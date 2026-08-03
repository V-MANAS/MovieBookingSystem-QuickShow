import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Stripe from 'stripe'
import logger from '../utils/logger.js'
import { validateBookingPayload, isValidObjectId } from '../utils/validation.js'
import asyncHandler from '../middleware/asyncHandler.js'

/**
 * HELPER: Atomic Seat Reservation
 * 
 * CONCURRENCY PROTECTION EXPLANATION:
 * MongoDB locks document writes. By querying for a document where `occupiedSeats.<seat>` does NOT exist
 * for EVERY requested seat (`$exists: false`), MongoDB atomically checks availability and sets the seat user ID
 * in a single database operation. If a concurrent user books any requested seat a millisecond prior,
 * `$exists: false` fails and `findOneAndUpdate` returns `null`, preventing double bookings.
 */
export const reserveSeatsAtomic = async (showId, selectedSeats, userId) => {
  const atomicQuery = { _id: showId }

  // Enforce that NONE of the requested seats currently exist in occupiedSeats
  selectedSeats.forEach((seat) => {
    atomicQuery[`occupiedSeats.${seat}`] = { $exists: false }
  })

  const atomicUpdate = { $set: {} }
  selectedSeats.forEach((seat) => {
    atomicUpdate.$set[`occupiedSeats.${seat}`] = userId
  })

  const updatedShow = await Show.findOneAndUpdate(atomicQuery, atomicUpdate, { new: true })
  return updatedShow
}

/**
 * HELPER: Rollback Reserved Seats
 * Releases reserved seats if booking persistence or Stripe session creation fails.
 */
export const rollbackReservedSeats = async (showId, selectedSeats) => {
  try {
    const unsetUpdate = { $unset: {} }
    selectedSeats.forEach((seat) => {
      unsetUpdate.$unset[`occupiedSeats.${seat}`] = ''
    })
    await Show.findByIdAndUpdate(showId, unsetUpdate)
    logger.warn('BOOKING_ROLLBACK', `Rolled back reserved seats for show ${showId}`, { selectedSeats })
  } catch (error) {
    logger.error('BOOKING_ROLLBACK_ERROR', `Failed to rollback seats for show ${showId}`, error)
  }
}

/**
 * Stripe Webhook Handler
 */
export const stripeWebhook = asyncHandler(async (req, res) => {
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event

  try {
    if (webhookSecret) {
      const sig = req.headers['stripe-signature']
      event = stripeInstance.webhooks.constructEvent(req.body, sig, webhookSecret)
    } else {
      event = JSON.parse(req.body.toString())
    }
  } catch (err) {
    logger.error('STRIPE_WEBHOOK', `Webhook signature verification error: ${err.message}`)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const bookingId = session.metadata?.bookingId

    if (bookingId) {
      try {
        await Booking.findByIdAndUpdate(bookingId, { isPaid: true })
        logger.info('STRIPE_WEBHOOK', `Booking ${bookingId} successfully marked as paid via webhook.`)
      } catch (err) {
        logger.error('STRIPE_WEBHOOK', `Failed to update booking ${bookingId} status`, err)
      }
    }
  }

  res.json({ received: true })
})

/**
 * Check Seat Availability Helper
 */
export const checkSeatAvailability = async (showId, selectedSeats) => {
  try {
    if (!isValidObjectId(showId) || !Array.isArray(selectedSeats)) return false

    const showData = await Show.findById(showId)
    if (!showData) return false

    const occupiedSeats = showData.occupiedSeats || {}
    return !selectedSeats.some((seat) => occupiedSeats[seat])
  } catch (error) {
    logger.error('CHECK_SEATS_ERROR', `Error checking seats for show ${showId}`, error)
    return false
  }
}

/**
 * Create Booking Controller
 */
export const createBooking = asyncHandler(async (req, res) => {
  const { userId } = req.auth()
  const { showId, selectedSeats } = req.body
  const clientOrigin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null) || process.env.FRONTEND_URL || 'http://localhost:5174'

  logger.info('CREATE_BOOKING', `Booking request initiated by user ${userId}`, { showId, selectedSeats })

  // 1. Validate request payload
  const validation = validateBookingPayload(req.body)
  if (!validation.isValid) {
    logger.warn('CREATE_BOOKING', `Validation failed: ${validation.message}`, { userId, showId })
    return res.status(validation.statusCode || 400).json({
      success: false,
      message: validation.message,
    })
  }

  // 2. Validate show existence
  const existingShow = await Show.findById(showId).populate('movie')
  if (!existingShow) {
    logger.warn('CREATE_BOOKING', `Show not found: ${showId}`)
    return res.status(404).json({
      success: false,
      message: 'Show not found',
    })
  }

  // 3. Check price minimum threshold (Stripe requires equivalent of ~50 cents USD / ₹50 INR)
  const seatPrice = parseFloat(existingShow.showPrice) || 0
  const totalAmount = seatPrice * selectedSeats.length

  if (totalAmount < 50) {
    logger.warn('CREATE_BOOKING_MIN_AMOUNT', `Total booking amount ₹${totalAmount} is below Stripe minimum threshold of ₹50`, { userId, showId })
    return res.status(400).json({
      success: false,
      message: `Total booking amount (₹${totalAmount}) is below the Stripe minimum payment requirement of ₹50. Please select more seats.`,
    })
  }

  // 4. Atomic Seat Allocation (Concurrency Protection)
  const updatedShow = await reserveSeatsAtomic(showId, selectedSeats, userId)

  if (!updatedShow) {
    logger.warn('CREATE_BOOKING_CONFLICT', `Race condition or seat conflict for seats: ${selectedSeats.join(', ')}`, { showId, userId })
    return res.status(409).json({
      success: false,
      message: 'One or more selected seats are already booked by another user!',
    })
  }

  let booking
  try {
    // 5. Create booking document in database
    booking = await Booking.create({
      user: userId,
      show: showId,
      amount: totalAmount,
      bookedSeats: selectedSeats,
    })

    // 6. Initialize Stripe Checkout Session
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
    
    const movieTitle = existingShow.movie?.title || 'Movie'
    const ticketCount = selectedSeats.length
    const seatsString = selectedSeats.join(', ')
    const descriptionText = `${movieTitle} • ${ticketCount} ${ticketCount === 1 ? 'Ticket' : 'Tickets'} (Seats: ${seatsString})`

    const line_items = [
      {
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'QuickShow Movie Ticket',
            description: descriptionText,
          },
          unit_amount: Math.floor(totalAmount * 100),
        },
        quantity: 1,
      },
    ]

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${clientOrigin}/loading/booking-success?session_id={CHECKOUT_SESSION_ID}&bookingId=${booking._id}`,
      cancel_url: `${clientOrigin}/my-bookings`,
      line_items: line_items,
      mode: 'payment',
      metadata: {
        bookingId: booking._id.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // expires in 30 minutes
    })

    booking.paymentLink = session.url
    await booking.save()

    logger.info('CREATE_BOOKING_SUCCESS', `Booking ${booking._id} created successfully for user ${userId}`, { amount: booking.amount })

    return res.json({
      success: true,
      url: session.url,
      booking,
    })
  } catch (error) {
    // 7. Rollback atomic seat reservation if Stripe or Booking creation fails
    logger.error('CREATE_BOOKING_FAILURE', `Error during booking creation. Rolling back reserved seats.`, error)
    await rollbackReservedSeats(showId, selectedSeats)

    if (booking?._id) {
      await Booking.findByIdAndDelete(booking._id).catch(() => {})
    }

    const isMinAmountError = error.message && error.message.includes('50 cents')
    const statusCode = isMinAmountError ? 400 : 500
    const friendlyMessage = isMinAmountError
      ? 'Total booking amount must be at least ₹50 to process payment through Stripe.'
      : (error.message || 'Failed to process booking transaction')

    return res.status(statusCode).json({
      success: false,
      message: friendlyMessage,
    })
  }
})

/**
 * Get Occupied Seats Controller
 */
export const getOccupiedSeats = asyncHandler(async (req, res) => {
  const { showId } = req.params

  if (!isValidObjectId(showId)) {
    return res.status(400).json({
      success: false,
      message: 'Valid showId is required',
    })
  }

  const showData = await Show.findById(showId)
  if (!showData) {
    return res.status(404).json({
      success: false,
      message: 'Show not found',
    })
  }

  const occupiedSeatsMap = showData.occupiedSeats || showData.occuppiedSeats || {}
  const occupiedSeats = Object.keys(occupiedSeatsMap)

  res.json({
    success: true,
    occupiedSeats,
  })
})

/**
 * Verify Stripe Payment Status
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { sessionId, bookingId } = req.body

  if (!sessionId || !bookingId) {
    return res.status(400).json({
      success: false,
      message: 'Missing sessionId or bookingId',
    })
  }

  if (!isValidObjectId(bookingId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid bookingId format',
    })
  }

  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
  const session = await stripeInstance.checkout.sessions.retrieve(sessionId)

  if (session.payment_status === 'paid') {
    await Booking.findByIdAndUpdate(bookingId, { isPaid: true })
    logger.info('VERIFY_PAYMENT', `Payment verified for booking ${bookingId}`)
    return res.json({ success: true, message: 'Payment verified and booking updated' })
  } else {
    logger.warn('VERIFY_PAYMENT', `Payment not completed for booking ${bookingId}`)
    return res.status(400).json({ success: false, message: 'Payment not completed' })
  }
})

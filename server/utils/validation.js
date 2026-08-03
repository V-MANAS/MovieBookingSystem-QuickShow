import mongoose from 'mongoose'

/**
 * Validates if a string is a valid MongoDB ObjectId
 */
export const isValidObjectId = (id) => {
  return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)
}

/**
 * Validates seat array for booking requests:
 * - Must be a non-empty array
 * - Must not exceed max seats (e.g., 5 per transaction)
 * - Every seat must be a valid non-empty string
 * - Rejects intra-request duplicates (e.g., ['A1', 'A1'])
 */
export const validateSelectedSeats = (seats, maxSeats = 5) => {
  if (!Array.isArray(seats) || seats.length === 0) {
    return { isValid: false, message: 'selectedSeats must be a non-empty array' }
  }

  if (seats.length > maxSeats) {
    return { isValid: false, message: `Cannot book more than ${maxSeats} seats in a single request` }
  }

  const seenSeats = new Set()
  for (const seat of seats) {
    if (typeof seat !== 'string' || !seat.trim()) {
      return { isValid: false, message: 'Invalid seat identifier format' }
    }

    const trimmedSeat = seat.trim()
    if (seenSeats.has(trimmedSeat)) {
      return { isValid: false, message: `Duplicate seat '${trimmedSeat}' in booking request` }
    }
    seenSeats.add(trimmedSeat)
  }

  return { isValid: true }
}

/**
 * Validates booking creation payload
 */
export const validateBookingPayload = (body) => {
  const { showId, selectedSeats } = body || {}

  if (!showId || !isValidObjectId(showId)) {
    return { isValid: false, statusCode: 400, message: 'Valid showId is required' }
  }

  const seatValidation = validateSelectedSeats(selectedSeats)
  if (!seatValidation.isValid) {
    return { isValid: false, statusCode: 400, message: seatValidation.message }
  }

  return { isValid: true }
}

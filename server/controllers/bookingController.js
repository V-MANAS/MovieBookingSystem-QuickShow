import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import stripe from 'stripe'


export const checkSeatAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);

    if (!showData) return false;

    const occupiedSeats = showData.occupiedSeats || {};

    return !selectedSeats.some(seat => occupiedSeats[seat]);

  } catch (error) {
    console.log(error.message);
    return false;
  }
};



export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { showId, selectedSeats } = req.body;
    const {origin} = req.headers;

    const showData = await Show.findById(showId);

    if (!showData) {
      return res.json({ success: false, message: "Show not found" });
    }

    if (!showData.occupiedSeats) {
      showData.occupiedSeats = {};
    }

    const isAnySeatTaken = selectedSeats.some(
      seat => showData.occupiedSeats[seat]
    );

    if (isAnySeatTaken) {
      return res.json({
        success: false,
        message: "Selected seats are already booked!"
      });
    }

    selectedSeats.forEach(seat => {
      showData.occupiedSeats[seat] = userId;
    });

    showData.markModified("occupiedSeats");
    await showData.save();

    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
    });
    //stripe gateway initialise
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    
  const line_items = [{
  price_data: {
    currency: 'usd',
    product_data: {
      name: showData.movie?.title || "Movie Ticket"
    },
    unit_amount: Math.floor(showData.showPrice * selectedSeats.length * 100)
  },
  quantity: 1
}];


    const session = await stripeInstance.checkout.sessions.create({
      success_url:`${origin}/loading/my-bookings`,
      cancel_url:`${origin}/my-bookings`,
      line_items:line_items,
      mode: 'payment',
      metadata:{
        bookingId: booking._id.toString()
      },
      expires_at: Math.floor(Date.now() / 1000) + 30*60, //expires in 30min

    })

    booking.paymentLink = session.url
    await booking.save()



    res.json({
      success: true,
      url: session.url,
      booking,
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};



export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;

    const showData = await Show.findById(showId);

    if (!showData) {
      return res.json({ success: false, message: "Show not found" });
    }

    const occupiedSeats = Object.keys(showData.occupiedSeats || {});

    res.json({
      success: true,
      occupiedSeats,
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};


import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './models/Booking.js';
import Stripe from 'stripe';

dotenv.config();

const checkBooking = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const bookingId = '6a70d8fc21d025214ed9caef';
    const sessionId = 'cs_test_a1HpPXBmQ6fAC5QLmKIOmkZ9CX25aqKnoFZGIXBiEoNCEV9Qf8vOS008RP';

    const booking = await Booking.findById(bookingId);
    console.log("Booking found:", booking);

    if (sessionId) {
      const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
      console.log("Stripe Session Payment Status:", session.payment_status);

      if (session.payment_status === 'paid') {
        booking.isPaid = true;
        await booking.save();
        console.log("UPDATED BOOKING isPaid to TRUE!");
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("CHECK ERROR:", err.message);
  }
};

checkBooking();

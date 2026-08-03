import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Show from './models/Show.js';
import Movie from './models/Movie.js';
import Booking from './models/Booking.js';
dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const shows = await Show.find().populate('movie').limit(5);
    console.log("FOUND SHOWS IN DB:", shows.length);
    shows.forEach(s => {
      console.log(`- Show ID: ${s._id}, Price: ${s.showPrice} (type: ${typeof s.showPrice}), Movie: ${s.movie?.title}`);
    });

    const bookings = await Booking.find().limit(5);
    console.log("RECENT BOOKINGS IN DB:", bookings.length);
    bookings.forEach(b => {
      console.log(`- Booking ID: ${b._id}, Amount: ${b.amount}, Seats: ${b.bookedSeats}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error("DB CHECK ERROR:", err);
  }
};

checkData();

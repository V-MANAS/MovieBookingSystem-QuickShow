import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import Stripe from "stripe";

// Get user bookings with automatic Stripe payment verification
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.auth().userId;   // Clerk user ID

    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });   // ✅ correct key

    // Auto-verify payment status with Stripe for any pending bookings
    if (process.env.STRIPE_SECRET_KEY) {
      const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
      await Promise.all(
        bookings.map(async (b) => {
          if (!b.isPaid && b.paymentLink) {
            try {
              const urlObj = new URL(b.paymentLink);
              const pathParts = urlObj.pathname.split('/');
              const sessionId = pathParts[pathParts.length - 1]?.split('#')[0];
              if (sessionId && sessionId.startsWith('cs_')) {
                const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
                if (session.payment_status === 'paid') {
                  b.isPaid = true;
                  await b.save();
                }
              }
            } catch (e) {
              // Ignore single item Stripe retrieval errors
            }
          }
        })
      );
    }

    res.json({ success: true, bookings });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};


// Update favorite movies in Clerk
export const updateFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.auth().userId;

    const user = await clerkClient.users.getUser(userId);

    // Ensure privateMetadata exists
    const favorites = user.privateMetadata?.favorites || [];

    let updatedFavorites;

    if (favorites.includes(movieId)) {
      // Remove
      updatedFavorites = favorites.filter(id => id !== movieId);
    } else {
      // Add
      updatedFavorites = [...favorites, movieId];
    }

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...user.privateMetadata,
        favorites: updatedFavorites
      }
    });

    res.json({
      success: true,
      message: favorites.includes(movieId)
        ? "Removed from favorites"
        : "Added to favorites"
    });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get favorite movies
export const getFavorites = async (req, res) => {
  try {
    const user = await clerkClient.users.getUser(req.auth().userId);

    const favorites = user.privateMetadata?.favorites || [];

    const movies = await Movie.find({ _id: { $in: favorites } });

    res.json({ success: true, movies });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

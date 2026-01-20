import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import { clerkClient } from "@clerk/express";

// ✅ Check if user is admin
export const isAdmin = async (req, res) => {
  try {
    const auth = req.auth?.();
    const userId = auth?.userId;

    if (!userId) {
      return res.json({ isAdmin: false });
    }

    const user = await clerkClient.users.getUser(userId);
    const isAdmin = user.privateMetadata?.role === "admin";

    res.json({ isAdmin });
  } catch (error) {
    console.error("Admin Check Error:", error);
    res.status(500).json({ isAdmin: false });
  }
};

// ✅ Dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const bookings = await Booking.find({ isPaid: true });

   const activeShows = await Show.find({
  showDateTime: { $gte: new Date() },
  movie: { $ne: null }        
}).populate("movie");


    const totalRevenue = bookings.reduce(
      (acc, booking) => acc + (booking.amount || 0),
      0
    );

    res.json({
      success: true,
      dashboardData: {
        totalBookings: bookings.length,
        activeShows: activeShows,
        totalRevenue,
        totalUser: bookings.length
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data"
    });
  }
};

// ✅ Get all shows
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({
      showDateTime: { $gte: new Date() },
      movie: { $ne: null }  
    })
      .populate("movie")
      .sort({ showDateTime: 1 });

    res.json({ success: true, shows });

  } catch (error) {
    console.error("Get Shows Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user")
      .populate({
        path: "show",
        populate: { path: "movie" }
      })
      .sort({ created: -1 });

    res.json({ success: true, bookings });

  } catch (error) {
    console.error("Get Bookings Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Movie from "../models/Movie.js";
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

// ✅ Dashboard data with real counts
export const getDashboardData = async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments({});
    const totalShows = await Show.countDocuments({ movie: { $ne: null } });
    const totalBookings = await Booking.countDocuments({});
    const paidBookings = await Booking.find({ isPaid: true });

    const activeShows = await Show.find({
      movie: { $ne: null }
    }).populate("movie").limit(10);

    const totalRevenue = paidBookings.reduce(
      (acc, booking) => acc + (booking.amount || 0),
      0
    );

    res.json({
      success: true,
      dashboardData: {
        totalMovies,
        totalShows,
        totalBookings,
        totalRevenue,
        activeShows,
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
      movie: { $ne: null }
    })
      .populate("movie")
      .sort({ showDateTime: -1 });

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
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });

  } catch (error) {
    console.error("Get Bookings Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete movie
export const deleteMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    await Movie.findByIdAndDelete(movieId);
    await Show.deleteMany({ movie: movieId });
    res.json({ success: true, message: "Movie and associated shows deleted" });
  } catch (error) {
    console.error("Delete Movie Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update movie
export const updateMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { title, overview, poster_path, trailerUrl, vote_average, runtime } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    if (title) movie.title = title;
    if (overview) movie.overview = overview;
    if (poster_path) movie.poster_path = poster_path;
    if (trailerUrl !== undefined) movie.trailerUrl = trailerUrl;
    if (vote_average !== undefined) movie.vote_average = vote_average;
    if (runtime !== undefined) movie.runtime = runtime;

    await movie.save();
    res.json({ success: true, message: "Movie updated successfully", movie });
  } catch (error) {
    console.error("Update Movie Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

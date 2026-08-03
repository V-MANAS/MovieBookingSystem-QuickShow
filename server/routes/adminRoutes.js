import express from "express";
import { clerkMiddleware } from "@clerk/express";
import {
  getAllBookings,
  getAllShows,
  getDashboardData,
  isAdmin,
  deleteMovie,
  updateMovie
} from "../controllers/adminController.js";

const adminRouter = express.Router();

// Clerk MUST be here
adminRouter.use(clerkMiddleware());

adminRouter.get("/is-admin", isAdmin);
adminRouter.get("/dashboard", getDashboardData);
adminRouter.get("/all-shows", getAllShows);
adminRouter.get("/all-bookings", getAllBookings);
adminRouter.delete("/delete-movie/:movieId", deleteMovie);
adminRouter.put("/update-movie/:movieId", updateMovie);

export default adminRouter;

import express from 'express'
import { getFavorites, getUserBookings, updateFavorite } from '../controllers/userController.js';
import { requireAuth } from '@clerk/express';

const userRouter = express.Router();

userRouter.get('/my-bookings',requireAuth(),getUserBookings)
userRouter.post('/update-favorite',updateFavorite)
userRouter.get('/favorites',getFavorites)

export default userRouter;
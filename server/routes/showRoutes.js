import express from 'express';
import { addShow, deleteShow, getNowPlayingMovies, getShow, getAllMovies } from '../controllers/showController.js';
import { protectAdmin } from '../middleware/auth.js';

const showRouter = express.Router();

showRouter.post('/add', protectAdmin, addShow);
showRouter.delete('/delete/:showId', protectAdmin, deleteShow);
showRouter.get('/all', getAllMovies);
showRouter.get('/releases', getNowPlayingMovies);
showRouter.get('/:movieId', getShow);

export default showRouter;

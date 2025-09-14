import express from 'express'
import { addReviewController, deleteOwnReviewController } from '../controllers/product/reviews/reviewsController.js';
import isAuthenticated from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/',isAuthenticated, addReviewController);
router.delete('/:reviewId', isAuthenticated, deleteOwnReviewController)
export default router;
import express from 'express';
import { addToCart } from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router();

router.post('/cart', protect, addToCart);

export default router;

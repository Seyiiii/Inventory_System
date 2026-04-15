import express from 'express';
import { addToCart, getCart } from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router();

router.post('/cart', protect, addToCart);
router.get('/cart', protect, getCart);

export default router;

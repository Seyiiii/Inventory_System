import express from "express";
import { createOrder } from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router();

router.post('/orders', protect, createOrder);

export default router;
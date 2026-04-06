import express from 'express';
import {
    createProduct,
    getAllProducts,
    updatedProduct,
    deleteProduct,
    getProductById
} from '../controllers/productController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();


router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.post('/products', protect, authorize('admin'), upload.single('image'), createProduct);
router.patch('/products/:id', protect, authorize('admin'), updatedProduct);
router.delete('/products/:id', protect, authorize('admin'), deleteProduct);

export default router;
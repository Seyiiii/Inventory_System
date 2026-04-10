import express from 'express';
import {
    createProduct,
    getAllProducts,
    updatedProduct,
    deleteProduct,
    getProductById
} from '../controllers/productController.js';
import {
    createStockMovement,
    getAllStockMovements,
    getProductStockMovements
} from '../controllers/stockMovementController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();


router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.post('/products', protect, authorize('admin', 'storekeeper'), upload.single('image'), createProduct);
router.patch('/products/:id', protect, authorize('admin', 'storekeeper'), updatedProduct);
router.delete('/products/:id', protect, authorize('admin', 'storekeeper'), deleteProduct);
router.post('/products/:id/stock', protect, authorize('admin', 'storekeeper'), createStockMovement);
router.get('/stock-movements', protect, authorize('admin', 'storekeeper'), getAllStockMovements);
router.get('/products/:id/stock', protect, authorize('admin', 'storekeeper'), getProductStockMovements);

export default router;
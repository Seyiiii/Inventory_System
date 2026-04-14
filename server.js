import express from 'express';
import connectDB from './db.js';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

import User from './models/userModel.js';
import Category from './models/categoryModel.js';
import Product from './models/productModel.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api', productRoutes);
app.use('/api', categoryRoutes);
app.use('/api/auth', authRoutes);


// --- TEMPORARY SEED ROUTE ---
app.post('/api/seed', async (req, res) => {
    try {
        const user = await User.findOne(); 
        if (!user) {
            return res.status(400).json({ message: "You need to create at least one user account first via Postman!" });
        }

        await Product.deleteMany();
        await Category.deleteMany();

        const createdCategories = await Category.insertMany([
            { user: user._id, name: 'Laptops', description: 'High performance laptops' },
            { user: user._id, name: 'Smartphones', description: 'Latest iOS and Android devices' },
            { user: user._id, name: 'Accessories', description: 'Keyboards, mice, and audio gear' }
        ]);

        const products = [
            {
                user: user._id,
                name: 'MacBook Pro 16-inch (M3 Max)',
                sku: 'LAP-MBP-16-M3',
                description: 'Apple M3 Max chip with 14‑core CPU.',
                price: 5200000,
                base_currency: 'NGN',
                stock_quantity: 15,
                low_stock_threshold: 5,
                category_id: createdCategories[0]._id
            },
            {
                user: user._id,
                name: 'iPhone 15 Pro Max',
                sku: 'PHO-IPH-15PM',
                description: '256GB, Natural Titanium.',
                price: 2100000,
                base_currency: 'NGN',
                stock_quantity: 45,
                low_stock_threshold: 15,
                category_id: createdCategories[1]._id
            },
            {
                user: user._id,
                name: 'Logitech MX Master 3S',
                sku: 'ACC-LOG-MX3S',
                description: 'Wireless Performance Mouse.',
                price: 185000,
                base_currency: 'NGN',
                stock_quantity: 120,
                low_stock_threshold: 20,
                category_id: createdCategories[2]._id
            }
        ];

        await Product.insertMany(products);
        res.status(200).json({ message: "✅ DATABASE FULLY SEEDED!" });

    } catch (error) {
        res.status(500).json({ message: "Seeder Failed", error: error.message });
    }
});
// ----------------------------


app.use(errorHandler);

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`)
    });
};

startServer();
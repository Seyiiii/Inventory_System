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
// --- HIGH-VOLUME TEMPORARY SEED ROUTE ---
app.post('/api/seed', async (req, res) => {
    try {
        const user = await User.findOne(); 
        if (!user) {
            return res.status(400).json({ message: "You need to create a user account first!" });
        }

        // Clear out the old 6 products so we don't have duplicates
        await Product.deleteMany();
        await Category.deleteMany();

        // 1. Create Categories
        const createdCategories = await Category.insertMany([
            { user: user._id, name: 'Laptops', description: 'High performance laptops' },
            { user: user._id, name: 'Smartphones', description: 'Latest iOS and Android devices' },
            { user: user._id, name: 'Accessories', description: 'Keyboards, mice, and audio gear' }
        ]);

        // 2. Data Arrays for Generation
        const laptopBrands = ['Apple MacBook Pro', 'Dell XPS', 'HP Spectre', 'Lenovo ThinkPad', 'ASUS ROG'];
        const phoneBrands = ['iPhone 15', 'Samsung Galaxy', 'Google Pixel', 'Xiaomi Redmi', 'Oppo Reno'];
        const accessoryNames = ['Wireless Mouse', 'Mechanical Keyboard', 'Noise Cancelling Headphones', 'USB-C Hub', '4K Monitor'];
        
        const products = [];

        // Helper function to generate a random price in Naira (e.g., between 100k and 3M)
        const getRandomPrice = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
        // Helper function to generate random stock
        const getRandomStock = () => Math.floor(Math.random() * 100) + 1;

        // 3. Generate 15 Laptops
        for (let i = 0; i < 15; i++) {
            const brand = laptopBrands[i % 5]; // Cycles through the 5 brands
            products.push({
                user: user._id,
                name: `${brand} - Model ${2020 + (i % 5)} Edition`,
                sku: `LAP-${Math.floor(Math.random() * 90000) + 10000}`, // Random 5 digit SKU
                description: `Professional grade ${brand} featuring cutting-edge processing power.`,
                price: getRandomPrice(800000, 4500000), // Random price between 800k and 4.5m NGN
                base_currency: 'NGN',
                stock_quantity: getRandomStock(),
                low_stock_threshold: 10,
                category_id: createdCategories[0]._id
            });
        }

        // 4. Generate 15 Smartphones
        for (let i = 0; i < 15; i++) {
            const brand = phoneBrands[i % 5];
            products.push({
                user: user._id,
                name: `${brand} (Gen ${i + 1})`,
                sku: `PHO-${Math.floor(Math.random() * 90000) + 10000}`,
                description: `The latest ${brand} with upgraded camera and battery life.`,
                price: getRandomPrice(300000, 2500000),
                base_currency: 'NGN',
                stock_quantity: getRandomStock(),
                low_stock_threshold: 15,
                category_id: createdCategories[1]._id
            });
        }

        // 5. Generate 15 Accessories
        for (let i = 0; i < 15; i++) {
            const accName = accessoryNames[i % 5];
            products.push({
                user: user._id,
                name: `Pro Series ${accName} V${(i % 3) + 1}`,
                sku: `ACC-${Math.floor(Math.random() * 90000) + 10000}`,
                description: `Premium ${accName.toLowerCase()} designed for maximum productivity.`,
                price: getRandomPrice(15000, 250000),
                base_currency: 'NGN',
                stock_quantity: getRandomStock() + 50, // Usually more stock for accessories
                low_stock_threshold: 20,
                category_id: createdCategories[2]._id
            });
        }

        // 6. Inject all 45 products into the database at once
        await Product.insertMany(products);
        res.status(200).json({ 
            message: "✅ MASSIVE DATABASE FULLY SEEDED!",
            total_products: products.length 
        });

    } catch (error) {
        res.status(500).json({ message: "Seeder Failed", error: error.message });
    }
});
// ----------------------------------------------


app.use(errorHandler);

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`)
    });
};

startServer();
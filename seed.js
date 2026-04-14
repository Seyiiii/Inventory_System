import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './db.js';
import User from './models/userModel.js';
import Category from './models/categoryModel.js';
import Product from './models/productModel.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        await connectDB();

        // 1. Find an existing user to "own" these products
        const user = await User.findOne(); 
        
        if (!user) {
            console.error("❌ ERROR: You need at least one User in the database first. Create an account via Postman!");
            process.exit(1);
        }

        const userId = user._id;

        // 2. Clear old data (Optional, but good for a fresh start)
        await Product.deleteMany();
        await Category.deleteMany();
        console.log('🧹 Cleared existing Products and Categories...');

        // 3. Create Categories
        const createdCategories = await Category.insertMany([
            { user: userId, name: 'Laptops', description: 'High performance laptops and notebooks' },
            { user: userId, name: 'Smartphones', description: 'Latest iOS and Android devices' },
            { user: userId, name: 'Accessories', description: 'Keyboards, mice, and audio gear' }
        ]);
        console.log('📁 Categories Seeded!');

        // Extract the new Category IDs
        const laptopCatId = createdCategories[0]._id;
        const phoneCatId = createdCategories[1]._id;
        const accessoryCatId = createdCategories[2]._id;

        // 4. Create Products
        const products = [
            {
                user: userId,
                name: 'MacBook Pro 16-inch (M3 Max)',
                sku: 'LAP-MBP-16-M3',
                description: 'Apple M3 Max chip with 14‑core CPU, 30‑core GPU, 36GB Memory.',
                price: 5200000,
                base_currency: 'NGN',
                stock_quantity: 15,
                low_stock_threshold: 5,
                category_id: laptopCatId
            },
            {
                user: userId,
                name: 'Dell XPS 15',
                sku: 'LAP-DELL-XPS15',
                description: '13th Gen Intel Core i9, 32GB RAM, 1TB SSD, OLED Display.',
                price: 2800000,
                base_currency: 'NGN',
                stock_quantity: 8,
                low_stock_threshold: 10, // Will trigger a low stock warning immediately
                category_id: laptopCatId
            },
            {
                user: userId,
                name: 'iPhone 15 Pro Max',
                sku: 'PHO-IPH-15PM',
                description: '256GB, Natural Titanium, A17 Pro chip.',
                price: 2100000,
                base_currency: 'NGN',
                stock_quantity: 45,
                low_stock_threshold: 15,
                category_id: phoneCatId
            },
            {
                user: userId,
                name: 'Samsung Galaxy S24 Ultra',
                sku: 'PHO-SAM-S24U',
                description: '512GB, Titanium Black, Snapdragon 8 Gen 3.',
                price: 1950000,
                base_currency: 'NGN',
                stock_quantity: 30,
                low_stock_threshold: 10,
                category_id: phoneCatId
            },
            {
                user: userId,
                name: 'Logitech MX Master 3S',
                sku: 'ACC-LOG-MX3S',
                description: 'Wireless Performance Mouse, Ultra-fast Scrolling, Ergonomic.',
                price: 185000,
                base_currency: 'NGN',
                stock_quantity: 120,
                low_stock_threshold: 20,
                category_id: accessoryCatId
            },
            {
                user: userId,
                name: 'Keychron K2 Wireless Mechanical Keyboard',
                sku: 'ACC-KEY-K2',
                description: '75% Layout, Bluetooth, Gateron Brown Switches.',
                price: 135000,
                base_currency: 'NGN',
                stock_quantity: 4, // Low stock!
                low_stock_threshold: 10,
                category_id: accessoryCatId
            }
        ];

        await Product.insertMany(products);
        console.log('📦 Products Seeded!');
        
        console.log('✅ DATABASE FULLY SEEDED! You can now start building the storefront.');
        process.exit();

    } catch (error) {
        console.error('❌ Seeder Failed:', error);
        process.exit(1);
    }
};

seedDatabase();
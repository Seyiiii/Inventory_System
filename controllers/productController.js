import Product from '../models/productModel.js';
import asyncHandler from "../middlewares/asyncHandler.js";


export const createProduct = asyncHandler(async (req, res) => {
    req.body.user = req.user.id;

    if (req.file) {
        req.body.image = req.file.path;
    }

    const newProduct = await Product.create(req.body);
    res.status(201).json({
        message: "Product created successfully!!",
        product: newProduct
    });
});

export const getAllProducts = asyncHandler(async (req, res) => {

    const { search, limit } = req.query;

    let filter = {};

    if (search) {
        filter.name = { $regex: search, $options: 'i' };
    }

    const maxResults = Number(limit) || 10;

    const products = await Product.find(filter)
    .populate('category_id', 'name')
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(maxResults);

    res.status(200).json({
        count: products.length,
        products: products
});

});

export const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id)
    .populate('category_id', 'name');

    if (!product) {
        res.status(404);
        throw new Error("Product not found.");
    }
    res.status(200).json({ product });
});

export const updatedProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        req.body,
        {
            returnDocument: 'after',
            runValidators: true
        }
    );

    if (!updatedProduct) {
        res.status(404);
        throw new Error("Product not found. Cannot Update.");
    }

    res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct
    });
});

export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
        res.status(404);
        throw new Error("Product not found. Cannot delete.");
    }

    res.status(200).json({
        message: "Product deleted successfully!",
        product: deletedProduct
    });
});
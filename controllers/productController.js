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

    let product = await Product.findById(id);

    if (!product) {
        res.status(404);
        throw new Error("Product not found. Cannot Update.");
    }

    if (req.user.role === 'storekeeper' && product.user.toString() != req.user.id) {
        res.status(403);
        throw new Error("You  are not authorized to edit a product that you did not create.");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        req.body,
        {
            returnDocument: 'after',
            runValidators: true
        }
    );

    res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct
    });
});

export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
        res.status(404);
        throw new Error("Product not found. Cannot delete.");
    }

    if (req.user.role === 'storekepper' && product.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error("You are not authorized to delete a product that you did not create.");
    }

    await Product.findByIdAndDelete(id);


    res.status(200).json({
        message: "Product deleted successfully!",
        id: id
    });
});


export const getLowStockProducts = asyncHandler(async (req, res) => {
    const lowStockItems = await Product.find({
        $expr: { $lte: ["$stock_quantity", "$low_stock_threshold"] }
    })
    .populate('category_id', 'name')
    .sort({ stock_quantity: 1 });

    res.status(200).json({
        count: lowStockItems.length,
        alert_status: "Low Stock Alert",
        products: lowStockItems
    });
});

// External API endpoint to fetch PRoducts prices in different currencies
export const getProductPriceInCurrency = asyncHandler(async (req, res) => {
    const { id, currencyCode } = req.params;

    const product = await Product.findById(id);
    if (!product) {
        res.status(404);
        throw new Error("Product not found.");
    }

    const targetCurrency = currencyCode.toUpperCase();

    const apiUrl = `https://open.er-api.com/v6/latest/${product.base_currency}`;

    try {
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.result !== "success") {
            res.status(502);
            throw new Error("Failed to fetch live exchange rates.");
        }

        if (!data.rates[targetCurrency]) {
            res.status(400);
            throw new Error(`Currency code '${targetCurrency}' is not supported.`);
        }

        const exchangeRate = data.rates[targetCurrency];
        const convertedPrice = product.price * exchangeRate;

        res.status(200).json({
            product_name: product.name,
            base_price: product.price,
            base_currency: product.base_currency,
            target_currency: targetCurrency,
            exchange_rate: exchangeRate,
            converted_price: Number(convertedPrice.toFixed(2))
        });
    } catch (error) {
        res.status(500);
        throw new Error(`External API Error: ${error.message}`);        
    }
})
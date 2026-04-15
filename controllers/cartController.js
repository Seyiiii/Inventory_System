import asyncHandler from '../middlewares/asyncHandler.js';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';


export const addToCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Product not found in inventory');
    }

    if (product.stock_quantity < quantity) {
        res.status(400);
        throw new Error(`Only ${product.stock_quantity} left in stock.`);
    }
    
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = new Cart({ user: userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item =>
        item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
    } else {
        cart.items.push({
            product: productId,
            quantity: quantity,
            price: product.price
        });
    }

    await cart.save();

    res.status(200).json({
        message: 'Item added to cart successfully',
        cart
    });

});

export const getCart = asyncHandler(async (req, res) => {
    const userId =req.user.id;
    
    const cart = await Cart.findOne({ user: userId })
        .populate({
            path: 'items.product',
            select: 'name sku price image'
        });

    if (!cart) {
        return res.status(200).json({
            message: "your cart is empty",
            cart: {
                items: [],
                totalPrice: 0
            }
        });
    }

    res.status(200).json({
        cart
    });
});
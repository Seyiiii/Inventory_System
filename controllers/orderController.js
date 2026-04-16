import Order from '../models/oderModel.js';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import StockMovement from '../models/stockMovementModel.js';
import asyncHandler from '../middlewares/asyncHandler.js';


export const createOrder = asyncHandler(async (req, res) => {
    const { shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId })
        .populate('items.product');

    if (!cart || cart.items.length === 0) {
        res.status(400);
        throw new Error('Your cart is empty. No Product to Checkout.');
    }

    const orderItems = cart.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        image: item.product.image,
        price: item.price,
        product: item.product._id
    }));

    const generatedOrderNumber = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const order = await Order.create({
        user: userId,
        orderNumber: generatedOrderNumber,
        orderItems,
        shippingAddress,
        paymentMethod,
        totalPrice: cart.totalPrice
    });

    for (const item of cart.items) {
        const product = await Product.findById(item.product._id);

        if (product.stock_quantity < item.quantity) {
            res.status(400);
            throw new Error(`Sorry, ${product.name} is currently out of stock!`);
        }
        
        const previous_quantity = product.stock_quantity;
        product.stock_quantity -= item.quantity;
        await product.save();

        await StockMovement.create({
            product: product._id,
            user: userId,
            previous_quantity: previous_quantity,
            new_quantity: product.stock_quantity,
            quantity_change: item.quantity,
            type: 'OUT'
        });
    }

    cart.items = [];
    await cart.save();

    res.status(201).json({
        message: 'Order placed successfully!',
        order
    });
});
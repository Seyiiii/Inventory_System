import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    image: {
        type: String,
        // default: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
    },
    sku: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock_quantity: {
        type: Number,
        default: 0,
        min: 0
    }, 
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }
}, {
    timestamps: true
});

export default mongoose.model('Product', productSchema);
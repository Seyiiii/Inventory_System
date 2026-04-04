import jwt from "jsonwebtoken";
import User from  '../models/userModel.js';
import asyncHandler from "../middlewares/asyncHandler.js";


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};



export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please insert all required fields');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('"User with this email already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } else {
        read.status(400);
        throw new Error("Invalid user data")
    }
});
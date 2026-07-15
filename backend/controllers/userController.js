import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from 'cloudinary';
import razorpay from 'razorpay';
import { AppError, catchAsync } from "../middlewares/errorMiddleware.js";

// API to register user
const registerUser = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;

    // checking for all data to register user
    if (!name || !email || !password) {
        throw new AppError('Missing Details', 400);
    }

    // validating email format
    if (!validator.isEmail(email)) {
        throw new AppError("Please enter a valid email", 400);
    }

    // validating strong password
    if (password.length < 8) {
        throw new AppError("Please enter a strong password", 400);
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
        name,
        email,
        password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();
    const token = jwt.sign({ id: user._id, role: 'patient' }, process.env.JWT_SECRET);

    res.status(201).json({ success: true, token });
});

// API to login user
const loginUser = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
        throw new AppError("User does not exist", 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        const token = jwt.sign({ id: user._id, role: 'patient' }, process.env.JWT_SECRET);
        res.status(200).json({ success: true, token });
    } else {
        throw new AppError("Invalid credentials", 401);
    }
});

// API to get user profile data
const getProfile = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const userData = await userModel.findById(userId).select('-password');
    if (!userData) {
        throw new AppError("User not found", 404);
    }
    res.status(200).json({ success: true, userData });
});

// API to update user profile
const updateProfile = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
        throw new AppError("Data Missing", 400);
    }

    await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender });

    if (imageFile) {
        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageURL = imageUpload.secure_url;

        await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }

    res.status(200).json({ success: true, message: 'Profile Updated' });
});

// API to book appointment 
const bookAppointment = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { docId, slotDate, slotTime } = req.body;
    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData) {
        throw new AppError("Doctor not found", 404);
    }

    if (!docData.available) {
        throw new AppError('Doctor Not Available', 400);
    }

    // Checking for slot availability in the Appointment collection directly
    const existingAppointment = await appointmentModel.findOne({
        docId,
        slotDate,
        slotTime,
        cancelled: false
    });

    if (existingAppointment) {
        throw new AppError('Slot Not Available', 409);
    }

    const appointmentData = {
        userId,
        docId,
        amount: docData.fees,
        slotTime,
        slotDate,
        date: Date.now()
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    res.status(201).json({ success: true, message: 'Appointment Booked' });
});

// API to cancel appointment
const cancelAppointment = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
        throw new AppError('Appointment not found', 404);
    }

    // verify appointment user 
    if (appointmentData.userId.toString() !== userId) {
        throw new AppError('Unauthorized action', 403);
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    res.status(200).json({ success: true, message: 'Appointment Cancelled' });
});

// API to get user appointments for frontend my-appointments page
const listAppointment = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const appointments = await appointmentModel.find({ userId }).populate('userId').populate('docId');
    const formatted = appointments.map(appt => {
        const obj = appt.toObject();
        obj.userData = obj.userId || {};
        obj.docData = obj.docId || {};
        return obj;
    });
    res.status(200).json({ success: true, appointments: formatted });
});

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
} else {
    console.warn("WARNING: Razorpay credentials are not defined in environment variables. Payment routes will be disabled.");
}

// API to make payment of appointment using razorpay
const paymentRazorpay = catchAsync(async (req, res, next) => {
    if (!razorpayInstance) {
        throw new AppError('Payment gateway is not configured.', 503);
    }

    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
        throw new AppError('Appointment Cancelled or not found', 404);
    }

    // creating options for razorpay payment
    const options = {
        amount: appointmentData.amount * 100,
        currency: process.env.CURRENCY || 'INR',
        receipt: appointmentId,
    };

    // creation of an order
    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({ success: true, order });
});

// API to verify payment of razorpay
const verifyRazorpay = catchAsync(async (req, res, next) => {
    if (!razorpayInstance) {
        throw new AppError('Payment gateway is not configured.', 503);
    }

    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === 'paid') {
        await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
        res.status(200).json({ success: true, message: "Payment Successful" });
    } else {
        throw new AppError('Payment Failed', 400);
    }
});

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay };
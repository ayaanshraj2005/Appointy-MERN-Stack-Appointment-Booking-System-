import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import { AppError, catchAsync } from "../middlewares/errorMiddleware.js";

// API for admin login
const loginAdmin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ id: "admin", role: "admin" }, process.env.JWT_SECRET);
        res.status(200).json({ success: true, token });
    } else {
        throw new AppError("Invalid credentials", 401);
    }
});

// API for adding Doctor
const addDoctor = catchAsync(async (req, res, next) => {
    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
    const imageFile = req.file;

    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
        throw new AppError("Missing Details", 400);
    }

    if (!validator.isEmail(email)) {
        throw new AppError("Please enter a valid email", 400);
    }

    if (password.length < 8) {
        throw new AppError("Please enter a strong password", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
    const imageUrl = imageUpload.secure_url;

    const doctorData = {
        name,
        email,
        image: imageUrl,
        password: hashedPassword,
        speciality,
        degree,
        experience,
        about,
        fees,
        address: JSON.parse(address),
        date: Date.now()
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.status(201).json({ success: true, message: "Doctor Added" });
});

// API for appointment cancellation
const appointmentCancel = catchAsync(async (req, res, next) => {
    const { appointmentId } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
        throw new AppError("Appointment not found", 404);
    }
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    res.status(200).json({ success: true, message: 'Appointment Cancelled' });
});

const allDoctors = catchAsync(async (req, res, next) => {
    const doctors = await doctorModel.find({}).select('-password');
    res.status(200).json({ success: true, doctors });
});

// API to get all appointments list
const appointmentsAdmin = catchAsync(async (req, res, next) => {
    const appointments = await appointmentModel.find({}).populate('userId').populate('docId');
    const formattedAppointments = appointments.map(item => {
        const apptObj = item.toObject();
        apptObj.userData = apptObj.userId || {};
        apptObj.docData = apptObj.docId || {};
        return apptObj;
    });
    res.status(200).json({ success: true, appointments: formattedAppointments });
});

// API to get dashboard data for admin panel
const adminDashboard = catchAsync(async (req, res, next) => {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({}).populate('userId').populate('docId');

    const formattedLatest = appointments.reverse().slice(0, 5).map(item => {
        const apptObj = item.toObject();
        apptObj.userData = apptObj.userId || {};
        apptObj.docData = apptObj.docId || {};
        return apptObj;
    });

    const dashData = {
        doctors: doctors.length,
        appointments: appointments.length,
        patients: users.length,
        latestAppointments: formattedLatest
    };

    res.status(200).json({ success: true, dashData });
});

export { loginAdmin, addDoctor, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard };
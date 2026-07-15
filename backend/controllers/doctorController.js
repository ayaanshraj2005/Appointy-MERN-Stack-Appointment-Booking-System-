import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { AppError, catchAsync } from "../middlewares/errorMiddleware.js";

// Doctor login
const loginDoctor = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await doctorModel.findOne({ email });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign({ id: user._id, role: 'doctor' }, process.env.JWT_SECRET);
  res.status(200).json({ success: true, token });
});

// Get doctor's appointments
const appointmentsDoctor = catchAsync(async (req, res, next) => {
  const docId = req.user.id;
  const appointments = await appointmentModel.find({ docId }).populate('userId').populate('docId');
  const formatted = appointments.map(appt => {
    const obj = appt.toObject();
    obj.userData = obj.userId || {};
    obj.docData = obj.docId || {};
    return obj;
  });
  res.status(200).json({ success: true, appointments: formatted });
});

// Cancel appointment
const appointmentCancel = catchAsync(async (req, res, next) => {
  const docId = req.user.id;
  const { appointmentId } = req.body;

  const appointment = await appointmentModel.findById(appointmentId);
  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }
  if (appointment.docId.toString() !== docId) {
    throw new AppError("Access forbidden. Appointment does not belong to this doctor.", 403);
  }

  await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
  res.status(200).json({ success: true, message: "Appointment Cancelled" });
});

// Complete appointment
const appointmentComplete = catchAsync(async (req, res, next) => {
  const docId = req.user.id;
  const { appointmentId } = req.body;

  const appointment = await appointmentModel.findById(appointmentId);
  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }
  if (appointment.docId.toString() !== docId) {
    throw new AppError("Access forbidden. Appointment does not belong to this doctor.", 403);
  }

  await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
  res.status(200).json({ success: true, message: "Appointment Completed" });
});

// Get all doctors (for frontend list)
const doctorList = catchAsync(async (req, res, next) => {
  const doctors = await doctorModel.find({}).select("-password -email");
  const doctorsWithSlots = await Promise.all(doctors.map(async (doc) => {
    const appointments = await appointmentModel.find({ docId: doc._id, cancelled: false, isCompleted: false });
    const slots_booked = {};
    appointments.forEach(appt => {
      if (!slots_booked[appt.slotDate]) {
        slots_booked[appt.slotDate] = [];
      }
      slots_booked[appt.slotDate].push(appt.slotTime);
    });
    const docObj = doc.toObject();
    docObj.slots_booked = slots_booked;
    return docObj;
  }));
  res.status(200).json({ success: true, doctors: doctorsWithSlots });
});

// Toggle doctor's availability
const changeAvailability = catchAsync(async (req, res, next) => {
  const { docId } = req.body;

  if (!docId) {
    throw new AppError("Doctor ID missing", 400);
  }

  const doctor = await doctorModel.findById(docId);

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  doctor.available = !doctor.available;
  await doctor.save();

  res.status(200).json({ success: true, message: "Availability changed successfully" });
});

// Get doctor's profile
const doctorProfile = catchAsync(async (req, res, next) => {
  const docId = req.user.id;
  const profile = await doctorModel.findById(docId).select("-password");
  if (!profile) {
    throw new AppError("Doctor profile not found", 404);
  }
  res.status(200).json({ success: true, profileData: profile });
});

// Update doctor's profile
const updateDoctorProfile = catchAsync(async (req, res, next) => {
  const docId = req.user.id;
  const { fees, address, available, about } = req.body;

  const doctor = await doctorModel.findByIdAndUpdate(docId, {
    fees,
    address,
    available,
    about,
  });

  if (!doctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  res.status(200).json({ success: true, message: "Profile Updated" });
});

// Get dashboard data
const doctorDashboard = catchAsync(async (req, res, next) => {
  const docId = req.user.id;
  const appointments = await appointmentModel.find({ docId }).populate('userId').populate('docId');

  let earnings = 0;
  const patientSet = new Set();

  appointments.forEach((a) => {
    if (a.isCompleted || a.payment) earnings += a.amount;
    if (a.userId) patientSet.add(a.userId._id.toString());
  });

  const formattedLatest = appointments.reverse().slice(0, 5).map(item => {
    const apptObj = item.toObject();
    apptObj.userData = apptObj.userId || {};
    apptObj.docData = apptObj.docId || {};
    return apptObj;
  });

  const dashData = {
    earnings,
    appointments: appointments.length,
    patients: patientSet.size,
    latestAppointments: formattedLatest,
  };

  res.status(200).json({ success: true, dashData });
});

export {
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  doctorList,
  changeAvailability,
  doctorProfile,
  updateDoctorProfile,
  doctorDashboard,
};


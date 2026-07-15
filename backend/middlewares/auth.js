import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import { AppError } from "./errorMiddleware.js";

// Helper to extract token from various headers
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  // Fallbacks for backward compatibility
  return req.headers.token || req.headers.atoken || req.headers.dtoken;
};

export const verifyToken = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const token = extractToken(req);
      if (!token) {
        return next(new AppError("Not Authorized. Token missing.", 401));
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return next(new AppError("Invalid or expired token.", 401));
      }

      // 1. Handle Admin Role
      // Support legacy admin login (where the token is the concatenated email + password string)
      const legacyAdminToken = process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD;
      if (decoded === legacyAdminToken || (decoded && typeof decoded === "object" && decoded.role === "admin")) {
        if (allowedRoles.includes("admin")) {
          req.user = { id: "admin", role: "admin" };
          return next();
        }
        return next(new AppError("Access forbidden for this role.", 403));
      }

      // 2. Handle Doctor and User Roles
      if (decoded && typeof decoded === "object" && decoded.id) {
        // If route allows doctor, check doctor model
        if (allowedRoles.includes("doctor")) {
          const doctor = await doctorModel.findById(decoded.id).select("-password");
          if (doctor) {
            req.user = { id: doctor._id.toString(), role: "doctor", doc: doctor };
            return next();
          }
        }

        // If route allows patient, check user model
        if (allowedRoles.includes("patient")) {
          const user = await userModel.findById(decoded.id).select("-password");
          if (user) {
            req.user = { id: user._id.toString(), role: "patient", user: user };
            // Legacy compatibility: some controllers read userId from req.body
            if (!req.body) req.body = {}
            req.body.userId = user._id.toString();
            return next();
          }
        }
      }

      return next(new AppError("Access forbidden. Role permissions not met.", 403));
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return next(error);
    }
  };
};

export const authAdmin = verifyToken(["admin"]);
export const authDoctor = verifyToken(["doctor"]);
export const authUser = verifyToken(["patient"]);


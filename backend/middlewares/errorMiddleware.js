export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

const errorHandler = (err, req, res, next) => {
  console.error("Global Error Handler caught error:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose / MongoDB errors mapping
  if (err.name === "CastError") {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }
  if (err.code === 11000) {
    const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)?.[0] || "" : "";
    message = `Duplicate field value: ${value}. Please use another value!`;
    statusCode = 409;
  }
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((el) => el.message);
    message = `Invalid input data: ${errors.join(". ")}`;
    statusCode = 400;
  }
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token. Please log in again!";
    statusCode = 401;
  }
  if (err.name === "TokenExpiredError") {
    message = "Your token has expired! Please log in again.";
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    message: message,
  });
};

export default errorHandler;


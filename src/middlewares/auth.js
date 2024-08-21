import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import ErrorHandler, { TryCatch } from "./error.js";

export const isAuthenticated = TryCatch(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("User not Authenticated!", 400));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decoded.id);
  next();
});

export const adminOnly = TryCatch(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("User not Authenticated!", 400));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const user = await User.findById(decoded.id);
  if (!user) return next(new ErrorHandler("Id invalid", 401));
  if (user.role !== "admin")
    return next(new ErrorHandler("Admin only access", 403));
  next();
});

import express from "express";
import {
  getUser,
  login,
  logout,
  register,
  updatePassword,
  updateProfile,
  forgotPassword,
  resetPassword,
  getUserForPortfolio,
} from "../controllers/user.js";
import { isAuthenticated } from "../middlewares/auth.js";
import {uploads } from "../middlewares/multer.js";

const app = express.Router();

app.post("/register", uploads, register);
app.post("/login", login);
app.get("/me", isAuthenticated, getUser);
app.get("/logout", isAuthenticated, logout);
app.get("/portfolio/me", getUserForPortfolio);
app.put("/password/update", isAuthenticated, updatePassword);
app.put("/me/profile/update", isAuthenticated, updateProfile);
app.post("/password/forgot", forgotPassword);
app.put("/password/reset/:token", resetPassword);

export default app;

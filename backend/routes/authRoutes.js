import express from "express";
import { register, login, getProfile, updateProfile, uploadProfilePicture, verifyEmail, forgotPassword, resetPassword } from "../controllers/authControllers.js";
import { authenticate } from "../middleware/auth.js";
import { registerValidation, loginValidation } from "../middleware/validators.js";
import upload from "../middleware/uploads.js";

const router = express.Router();

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes (any authenticated user)
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.post(
  "/profile/picture",
  authenticate,
  upload.single('profile_picture'),
  uploadProfilePicture
);

export default router;
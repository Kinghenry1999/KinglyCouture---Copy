import express from "express";
import { register, login, getProfile, updateProfile } from "../controllers/authControllers.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Protected (user only)
router.get("/profile", authenticate, authorize('user'), getProfile);
router.put("/profile", authenticate, authorize('user'), updateProfile);

export default router;
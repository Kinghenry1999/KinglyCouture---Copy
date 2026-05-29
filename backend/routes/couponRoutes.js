import express from "express";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import * as couponController from "../controllers/couponController.js";

const router = express.Router();

// Admin routes
router.post("/", authenticate, authorize('admin', 'super_admin'), couponController.createCoupon);
router.get("/", authenticate, authorize('admin', 'super_admin'), couponController.getAllCoupons);
router.delete("/:id", authenticate, authorize('admin', 'super_admin'), couponController.deleteCoupon);

// Public route: apply coupon (requires user to be logged in)
router.post("/apply", authenticate, couponController.applyCoupon);

export default router;
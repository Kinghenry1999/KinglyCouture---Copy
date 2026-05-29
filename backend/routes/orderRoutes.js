import express from "express";
import { createPaymentIntent, createOrder, getUserOrders, getOrder } from "../controllers/orderController.js";
import { verifyPaystackPayment } from "../controllers/paymentController.js"; // new import
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.use(authenticate, authorize('user'));

// Paystack verification endpoint
router.post("/verify-paystack", verifyPaystackPayment);

// Keep existing endpoints if you still need them, or replace with new ones
router.post("/payment-intent", createPaymentIntent); // maybe remove later
router.post("/", createOrder);
router.get("/", getUserOrders);
router.get("/:orderId", getOrder);

export default router;
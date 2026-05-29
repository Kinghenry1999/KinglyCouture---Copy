// backend/routes/complaintRoutes.js
import express from "express";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import * as complaintController from "../controllers/complaintController.js";

const router = express.Router();

// Public route – anyone can submit a complaint
router.post("/", complaintController.submitComplaint);

// Admin only routes
router.get("/", authenticate, authorize('admin', 'super_admin'), complaintController.getAllComplaints);
router.post("/:id/respond", authenticate, authorize('admin', 'super_admin'), complaintController.respondComplaint);
router.delete("/:id", authenticate, authorize('admin', 'super_admin'), complaintController.deleteComplaint);

export default router;
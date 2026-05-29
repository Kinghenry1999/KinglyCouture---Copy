// backend/routes/blogRoutes.js
import express from "express";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import upload from "../middleware/uploads.js";
import * as blogController from "../controllers/blogController.js";

const router = express.Router();

// Public routes
router.get("/", blogController.getAllPosts);
router.get("/:id", blogController.getPost);

// Admin only
router.post(
  "/",
  authenticate,
  authorize('admin', 'super_admin'),
  upload.single('image'),
  blogController.createPost
);
router.put(
  "/:id",
  authenticate,
  authorize('admin', 'super_admin'),
  upload.single('image'),
  blogController.updatePost
);
router.delete(
  "/:id",
  authenticate,
  authorize('admin', 'super_admin'),
  blogController.deletePost
);

export default router;
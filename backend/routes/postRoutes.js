import express from "express";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import upload from "../middleware/uploads.js";
import * as postController from "../controllers/postController.js";

const router = express.Router();

// Public routes
router.get("/", postController.getAllPosts);
router.get("/featured", postController.getFeaturedPosts);
router.get("/category/:category", postController.getPostsByCategory);
router.get("/:id", postController.getPost);   

// Protected routes – admin only
router.post("/", authenticate, authorize('admin'), upload.single('image'), postController.createPost);
router.put("/:id", authenticate, authorize('admin'), upload.single('image'), postController.updatePost);
router.delete("/:id", authenticate, authorize('admin'), postController.deletePost);

export default router;
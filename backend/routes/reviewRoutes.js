import express from "express";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import * as reviewController from "../controllers/reviewController.js";

const router = express.Router();

// Public: get reviews for a product
router.get("/:productId", reviewController.getProductReviews);

// Protected: create/update review
router.post("/:productId", authenticate, reviewController.createOrUpdateReview);

// Protected: delete own review
router.delete("/:reviewId", authenticate, reviewController.deleteReview);

export default router;
import * as Review from "../models/Review.js";

// POST /api/reviews/:productId
export const createOrUpdateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const review = await Review.createReview(userId, productId, rating, comment || null);
    res.status(201).json(review);
  } catch (error) {
    console.error("CREATE/UPDATE REVIEW ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/reviews/:productId
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.getReviewsByProduct(productId);
    res.json(reviews);
  } catch (error) {
    console.error("GET REVIEWS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/reviews/:reviewId
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    await Review.deleteReview(reviewId, userId);
    res.json({ message: "Review deleted" });
  } catch (error) {
    console.error("DELETE REVIEW ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
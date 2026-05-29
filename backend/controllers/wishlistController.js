import * as Wishlist from "../models/Wishlist.js";

// POST /api/wishlist/:productId
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    await Wishlist.addToWishlist(userId, productId);
    res.status(201).json({ message: "Added to wishlist" });
  } catch (error) {
    console.error("ADD TO WISHLIST ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/wishlist/:productId
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    await Wishlist.removeFromWishlist(userId, productId);
    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("REMOVE FROM WISHLIST ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await Wishlist.getWishlist(userId);
    res.json(wishlist);
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
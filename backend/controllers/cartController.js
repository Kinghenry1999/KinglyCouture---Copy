// controllers/cartController.js
import * as Cart from "../models/Cart.js";

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Product ID and valid quantity required" });
    }

    const cartItem = await Cart.addToCart(userId, productId, quantity);
    res.status(201).json(cartItem);
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.getCart(userId);
    res.json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update cart item
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !quantity || quantity < 0) {
      return res.status(400).json({ message: "Product ID and valid quantity required" });
    }

    const updatedItem = await Cart.updateCartItem(userId, productId, quantity);
    res.json(updatedItem);
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    await Cart.removeFromCart(userId, productId);
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
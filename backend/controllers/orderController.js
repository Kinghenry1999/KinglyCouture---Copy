// controllers/orderController.js
import * as Order from "../models/Order.js";
import * as Cart from "../models/Cart.js";
import pool from "../config/db.js";

// Create payment intent (mock)
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body; // amount in cents
    // Mock client secret for testing
    const mockClientSecret = `mock_pi_${Date.now()}_secret_${Math.random().toString(36).substring(2)}`;
    res.json({ clientSecret: mockClientSecret });
  } catch (error) {
    console.error("Create payment intent error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create order after payment (mock)
export const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { items, totalAmount, shippingAddress, paymentIntentId } = req.body;
    const userId = req.user.id;

    // Mock payment verification (always succeed for testing)
    // In production, verify with actual payment provider

    // Create order
    const order = await Order.createOrder(userId, items, totalAmount, shippingAddress, paymentIntentId);

    // Send order confirmation email (non‑blocking)
sendEmail({
  to: req.user.email, // you need the user's email; you can get it from req.user.email (add email to JWT payload) or fetch user
  subject: "Your Order Confirmation - Kingly Stores",
  html: `
    <h2>Thank you for your order!</h2>
    <p>Order ID: ${order.id}</p>
    <p>Total: ₦${totalAmount}</p>
    <p>We'll notify you when your order ships.</p>
  `,
}).catch(err => console.error("Order confirmation email failed:", err));
    // Clear cart
    await Cart.clearCart(userId);

    // Update product quantities (if needed)
    for (const item of items) {
      await client.query(
        "UPDATE posts SET quantity = quantity - $1 WHERE id = $2",
        [item.quantity, item.productId]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(order);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Create order error:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.getOrdersByUser(userId);
    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get order by ID
export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.getOrderById(orderId);
    if (!order || order.user_id !== req.user.id) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
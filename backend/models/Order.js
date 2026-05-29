// models/Order.js
import pool from "../config/db.js";

export const createOrder = async (userId, items, totalAmount, shippingAddress, paymentReference = null, paymentProvider = 'paystack') => {
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const result = await pool.query(
    "INSERT INTO orders (id, user_id, items, total_amount, shipping_address, payment_reference, payment_provider, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
    [orderId, userId, JSON.stringify(items), totalAmount, JSON.stringify(shippingAddress), paymentReference, paymentProvider, 'completed']
  );
  return result.rows[0];
};
export const getOrdersByUser = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return result.rows.map(order => ({
    ...order,
    items: JSON.parse(order.items),
    shipping_address: JSON.parse(order.shipping_address)
  }));
};

export const getOrderById = async (orderId) => {
  const result = await pool.query("SELECT * FROM orders WHERE id = $1", [orderId]);
  if (result.rows.length === 0) return null;
  const order = result.rows[0];
  return {
    ...order,
    items: JSON.parse(order.items),
    shipping_address: JSON.parse(order.shipping_address)
  };
};

export const updateOrderStatus = async (orderId, status) => {
  const result = await pool.query(
    "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
    [status, orderId]
  );
  return result.rows[0];
};
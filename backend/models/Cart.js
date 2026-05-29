import pool from "../config/db.js";

export const addToCart = async (userId, productId, quantity) => {
  const existing = await pool.query(
    "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2",
    [userId, productId]
  );
  if (existing.rows.length > 0) {
    const result = await pool.query(
      "UPDATE cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 RETURNING *",
      [quantity, userId, productId]
    );
    return result.rows[0];
  } else {
    const result = await pool.query(
      "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
      [userId, productId, quantity]
    );
    return result.rows[0];
  }
};

export const getCart = async (userId) => {
  const result = await pool.query(
    // FIXED: use p.image_url AS image so the frontend gets { image }
    "SELECT c.*, p.name, p.price, p.image_url AS image FROM cart c JOIN posts p ON c.product_id = p.id WHERE c.user_id = $1",
    [userId]
  );
  return result.rows;
};

export const updateCartItem = async (userId, productId, quantity) => {
  const result = await pool.query(
    "UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *",
    [quantity, userId, productId]
  );
  return result.rows[0];
};

export const removeFromCart = async (userId, productId) => {
  await pool.query(
    "DELETE FROM cart WHERE user_id = $1 AND product_id = $2",
    [userId, productId]
  );
};

export const clearCart = async (userId) => {
  await pool.query("DELETE FROM cart WHERE user_id = $1", [userId]);
};
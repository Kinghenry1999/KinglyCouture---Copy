import pool from "../config/db.js";

export const addToWishlist = async (userId, productId) => {
  await pool.query(
    "INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [userId, productId]
  );
};

export const removeFromWishlist = async (userId, productId) => {
  await pool.query(
    "DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2",
    [userId, productId]
  );
};

export const getWishlist = async (userId) => {
  const result = await pool.query(
    "SELECT w.*, p.name, p.price, p.image_url AS image FROM wishlist w JOIN posts p ON w.product_id = p.id WHERE w.user_id = $1",
    [userId]
  );
  return result.rows;
};

export const isInWishlist = async (userId, productId) => {
  const result = await pool.query(
    "SELECT 1 FROM wishlist WHERE user_id = $1 AND product_id = $2",
    [userId, productId]
  );
  return result.rows.length > 0;
};
import pool from "../config/db.js";

export const createReview = async (userId, productId, rating, comment) => {
  const result = await pool.query(
    `INSERT INTO reviews (user_id, product_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, product_id) DO UPDATE
     SET rating = $3, comment = $4
     RETURNING *`,
    [userId, productId, rating, comment]
  );
  return result.rows[0];
};

export const getReviewsByProduct = async (productId) => {
  const result = await pool.query(
    `SELECT r.*, u.name as user_name
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.product_id = $1
     ORDER BY r.created_at DESC`,
    [productId]
  );
  return result.rows;
};

export const getReviewByUserAndProduct = async (userId, productId) => {
  const result = await pool.query(
    "SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2",
    [userId, productId]
  );
  return result.rows[0];
};

export const deleteReview = async (reviewId, userId) => {
  await pool.query("DELETE FROM reviews WHERE id = $1 AND user_id = $2", [reviewId, userId]);
};
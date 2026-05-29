// backend/models/Post.js
import pool from "../config/db.js";

export const createPost = async (name, price, imageUrl, category, featured, quantity, description, adminId) => {
  const result = await pool.query(
    "INSERT INTO posts (name, price, image_url, category, featured, quantity, description, admin_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
    [name, price, imageUrl, category, featured, quantity, description, adminId]
  );
  return result.rows[0];
};

export const getAllPosts = async () => {
  const result = await pool.query(`
    SELECT p.id, p.name, p.price, p.image_url AS image, p.category, p.featured, p.quantity, p.description, p.admin_id, p.created_at, p.updated_at,
           COALESCE(ROUND(AVG(r.rating), 1), 0) as average_rating,
           COUNT(r.id) as review_count
    FROM posts p
    LEFT JOIN reviews r ON p.id = r.product_id
    GROUP BY p.id
    ORDER BY p.id DESC
  `);
  return result.rows;
};

export const getFeaturedPosts = async (limit = 20) => {
  const result = await pool.query(`
    SELECT p.id, p.name, p.price, p.image_url AS image, p.category, p.featured, p.quantity, p.description, p.admin_id, p.created_at, p.updated_at,
           COALESCE(ROUND(AVG(r.rating), 1), 0) as average_rating,
           COUNT(r.id) as review_count
    FROM posts p
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.featured = true
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT $1
  `, [limit]);
  return result.rows;
};

export const getPostsByCategory = async (category) => {
  const result = await pool.query(`
    SELECT p.id, p.name, p.price, p.image_url AS image, p.category, p.featured, p.quantity, p.description, p.admin_id, p.created_at, p.updated_at,
           COALESCE(ROUND(AVG(r.rating), 1), 0) as average_rating,
           COUNT(r.id) as review_count
    FROM posts p
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.category = $1
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `, [category]);
  return result.rows;
};

export const getPostById = async (id) => {
  const result = await pool.query(`
    SELECT p.id, p.name, p.price, p.image_url AS image, p.category, p.featured, p.quantity, p.description, p.admin_id, p.created_at, p.updated_at,
           COALESCE(ROUND(AVG(r.rating), 1), 0) as average_rating,
           COUNT(r.id) as review_count
    FROM posts p
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.id = $1
    GROUP BY p.id
  `, [id]);
  return result.rows[0];
};

export const updatePost = async (id, name, price, image, category, featured, quantity, description) => {
  const result = await pool.query(
    "UPDATE posts SET name = $1, price = $2, image_url = $3, category = $4, featured = $5, quantity = $6, description = $7 WHERE id = $8 RETURNING *",
    [name, price, image, category, featured, quantity, description, id]
  );
  return result.rows[0];
};

export const deletePost = async (id) => {
  await pool.query("DELETE FROM posts WHERE id = $1", [id]);
};

export const countFeaturedPosts = async () => {
  const result = await pool.query("SELECT COUNT(*) FROM posts WHERE featured = true");
  return parseInt(result.rows[0].count);
};
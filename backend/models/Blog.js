// backend/models/Blog.js
import pool from "../config/db.js";

export const createBlogPost = async (title, content, excerpt, imageUrl, author) => {
  const result = await pool.query(
    `INSERT INTO blog_posts (title, content, excerpt, image_url, author)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [title, content, excerpt, imageUrl, author]
  );
  return result.rows[0];
};

export const getAllBlogPosts = async () => {
  const result = await pool.query(
    "SELECT * FROM blog_posts ORDER BY published_at DESC"
  );
  return result.rows;
};

export const getBlogPostById = async (id) => {
  const result = await pool.query("SELECT * FROM blog_posts WHERE id = $1", [id]);
  return result.rows[0];
};

export const updateBlogPost = async (id, title, content, excerpt, imageUrl, author) => {
  const result = await pool.query(
    `UPDATE blog_posts
     SET title = $1, content = $2, excerpt = $3, image_url = $4, author = $5, updated_at = CURRENT_TIMESTAMP
     WHERE id = $6 RETURNING *`,
    [title, content, excerpt, imageUrl, author, id]
  );
  return result.rows[0];
};

export const deleteBlogPost = async (id) => {
  await pool.query("DELETE FROM blog_posts WHERE id = $1", [id]);
};
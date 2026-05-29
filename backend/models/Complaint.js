// backend/models/Complaint.js
import pool from "../config/db.js";

export const createComplaint = async (name, email, message) => {
  const result = await pool.query(
    `INSERT INTO complaints (name, email, message, status)
     VALUES ($1, $2, $3, 'pending') RETURNING *`,
    [name, email, message]
  );
  return result.rows[0];
};

export const getAllComplaints = async () => {
  const result = await pool.query(
    "SELECT * FROM complaints ORDER BY created_at DESC"
  );
  return result.rows;
};

export const getComplaintById = async (id) => {
  const result = await pool.query("SELECT * FROM complaints WHERE id = $1", [id]);
  return result.rows[0];
};

export const respondToComplaint = async (id, adminResponse) => {
  const result = await pool.query(
    `UPDATE complaints 
     SET admin_response = $1, status = 'responded', updated_at = CURRENT_TIMESTAMP
     WHERE id = $2 RETURNING *`,
    [adminResponse, id]
  );
  return result.rows[0];
};

export const deleteComplaint = async (id) => {
  await pool.query("DELETE FROM complaints WHERE id = $1", [id]);
};
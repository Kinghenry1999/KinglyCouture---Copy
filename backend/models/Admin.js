import pool from "../config/db.js";

export const createAdmin = async (name, email, password, role = 'admin') => {
  const result = await pool.query(
    "INSERT INTO admins (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, email, password, role]
  );
  return result.rows[0];
};

export const getAdminByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);
  return result.rows[0];
};

export const getAdminById = async (id) => {
  const result = await pool.query("SELECT * FROM admins WHERE id = $1", [id]);
  return result.rows[0];
};

export const updateAdminProfilePicture = async (id, profilePictureUrl) => {
  const result = await pool.query(
    "UPDATE admins SET profile_picture = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
    [profilePictureUrl, id]
  );
  return result.rows[0];
};
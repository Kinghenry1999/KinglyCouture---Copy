import pool from "../config/db.js";

export const createUser = async (name, email, password, role = 'user', phone = null, address = null) => {
  const result = await pool.query(
    "INSERT INTO users (name, email, password, role, phone, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [name, email, password, role, phone, address]
  );
  return result.rows[0];
};

export const getUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
};

export const getUserById = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
};

export const updateUserProfile = async (id, { name, phone, address }) => {
  const result = await pool.query(
    "UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), address = COALESCE($3, address), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *",
    [name, phone, address, id]
  );
  return result.rows[0];
};

export const updateUserProfilePicture = async (id, profilePictureUrl) => {
  const result = await pool.query(
    "UPDATE users SET profile_picture = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
    [profilePictureUrl, id]
  );
  return result.rows[0];
};

export const verifyUser = async (id) => {
  await pool.query("UPDATE users SET verified = true WHERE id = $1", [id]);
};

export const updateUserPassword = async (id, hashedPassword) => {
  await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, id]);
};
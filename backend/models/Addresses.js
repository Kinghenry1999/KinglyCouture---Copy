import pool from "../config/db.js";

export const createAddress = async (userId, addressData) => {
  const { address_line1, address_line2, city, state, postal_code, country, is_default } = addressData;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (is_default) {
      await client.query(
        "UPDATE addresses SET is_default = false WHERE user_id = $1",
        [userId]
      );
    }
    const result = await client.query(
      `INSERT INTO addresses 
       (user_id, address_line1, address_line2, city, state, postal_code, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, address_line1, address_line2, city, state, postal_code, country, is_default || false]
    );
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getAddressesByUser = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC",
    [userId]
  );
  return result.rows;
};

export const getAddressById = async (addressId, userId) => {
  const result = await pool.query(
    "SELECT * FROM addresses WHERE id = $1 AND user_id = $2",
    [addressId, userId]
  );
  return result.rows[0];
};

export const updateAddress = async (addressId, userId, addressData) => {
  const { address_line1, address_line2, city, state, postal_code, country, is_default } = addressData;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (is_default) {
      await client.query(
        "UPDATE addresses SET is_default = false WHERE user_id = $1",
        [userId]
      );
    }
    const result = await client.query(
      `UPDATE addresses SET
        address_line1 = COALESCE($1, address_line1),
        address_line2 = COALESCE($2, address_line2),
        city = COALESCE($3, city),
        state = COALESCE($4, state),
        postal_code = COALESCE($5, postal_code),
        country = COALESCE($6, country),
        is_default = COALESCE($7, is_default),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [address_line1, address_line2, city, state, postal_code, country, is_default, addressId, userId]
    );
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const deleteAddress = async (addressId, userId) => {
  const result = await pool.query(
    "DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *",
    [addressId, userId]
  );
  return result.rows[0];
};

export const setDefaultAddress = async (addressId, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      "UPDATE addresses SET is_default = false WHERE user_id = $1",
      [userId]
    );
    const result = await client.query(
      "UPDATE addresses SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING *",
      [addressId, userId]
    );
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
import pool from "../config/db.js";

export const createCoupon = async (code, discountType, discountValue, minOrder, expiresAt, usageLimit) => {
  const result = await pool.query(
    "INSERT INTO coupons (code, discount_type, discount_value, min_order, expires_at, usage_limit) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [code, discountType, discountValue, minOrder, expiresAt, usageLimit]
  );
  return result.rows[0];
};

export const getCouponByCode = async (code) => {
  const result = await pool.query("SELECT * FROM coupons WHERE code = $1", [code]);
  return result.rows[0];
};

export const getAllCoupons = async () => {
  const result = await pool.query("SELECT * FROM coupons ORDER BY created_at DESC");
  return result.rows;
};

export const deleteCoupon = async (id) => {
  await pool.query("DELETE FROM coupons WHERE id = $1", [id]);
};

export const incrementUsedCount = async (id) => {
  await pool.query("UPDATE coupons SET used_count = used_count + 1 WHERE id = $1", [id]);
};
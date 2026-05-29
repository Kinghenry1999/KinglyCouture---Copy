import * as Coupon from "../models/Coupon.js";

// Admin: create coupon
export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrder, expiresAt, usageLimit } = req.body;
    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ message: "Code, type, and value are required" });
    }

    const coupon = await Coupon.createCoupon(code, discountType, discountValue, minOrder || 0, expiresAt || null, usageLimit || 1);
    res.status(201).json(coupon);
  } catch (error) {
    console.error("CREATE COUPON ERROR:", error);
    if (error.code === '23505') {
      return res.status(400).json({ message: "Coupon code already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: get all coupons
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.getAllCoupons();
    res.json(coupons);
  } catch (error) {
    console.error("GET COUPONS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await Coupon.deleteCoupon(id);
    res.json({ message: "Coupon deleted" });
  } catch (error) {
    console.error("DELETE COUPON ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Public: validate and apply coupon (used during checkout)
export const applyCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.getCouponByCode(code);
    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    // Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    // Check usage limit
    if (coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    // Check minimum order
    if (orderTotal < coupon.min_order) {
      return res.status(400).json({ message: `Minimum order of ₦${coupon.min_order} required` });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (coupon.discount_value / 100) * orderTotal;
    } else {
      discount = coupon.discount_value;
    }
    discount = Math.min(discount, orderTotal); // discount can't exceed total

    res.json({
      couponId: coupon.id,
      code: coupon.code,
      discount: parseFloat(discount.toFixed(2)),
      finalTotal: parseFloat((orderTotal - discount).toFixed(2)),
    });
  } catch (error) {
    console.error("APPLY COUPON ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
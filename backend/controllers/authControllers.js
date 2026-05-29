import * as authService from "../services/authService.js";
import * as User from "../models/User.js";
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';
import AppError from "../utils/AppError.js";

// ================= REGISTER =================
export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// ================= LOGIN =================
export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    if (result.requiresRoleSelection) {
      return res.status(200).json({ success: true, ...result });
    }
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// ================= VERIFY EMAIL =================
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      throw new AppError("Email and verification code required", 400);
    }

    const user = await User.getUserByEmail(email);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.verified) {
      return res.json({ success: true, message: "Email already verified" });
    }

    const result = await pool.query(
      "SELECT * FROM email_verifications WHERE user_id = $1 AND token = $2 AND expires_at > NOW()",
      [user.id, code]
    );

    if (result.rows.length === 0) {
      throw new AppError("Invalid or expired verification code", 400);
    }

    await pool.query("UPDATE users SET verified = true WHERE id = $1", [user.id]);
    await pool.query("DELETE FROM email_verifications WHERE token = $1", [code]);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, verified: true },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Email verified successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ================= GET PROFILE =================
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.getUserById(req.user.id);
    if (!user) throw new AppError("User not found", 404);
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profile_picture: user.profile_picture,
        role: user.role,
        verified: user.verified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const updatedUser = await User.updateUserProfile(req.user.id, { name, phone, address });
    res.json({
      success: true,
      message: "Profile updated",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// ================= UPLOAD PROFILE PICTURE =================
export const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError("No image file provided", 400);
   const imageUrl = req.file.path; 
    await pool.query("UPDATE users SET profile_picture = $1 WHERE id = $2", [imageUrl, req.user.id]);
    res.json({ success: true, message: "Profile picture updated", imageUrl });
  } catch (error) {
    next(error);
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError("Email required", 400);

    const user = await User.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user doesn't exist
      return res.json({ success: true, message: "If that email exists, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

    await pool.query(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, token, expiresAt]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    });

    res.json({ success: true, message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    next(error);
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) throw new AppError("Token and new password required", 400);

    const result = await pool.query(
      "SELECT * FROM password_resets WHERE token = $1 AND expires_at > NOW()",
      [token]
    );
    if (result.rows.length === 0) throw new AppError("Invalid or expired token", 400);

    const reset = result.rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, reset.user_id]);
    await pool.query("DELETE FROM password_resets WHERE token = $1", [token]);

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';
import pool from "../config/db.js";
import * as User from "../models/User.js";
import AppError from "../utils/AppError.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, verified: user.verified },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const registerUser = async ({ name, email, password, phone, address, role = 'user', adminKey }) => {
  if (!name || !email || !password) {
    throw new AppError("Name, email and password are required", 400);
  }

  const existingUser = await User.getUserByEmail(email);
  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  let finalRole = 'user';
  if (role === 'admin' || role === 'super_admin') {
    if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
      throw new AppError("Invalid admin registration key", 403);
    }
    finalRole = role;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.createUser(name, email, hashedPassword, finalRole, phone, address);

  // Generate verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await pool.query(
    "INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($1, $2, $3)",
    [newUser.id, verificationCode, expiresAt]
  );

  // Non-blocking email
  sendEmail({
    to: email,
    subject: "Verify your email address",
    html: `
      <h2>Welcome to Kingly Stores!</h2>
      <p>Your email verification code is:</p>
      <h1 style="font-size: 32px; letter-spacing: 5px; background: #f0f0f0; padding: 10px;">${verificationCode}</h1>
      <p>This code will expire in 24 hours.</p>
      <p>If you did not register, please ignore this email.</p>
    `,
  }).catch(err => {
    console.error("Failed to send verification email:", err);
  });

  const token = generateToken({ ...newUser, verified: false });

  return {
    message: "User registered successfully. Please check your email for verification code.",
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      verified: false,
    },
  };
};

export const loginUser = async ({ email, password, requestedRole }) => {
  if (!email || !password) {
    throw new AppError("Email and password required", 400);
  }

  const user = await User.getUserByEmail(email);
  if (!user) {
    throw new AppError("Invalid credentials", 400);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 400);
  }

  // (Optional) enforce email verification
  // if (!user.verified) {
  //   throw new AppError("Please verify your email first", 403);
  // }

  // Non-blocking login notification
  sendEmail({
    to: user.email,
    subject: "New login to your account",
    html: `
      <p>Hello ${user.name},</p>
      <p>We detected a new login to your account at ${new Date().toLocaleString()}.</p>
      <p>If this was you, no further action is needed. If you didn't log in, please reset your password immediately.</p>
    `,
  }).catch(err => console.error("Login notification email failed:", err));

  const availableRoles = [user.role];

  if (requestedRole) {
    if (!availableRoles.includes(requestedRole)) {
      throw new AppError("You do not have the requested role", 403);
    }
    const token = generateToken({ ...user, role: requestedRole });
    return {
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: requestedRole,
        verified: user.verified,
        phone: user.phone,
        address: user.address,
      },
    };
  }

  if (availableRoles.length > 1) {
    return {
      requiresRoleSelection: true,
      availableRoles,
      message: "Please select a role to continue",
    };
  }

  const token = generateToken(user);
  return {
    message: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
      phone: user.phone,
      address: user.address,
    },
  };
};
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// HTTP logging
app.use(morgan('combined'));

// CORS – allow both Vercel and local dev
const allowedOrigins = [
  process.env.FRONTEND_URL,          // e.g. https://your-app.vercel.app
  "http://localhost:5173",
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ❌ No longer serving local uploads – Cloudinary hosts images directly
// app.use('/uploads', express.static(...));   <- REMOVED

// Routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/cart", cartRoutes);
app.use("/addresses", addressRoutes);
app.use("/orders", orderRoutes);
app.use("/blog", blogRoutes);
app.use("/complaints", complaintRoutes);
app.use("/reviews", reviewRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/coupons", couponRoutes);

app.get("/", (req, res) => {
  res.send("Kingly Stores API running 🚀");
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
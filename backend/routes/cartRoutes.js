// routes/cartRoutes.js
import express from "express";
import { addToCart, getCart, updateCartItem, removeFromCart } from "../controllers/cartController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

// All cart routes require user role
router.use(authenticate, authorize('user'));

router.post("/", addToCart);
router.get("/", getCart);
router.put("/", updateCartItem);
router.delete("/:productId", removeFromCart);

export default router;
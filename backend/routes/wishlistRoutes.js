import express from "express";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import * as wishlistController from "../controllers/wishlistController.js";

const router = express.Router();

router.use(authenticate, authorize('user'));

router.post("/:productId", wishlistController.addToWishlist);
router.delete("/:productId", wishlistController.removeFromWishlist);
router.get("/", wishlistController.getWishlist);

export default router;
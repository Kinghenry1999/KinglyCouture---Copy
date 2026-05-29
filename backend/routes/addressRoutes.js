// routes/addressRoutes.js
import express from "express";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import * as addressController from "../controllers/addressController.js";

const router = express.Router();

// All address routes require user role
router.use(authenticate, authorize('user'));

router.post("/", addressController.createAddress);
router.get("/", addressController.getAddresses);
router.get("/:addressId", addressController.getAddress);
router.put("/:addressId", addressController.updateAddress);
router.delete("/:addressId", addressController.deleteAddress);
router.patch("/:addressId/default", addressController.setDefaultAddress);

export default router;
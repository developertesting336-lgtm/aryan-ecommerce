import express from "express";
import {
  adminDashboard,
  adminEditProducts,
  adminOrders,
  adminProducts,
  adminUsers,
  getProductById,
  adminUpdateOrderStatus,
  getOrderById,
  getAdminUserOrders,
  getAdminUserReviews,
} from "../controllers/admin.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/dashboard", verifyJWT, verifyAdmin, adminDashboard);
router.get("/products", verifyJWT, verifyAdmin, adminProducts);
router.get("/users", verifyJWT, verifyAdmin, adminUsers);
router.get("/orders", verifyJWT, verifyAdmin, adminOrders);
router.get("/products/:id", verifyJWT, verifyAdmin, getProductById);
router.put("/products/:id", verifyJWT, verifyAdmin, upload, adminEditProducts);
router.get("/orders/:id", verifyJWT, getOrderById);
router.patch("/orders/:id/status", verifyJWT, verifyAdmin, adminUpdateOrderStatus);

// Admin User Specific Orders & Reviews
router.get("/users/:userId/orders", verifyJWT, verifyAdmin, getAdminUserOrders);
router.get("/customers/:userId/orders", verifyJWT, verifyAdmin, getAdminUserOrders);
router.get("/users/:userId/reviews", verifyJWT, verifyAdmin, getAdminUserReviews);
router.get("/customers/:userId/reviews", verifyJWT, verifyAdmin, getAdminUserReviews);


export default router;
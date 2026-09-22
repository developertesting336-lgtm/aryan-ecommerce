import express from "express";
import { vendorDashboard,vendorEditProducts,vendorOrders,vendorProducts } from "../controllers/vendor.controller.js";
import { verifyJWT,verifyAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/dashboard",verifyJWT,vendorDashboard);
router.get("/products",verifyJWT,vendorProducts);
router.get("/orders",verifyJWT,vendorOrders);
router.patch("/products/:id",verifyJWT, upload,vendorEditProducts);
// router.patch("/orders/:id/status",verifyJWT,verifyAdmin,adminUpdateOrderStatus);


export default router;
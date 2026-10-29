import express from "express";
import {
  getAdminRefunds,
  getAdminRefundById,
  updateRefundStatus,
  receiveReturnedItems,
  processRefundPayment,
} from "../controllers/adminRefund.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyJWT, verifyAdmin, getAdminRefunds);
router.get("/:id", verifyJWT, verifyAdmin, getAdminRefundById);
router.patch("/:id/status", verifyJWT, verifyAdmin, updateRefundStatus);
router.patch("/:id/receive", verifyJWT, verifyAdmin, receiveReturnedItems);
router.post("/:id/process", verifyJWT, verifyAdmin, processRefundPayment);

export default router;

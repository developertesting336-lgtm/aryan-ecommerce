import express from "express";
import {
  createRefundRequest,
  getUserRefundRequests,
  getRefundRequestById,
  checkOrderEligibility,
} from "../controllers/refund.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/", verifyJWT, upload, createRefundRequest);
router.get("/", verifyJWT, getUserRefundRequests);
router.get("/eligibility/:orderId", verifyJWT, checkOrderEligibility);
router.get("/:id", verifyJWT, getRefundRequestById);

export default router;

import express from "express";
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  addComplaintMessage,
  closeMyComplaint,
  getUserOrdersForComplaint,
} from "../controllers/complaint.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";
import {
  complaintCreateLimiter,
  complaintReplyLimiter,
} from "../utils/complaintValidation.js";

const router = express.Router();

// All customer complaint routes require authentication
router.use(verifyJWT);

// Customer complaints collection
router.get("/user-orders", getUserOrdersForComplaint);
router.post("/", complaintCreateLimiter, upload, createComplaint);
router.get("/", getMyComplaints);

// Specific complaint resource
router.get("/:id", getComplaintById);
router.post("/:id/messages", complaintReplyLimiter, upload, addComplaintMessage);
router.patch("/:id/close", closeMyComplaint);

export default router;

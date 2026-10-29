import express from "express";
import {
  getAdminComplaints,
  getAdminComplaintById,
  updateComplaintStatus,
  updateComplaintPriority,
  addAdminInternalNote,
} from "../controllers/adminComplaint.controller.js";
import { addComplaintMessage } from "../controllers/complaint.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

// Admin-only protection
router.use(verifyJWT, verifyAdmin);

router.get("/", getAdminComplaints);
router.get("/:id", getAdminComplaintById);
router.patch("/:id/status", updateComplaintStatus);
router.patch("/:id/priority", updateComplaintPriority);
router.post("/:id/messages", upload, addComplaintMessage);
router.post("/:id/internal-notes", addAdminInternalNote);

export default router;

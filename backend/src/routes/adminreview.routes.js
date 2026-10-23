import express from "express";

import {
  getReviewDashboard,
  getReviewTimeline,
  getAdminReviews,
  getReviewById,
  updateReviewApproval,
  bulkUpdateReviews,
  deleteReview,
} from "../controllers/adminreview.controller.js";

// Use the same auth middleware your other admin routes use
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT, verifyAdmin);

// Fixed paths first, so Express doesn't treat them as an :id
router.get("/dashboard", getReviewDashboard);
router.get("/timeline", getReviewTimeline);
router.patch("/bulk", bulkUpdateReviews);

router.get("/", getAdminReviews);

router.get("/:id", getReviewById);
router.patch("/:id/approval", updateReviewApproval);
router.delete("/:id", deleteReview);

export default router;
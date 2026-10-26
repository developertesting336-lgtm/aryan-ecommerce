// routes/referral.routes.js
import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createReferralLink,
  trackClick,
  getMyPoints,
  getMyReferrals,
  getMyLinks,
  getPointsHistory,
} from "../controllers/referral.controller.js";

const router = express.Router();

router.post("/click", trackClick); // public
router.post("/link", verifyJWT, createReferralLink);
router.get("/points", verifyJWT, getMyPoints);
router.get("/my-referrals", verifyJWT, getMyReferrals);
router.get("/my-links", verifyJWT, getMyLinks);
router.get("/ledger", verifyJWT, getPointsHistory);

export default router;
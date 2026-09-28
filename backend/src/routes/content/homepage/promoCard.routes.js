import express from "express";

import {
  getPromoCards,
  getPromoCardById,
  createPromoCard,
  updatePromoCard,
  deletePromoCard,
  togglePromoCardStatus,
} from "../../../controllers/content/homepage/promoCard.controller.js";

import {
  verifyJWT,
  verifyAdmin,
} from "../../../middlewares/auth.middleware.js";

import { upload } from "../../../middlewares/multer.js";

const router = express.Router();

// Get all promo cards
router.get("/", verifyJWT, verifyAdmin, getPromoCards);

// Get single promo card
router.get("/:id", verifyJWT, verifyAdmin, getPromoCardById);

// Create promo card
router.post("/", verifyJWT, verifyAdmin, upload, createPromoCard);

// Update promo card
router.put("/:id", verifyJWT, verifyAdmin, upload, updatePromoCard);

// Delete promo card
router.delete("/:id", verifyJWT, verifyAdmin, deletePromoCard);

// Activate / deactivate promo card
router.patch("/:id/status", verifyJWT, verifyAdmin, togglePromoCardStatus);

export default router;

import express from "express";

import {
  getPromoGridItems,
  getPromoGridItemById,
  createPromoGridItem,
  updatePromoGridItem,
  deletePromoGridItem,
  togglePromoGridItemStatus,
} from "../../../controllers/content/homepage/promoGrid.controller.js";

import {
  verifyJWT,
  verifyAdmin,
} from "../../../middlewares/auth.middleware.js";

import { upload } from "../../../middlewares/multer.js";

const router = express.Router();

// Get all promo grid items
router.get("/", verifyJWT, verifyAdmin, getPromoGridItems);

// Get single promo grid item
router.get("/:id", verifyJWT, verifyAdmin, getPromoGridItemById);

// Create promo grid item
router.post("/", verifyJWT, verifyAdmin, upload, createPromoGridItem);

// Update promo grid item
router.put("/:id", verifyJWT, verifyAdmin, upload, updatePromoGridItem);

// Delete promo grid item
router.delete("/:id", verifyJWT, verifyAdmin, deletePromoGridItem);

// Activate / deactivate promo grid item
router.patch("/:id/status", verifyJWT, verifyAdmin, togglePromoGridItemStatus);

export default router;

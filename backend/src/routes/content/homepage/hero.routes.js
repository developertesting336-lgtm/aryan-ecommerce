import express from "express";

import {
  getHeroSlides,
  getHeroSlideById,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  toggleHeroSlideStatus,
} from "../../../controllers/content/homepage/hero.controller.js";

import {
  verifyJWT,
  verifyAdmin,
} from "../../../middlewares/auth.middleware.js";

import { upload } from "../../../middlewares/multer.js";

const router = express.Router();

// Get all hero slides
router.get("/", verifyJWT, verifyAdmin, getHeroSlides);

// Get single hero slide
router.get("/:id", verifyJWT, verifyAdmin, getHeroSlideById);

// Create hero slide
router.post("/", verifyJWT, verifyAdmin, upload, createHeroSlide);

// Update hero slide
router.put("/:id", verifyJWT, verifyAdmin, upload, updateHeroSlide);

// Delete hero slide
router.delete("/:id", verifyJWT, verifyAdmin, deleteHeroSlide);

// Activate / deactivate hero slide
router.patch("/:id/status", verifyJWT, verifyAdmin, toggleHeroSlideStatus);

export default router;

import express from "express";

import {
  createReview,
  getProductReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "../controllers/reviews.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

// Create a review for a product
router.post("/:productId", verifyJWT,upload, createReview);

// Get all reviews of a product
router.get("/product/:productId", getProductReviews);

// Get single review
router.get("/:id", getReviewById);

// Update user's review
router.patch("/:id", verifyJWT,upload, updateReview);

// Delete user's review
router.delete("/:id", verifyJWT, deleteReview);

export default router;

import express from "express";

import {
  getShopByNeedItems,
  getShopByNeedItemById,
  createShopByNeedItem,
  updateShopByNeedItem,
  deleteShopByNeedItem,
  toggleShopByNeedItemStatus,
} from "../../../controllers/content/homepage/shopByNeed.controller.js";

import {
  verifyJWT,
  verifyAdmin,
} from "../../../middlewares/auth.middleware.js";

import { upload,uploadMedia } from "../../../middlewares/multer.js";

const router = express.Router();

// Get all Shop By Need items
router.get("/", verifyJWT, verifyAdmin, getShopByNeedItems);

// Get single Shop By Need item
router.get("/:id", verifyJWT, verifyAdmin, getShopByNeedItemById);

// Create Shop By Need item
router.post("/", verifyJWT, verifyAdmin, uploadMedia, createShopByNeedItem);

// Update Shop By Need item
router.put("/:id", verifyJWT, verifyAdmin, uploadMedia, updateShopByNeedItem);

// Delete Shop By Need item
router.delete("/:id", verifyJWT, verifyAdmin, deleteShopByNeedItem);

// Activate / deactivate Shop By Need item
router.patch("/:id/status", verifyJWT, verifyAdmin, toggleShopByNeedItemStatus);

export default router;

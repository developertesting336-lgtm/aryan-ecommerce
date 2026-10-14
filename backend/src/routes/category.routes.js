// routes/category.routes.js

import express from "express";

import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryChildren,
  getRootCategories,
  getstatsData,
} from "../controllers/category.controller.js";

const router = express.Router();

router.post("/", createCategory);

router.get("/", getCategories);

router.get("/stats", getstatsData);

router.get("/roots", getRootCategories);

router.get("/:id/children", getCategoryChildren);

router.get("/:id", getCategoryById);

router.patch("/:id", updateCategory);

router.delete("/:id", deleteCategory);

export default router;
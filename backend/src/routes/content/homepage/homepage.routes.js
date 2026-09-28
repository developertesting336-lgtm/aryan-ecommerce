import express from "express";

import {
  getHomepage,
} from "../../../controllers/content/homepage/homepage.controller.js";

const router = express.Router();

/*
 * Public homepage content
 *
 * GET /api/homepage
 */
router.get("/", getHomepage);

export default router;
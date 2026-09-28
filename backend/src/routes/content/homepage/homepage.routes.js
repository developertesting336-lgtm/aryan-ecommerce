import express from "express";

import {
  getHomepage,
} from "../../../controllers/content/homePage/homepage.controller.js";

const router = express.Router();

/*
 * Public homepage content
 *
 * GET /api/homepage
 */
router.get("/", getHomepage);

export default router;
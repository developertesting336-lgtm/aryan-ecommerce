import express from "express";
import { getProducts } from "../controllers/productRelation.controller.js";

const router = express.Router();

// CREATE
router.get("/:product",getProducts);




export default router;
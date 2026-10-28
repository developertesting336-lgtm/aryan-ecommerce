import express from "express";
import { createProduct,getProducts,getVendorsProducts,getProductById,editProduct,
     searchProducts,getProductsByFilter } from "../controllers/product.controller.js";
import { validate } from "../middlewares/validate.js";
import { createProductSchema } from "../utils/validation.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.js";
import { getPriceHistory } from "../controllers/priceHistory.controller.js";

const router = express.Router();

// CREATE
router.get("/",getProducts);
router.get("/filter",getProductsByFilter);
router.get("/search",searchProducts);
router.get("/myProducts", verifyJWT,getVendorsProducts);
router.post("/", verifyJWT,validate(createProductSchema),upload, createProduct);
// router.post("/", verifyJWT,validate(createProductSchema),upload.array("images", 5), createProduct);
// router.get("/:id",verifyJWT,getProductById)
router.get("/:id",getProductById)
router.patch("/:id",verifyJWT, upload,editProduct);
router.get("/:id/price-history", getPriceHistory);


export default router;
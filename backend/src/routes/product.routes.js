import express from "express";
import { createProduct,getProducts,getVendorsProducts,getProductById,editProduct, searchProducts,getProductsByFilter } from "../controllers/product.controller.js";
import { validate } from "../middlewares/validate.js";
import { createProductSchema } from "../utils/validation.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.js";
const router = express.Router();

// CREATE
router.get("/",getProducts);
router.get("/filter",getProductsByFilter);
router.get("/search",searchProducts);
router.get("/myProducts", verifyJWT,getVendorsProducts);
router.post("/", verifyJWT,validate(createProductSchema),upload, createProduct);
// router.post("/", verifyJWT,validate(createProductSchema),upload.array("images", 5), createProduct);
router.get("/:id",verifyJWT,getProductById)
router.patch("/:id",verifyJWT, upload,editProduct);



export default router;
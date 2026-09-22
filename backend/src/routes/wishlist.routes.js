import express from "express";
import { addProducts,deleteProducts,getProducts } from "../controllers/wishlist.controller.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema } from "../utils/validation.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/:productId",verifyJWT,addProducts);
router.patch("/:productId",verifyJWT,deleteProducts);
router.get("/",verifyJWT,getProducts);


export default router;
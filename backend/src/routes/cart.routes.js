import express from "express";
import { addProducts,getCart ,decreaseQuantity} from "../controllers/cart.controller.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema } from "../utils/validation.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/",verifyJWT,addProducts);
router.get("/",verifyJWT,getCart);
router.patch("/:productId",verifyJWT,decreaseQuantity);


export default router;
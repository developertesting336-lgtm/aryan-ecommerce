import express from "express";
import { validate } from "../middlewares/validate.js";
import { registerSchema } from "../utils/validation.js";
import { upload } from "../middlewares/multer.js";
import { verifyAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { payment,testingapi } from "../controllers/payment.controller.js";
const router = express.Router();

router.post("/",verifyJWT,payment);
router.post("/testing",verifyJWT,testingapi);


export default router;
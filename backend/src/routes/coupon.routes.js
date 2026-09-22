import express from "express";
import {applyCoupon, createCoupon, deleteCoupon, getCouponById, getCoupons, updateCoupon} from "../controllers/coupon.controller.js";
import { verifyJWT,verifyAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";
import { updateCategory } from "../controllers/category.controller.js";

const router = express.Router();

router.post("/",verifyJWT,createCoupon);
router.get("/",verifyJWT,getCoupons);
router.get("/:id",verifyJWT,getCouponById);
router.patch("/:id",verifyJWT,deleteCoupon);
router.put("/:id",verifyJWT,updateCoupon);
router.post("/apply",verifyJWT,applyCoupon);



export default router;
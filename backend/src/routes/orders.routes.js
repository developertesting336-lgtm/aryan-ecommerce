import express from "express";
import { cancelOrder, createOrder,getOrderByStatus,getOrderItems,getOrders,getOrderStatus, updateOrderStatus,getOrderById} from "../controllers/orders.controller.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema } from "../utils/validation.js";
import { upload } from "../middlewares/multer.js";
import { verifyAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/",verifyJWT,createOrder);
router.get("/",verifyJWT,getOrders);
router.get("/orderStatus/",verifyJWT,verifyAdmin,getOrderByStatus);
router.patch("/cancelOrder/",verifyJWT,cancelOrder);
router.get("/orders/:id",verifyJWT,getOrderById);
router.get("/:_id",verifyJWT,getOrderItems);
router.get("/orderStatus/:_id",verifyJWT,getOrderStatus);
router.patch("/orderStatus/:_id",verifyJWT,verifyAdmin,updateOrderStatus);
// router.patch("/:productId",verifyJWT,decreaseQuantity);


export default router;
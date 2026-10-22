import express from "express";
import { verifyJWT,verifyAdmin } from "../middlewares/auth.middleware.js";
import { getRecommendations ,generateProductDescription,chatAssistant,getCartRecommendations,getChatHistory,clearChatHistory} from "../controllers/ai.controller.js";
import rateLimit from "express-rate-limit";

const router = express.Router();
router.get("/recommendations", verifyJWT, getRecommendations);
router.get("/recommendations/cart", verifyJWT, getCartRecommendations);
router.post("/generate-description", verifyJWT, verifyAdmin, generateProductDescription);
router.get("/chat/history", verifyJWT, getChatHistory);
router.delete("/chat/history", verifyJWT, clearChatHistory);
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15, // 15 messages per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many messages. Please wait a minute." },
});

router.post("/chat", verifyJWT, chatLimiter, chatAssistant);
export default router;
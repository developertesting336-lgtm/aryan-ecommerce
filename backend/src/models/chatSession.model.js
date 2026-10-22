// models/ChatSession.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    text: { type: String, maxlength: 1000 },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  messages: [messageSchema],
  // TTL: MongoDB deletes the chat 30 days after the last message
  updatedAt: { type: Date, default: Date.now, index: { expireAfterSeconds: 60 * 60 * 24 * 30 } },
});

export const ChatSession = mongoose.model("ChatSession", chatSessionSchema);
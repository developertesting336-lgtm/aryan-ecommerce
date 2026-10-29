import Joi from "joi";
import rateLimit from "express-rate-limit";
import crypto from "node:crypto";
import {
  ComplaintCategory,
  ComplaintStatus,
  ComplaintPriority,
} from "../config/constants.js";

export function generateTicketId() {
  const now = new Date();
  const dateStr = now
    .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
    .replace(/-/g, "");
  const randomSuffix = crypto.randomInt(100000, 999999);
  return `CMP-${dateStr}-${randomSuffix}`;
}

export const createComplaintSchema = Joi.object({
  category: Joi.string()
    .valid(...Object.values(ComplaintCategory))
    .required()
    .messages({
      "any.only": "Invalid complaint category",
      "any.required": "Complaint category is required",
    }),
  subject: Joi.string().trim().min(3).max(150).required().messages({
    "string.empty": "Subject is required",
    "string.min": "Subject must be at least 3 characters long",
    "string.max": "Subject cannot exceed 150 characters",
  }),
  description: Joi.string().trim().min(10).max(3000).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description cannot exceed 3000 characters",
  }),
  orderId: Joi.string().trim().allow("", null).optional(),
  productId: Joi.string().trim().allow("", null).optional(),
});

export const addMessageSchema = Joi.object({
  message: Joi.string().trim().min(1).max(3000).required().messages({
    "string.empty": "Message cannot be empty",
    "string.max": "Message cannot exceed 3000 characters",
  }),
});

export const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ComplaintStatus))
    .required()
    .messages({
      "any.only": "Invalid complaint status",
      "any.required": "Complaint status is required",
    }),
  note: Joi.string().trim().max(500).allow("", null).optional(),
});

export const updatePrioritySchema = Joi.object({
  priority: Joi.string()
    .valid(...Object.values(ComplaintPriority))
    .required()
    .messages({
      "any.only": "Invalid priority level",
      "any.required": "Priority level is required",
    }),
});

export const internalNoteSchema = Joi.object({
  note: Joi.string().trim().min(2).max(2000).required().messages({
    "string.empty": "Internal note cannot be empty",
    "string.max": "Internal note cannot exceed 2000 characters",
  }),
});

// Anti-spam Rate Limiters
export const complaintCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 complaints per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many complaints created from this IP. Please try again after 15 minutes.",
  },
});

export const complaintReplyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 replies per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many messages sent. Please slow down and try again.",
  },
});

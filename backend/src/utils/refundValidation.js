import Joi from "joi";
import { ReturnReason } from "../config/constants.js";

export const createRefundRequestSchema = Joi.object({
  orderId: Joi.string().hex().length(24).required().messages({
    "string.empty": "Order ID is required",
    "string.hex": "Invalid Order ID format",
    "string.length": "Invalid Order ID format",
  }),
  items: Joi.array()
    .items(
      Joi.object({
        orderItemId: Joi.string().hex().length(24).required().messages({
          "string.empty": "Order item ID is required",
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          "number.base": "Quantity must be a valid number",
          "number.min": "Quantity must be at least 1",
        }),
        reason: Joi.string()
          .valid(...Object.values(ReturnReason))
          .required()
          .messages({
            "any.only": "Invalid return reason",
            "string.empty": "Return reason is required",
          }),
        customerNote: Joi.string().allow("").max(1000),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one item must be selected for return",
    }),
  idempotencyKey: Joi.string().max(100).optional(),
});

export const updateRefundStatusSchema = Joi.object({
  status: Joi.string()
    .valid("APPROVED", "REJECTED")
    .required()
    .messages({
      "any.only": "Status must be either APPROVED or REJECTED",
    }),
  rejectionReason: Joi.string().when("status", {
    is: "REJECTED",
    then: Joi.required().messages({
      "string.empty": "Rejection reason is required when rejecting a request",
      "any.required": "Rejection reason is required when rejecting a request",
    }),
    otherwise: Joi.optional().allow(""),
  }),
  adminNotes: Joi.string().allow("").max(1000).optional(),
});

export const receiveRefundItemsSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        itemId: Joi.string().hex().length(24).required(),
        restockItem: Joi.boolean().required(),
      })
    )
    .optional(),
  adminNotes: Joi.string().allow("").max(1000).optional(),
});

export const processRefundPaymentSchema = Joi.object({
  paymentGateway: Joi.string()
    .valid("STRIPE", "COD_MANUAL")
    .default("STRIPE"),
  manualReference: Joi.string().allow("").optional(),
  adminNotes: Joi.string().allow("").max(1000).optional(),
  idempotencyKey: Joi.string().max(100).optional(),
});

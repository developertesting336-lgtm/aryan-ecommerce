import mongoose from "mongoose";
import {
  ReturnStatus,
  ReturnReason,
  RefundType,
  RefundGatewayStatus,
} from "../config/constants.js";

const refundItemSchema = new mongoose.Schema(
  {
    orderItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    itemRefundAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      enum: Object.values(ReturnReason),
      required: true,
    },
    customerNote: {
      type: String,
      trim: true,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    restockItem: {
      type: Boolean,
      default: true,
    },
    restocked: {
      type: Boolean,
      default: false,
    },
    restockedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true, timestamps: false }
);

const auditEntrySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true, timestamps: false }
);

const refundRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [refundItemSchema],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "Refund request must include at least one item.",
      },
    },
    status: {
      type: String,
      enum: Object.values(ReturnStatus),
      default: ReturnStatus.REQUESTED,
      index: true,
    },
    refundType: {
      type: String,
      enum: Object.values(RefundType),
      default: RefundType.PARTIAL,
    },
    totalRefundAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingRefundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pointsRestored: {
      type: Number,
      default: 0,
      min: 0,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },
    paymentGateway: {
      type: String,
      enum: ["STRIPE", "COD_MANUAL", "OTHER"],
      default: "STRIPE",
    },
    gatewayRefundId: {
      type: String,
      default: null,
      trim: true,
    },
    gatewayStatus: {
      type: String,
      enum: Object.values(RefundGatewayStatus),
      default: RefundGatewayStatus.PENDING,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    auditTrail: {
      type: [auditEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

refundRequestSchema.index({ order: 1, createdAt: -1 });
refundRequestSchema.index({ user: 1, createdAt: -1 });
refundRequestSchema.index({ status: 1, createdAt: -1 });

export const RefundRequest = mongoose.model(
  "RefundRequest",
  refundRequestSchema
);

export default RefundRequest;

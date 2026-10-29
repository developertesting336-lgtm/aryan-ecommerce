import mongoose from "mongoose";
import {
  ComplaintCategory,
  ComplaintStatus,
  ComplaintPriority,
} from "../config/constants.js";

const complaintTimelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: Object.values(ComplaintStatus),
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "system"],
      default: "user",
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
  { _id: true }
);

const internalNoteSchema = new mongoose.Schema(
  {
    note: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adminName: {
      type: String,
      default: "Admin",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const complaintSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },
    orderNumber: {
      type: String,
      default: null,
      trim: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
      index: true,
    },
    productName: {
      type: String,
      default: null,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: Object.values(ComplaintCategory),
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(ComplaintPriority),
      default: ComplaintPriority.MEDIUM,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ComplaintStatus),
      default: ComplaintStatus.OPEN,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 3000,
    },
    attachments: {
      type: [String],
      default: [],
    },
    timeline: {
      type: [complaintTimelineSchema],
      default: [],
    },
    internalNotes: {
      type: [internalNoteSchema],
      default: [],
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

complaintSchema.index({ user: 1, createdAt: -1 });
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ order: 1, category: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });

export const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;

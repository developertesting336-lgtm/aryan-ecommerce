import mongoose from "mongoose";

const complaintMessageSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
    senderName: {
      type: String,
      default: "User",
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 3000,
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

complaintMessageSchema.index({ complaint: 1, createdAt: 1 });

export const ComplaintMessage = mongoose.model(
  "ComplaintMessage",
  complaintMessageSchema
);
export default ComplaintMessage;

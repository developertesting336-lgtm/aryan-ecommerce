// models/productReferral.model.js
import mongoose from "mongoose";

const productReferralSchema = new mongoose.Schema(
  {
    link: { type: mongoose.Schema.Types.ObjectId, ref: "ReferralLink", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },   // User A
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },              // User B
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },

    itemTotal: { type: Number, required: true }, // amount the points were calculated on
    points: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    approvedAt: Date,
  },
  { timestamps: true },
);

productReferralSchema.index({ order: 1, product: 1 }, { unique: true });

export const ProductReferral = mongoose.model("ProductReferral", productReferralSchema);
// export default ProductReferral;
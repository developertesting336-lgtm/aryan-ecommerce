// models/referralLink.model.js
import mongoose from "mongoose";

const referralLinkSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// One link per sender per product
referralLinkSchema.index({ sender: 1, product: 1 }, { unique: true });

export const ReferralLink = mongoose.model("ReferralLink", referralLinkSchema);
// export default ReferralLink;
import mongoose from "mongoose";

const priceHistorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variantSku: { type: String, default: null }, // null = base product price
  oldPrice: { type: Number, default: null },
  newPrice: { type: Number, required: true },
  oldMrp: { type: Number, default: null },
  newMrp: { type: Number, default: null },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  reason: { type: String, default: "manual" }, // initial, manual, bulk_import...
  changedAt: { type: Date, default: Date.now },
});

priceHistorySchema.index({ product: 1, variantSku: 1, changedAt: -1 });

export const PriceHistory = mongoose.model("PriceHistory", priceHistorySchema);
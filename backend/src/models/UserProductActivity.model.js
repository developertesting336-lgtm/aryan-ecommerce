import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  addedAt: Date,
  removedAt: Date,
  status: { type: String, enum: ['in_cart', 'removed', 'purchased'] },
});
activitySchema.index({ user: 1, product: 1 }, { unique: true });

export const  Activity = mongoose.model("Activity",activitySchema);
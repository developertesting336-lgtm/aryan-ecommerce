// models/pointsLedger.model.js
import mongoose from "mongoose";

const pointsLedgerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    points: { type: Number, required: true }, // +100 earned, -100 redeemed
    type: {
      type: String,
      enum: ["earned", "redeemed", "reversed", "refunded"],
      required: true,
    },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", index: true },
    note: String,
  },
  { timestamps: true },
);

export const PointsLedger = mongoose.model("PointsLedger", pointsLedgerSchema);
// export default PointsLedger;
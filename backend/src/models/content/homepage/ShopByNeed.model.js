import { Schema, model } from "mongoose";

const shopByNeedSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    eyebrow: {
      type: String,
      trim: true,
      default: "",
    },

    icon: {
      type: String,
      default: "ShoppingBag",
    },

    query: {
      type: String,
      required: true,
      trim: true,
    },

    video: {
      type: String,
      default: "",
    },

    fallbackImage: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const ShopByNeed =model("ShopByNeed",shopByNeedSchema);

export default ShopByNeed;
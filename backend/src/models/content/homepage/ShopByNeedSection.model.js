import { Schema, model } from "mongoose";

const shopByNeedSectionSchema = new Schema(
  {
    eyebrow: {
      type: String,
      default: "Curated for you",
      trim: true,
    },

    title: {
      type: String,
      default: "Shop by your lifestyle",
      trim: true,
    },

    description: {
      type: String,
      default:
        "Explore products around the things you love, wear, use, and do every day.",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const ShopByNeedSection= model("ShopByNeedSection",shopByNeedSectionSchema);

export default ShopByNeedSection;
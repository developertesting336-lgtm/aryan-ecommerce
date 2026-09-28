import { Schema, model } from "mongoose";

const promoCardSchema = new Schema(
  {
    eyebrow: {
      type: String,
      trim: true,
      default: "",
    },

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

    buttonText: {
      type: String,
      trim: true,
      default: "Shop Now",
    },

    buttonLink: {
      type: String,
      trim: true,
      default: "/products",
    },

    image: {
      type: String,
      required: true,
    },

    imagePosition: {
      type: String,
      default: "center",
    },

    overlay: {
      type: String,
      default: "bg-gradient-to-r from-black/60 via-black/20 to-black/5",
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

const PromoCard=model("PromoCard", promoCardSchema);
export default PromoCard;
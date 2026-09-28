import { Schema, model } from "mongoose";

const promoGridItemSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["large", "wide", "small"],
      required: true,
    },

    label: {
      type: String,
      trim: true,
      default: "",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
titleLines: {
  type: [String],
  default: [],
},
    buttonText: {
      type: String,
      trim: true,
      default: "",
    },

    buttonLink: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    backgroundPosition: {
      type: String,
      default: "center",
    },

    backgroundSize: {
      type: String,
      default: "cover",
    },

    gradient: {
      type: Boolean,
      default: false,
    },

    dark: {
      type: Boolean,
      default: false,
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

 const PromoGridItem = model("PromoGridItem",promoGridItemSchema);

export default PromoGridItem
import mongoose from "mongoose";

const heroSlideSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
      trim: true,
    },

    badge: {
      type: String,
      trim: true,
      default: "",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    highlight: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    primaryButtonText: {
      type: String,
      trim: true,
      default: "Shop Now",
    },

    primaryButtonLink: {
      type: String,
      trim: true,
      default: "/products",
    },

    secondaryButtonText: {
      type: String,
      trim: true,
      default: "",
    },

    secondaryButtonLink: {
      type: String,
      trim: true,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
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

const HeroSlide = mongoose.model("HeroSlide", heroSlideSchema);

export default HeroSlide;
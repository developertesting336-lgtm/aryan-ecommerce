import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,

    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    brand: {
      type: String,
      trim: true,
      index: true,
    },

    images: {
      type: [String],
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    mrp: {
      type: Number,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    sku: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },

    // Products that can be purchased as accessories
    accessories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    status: {
      type: String,
      enum: ["draft", "active", "inactive"],
      default: "draft",
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
productSchema.index({ name: "text" });

export const Product = mongoose.model("Product",productSchema);








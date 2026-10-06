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

// =========================
// VARIANTS
// =========================

hasVariants: {
  type: Boolean,
  default: false,
},

variants: [
  {
    sku: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: [0, "Variant price cannot be negative"],
    },

    mrp: {
      type: Number,
      default: null,
      min: [0, "Variant mrp cannot be negative"],
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Variant stock cannot be negative"],
    },

    attributes: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        value: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
],

    rating: {
  average: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },

  count: {
    type: Number,
    default: 0,
    min: 0,
  },

  distribution: {
    5: {
      type: Number,
      default: 0,
    },
    4: {
      type: Number,
      default: 0,
    },
    3: {
      type: Number,
      default: 0,
    },
    2: {
      type: Number,
      default: 0,
    },
    1: {
      type: Number,
      default: 0,
    },
  },
},
  },
  {
    timestamps: true,
  }
);
productSchema.index({ name: "text" });

export const Product = mongoose.model("Product",productSchema);

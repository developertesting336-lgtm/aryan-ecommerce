import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    description: String,

    image: {
      url: String,
      publicId: String,
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    level: Number,
    sortOrder: Number,

    isActive: Boolean,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Category = mongoose.model("Category",categorySchema);
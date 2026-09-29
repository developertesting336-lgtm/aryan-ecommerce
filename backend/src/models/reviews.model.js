import mongoose from "mongoose";

const { Schema } = mongoose;

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },

    images: {
      type: [String],
    },

    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },

    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);



// ------------------------------------------------------
// Prevent duplicate review for the same order item
// ------------------------------------------------------

reviewSchema.index(
  {
    user: 1,
    product: 1,
    orderItem: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      orderItem: {
        $type: "objectId",
      },
    },
  }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;




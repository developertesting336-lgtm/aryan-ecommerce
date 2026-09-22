// models/Coupon.js

import mongoose from "mongoose";

const { Schema } = mongoose;

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    maxDiscountAmount: {
      type: Number,
      min: 0,
      default: null,
    },

    minOrderAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },

    // --------------------------------
    // Validity
    // --------------------------------

    startsAt: {
      type: Date,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // --------------------------------
    // Usage restrictions
    // --------------------------------

    totalUsageLimit: {
      type: Number,
      min: 1,
      default: null,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    usageLimitPerUser: {
      type: Number,
      min: 1,
      default: 1,
    },

    // --------------------------------
    // Eligibility
    // --------------------------------

    eligibility: {
      type: String,
      enum: [
        "all",
        "new_users",
        "specific_users",
      ],
      default: "all",
    },

    eligibleUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // --------------------------------
    // Product/category restrictions
    // --------------------------------

    applicability: {
      type: String,
      enum: [
        "all_products",
        "specific_products",
        "specific_categories",
      ],
      default: "all_products",
    },

    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    excludedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    excludedCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    // --------------------------------
    // Admin
    // --------------------------------

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
        couponType: {
      type: String,
      enum: ["PLATFORM", "VENDOR"],
      required: true,
      default: "PLATFORM",
    },

    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Coupon = mongoose.model("Coupon", couponSchema);

couponSchema.index({
  code: 1,
});

couponSchema.index({
  isActive: 1,
  startsAt: 1,
  expiresAt: 1,
});

couponSchema.index({
  createdAt: -1,
});



const couponUsageSchema = new Schema(
  {
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    couponCode: {
      type: String,
      required: true,
      uppercase: true,
    },

    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    orderAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    usedAt: {
      type: Date,
      default: Date.now,
    },
     vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);



export const CouponUsage= mongoose.model(
  "CouponUsage",
  couponUsageSchema
);


couponUsageSchema.index({
  coupon: 1,
  user: 1,
});

couponUsageSchema.index({
  user: 1,
  createdAt: -1,
});

couponUsageSchema.index({
  order: 1,
});

function getCouponStatus(coupon) {
  const now = new Date();

  if (!coupon.isActive) {
    return "disabled";
  }

  if (now < coupon.startsAt) {
    return "scheduled";
  }

  if (now > coupon.expiresAt) {
    return "expired";
  }

  return "active";
}
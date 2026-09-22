
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "AUTHORIZED",
        "PAID",
        "FAILED",
        "REFUNDED",
        "PARTIALLY_REFUNDED",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    fulfillmentStatus: {
      type: String,
      enum: [
        "UNFULFILLED",
        "PROCESSING",
        "PACKED",
        "SHIPPED",
        "DELIVERED",
        "RETURNED",
      ],
      default: "UNFULFILLED",
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

  couponCode: {
  type: String,
  trim: true,
  uppercase: true,
},

    placedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const Order = mongoose.model("Order", orderSchema);

orderSchema.index({ user: 1, createdAt: -1 });

orderSchema.index({
  fulfillmentStatus: 1,
  createdAt: -1,
});

orderSchema.index({
  status: 1,
  createdAt: -1,
});

orderSchema.index({
  paymentStatus: 1,
  createdAt: -1,
});

//Order Item schema


const orderItemSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

      vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

    // variant: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "ProductVariant",
    // },

    // Snapshot
    productName: {
      type: String,
      required: true,
    },

    // sku: {
    //   type: String,
    //   required: true,
    // },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    discount: {
      type: Number,
      default: 0,
    },

   couponCode: {
      type: String,
      trim: true,
      uppercase: true,
    },

    tax: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
    },
    commissionRate:{
      type:Number
    },
    commissionAmount:{
      type:Number
    },
   vendorEarning:{
      type:Number
    },
  },
  { timestamps: true },
);

export const OrderItem = mongoose.model("OrderItem", orderItemSchema);

//Order Address


const orderAddressSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["SHIPPING", "BILLING"],
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    addressLine1: {
      type: String,
      required: true,
    },

    addressLine2: {
      type: String,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    postalCode: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const OrderAddress = mongoose.model("OrderAddress", orderAddressSchema);



const orderStatusHistorySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    statusType: {
      type: String,
      enum: ["ORDER", "PAYMENT", "FULFILLMENT"],
      required: true,
    },

    status: {
      type: String,
      required: true,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const OrderStatusHistory = mongoose.model(
  "OrderStatusHistory",
  orderStatusHistorySchema,
);
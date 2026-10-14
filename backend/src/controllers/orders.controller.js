import {
  Product,
  User,
  Cart,
  Category,
  Coupon,
  Order,
  OrderItem,
  OrderAddress,
  Review,
} from "../models/index.js";
import {agenda} from '../config/agenda.js'
import { ApiError, ApiResponse } from "../utils/apiResponse.js";
import { generateSlug } from "../utils/common.js";
import { OrderStatus, PaymentStatus } from "../config/constants.js";
import mongoose from "mongoose";
import { sendEmailtoUser } from "../utils/mail.js";
import {
  calculateDiscountForOrder,
  couponUsage,
  validateCoupon,
  calculateDiscount,
} from "./coupon.controller.js";

function createOrderNumber() {
  const now = new Date();

  const datePart = now
    .toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    })
    .replace(/-/g, "");

  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `ORD-${datePart}-${timestamp}${random}`;
}

export const createOrder = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      phone,
      name,
      addressLine1,
      city,
      state,
      postalCode,
      country,
      code,
    } = req.body;

    // =====================================================
    // 1. FIND USER
    // =====================================================

    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // =====================================================
    // 2. FIND CART
    // =====================================================

    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    // =====================================================
    // 3. DECIDE WHAT PRODUCTS WILL BE ORDERED
    // =====================================================

    let itemsToOrder;

    if (productId) {
      // -------------------------------------------------
      // BUY NOW
      // -------------------------------------------------

      itemsToOrder = cart.items.filter(
        (item) =>
          item.product && item.product._id.toString() === productId.toString(),
      );

      if (itemsToOrder.length === 0) {
        throw new ApiError(404, "Product not found in cart");
      }

      // -------------------------------------------------
      // Override quantity for Buy Now
      // -------------------------------------------------

      if (quantity !== undefined) {
        const parsedQuantity = Number(quantity);

        if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
          throw new ApiError(400, "Invalid quantity");
        }

        itemsToOrder[0].quantity = parsedQuantity;
      }
    } else {
      // -------------------------------------------------
      // BUY ALL
      // -------------------------------------------------

      itemsToOrder = cart.items;
    }

    // =====================================================
    // 4. VALIDATE ORDER ITEMS
    // =====================================================

    if (itemsToOrder.length === 0) {
      throw new ApiError(400, "No products to order");
    }

    for (const item of itemsToOrder) {
      if (!item.product) {
        throw new ApiError(404, "One or more products no longer exist");
      }

      const parsedQuantity = Number(item.quantity);

      if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
        throw new ApiError(400, `Invalid quantity for ${item.product.name}`);
      }
    }

    // =====================================================
    // 5. CALCULATE ORDER SUBTOTAL
    // =====================================================

    const subtotal = itemsToOrder.reduce((total, item) => {
      const itemSubtotal = Number(item.product.price) * Number(item.quantity);

      return total + itemSubtotal;
    }, 0);

    console.log("ORDER SUBTOTAL:", subtotal);

    // =====================================================
    // 6. CALCULATE COUPON
    // =====================================================

    let couponResult = null;

    if (code?.trim()) {
      couponResult = await calculateDiscountForOrder(user, code, itemsToOrder);
    }

    // =====================================================
    // 7. GET COUPON RESULT
    // =====================================================

    const discount = Number(couponResult?.discountAmount || 0);

    const couponCode = couponResult?.couponCode || "";

    const couponId = couponResult?.coupon || null;

    const eligibleItems = couponResult?.eligibleItems || [];

    const eligibleAmount = Number(couponResult?.eligibleAmount || 0);

    console.log({
      subtotal,
      eligibleAmount,
      discount,
      couponCode,
      couponId,
    });

    // =====================================================
    // 8. CALCULATE DISCOUNTED SUBTOTAL
    // =====================================================

    const discountedSubtotal = Math.max(0, subtotal - discount);

    // =====================================================
    // 9. CALCULATE SHIPPING
    // =====================================================

    const shippingCharge = discountedSubtotal > 500 ? 0 : 150;

    // =====================================================
    // 10. CALCULATE FINAL TOTAL
    // =====================================================

    const total = subtotal + shippingCharge - discount;

    console.log({
      subtotal,
      discount,
      discountedSubtotal,
      shippingCharge,
      total,
      couponCode,
    });

    // =====================================================
    // 11. CREATE ORDER
    // =====================================================

    const order = await Order.create({
      orderNumber: createOrderNumber(),
      user: user._id,
      status: OrderStatus.CONFIRMED,

      subtotal,
      shippingCharge,
      discount,
      couponCode,
      total,
    });

    // =====================================================
    // 12. CALCULATE ELIGIBLE PRODUCT TOTAL
    // =====================================================

    // We already know which products are eligible
    // because calculateDiscountForOrder() returned them.

    const eligibleProductIds = new Set(
      eligibleItems.map((item) => item.product._id.toString()),
    );

    // =====================================================
    // 13. CREATE ORDER ITEMS
    // =====================================================

    const orderItems = itemsToOrder.map((item) => {
      const itemSubtotal = Number(item.product.price) * Number(item.quantity);

      const isCouponEligible = eligibleProductIds.has(
        item.product._id.toString(),
      );

      let itemDiscount = 0;

      // -------------------------------------------------
      // Allocate total coupon discount proportionally
      // -------------------------------------------------

      if (isCouponEligible && eligibleAmount > 0) {
        itemDiscount = discount * (itemSubtotal / eligibleAmount);
      }

      const itemTotal = itemSubtotal - itemDiscount;

      return {
        order: order._id,
        product: item.product._id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        total: itemTotal,
        vendor: item.product.vendor,
        discount: itemDiscount,
        couponCode,
      };
    });

    // =====================================================
    // 14. INSERT ORDER ITEMS
    // =====================================================

    await OrderItem.insertMany(orderItems);

    // =====================================================
    // 15. CREATE SHIPPING ADDRESS
    // =====================================================

    await OrderAddress.create({
      order: order._id,
      type: "SHIPPING",
      name,
      phone,
      addressLine1,
      city,
      state,
      postalCode,
      country,
    });

    // =====================================================
    // 16. REMOVE ORDERED PRODUCTS FROM CART
    // =====================================================

    if (productId) {
      // -------------------------------------------------
      // BUY NOW
      // Remove only selected product
      // -------------------------------------------------

      cart.items = cart.items.filter(
        (item) =>
          item.product && item.product._id.toString() !== productId.toString(),
      );
    } else {
      // -------------------------------------------------
      // BUY ALL
      // -------------------------------------------------

      cart.items = [];
    }

    // =====================================================
    // 17. RECALCULATE CART TOTAL
    // =====================================================

    cart.totalPrice = cart.items.reduce(
      (total, item) =>
        total + Number(item.product.price) * Number(item.quantity),
      0,
    );

    // =====================================================
    // 18. SAVE ORDER + CART
    // =====================================================

    await order.save();

    await cart.save();

    // =====================================================
    // 19. RECORD COUPON USAGE
    // =====================================================

    if (couponId) {
      await couponUsage(couponId, order);
    }

    // =====================================================
    // 20. RESPONSE
    // =====================================================
// await agenda.schedule("in 10 seconds", "update-order-status", {
//   orderId: order._id.toString(),
//   fulfillmentStatus: "PROCESSING",
// });
    return res.status(201).json(
      new ApiResponse(
        201,
        {
          order,
        },
        "Order created successfully",
      ),
    );
  } catch (error) {
    console.log("Create order error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const order = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { order }, "Product created successfully"));
  } catch (error) {
    console.log("Get products error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrderItems = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const orderItem = await OrderItem.find({ order: req.params._id })
      .populate(
        "order",
        "orderNumber createdAt fulfillmentStatus total shippingCharge discount subtotal status",
      )
      .populate("product", "images");
    const orderAddress = await OrderAddress.findOne({ order: req.params._id });
    const productIds = orderItem
      .map((item) => item.product?._id)
      .filter(Boolean);

    const reviews = await Review.find({
      product: { $in: productIds },
      user: req.user._id,
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { orderdetails: { orderItem, orderAddress, reviews } },
          "Product created successfully",
        ),
      );
  } catch (error) {
    console.log("Get products error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrderStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const order = await Order.findOne({ user: req.user._id }).select(
      "orderNumber status paymentStatus fulfillmentStatus",
    );

    return res
      .status(200)
      .json(new ApiResponse(200, { order }, "Product created successfully"));
  } catch (error) {
    console.log("Get products error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const updateOrderStatus = async(req,res)=>{
//     try {
//         const {status} = req.body
//         const user = await User.findById(req.user._id);

//     if (!user) {
//       throw new ApiError(404, "User not found");
//     }
//      const order = await Order.findOneAndUpdate({_id:req.params._id},
//         {status:status}, {new:true}
//      ).select("orderNumber status paymentStatus fulfillmentStatus");

//      return res.status(200).json(
//       new ApiResponse(
//         200,
//         { order },
//         "Product created successfully"
//       )
//     );
// } catch (error) {
//          console.log("Get products error:", error);
//     return res.status(error.statusCode || 500).json({
//       success: false,
//       message: error.message,
//     });
//     }
// }

export const getOrderByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const order = await Order.find({ status });
    return res
      .status(200)
      .json(new ApiResponse(200, { order }, "Product created successfully"));
  } catch (error) {
    console.log("Get products error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const order = await Order.findOneAndUpdate(
      { user: user._id, fulfillmentStatus: { $ne: "DELIVERED" } },
      { fulfillmentStatus: "CANCELLED" },
      { new: true },
    );
    if (!order) {
      throw new ApiError(
        400,
        `Order cannot be cancelled because its current status is confirmed, shipped, completed, or cancelled.`,
      );
    }
    return res
      .status(200)
      .json(new ApiResponse(200, { order }, "Product created successfully"));
  } catch (error) {
    console.log("Get products error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { fulfillmentStatus } = req.body;

    // Validate status
    if (!fulfillmentStatus) {
      throw new ApiError(400, "Fulfillment status is required");
    }

    // Find order
    const order = await Order.findById(id);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    const currentStatus = order.fulfillmentStatus;

    // Get allowed next statuses
    const allowedStatuses = fulfillmentTransitions[currentStatus];

    // Invalid current status
    if (!allowedStatuses) {
      throw new ApiError(
        400,
        `Invalid current fulfillment status: ${currentStatus}`,
      );
    }

    // Check transition
    if (!allowedStatuses.includes(fulfillmentStatus)) {
      throw new ApiError(
        400,
        `Cannot change fulfillment status from ${currentStatus} to ${fulfillmentStatus}`,
      );
    }

    // Update status
    order.fulfillmentStatus = fulfillmentStatus;

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Fulfillment status changed from ${currentStatus} to ${fulfillmentStatus}`,
      order,
    });
  } catch (error) {
    console.log("error", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { order }, "Product created successfully"));
  } catch (error) {
    console.log("Get products error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

import mongoose from "mongoose";
import {
  Order,
  OrderItem,
  RefundRequest,
  User,
} from "../models/index.js";
import {
  ReturnStatus,
  ReturnReason,
  RefundType,
  DEFAULT_RETURN_WINDOW_DAYS,
} from "../config/constants.js";
import { ApiError, ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import { sendRefundStatusEmail } from "../utils/refundMail.js";
import { createRefundRequestSchema } from "../utils/refundValidation.js";

function generateRefundNumber() {
  const now = new Date();
  const datePart = now
    .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
    .replace(/-/g, "");
  const timestamp = Date.now().toString().slice(-5);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `REF-${datePart}-${timestamp}${random}`;
}

export const checkOrderEligibility = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    const orderItems = await OrderItem.find({ order: orderId }).populate(
      "product",
      "name images stock price"
    );

    const isDelivered = order.fulfillmentStatus === "DELIVERED";
    const isPaid =
      order.paymentStatus === "PAID" ||
      order.paymentStatus === "PARTIALLY_REFUNDED";

    const returnWindowDays =
      Number(process.env.RETURN_WINDOW_DAYS) || DEFAULT_RETURN_WINDOW_DAYS;
    const deliveryDate = new Date(order.updatedAt || order.placedAt || order.createdAt);
    const windowExpiryDate = new Date(deliveryDate);
    windowExpiryDate.setDate(windowExpiryDate.getDate() + returnWindowDays);

    const isWithinWindow = Date.now() <= windowExpiryDate.getTime();
    const daysRemaining = Math.max(
      0,
      Math.ceil((windowExpiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );

    // Existing active / completed refund requests for this order
    const existingRefunds = await RefundRequest.find({
      order: orderId,
      status: { $nin: ["REJECTED", "CANCELLED"] },
    });

    const itemRefundedQuantities = {};
    for (const refund of existingRefunds) {
      for (const item of refund.items) {
        const id = item.orderItem.toString();
        itemRefundedQuantities[id] =
          (itemRefundedQuantities[id] || 0) + item.quantity;
      }
    }

    const itemsEligibility = orderItems.map((item) => {
      const alreadyReturned = itemRefundedQuantities[item._id.toString()] || 0;
      const returnableQuantity = Math.max(0, item.quantity - alreadyReturned);
      const unitRefundPrice =
        item.quantity > 0 ? Math.round((item.total / item.quantity) * 100) / 100 : 0;

      return {
        orderItemId: item._id,
        productId: item.product?._id || item.product,
        productName: item.productName || item.product?.name,
        image: item.product?.images?.[0] || null,
        purchasedQuantity: item.quantity,
        alreadyReturnedQuantity: alreadyReturned,
        returnableQuantity,
        unitPrice: item.price,
        unitRefundAmount: unitRefundPrice,
        isEligible: isDelivered && isPaid && isWithinWindow && returnableQuantity > 0,
      };
    });

    const hasAnyReturnableItems = itemsEligibility.some((i) => i.returnableQuantity > 0);
    const isEligible = isDelivered && isPaid && isWithinWindow && hasAnyReturnableItems;

    let ineligibilityReason = null;
    if (!isDelivered) {
      ineligibilityReason = `Order fulfillment status is '${order.fulfillmentStatus}'. Only delivered orders are eligible for return.`;
    } else if (!isPaid) {
      ineligibilityReason = `Order payment status is '${order.paymentStatus}'. Only paid orders are eligible for refund.`;
    } else if (!isWithinWindow) {
      ineligibilityReason = `The ${returnWindowDays}-day return window expired on ${windowExpiryDate.toLocaleDateString("en-IN")}.`;
    } else if (!hasAnyReturnableItems) {
      ineligibilityReason = "All items from this order have already been requested or refunded.";
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          orderId: order._id,
          orderNumber: order.orderNumber,
          isEligible,
          ineligibilityReason,
          returnWindowDays,
          windowExpiryDate,
          daysRemaining,
          items: itemsEligibility,
          existingRequestsCount: existingRefunds.length,
        },
        "Order eligibility retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Check eligibility error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to check order eligibility",
    });
  }
};

export const createRefundRequest = async (req, res) => {
  try {
    let payload = req.body;

    // Handle multipart JSON stringification if items sent as string
    if (typeof payload.items === "string") {
      try {
        payload.items = JSON.parse(payload.items);
      } catch (err) {
        throw new ApiError(400, "Invalid JSON format for items");
      }
    }

    // Validate inputs with Joi
    const { error: validationError } = createRefundRequestSchema.validate(payload);
    if (validationError) {
      throw new ApiError(400, validationError.details[0].message);
    }

    const { orderId, items: requestedItems, idempotencyKey } = payload;
    const userId = req.user._id;

    // Idempotency check
    if (idempotencyKey) {
      const existingKey = await RefundRequest.findOne({ idempotencyKey });
      if (existingKey) {
        return res.status(200).json(
          new ApiResponse(
            200,
            { refundRequest: existingKey, idempotentReplay: true },
            "Refund request already received"
          )
        );
      }
    }

    // Fetch order
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Verify delivery and payment
    if (order.fulfillmentStatus !== "DELIVERED") {
      throw new ApiError(
        400,
        `Cannot request return: Order fulfillment status is '${order.fulfillmentStatus}'. Only delivered orders can be returned.`
      );
    }

    if (
      order.paymentStatus !== "PAID" &&
      order.paymentStatus !== "PARTIALLY_REFUNDED"
    ) {
      throw new ApiError(
        400,
        `Cannot request return: Order payment status is '${order.paymentStatus}'.`
      );
    }

    // Return window check
    const returnWindowDays =
      Number(process.env.RETURN_WINDOW_DAYS) || DEFAULT_RETURN_WINDOW_DAYS;
    const deliveryDate = new Date(order.updatedAt || order.placedAt || order.createdAt);
    const windowExpiryDate = new Date(deliveryDate);
    windowExpiryDate.setDate(windowExpiryDate.getDate() + returnWindowDays);

    if (Date.now() > windowExpiryDate.getTime()) {
      throw new ApiError(
        400,
        `The ${returnWindowDays}-day return window for this order expired on ${windowExpiryDate.toLocaleDateString("en-IN")}.`
      );
    }

    // Fetch order items & past requests
    const orderItems = await OrderItem.find({ order: orderId });
    const orderItemMap = new Map();
    orderItems.forEach((item) => orderItemMap.set(item._id.toString(), item));

    const existingRefunds = await RefundRequest.find({
      order: orderId,
      status: { $nin: ["REJECTED", "CANCELLED"] },
    });

    const alreadyRequestedMap = new Map();
    for (const ref of existingRefunds) {
      for (const item of ref.items) {
        const id = item.orderItem.toString();
        alreadyRequestedMap.set(
          id,
          (alreadyRequestedMap.get(id) || 0) + item.quantity
        );
      }
    }

    // Upload files if provided via multer
    let uploadedImageUrls = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadOnCloudinary(file.path);
        if (uploadResult?.secure_url) {
          uploadedImageUrls.push(uploadResult.secure_url);
        }
      }
    } else if (req.files?.images && Array.isArray(req.files.images)) {
      for (const file of req.files.images) {
        const uploadResult = await uploadOnCloudinary(file.path);
        if (uploadResult?.secure_url) {
          uploadedImageUrls.push(uploadResult.secure_url);
        }
      }
    }

    // Build and validate line items
    let totalRefundAmount = 0;
    const validatedRefundItems = [];

    for (const reqItem of requestedItems) {
      const orderItem = orderItemMap.get(reqItem.orderItemId);
      if (!orderItem) {
        throw new ApiError(
          400,
          `Item ${reqItem.orderItemId} does not belong to this order.`
        );
      }

      const alreadyReturned = alreadyRequestedMap.get(reqItem.orderItemId) || 0;
      const maxReturnable = orderItem.quantity - alreadyReturned;

      if (reqItem.quantity > maxReturnable) {
        throw new ApiError(
          400,
          `Cannot return ${reqItem.quantity} unit(s) of "${orderItem.productName}". Only ${maxReturnable} unit(s) eligible.`
        );
      }

      // Net refund amount per unit accounts for proportional coupon discount
      const unitRefundPrice =
        orderItem.quantity > 0
          ? Math.round((orderItem.total / orderItem.quantity) * 100) / 100
          : 0;

      const itemRefundAmount =
        Math.round(unitRefundPrice * reqItem.quantity * 100) / 100;
      totalRefundAmount += itemRefundAmount;

      // Restock eligibility: damaged or defective items are not restocked by default
      const isDamaged =
        reqItem.reason === ReturnReason.DEFECTIVE ||
        reqItem.reason === ReturnReason.DAMAGED_IN_TRANSIT;

      validatedRefundItems.push({
        orderItem: orderItem._id,
        product: orderItem.product,
        productName: orderItem.productName,
        quantity: reqItem.quantity,
        unitPrice: orderItem.price,
        itemRefundAmount,
        reason: reqItem.reason,
        customerNote: reqItem.customerNote || "",
        images: uploadedImageUrls,
        restockItem: !isDamaged,
        restocked: false,
      });
    }

    totalRefundAmount = Math.round(totalRefundAmount * 100) / 100;

    // Check if full order refund
    const totalOrderedQty = orderItems.reduce((acc, i) => acc + i.quantity, 0);
    const totalPreviousReturnedQty = Array.from(alreadyRequestedMap.values()).reduce(
      (acc, q) => acc + q,
      0
    );
    const thisReturnedQty = validatedRefundItems.reduce((acc, i) => acc + i.quantity, 0);

    const isFullRefund =
      totalPreviousReturnedQty + thisReturnedQty >= totalOrderedQty;
    const refundType = isFullRefund ? RefundType.FULL : RefundType.PARTIAL;

    // Determine payment gateway based on order metadata
    const paymentGateway = "STRIPE";

    // Create Refund Request document
    const refundNumber = generateRefundNumber();
    const refundRequest = await RefundRequest.create({
      requestNumber: refundNumber,
      order: order._id,
      user: userId,
      items: validatedRefundItems,
      status: ReturnStatus.REQUESTED,
      refundType,
      totalRefundAmount,
      shippingRefundAmount: 0,
      paymentGateway,
      idempotencyKey: idempotencyKey || null,
      auditTrail: [
        {
          action: "REQUEST_CREATED",
          status: ReturnStatus.REQUESTED,
          changedBy: userId,
          note: `Customer requested return for ${validatedRefundItems.length} item(s)`,
          timestamp: new Date(),
        },
      ],
    });

    // Send confirmation email (non-blocking)
    sendRefundStatusEmail({
      to: req.user.email,
      userName: `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || req.user.fullName,
      requestNumber: refundNumber,
      orderNumber: order.orderNumber,
      status: "REQUESTED",
      amount: totalRefundAmount,
    }).catch((err) => console.error("Email notification error:", err));

    return res.status(201).json(
      new ApiResponse(
        201,
        { refundRequest },
        "Return request submitted successfully"
      )
    );
  } catch (error) {
    console.error("Create refund request error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to submit return request",
    });
  }
};

export const getUserRefundRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const refunds = await RefundRequest.find({ user: userId })
      .populate("order", "orderNumber total paymentStatus fulfillmentStatus placedAt")
      .populate("items.product", "images name price")
      .sort({ createdAt: -1 });

    return res.status(200).json(
      new ApiResponse(
        200,
        { refunds },
        "User refund requests retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Get user refunds error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch refund requests",
    });
  }
};

export const getRefundRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const query = { _id: id };
    if (req.user.role !== "admin") {
      query.user = userId;
    }

    const refundRequest = await RefundRequest.findOne(query)
      .populate("order")
      .populate("user", "firstName lastName email phone")
      .populate("items.product", "name images price stock")
      .populate("auditTrail.changedBy", "firstName lastName email role");

    if (!refundRequest) {
      throw new ApiError(404, "Refund request not found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        { refundRequest },
        "Refund request details retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Get refund request error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch refund request details",
    });
  }
};

import Stripe from "stripe";
import mongoose from "mongoose";
import {
  RefundRequest,
  Order,
  OrderItem,
  Product,
  PointsLedger,
} from "../models/index.js";
import {
  ReturnStatus,
  RefundGatewayStatus,
} from "../config/constants.js";
import { ApiError, ApiResponse } from "../utils/apiResponse.js";
import { sendRefundStatusEmail } from "../utils/refundMail.js";
import {
  updateRefundStatusSchema,
  receiveRefundItemsSchema,
  processRefundPaymentSchema,
} from "../utils/refundValidation.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getAdminRefunds = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10, startDate, endDate } = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.max(parseInt(limit) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Quick stats queries in parallel
    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      receivedRequests,
      refundedRequests,
      totalRefundedSum,
    ] = await Promise.all([
      RefundRequest.countDocuments({}),
      RefundRequest.countDocuments({ status: ReturnStatus.REQUESTED }),
      RefundRequest.countDocuments({ status: ReturnStatus.APPROVED }),
      RefundRequest.countDocuments({ status: ReturnStatus.RETURN_RECEIVED }),
      RefundRequest.countDocuments({ status: ReturnStatus.REFUNDED }),
      RefundRequest.aggregate([
        { $match: { status: ReturnStatus.REFUNDED } },
        { $group: { _id: null, total: { $sum: "$totalRefundAmount" } } },
      ]),
    ]);

    const stats = {
      totalRequests,
      pendingRequests,
      approvedRequests,
      receivedRequests,
      refundedRequests,
      totalRefundedAmount: totalRefundedSum[0]?.total || 0,
    };

    // Build aggregate pipeline with lookups to support searching by orderNumber or customer
    const pipeline = [
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "orders",
          localField: "order",
          foreignField: "_id",
          as: "orderData",
        },
      },
      {
        $unwind: {
          path: "$orderData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: {
          path: "$userData",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      pipeline.push({
        $match: {
          $or: [
            { requestNumber: searchRegex },
            { "orderData.orderNumber": searchRegex },
            { "userData.email": searchRegex },
            { "userData.firstName": searchRegex },
            { "userData.lastName": searchRegex },
            { "userData.fullName": searchRegex },
          ],
        },
      });
    }

    // Count matching documents
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await RefundRequest.aggregate(countPipeline);
    const totalMatching = countResult[0]?.total || 0;

    // Apply pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    const refunds = await RefundRequest.aggregate(pipeline);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          refunds,
          stats,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalMatching,
            totalPages: Math.max(1, Math.ceil(totalMatching / limitNum)),
          },
        },
        "Admin refunds retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Admin get refunds error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch refunds",
    });
  }
};

export const getAdminRefundById = async (req, res) => {
  try {
    const { id } = req.params;

    const refundRequest = await RefundRequest.findById(id)
      .populate({
        path: "order",
        select:
          "orderNumber total subtotal shippingCharge discount paymentStatus fulfillmentStatus placedAt createdAt paymentIntentId stripeSessionId",
      })
      .populate("user", "firstName lastName fullName email phone")
      .populate("items.product", "name images price stock")
      .populate("auditTrail.changedBy", "firstName lastName email role");

    if (!refundRequest) {
      throw new ApiError(404, "Refund request not found");
    }

    const orderItems = await OrderItem.find({ order: refundRequest.order._id });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          refundRequest,
          orderItems,
        },
        "Admin refund details retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Admin get refund by id error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch refund details",
    });
  }
};

export const updateRefundStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { error: validationError } = updateRefundStatusSchema.validate(req.body);
    if (validationError) {
      throw new ApiError(400, validationError.details[0].message);
    }

    const { status: targetStatus, rejectionReason, adminNotes } = req.body;
    const adminUser = req.user;

    const refundRequest = await RefundRequest.findById(id)
      .populate("order", "orderNumber")
      .populate("user", "email firstName lastName fullName");

    if (!refundRequest) {
      throw new ApiError(404, "Refund request not found");
    }

    if (refundRequest.status !== ReturnStatus.REQUESTED) {
      throw new ApiError(
        400,
        `Cannot change status from '${refundRequest.status}' to '${targetStatus}'. Only pending requests can be approved or rejected.`
      );
    }

    refundRequest.status = targetStatus;
    if (targetStatus === ReturnStatus.REJECTED) {
      refundRequest.rejectionReason = rejectionReason || "";
    }
    if (adminNotes) {
      refundRequest.adminNotes = adminNotes;
    }

    refundRequest.auditTrail.push({
      action: targetStatus === ReturnStatus.APPROVED ? "REQUEST_APPROVED" : "REQUEST_REJECTED",
      status: targetStatus,
      changedBy: adminUser._id,
      note: targetStatus === ReturnStatus.REJECTED ? rejectionReason : (adminNotes || "Request approved by admin"),
      timestamp: new Date(),
    });

    await refundRequest.save();

    // Send email notification to user
    sendRefundStatusEmail({
      to: refundRequest.user?.email,
      userName: `${refundRequest.user?.firstName || ""} ${refundRequest.user?.lastName || ""}`.trim() || refundRequest.user?.fullName,
      requestNumber: refundRequest.requestNumber,
      orderNumber: refundRequest.order?.orderNumber,
      status: targetStatus,
      amount: refundRequest.totalRefundAmount,
      rejectionReason: refundRequest.rejectionReason,
      note: adminNotes,
    }).catch((err) => console.error("Email notification error:", err));

    return res.status(200).json(
      new ApiResponse(
        200,
        { refundRequest },
        `Refund request has been ${targetStatus.toLowerCase()}`
      )
    );
  } catch (error) {
    console.error("Admin update refund status error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update refund status",
    });
  }
};

export const receiveReturnedItems = async (req, res) => {
  try {
    const { id } = req.params;

    const { error: validationError } = receiveRefundItemsSchema.validate(req.body);
    if (validationError) {
      throw new ApiError(400, validationError.details[0].message);
    }

    const { items: itemUpdates, adminNotes } = req.body;
    const adminUser = req.user;

    const refundRequest = await RefundRequest.findById(id)
      .populate("order", "orderNumber")
      .populate("user", "email firstName lastName fullName");

    if (!refundRequest) {
      throw new ApiError(404, "Refund request not found");
    }

    if (
      refundRequest.status !== ReturnStatus.APPROVED &&
      refundRequest.status !== ReturnStatus.RETURN_SHIPPED
    ) {
      throw new ApiError(
        400,
        `Cannot mark items received: Current request status is '${refundRequest.status}'. Request must be in APPROVED or RETURN_SHIPPED status.`
      );
    }

    // Process per-item restock preferences
    if (Array.isArray(itemUpdates) && itemUpdates.length > 0) {
      const updateMap = new Map();
      itemUpdates.forEach((u) => updateMap.set(u.itemId, u.restockItem));

      for (const item of refundRequest.items) {
        if (updateMap.has(item._id.toString())) {
          item.restockItem = Boolean(updateMap.get(item._id.toString()));
        }
      }
    }

    // Perform atomic restock on items marked for restocking that have not been restocked yet
    let restockedCount = 0;
    for (const item of refundRequest.items) {
      if (item.restockItem && !item.restocked) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
        item.restocked = true;
        item.restockedAt = new Date();
        restockedCount += item.quantity;
      }
    }

    refundRequest.status = ReturnStatus.RETURN_RECEIVED;
    if (adminNotes) {
      refundRequest.adminNotes = adminNotes;
    }

    refundRequest.auditTrail.push({
      action: "ITEMS_RECEIVED",
      status: ReturnStatus.RETURN_RECEIVED,
      changedBy: adminUser._id,
      note: `Items received at warehouse. Restocked ${restockedCount} unit(s). ${adminNotes || ""}`.trim(),
      timestamp: new Date(),
    });

    await refundRequest.save();

    // Send email notification to user
    sendRefundStatusEmail({
      to: refundRequest.user?.email,
      userName: `${refundRequest.user?.firstName || ""} ${refundRequest.user?.lastName || ""}`.trim() || refundRequest.user?.fullName,
      requestNumber: refundRequest.requestNumber,
      orderNumber: refundRequest.order?.orderNumber,
      status: "RETURN_RECEIVED",
      amount: refundRequest.totalRefundAmount,
      note: adminNotes,
    }).catch((err) => console.error("Email notification error:", err));

    return res.status(200).json(
      new ApiResponse(
        200,
        { refundRequest, restockedCount },
        "Returned items marked as received and eligible inventory restocked"
      )
    );
  } catch (error) {
    console.error("Admin receive items error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to mark items received",
    });
  }
};

export const processRefundPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const { error: validationError } = processRefundPaymentSchema.validate(req.body);
    if (validationError) {
      throw new ApiError(400, validationError.details[0].message);
    }

    const { paymentGateway = "STRIPE", manualReference, adminNotes } = req.body;
    const adminUser = req.user;

    const refundRequest = await RefundRequest.findById(id)
      .populate("order")
      .populate("user", "email firstName lastName fullName");

    if (!refundRequest) {
      throw new ApiError(404, "Refund request not found");
    }

    // Idempotency check: Already processed
    if (
      refundRequest.status === ReturnStatus.REFUNDED &&
      refundRequest.gatewayStatus === RefundGatewayStatus.SUCCEEDED
    ) {
      return res.status(200).json(
        new ApiResponse(
          200,
          { refundRequest, alreadyProcessed: true },
          "This refund has already been processed"
        )
      );
    }

    if (
      refundRequest.status !== ReturnStatus.APPROVED &&
      refundRequest.status !== ReturnStatus.RETURN_RECEIVED
    ) {
      throw new ApiError(
        400,
        `Cannot process refund: Current request status is '${refundRequest.status}'. Must be APPROVED or RETURN_RECEIVED.`
      );
    }

    const order = refundRequest.order;
    const refundAmountInRupees = Number(refundRequest.totalRefundAmount);

    if (!refundAmountInRupees || refundAmountInRupees <= 0) {
      throw new ApiError(400, "Invalid refund amount");
    }

    let gatewayRefundId = null;

    if (paymentGateway === "STRIPE") {
      // Find payment intent
      let paymentIntentId = order.paymentIntentId;

      // Fallback: If not stored on order, locate from Stripe checkout session
      if (!paymentIntentId) {
        if (order.stripeSessionId) {
          try {
            const stripeSession = await stripe.checkout.sessions.retrieve(
              order.stripeSessionId
            );
            if (stripeSession?.payment_intent) {
              paymentIntentId = String(stripeSession.payment_intent);
              order.paymentIntentId = paymentIntentId;
              await order.save();
            }
          } catch (sessionErr) {
            console.warn("Could not retrieve Stripe session directly:", sessionErr.message);
          }
        }
      }

      // Second fallback: query Stripe checkout sessions by metadata
      if (!paymentIntentId) {
        try {
          const sessions = await stripe.checkout.sessions.list({ limit: 100 });
          const matchingSession = sessions.data.find(
            (s) => s.metadata?.orderId === order._id.toString()
          );
          if (matchingSession?.payment_intent) {
            paymentIntentId = String(matchingSession.payment_intent);
            order.paymentIntentId = paymentIntentId;
            order.stripeSessionId = matchingSession.id;
            await order.save();
          }
        } catch (searchErr) {
          console.warn("Could not search Stripe sessions:", searchErr.message);
        }
      }

      if (!paymentIntentId) {
        throw new ApiError(
          400,
          "No Stripe Payment Intent found for this order. If paid via COD or offline, please select 'COD_MANUAL' refund method."
        );
      }

      try {
        const stripeRefund = await stripe.refunds.create(
          {
            payment_intent: paymentIntentId,
            amount: Math.round(refundAmountInRupees * 100),
            metadata: {
              orderId: order._id.toString(),
              refundRequestId: refundRequest._id.toString(),
              requestNumber: refundRequest.requestNumber,
            },
          },
          {
            idempotencyKey: `refund_request_${refundRequest._id.toString()}`,
          }
        );

        gatewayRefundId = stripeRefund.id;
        refundRequest.gatewayRefundId = gatewayRefundId;
        refundRequest.gatewayStatus = RefundGatewayStatus.SUCCEEDED;
      } catch (stripeError) {
        console.error("🔴 Stripe refund API failure:", stripeError);
        refundRequest.gatewayStatus = RefundGatewayStatus.FAILED;
        refundRequest.auditTrail.push({
          action: "GATEWAY_REFUND_FAILED",
          status: refundRequest.status,
          changedBy: adminUser._id,
          note: `Stripe Refund Error: ${stripeError.message}`,
          timestamp: new Date(),
        });
        await refundRequest.save();

        throw new ApiError(
          502,
          `Stripe refund failed: ${stripeError.message}. Safe to retry.`
        );
      }
    } else {
      // Manual / COD Refund
      gatewayRefundId = manualReference || `MANUAL-${Date.now()}`;
      refundRequest.paymentGateway = "COD_MANUAL";
      refundRequest.gatewayRefundId = gatewayRefundId;
      refundRequest.gatewayStatus = RefundGatewayStatus.SUCCEEDED;
    }

    // Update refund request status
    refundRequest.status = ReturnStatus.REFUNDED;
    if (adminNotes) {
      refundRequest.adminNotes = adminNotes;
    }

    // Update order totals and statuses
    const newTotalRefunded = Math.round(((order.totalRefunded || 0) + refundAmountInRupees) * 100) / 100;
    order.totalRefunded = newTotalRefunded;

    if (newTotalRefunded >= order.total) {
      order.paymentStatus = "REFUNDED";
      order.fulfillmentStatus = "RETURNED";
    } else {
      order.paymentStatus = "PARTIALLY_REFUNDED";
    }
    await order.save();

    // Reward points restoration if points were used and full refund occurs
    if (order.pointsUsed > 0 && refundRequest.refundType === "FULL") {
      try {
        const alreadyRestored = await PointsLedger.exists({
          order: order._id,
          type: "refunded",
        });

        if (!alreadyRestored) {
          await PointsLedger.create({
            user: order.user,
            points: order.pointsUsed,
            type: "refunded",
            order: order._id,
            note: `Points restored for return #${refundRequest.requestNumber}`,
          });
          refundRequest.pointsRestored = order.pointsUsed;
        }
      } catch (pointsErr) {
        console.error("Points restoration non-fatal error:", pointsErr);
      }
    }

    // Append to audit trail
    refundRequest.auditTrail.push({
      action: "REFUND_PROCESSED",
      status: ReturnStatus.REFUNDED,
      changedBy: adminUser._id,
      note: `Refund of ₹${refundAmountInRupees} successfully processed via ${paymentGateway} (Ref: ${gatewayRefundId}). ${adminNotes || ""}`.trim(),
      timestamp: new Date(),
    });

    await refundRequest.save();

    // Send confirmation email
    sendRefundStatusEmail({
      to: refundRequest.user?.email,
      userName: `${refundRequest.user?.firstName || ""} ${refundRequest.user?.lastName || ""}`.trim() || refundRequest.user?.fullName,
      requestNumber: refundRequest.requestNumber,
      orderNumber: order.orderNumber,
      status: "REFUNDED",
      amount: refundAmountInRupees,
      note: adminNotes,
    }).catch((err) => console.error("Email notification error:", err));

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          refundRequest,
          order: {
            _id: order._id,
            totalRefunded: order.totalRefunded,
            paymentStatus: order.paymentStatus,
            fulfillmentStatus: order.fulfillmentStatus,
          },
        },
        "Refund has been successfully processed"
      )
    );
  } catch (error) {
    console.error("Admin process refund error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to process refund",
    });
  }
};

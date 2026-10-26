// import mongoose from "mongoose";
// import { nanoid } from "nanoid";
// import {Product,ReferralLink,ProductReferral,PointsLedger} from "../models/index.js";
// import { ApiResponse,ApiError } from "../utils/apiResponse.js";

// // ================= CONFIG =================
// export const REFERRAL_PERCENT = 10;      // sender earns 10%
// export const POINT_VALUE = 1;            // 1 point = ₹1
// export const MIN_ORDER_FOR_REDEEM = 500; // min subtotal to use points

// // ================= HELPERS (used by other controllers) =================

// // Points locked by the buyer's unpaid orders (Stripe session lives 30 min)
// export const getReservedPoints = async (userId) => {
//   const since = new Date(Date.now() - 30 * 60 * 1000);

//   const result = await Order.aggregate([
//     {
//       $match: {
//         user: new mongoose.Types.ObjectId(userId),
//         paymentStatus: "PENDING",
//         status: "PENDING",
//         createdAt: { $gte: since },
//         pointsUsed: { $gt: 0 },
//       },
//     },
//     { $group: { _id: null, total: { $sum: "$pointsUsed" } } },
//   ]);

//   return result[0]?.total || 0;
// };

// export const getAvailablePoints = async (userId) => {
//   const result = await PointsLedger.aggregate([
//     { $match: { user: new mongoose.Types.ObjectId(userId) } },
//     { $group: { _id: null, total: { $sum: "$points" } } },
//   ]);
//   return result[0]?.total || 0;
// };

// export const getPendingPoints = async (userId) => {
//   const result = await ProductReferral.aggregate([
//     { $match: { sender: new mongoose.Types.ObjectId(userId), status: "pending" } },
//     { $group: { _id: null, total: { $sum: "$points" } } },
//   ]);
//   return result[0]?.total || 0;
// };

// // Called after order is created: stores PENDING points for the sender
// export const recordReferrals = async ({ orderId, buyerId, orderItems, referrals = [] }) => {
//   for (const ref of referrals) {
//     const item = orderItems.find((i) => i.product.toString() === String(ref.productId));
//     if (!item) continue;

//     const link = await ReferralLink.findOne({ code: ref.refCode });
//     if (!link) continue;
//     if (link.product.toString() !== item.product.toString()) continue; // link must match product
//     if (link.sender.toString() === buyerId.toString()) continue;       // no self-referral

//     const itemTotal = Number(item.total);
//     const points = Math.floor((itemTotal * REFERRAL_PERCENT) / 100);
//     if (points <= 0) continue;

//     try {
//       await ProductReferral.create({
//         link: link._id,
//         sender: link.sender,
//         receiver: buyerId,
//         product: item.product,
//         order: orderId,
//         itemTotal,
//         points,
//       });
//     } catch (err) {
//       if (err.code !== 11000) throw err; // ignore duplicate
//     }
//   }
// };

// // Called when order is DELIVERED: pending -> available
// export const approveReferrals = async (orderId) => {
//   const referrals = await ProductReferral.find({ order: orderId, status: "pending" });

//   for (const r of referrals) {
//     await PointsLedger.create({
//       user: r.sender,
//       points: r.points,
//       type: "earned",
//       order: orderId,
//       note: "Referral order delivered",
//     });
//     r.status = "approved";
//     r.approvedAt = new Date();
//     await r.save();
//   }
// };

// // Called when order is CANCELLED / RETURNED
// export const rejectReferrals = async (order) => {
//   const referrals = await ProductReferral.find({
//     order: order._id,
//     status: { $in: ["pending", "approved"] },
//   });

//   for (const r of referrals) {
//     if (r.status === "approved") {
//       await PointsLedger.create({
//         user: r.sender,
//         points: -r.points,
//         type: "reversed",
//         order: order._id,
//         note: "Referred order cancelled/returned",
//       });
//     }
//     r.status = "rejected";
//     await r.save();
//   }

//   // refund the buyer's spent points (only once)
//   if (order.pointsUsed > 0) {
//     const alreadyRefunded = await PointsLedger.exists({ order: order._id, type: "refunded" });
//     if (!alreadyRefunded) {
//       await PointsLedger.create({
//         user: order.user,
//         points: order.pointsUsed,
//         type: "refunded",
//         order: order._id,
//         note: "Order cancelled/returned",
//       });
//     }
//   }
// };

// // ================= CONTROLLERS =================

// // POST /api/referral/link   body: { productId }
// export const createReferralLink = async (req, res) => {
//   try {
//     const { productId } = req.body;

//     const product = await Product.findById(productId);
//     if (!product) throw new ApiError(404, "Product not found");

//     let link = await ReferralLink.findOne({ sender: req.user._id, product: productId });

//     if (!link) {
//       link = await ReferralLink.create({
//         sender: req.user._id,
//         product: productId,
//         code: nanoid(8),
//       });
//     }

//     const url = `${process.env.CLIENT_URL}/product/${productId}?ref=${link.code}`;

//     return res.status(200).json(new ApiResponse(200, { url, code: link.code }, "Referral link ready"));
//   } catch (error) {
//     console.log("error",error)
//     return res.status(error.statusCode || 500).json({ success: false, message: error.message });
//   }
// };

// // POST /api/referral/click   body: { code }   (public)
// export const trackClick = async (req, res) => {
//   try {
//     const { code } = req.body;
//     await ReferralLink.updateOne({ code }, { $inc: { clicks: 1 } });
//     return res.status(200).json(new ApiResponse(200, null, "Tracked"));
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // GET /api/referral/points
// export const getMyPoints = async (req, res) => {
//   try {
//     const [available, pending] = await Promise.all([
//       getAvailablePoints(req.user._id),
//       getPendingPoints(req.user._id),
//     ]);

//     return res.status(200).json(
//       new ApiResponse(200, { available, pending, availableValue: available * POINT_VALUE }, "Points fetched"),
//     );
//   } catch (error) {
//     return res.status(error.statusCode || 500).json({ success: false, message: error.message });
//   }
// };

// // GET /api/referral/my-referrals
// export const getMyReferrals = async (req, res) => {
//   try {
//     const referrals = await ProductReferral.find({ sender: req.user._id })
//       .populate("product", "name price images")
//       .populate("receiver", "firstName lastName")
//       .sort("-createdAt");

//     return res.status(200).json(new ApiResponse(200, { referrals }, "Referrals fetched"));
//   } catch (error) {
//     return res.status(error.statusCode || 500).json({ success: false, message: error.message });
//   }
// };

// // GET /api/referral/my-links
// export const getMyLinks = async (req, res) => {
//   try {
//     const links = await ReferralLink.find({ sender: req.user._id })
//       .populate("product", "name price images")
//       .sort("-createdAt");

//     return res.status(200).json(new ApiResponse(200, { links }, "Links fetched"));
//   } catch (error) {
//     return res.status(error.statusCode || 500).json({ success: false, message: error.message });
//   }
// };

// // GET /api/referral/ledger
// export const getPointsHistory = async (req, res) => {
//   try {
//     const history = await PointsLedger.find({ user: req.user._id }).sort("-createdAt").limit(100);
//     return res.status(200).json(new ApiResponse(200, { history }, "History fetched"));
//   } catch (error) {
//     return res.status(error.statusCode || 500).json({ success: false, message: error.message });
//   }
// };



















import mongoose from "mongoose";
import { nanoid } from "nanoid";
import {
  Product,
  Order,
  ReferralLink,
  ProductReferral,
  PointsLedger,
} from "../models/index.js";
import { ApiResponse, ApiError } from "../utils/apiResponse.js";

// ================= CONFIG =================
export const REFERRAL_PERCENT = 10; // sender earns 10%
export const POINT_VALUE = 1; // 1 point = ₹1
export const MIN_ORDER_FOR_REDEEM = 500; // min subtotal to use points

// ================= HELPERS (used by other controllers) =================

// Points locked by the buyer's unpaid orders (Stripe session lives 31 min)
export const getReservedPoints = async (userId) => {
  const since = new Date(Date.now() - 31 * 60 * 1000);

  const result = await Order.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        paymentStatus: "PENDING",
        status: "PENDING",
        createdAt: { $gte: since },
        pointsUsed: { $gt: 0 },
      },
    },
    { $group: { _id: null, total: { $sum: "$pointsUsed" } } },
  ]);

  return result[0]?.total || 0;
};

export const getAvailablePoints = async (userId) => {
  const result = await PointsLedger.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: "$points" } } },
  ]);
  return result[0]?.total || 0;
};

export const getPendingPoints = async (userId) => {
  const result = await ProductReferral.aggregate([
    {
      $match: {
        sender: new mongoose.Types.ObjectId(userId),
        status: "pending",
      },
    },
    { $group: { _id: null, total: { $sum: "$points" } } },
  ]);
  return result[0]?.total || 0;
};

// Called after PAYMENT succeeds: stores PENDING points for the sender
export const recordReferrals = async ({
  orderId,
  buyerId,
  orderItems,
  referrals = [],
}) => {
  for (const ref of referrals) {
    const item = orderItems.find(
      (i) => i.product.toString() === String(ref.productId),
    );
    if (!item) continue;

    const link = await ReferralLink.findOne({ code: ref.refCode });
    if (!link) continue;
    if (link.product.toString() !== item.product.toString()) continue; // link must match product
    if (link.sender.toString() === buyerId.toString()) continue; // no self-referral

    const itemTotal = Number(item.total);
    const points = Math.floor((itemTotal * REFERRAL_PERCENT) / 100);
    if (points <= 0) continue;

    try {
      await ProductReferral.create({
        link: link._id,
        sender: link.sender,
        receiver: buyerId,
        product: item.product,
        order: orderId,
        itemTotal,
        points,
      });
    } catch (err) {
      if (err.code !== 11000) throw err; // ignore duplicate (order + product)
    }
  }
};

// Called when order is DELIVERED: pending -> available
export const approveReferrals = async (orderId) => {
  const referrals = await ProductReferral.find({
    order: orderId,
    status: "pending",
  });

  for (const r of referrals) {
    await PointsLedger.create({
      user: r.sender,
      points: r.points,
      type: "earned",
      order: orderId,
      note: "Referral order delivered",
    });
    r.status = "approved";
    r.approvedAt = new Date();
    await r.save();
  }
};

// Called when order is CANCELLED / RETURNED
export const rejectReferrals = async (order) => {
  const referrals = await ProductReferral.find({
    order: order._id,
    status: { $in: ["pending", "approved"] },
  });

  for (const r of referrals) {
    if (r.status === "approved") {
      await PointsLedger.create({
        user: r.sender,
        points: -r.points,
        type: "reversed",
        order: order._id,
        note: "Referred order cancelled/returned",
      });
    }
    r.status = "rejected";
    await r.save();
  }

  // refund the buyer's points ONLY if they were actually deducted (payment succeeded)
  if (order.pointsUsed > 0) {
    const wasDeducted = await PointsLedger.exists({
      order: order._id,
      type: "redeemed",
    });
    const alreadyRefunded = await PointsLedger.exists({
      order: order._id,
      type: "refunded",
    });

    if (wasDeducted && !alreadyRefunded) {
      await PointsLedger.create({
        user: order.user,
        points: order.pointsUsed,
        type: "refunded",
        order: order._id,
        note: "Order cancelled/returned",
      });
    }
  }
};

// ================= CONTROLLERS =================

// POST /api/referral/link   body: { productId }
export const createReferralLink = async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    let link = await ReferralLink.findOne({
      sender: req.user._id,
      product: productId,
    });

    if (!link) {
      link = await ReferralLink.create({
        sender: req.user._id,
        product: productId,
        code: nanoid(8),
      });
    }

    const url = `${process.env.CLIENT_URL}/product/${productId}?ref=${link.code}`;

    return res
      .status(200)
      .json(new ApiResponse(200, { url, code: link.code }, "Referral link ready"));
  } catch (error) {
    console.log("error", error);
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

// POST /api/referral/click   body: { code }   (public)
export const trackClick = async (req, res) => {
  try {
    const { code } = req.body;
    await ReferralLink.updateOne({ code }, { $inc: { clicks: 1 } });
    return res.status(200).json(new ApiResponse(200, null, "Tracked"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/referral/points
export const getMyPoints = async (req, res) => {
  try {
    const [balance, reserved, pending] = await Promise.all([
      getAvailablePoints(req.user._id),
      getReservedPoints(req.user._id),
      getPendingPoints(req.user._id),
    ]);

    // points locked by an unpaid checkout are not spendable
    const available = Math.max(0, balance - reserved);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          available,
          pending,
          reserved,
          availableValue: available * POINT_VALUE,
        },
        "Points fetched",
      ),
    );
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

// GET /api/referral/my-referrals
export const getMyReferrals = async (req, res) => {
  try {
    const referrals = await ProductReferral.find({ sender: req.user._id })
      .populate("product", "name price images")
      .populate("receiver", "firstName lastName")
      .sort("-createdAt");

    return res
      .status(200)
      .json(new ApiResponse(200, { referrals }, "Referrals fetched"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

// GET /api/referral/my-links
export const getMyLinks = async (req, res) => {
  try {
    const links = await ReferralLink.find({ sender: req.user._id })
      .populate("product", "name price images")
      .sort("-createdAt");

    return res
      .status(200)
      .json(new ApiResponse(200, { links }, "Links fetched"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

// GET /api/referral/ledger
export const getPointsHistory = async (req, res) => {
  try {
    const history = await PointsLedger.find({ user: req.user._id })
      .sort("-createdAt")
      .limit(100);
    return res
      .status(200)
      .json(new ApiResponse(200, { history }, "History fetched"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};
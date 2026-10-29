
import mongoose from "mongoose";
import { Review, User } from "../models/index.js";
import { ApiResponse, ApiError } from "../utils/apiResponse.js";
import { updateProductRating } from "./reviews.controller.js";
// =====================================================
// HELPERS
// =====================================================

// Timezone used to group the chart by day (change if your admins are elsewhere)
const TZ = "Asia/Kolkata";
const TZ_OFFSET = "+05:30";

const isTrue = (v) => v === true || v === "true";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const POPULATE_USER = { path: "user", select: "firstName email" };
const POPULATE_PRODUCT = { path: "product", select: "name" };

// =====================================================
// GET /admin/reviews/dashboard
// =====================================================

export const getReviewDashboard = async (req, res) => {
  try {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const flag = (condition) => ({ $sum: { $cond: [condition, 1, 0] } });

    const [agg] = await Review.aggregate([
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                approved: flag("$isApproved"),
                hidden: flag({ $not: ["$isApproved"] }),
                avgRating: { $avg: "$rating" },
                thisMonth: flag({ $gte: ["$createdAt", monthStart] }),
                lowRated: flag({ $lte: ["$rating", 2] }),
                unverified: flag({ $not: ["$isVerifiedPurchase"] }),
                withImages: flag({
                  $gt: [{ $size: { $ifNull: ["$images", []] } }, 0],
                }),
              },
            },
          ],
          distribution: [{ $group: { _id: "$rating", count: { $sum: 1 } } }],
        },
      },
    ]);

    const s = agg?.summary?.[0] || {};

    const recent = await Review.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate(POPULATE_USER)
      .populate(POPULATE_PRODUCT)
      .lean();

    // console.log("read",s)
    // console.log("recent",recent)

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          stats: {
            total: s.total || 0,
            approved: s.approved || 0,
            hidden: s.hidden || 0,
            avgRating: Number((s.avgRating || 0).toFixed(1)),
            thisMonth: s.thisMonth || 0,
          },
          distribution: (agg?.distribution || []).map((d) => ({
            rating: d._id,
            count: d.count,
          })),
          quickCounts: {
            hidden: s.hidden || 0,
            lowRated: s.lowRated || 0,
            unverified: s.unverified || 0,
            withImages: s.withImages || 0,
          },
          recent,
        },
        "Review dashboard fetched successfully"
      )
    );
  } catch (error) {
    console.log("error", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load review dashboard.",
    });
  }
};

// =====================================================
// GET /admin/reviews/timeline?range=7|30
// =====================================================

export const getReviewTimeline = async (req, res) => {
  try {
    const range = Number(req.query.range) === 30 ? 30 : 7;

    // Build the list of day keys (YYYY-MM-DD), oldest first
    const keys = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      keys.push(d.toLocaleDateString("en-CA", { timeZone: TZ }));
    }

    const start = new Date(`${keys[0]}T00:00:00${TZ_OFFSET}`);

    const rows = await Review.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: TZ,
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = Object.fromEntries(rows.map((r) => [r._id, r.count]));

    // Include days with 0 reviews so the chart has no gaps
    const data = keys.map((date) => ({ date, count: counts[date] || 0 }));

    return res.status(200).json(
      new ApiResponse(200, data, "Review timeline fetched successfully")
    );
  } catch (error) {
    console.log("error", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load review timeline.",
    });
  }
};

// =====================================================
// GET /admin/reviews   (filters, sort, pagination)
// =====================================================

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  highest: { rating: -1, createdAt: -1 },
  lowest: { rating: 1, createdAt: -1 },
};

export const getAdminReviews = async (req, res) => {
  try {
    const {
      search,
      status,
      ratingMin,
      ratingMax,
      verified,
      hasImages,
      product,
      dateFrom,
      dateTo,
      sort = "newest",
    } = req.query;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

    const query = {};

    if (status === "approved") query.isApproved = true;
    if (status === "hidden") query.isApproved = false;

    if (verified === "verified") query.isVerifiedPurchase = true;
    if (verified === "unverified") query.isVerifiedPurchase = false;

    if (ratingMin || ratingMax) {
      query.rating = {};
      if (ratingMin) query.rating.$gte = Number(ratingMin);
      if (ratingMax) query.rating.$lte = Number(ratingMax);
    }

    if (isTrue(hasImages)) query["images.0"] = { $exists: true };

    if (product && mongoose.isValidObjectId(product)) query.product = product;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search?.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), "i");
      const users = await User.find({ $or: [{ firstName: rx }, { email: rx }] })
        .select("_id")
        .limit(200)
        .lean();

      query.$or = [
        { description: rx },
        { user: { $in: users.map((u) => u._id) } },
      ];
    }

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .sort(SORTS[sort] || SORTS.newest)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(POPULATE_USER)
        .populate(POPULATE_PRODUCT)
        .lean(),
      Review.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          reviews,
          total,
          page,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
        "Reviews fetched successfully"
      )
    );
  } catch (error) {
    console.log("error", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load reviews.",
    });
  }
};

// =====================================================
// GET /admin/reviews/:id
// =====================================================

export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid review id.");
    }

    const review = await Review.findById(id)
      .populate(POPULATE_USER)
      .populate(POPULATE_PRODUCT)
      .lean();

    if (!review) {
      throw new ApiError(404, "Review not found.");
    }

    return res.status(200).json(
      new ApiResponse(200, { review }, "Review fetched successfully")
    );
  } catch (error) {
    console.log("error", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load review.",
    });
  }
};

// =====================================================
// PATCH /admin/reviews/:id/approval   body: { isApproved }
// =====================================================

export const updateReviewApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid review id.");
    }

    if (typeof isApproved !== "boolean") {
      throw new ApiError(400, "isApproved must be true or false.");
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    );

    if (!review) {
      throw new ApiError(404, "Review not found.");
    }

    let updatedRating = null;
    if (review.product) {
      updatedRating = await updateProductRating(review.product);
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          id,
          isApproved: review.isApproved,
          productId: review.product,
          rating: updatedRating,
        },
        "Review approval updated successfully"
      )
    );
  } catch (error) {
    console.log("error", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update review.",
    });
  }
};

// =====================================================
// PATCH /admin/reviews/bulk   body: { ids, action }
// action: "approve" | "hide" | "delete"
// =====================================================

export const bulkUpdateReviews = async (req, res) => {
  try {
    const { ids, action } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiError(400, "Select at least one review.");
    }

    if (ids.length > 200) {
      throw new ApiError(400, "You can update up to 200 reviews at a time.");
    }

    if (!ids.every((id) => mongoose.isValidObjectId(id))) {
      throw new ApiError(400, "One or more review ids are invalid.");
    }

    if (!["approve", "hide", "delete"].includes(action)) {
      throw new ApiError(400, "Action must be approve, hide or delete.");
    }

    // Capture affected product IDs before modification/deletion
    const existingReviews = await Review.find({ _id: { $in: ids } }).select("product");
    const productIds = [
      ...new Set(
        existingReviews
          .map((r) => r.product?.toString())
          .filter(Boolean)
      ),
    ];

    let affected;

    if (action === "delete") {
      const result = await Review.deleteMany({ _id: { $in: ids } });
      affected = result.deletedCount;
    } else {
      const result = await Review.updateMany(
        { _id: { $in: ids } },
        { isApproved: action === "approve" }
      );
      affected = result.modifiedCount;
    }

    // Recalculate rating for all affected products
    await Promise.all(productIds.map((pId) => updateProductRating(pId)));

    return res.status(200).json(
      new ApiResponse(
        200,
        { ids, action, affected, productIds },
        "Bulk review action completed successfully"
      )
    );
  } catch (error) {
    console.log("error", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Bulk action failed.",
    });
  }
};

// =====================================================
// DELETE /admin/reviews/:id
// =====================================================

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid review id.");
    }

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      throw new ApiError(404, "Review not found.");
    }

    let updatedRating = null;
    if (review.product) {
      updatedRating = await updateProductRating(review.product);
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          id,
          productId: review.product,
          rating: updatedRating,
        },
        "Review deleted successfully"
      )
    );
  } catch (error) {
    console.log("error", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete review.",
    });
  }
};

import mongoose from "mongoose";
import { ApiResponse,ApiError } from "../utils/apiResponse.js";
import { PriceHistory } from "../models/index.js";

const n = (v) => (v === undefined || v === null ? null : Number(v));

// Compare the product before/after an edit and save a row for every change
export const recordPriceChanges = async ({
  before,        // plain object of product BEFORE update
  after,         // plain object of product AFTER update
  userId = null,
  reason = "manual",
}) => {
  const rows = [];

  const check = (variantSku, oldP, newP, oldM, newM) => {
    if (n(oldP) === n(newP) && n(oldM) === n(newM)) return; // nothing changed
    rows.push({
      product: after._id,
      variantSku,
      oldPrice: n(oldP),
      newPrice: n(newP),
      oldMrp: n(oldM),
      newMrp: n(newM),
      changedBy: userId,
      reason,
    });
  };

  // Base product
  check(null, before.price, after.price, before.mrp, after.mrp);

  // Variants (matched by SKU)
  const beforeMap = new Map((before.variants || []).map((v) => [v.sku, v]));
  for (const v of after.variants || []) {
    const old = beforeMap.get(v.sku);
    check(v.sku, old?.price, v.price, old?.mrp, v.mrp);
  }

  if (rows.length > 0) await PriceHistory.insertMany(rows);
};

// Call once when a product is created
export const recordInitialPrice = async (product, userId = null) => {
  const rows = [
    {
      product: product._id,
      variantSku: null,
      oldPrice: null,
      newPrice: product.price,
      newMrp: n(product.mrp),
      changedBy: userId,
      reason: "initial",
    },
    ...(product.variants || []).map((v) => ({
      product: product._id,
      variantSku: v.sku,
      oldPrice: null,
      newPrice: v.price,
      newMrp: n(v.mrp),
      changedBy: userId,
      reason: "initial",
    })),
  ];
  await PriceHistory.insertMany(rows);
};
export const getPriceHistory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid product ID");
    }

    const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);
    const variantSku = req.query.variantSku
      ? String(req.query.variantSku).toUpperCase()
      : null;

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const filter = { product: id, variantSku };

    const [inWindow, prior] = await Promise.all([
      PriceHistory.find({ ...filter, changedAt: { $gte: since } })
        .sort({ changedAt: 1 })
        .select("newPrice newMrp reason changedAt -_id")
        .lean(),
      // price that was already live when the window started
      PriceHistory.findOne({ ...filter, changedAt: { $lt: since } })
        .sort({ changedAt: -1 })
        .select("newPrice newMrp changedAt -_id")
        .lean(),
    ]);

    const points = [];
    if (prior) {
      points.push({ price: prior.newPrice, mrp: prior.newMrp, at: since });
    }
    inWindow.forEach((r) =>
      points.push({ price: r.newPrice, mrp: r.newMrp, at: r.changedAt, reason: r.reason })
    );

    const prices = points.map((p) => p.price);
    const stats = prices.length
      ? {
          lowest: Math.min(...prices),
          highest: Math.max(...prices),
          current: prices[prices.length - 1],
        }
      : null;

    return res
      .status(200)
      .json(new ApiResponse(200, { days, variantSku, stats, points }, "Price history fetched"));
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
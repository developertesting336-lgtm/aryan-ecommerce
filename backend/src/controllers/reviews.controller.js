import { Review, Product, User } from "../models/index.js";
import { ApiError, ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import fs from "fs";

// =====================================================
// HELPER - UPDATE PRODUCT RATING
// =====================================================

const updateProductRating = async (productId) => {
  const reviews = await Review.find({
    product: productId,
  }).select("rating");

  const count = reviews.length;

  // No reviews
  if (count === 0) {
    await Product.findByIdAndUpdate(productId, {
      $set: {
        "rating.average": 0,
        "rating.count": 0,
        "rating.distribution.5": 0,
        "rating.distribution.4": 0,
        "rating.distribution.3": 0,
        "rating.distribution.2": 0,
        "rating.distribution.1": 0,
      },
    });

    return;
  }

  // Calculate average
  const totalRating = reviews.reduce(
    (total, review) => total + review.rating,
    0
  );

  const average = Number((totalRating / count).toFixed(1));

  // Calculate distribution
  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  reviews.forEach((review) => {
    distribution[review.rating]++;
  });

  // Update Product
  await Product.findByIdAndUpdate(productId, {
    $set: {
      "rating.average": average,
      "rating.count": count,

      "rating.distribution.5": distribution[5],
      "rating.distribution.4": distribution[4],
      "rating.distribution.3": distribution[3],
      "rating.distribution.2": distribution[2],
      "rating.distribution.1": distribution[1],
    },
  });
};

// =====================================================
// CREATE REVIEW
// =====================================================

export const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, description } = req.body;

    // -----------------------------------------
    // Validate product ID
    // -----------------------------------------

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new ApiError(400, "Invalid product ID");
    }

    // -----------------------------------------
    // Validate user
    // -----------------------------------------

    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // -----------------------------------------
    // Validate product
    // -----------------------------------------

    const product = await Product.findById(productId);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // -----------------------------------------
    // Validate rating
    // -----------------------------------------

    const ratingNumber = Number(rating);

    if (
      rating === undefined ||
      rating === null ||
      !Number.isInteger(ratingNumber) ||
      ratingNumber < 1 ||
      ratingNumber > 5
    ) {
      throw new ApiError(
        400,
        "Rating must be a number between 1 and 5"
      );
    }

    // -----------------------------------------
    // Validate description
    // -----------------------------------------

    if (!description?.trim()) {
      throw new ApiError(
        400,
        "Review description is required"
      );
    }

    if (description.trim().length < 5) {
      throw new ApiError(
        400,
        "Review description must contain at least 5 characters"
      );
    }

    if (description.trim().length > 1000) {
      throw new ApiError(
        400,
        "Review description cannot exceed 1000 characters"
      );
    }

    // -----------------------------------------
    // Check existing review
    // -----------------------------------------

    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (existingReview) {
      throw new ApiError(
        409,
        "You have already reviewed this product"
      );
    }

    // -----------------------------------------
    // Upload review images
    // -----------------------------------------

    const images = [];

    const files = req.files || [];

    for (const file of files) {
      try {
        const uploaded = await uploadOnCloudinary(file.path);

        if (uploaded?.secure_url) {
          images.push(uploaded.secure_url);
        }
      } finally {
        // Remove local uploaded file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    // -----------------------------------------
    // Create review
    // -----------------------------------------

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: ratingNumber,
      description: description.trim(),
      images,

      // This should later be calculated
      // from the user's order history.
      isVerifiedPurchase: false,
    });

    // -----------------------------------------
    // Update product rating
    // -----------------------------------------

    await updateProductRating(productId);

    // -----------------------------------------
    // Return review
    // -----------------------------------------

    const createdReview = await Review.findById(review._id)
      .populate("user", "firstName lastName avatar")
      .populate("product", "name images");

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          review: createdReview,
        },
        "Review created successfully"
      )
    );

  } catch (error) {
    console.error("Create review error:", error);

    // Duplicate review
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};


// =====================================================
// GET PRODUCT REVIEWS
// =====================================================

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    // -----------------------------------------
    // Validate product ID
    // -----------------------------------------

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new ApiError(400, "Invalid product ID");
    }

    // -----------------------------------------
    // Check product
    // -----------------------------------------

    const product = await Product.findById(productId)
      .select("name rating");

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // -----------------------------------------
    // Pagination
    // -----------------------------------------

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    // -----------------------------------------
    // Get reviews
    // -----------------------------------------

    const [reviews, total] = await Promise.all([
      Review.find({
        product: productId,
        isApproved: true,
      })
        .populate(
          "user",
          "firstName lastName avatar"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Review.countDocuments({
        product: productId,
        isApproved: true,
      }),
    ]);

    // -----------------------------------------
    // Response
    // -----------------------------------------

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          rating: product.rating,

          reviews,

          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        "Product reviews fetched successfully"
      )
    );

  } catch (error) {
    console.error(
      "Get product reviews error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "Something went wrong",
    });
  }
};


// =====================================================
// GET REVIEW BY ID
// =====================================================

export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    // -----------------------------------------
    // Validate review ID
    // -----------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid review ID");
    }

    // -----------------------------------------
    // Get review
    // -----------------------------------------

    const review = await Review.findOne({
      _id: id,
      isApproved: true,
    })
      .populate(
        "user",
        "firstName lastName avatar"
      )
      .populate(
        "product",
        "name images rating"
      );

    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          review,
        },
        "Review fetched successfully"
      )
    );

  } catch (error) {
    console.error("Get review error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "Something went wrong",
    });
  }
};


// =====================================================
// UPDATE REVIEW
// =====================================================

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    // -----------------------------------------
    // Validate review ID
    // -----------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid review ID");
    }

    // -----------------------------------------
    // Find user's review
    // -----------------------------------------

    const review = await Review.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!review) {
      throw new ApiError(
        404,
        "Review not found or you are not authorized to update it"
      );
    }

    // -----------------------------------------
    // Validate rating
    // -----------------------------------------

    if (rating !== undefined) {
      const ratingNumber = Number(rating);

      if (
        !Number.isInteger(ratingNumber) ||
        ratingNumber < 1 ||
        ratingNumber > 5
      ) {
        throw new ApiError(
          400,
          "Rating must be a number between 1 and 5"
        );
      }

      review.rating = ratingNumber;
    }


    

  
   

    // -----------------------------------------
    // Save review
    // -----------------------------------------

    await review.save();

    // -----------------------------------------
    // Update product rating
    // -----------------------------------------

    await updateProductRating(review.product);

    // -----------------------------------------
    // Return updated review
    // -----------------------------------------

    const updatedReview = await Review.findById(
      review._id
    )
      .populate(
        "user",
        "firstName lastName avatar"
      )
      .populate(
        "product",
        "name images rating"
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          review: updatedReview,
        },
        "Review updated successfully"
      )
    );

  } catch (error) {
    console.error(
      "Update review error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "Something went wrong",
    });
  }
};


// =====================================================
// DELETE REVIEW
// =====================================================

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // -----------------------------------------
    // Validate review ID
    // -----------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid review ID");
    }

    // -----------------------------------------
    // Find user's review
    // -----------------------------------------

    const review = await Review.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!review) {
      throw new ApiError(
        404,
        "Review not found or you are not authorized to delete it"
      );
    }

    const productId = review.product;

    // -----------------------------------------
    // Delete review
    // -----------------------------------------

    await Review.findByIdAndDelete(id);

    // -----------------------------------------
    // Update product rating
    // -----------------------------------------

    await updateProductRating(productId);

    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        "Review deleted successfully"
      )
    );

  } catch (error) {
    console.error(
      "Delete review error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "Something went wrong",
    });
  }
};

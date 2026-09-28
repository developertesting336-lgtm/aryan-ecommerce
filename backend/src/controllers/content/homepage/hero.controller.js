import fs from "fs";

import { HeroSlide } from "../../../models/index.js";

import { ApiError, ApiResponse } from "../../../utils/apiResponse.js";
import { uploadOnCloudinary } from "../../../config/cloudinary.js";

// =====================================================
// CREATE HERO SLIDE
// =====================================================

export const createHeroSlide = async (req, res) => {
  try {
    const {
      badge,
      title,
      highlight,
      description,
      primaryButtonText,
      primaryButtonLink,
      secondaryButtonText,
      secondaryButtonLink,
      order,
      isActive,
    } = req.body;

    // -----------------------------------------
    // Validate required fields
    // -----------------------------------------

    if (!title?.trim()) {
      throw new ApiError(400, "Hero title is required");
    }

    // -----------------------------------------
    // Files
    // -----------------------------------------

    const files = req.files || [];

    if (files.length === 0) {
      throw new ApiError(400, "Hero image is required");
    }

    // -----------------------------------------
    // Upload image to Cloudinary
    // -----------------------------------------

    let imageUrl = "";

    for (const file of files) {
      try {
        const uploaded = await uploadOnCloudinary(file.path);

        if (uploaded) {
          imageUrl = uploaded.secure_url;
          break;
        }
      } finally {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    if (!imageUrl) {
      throw new ApiError(400, "Failed to upload hero image");
    }

    // -----------------------------------------
    // Create hero slide
    // -----------------------------------------

    const heroSlide = await HeroSlide.create({
      image: imageUrl,

      badge: badge?.trim() || "",

      title: title.trim(),

      highlight: highlight?.trim() || "",

      description: description?.trim() || "",

      primaryButtonText: primaryButtonText?.trim() || "Shop Now",

      primaryButtonLink: primaryButtonLink?.trim() || "/products",

      secondaryButtonText: secondaryButtonText?.trim() || "",

      secondaryButtonLink: secondaryButtonLink?.trim() || "",

      order: order !== undefined && order !== "" ? Number(order) : 0,

      isActive:
        isActive !== undefined
          ? isActive === true || isActive === "true"
          : true,
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          heroSlide,
        },
        "Hero slide created successfully",
      ),
    );
  } catch (error) {
    console.error("Create hero slide error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// GET ALL HERO SLIDES
// =====================================================

export const getHeroSlides = async (req, res) => {
  try {
    const heroSlides = await HeroSlide.find().sort({
      order: 1,
      createdAt: 1,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          heroSlides,
        },
        "Hero slides fetched successfully",
      ),
    );
  } catch (error) {
    console.error("Get hero slides error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// GET HERO SLIDE BY ID
// =====================================================

export const getHeroSlideById = async (req, res) => {
  try {
    const { id } = req.params;

    const heroSlide = await HeroSlide.findById(id);

    if (!heroSlide) {
      throw new ApiError(404, "Hero slide not found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          heroSlide,
        },
        "Hero slide fetched successfully",
      ),
    );
  } catch (error) {
    console.error("Get hero slide error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// UPDATE HERO SLIDE
// =====================================================

export const updateHeroSlide = async (req, res) => {
  try {
    const { id } = req.params;

    const heroSlide = await HeroSlide.findById(id);

    if (!heroSlide) {
      throw new ApiError(404, "Hero slide not found");
    }

    const {
      badge,
      title,
      highlight,
      description,
      primaryButtonText,
      primaryButtonLink,
      secondaryButtonText,
      secondaryButtonLink,
      order,
      isActive,
    } = req.body;

    // -----------------------------------------
    // Validate title
    // -----------------------------------------

    if (title !== undefined && !title?.trim()) {
      throw new ApiError(400, "Hero title cannot be empty");
    }

    // -----------------------------------------
    // Update image if new file provided
    // -----------------------------------------

    const files = req.files || [];

    if (files.length > 0) {
      for (const file of files) {
        try {
          const uploaded = await uploadOnCloudinary(file.path);

          if (uploaded) {
            heroSlide.image = uploaded.secure_url;

            break;
          }
        } finally {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
    }

    // -----------------------------------------
    // Update fields
    // -----------------------------------------

    if (badge !== undefined) {
      heroSlide.badge = badge.trim();
    }

    if (title !== undefined) {
      heroSlide.title = title.trim();
    }

    if (highlight !== undefined) {
      heroSlide.highlight = highlight.trim();
    }

    if (description !== undefined) {
      heroSlide.description = description.trim();
    }

    if (primaryButtonText !== undefined) {
      heroSlide.primaryButtonText = primaryButtonText.trim();
    }

    if (primaryButtonLink !== undefined) {
      heroSlide.primaryButtonLink = primaryButtonLink.trim();
    }

    if (secondaryButtonText !== undefined) {
      heroSlide.secondaryButtonText = secondaryButtonText.trim();
    }

    if (secondaryButtonLink !== undefined) {
      heroSlide.secondaryButtonLink = secondaryButtonLink.trim();
    }

    if (order !== undefined && order !== "") {
      heroSlide.order = Number(order);
    }

    if (isActive !== undefined) {
      heroSlide.isActive = isActive === true || isActive === "true";
    }

    await heroSlide.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          heroSlide,
        },
        "Hero slide updated successfully",
      ),
    );
  } catch (error) {
    console.error("Update hero slide error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// DELETE HERO SLIDE
// =====================================================

export const deleteHeroSlide = async (req, res) => {
  try {
    const { id } = req.params;

    const heroSlide = await HeroSlide.findByIdAndDelete(id);

    if (!heroSlide) {
      throw new ApiError(404, "Hero slide not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Hero slide deleted successfully"));
  } catch (error) {
    console.error("Delete hero slide error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// TOGGLE HERO SLIDE STATUS
// =====================================================

export const toggleHeroSlideStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const heroSlide = await HeroSlide.findById(id);

    if (!heroSlide) {
      throw new ApiError(404, "Hero slide not found");
    }

    heroSlide.isActive = !heroSlide.isActive;

    await heroSlide.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          heroSlide,
        },
        `Hero slide ${
          heroSlide.isActive ? "activated" : "deactivated"
        } successfully`,
      ),
    );
  } catch (error) {
    console.error("Toggle hero slide status error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

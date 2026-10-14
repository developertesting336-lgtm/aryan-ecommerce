import fs from "fs";

import { PromoCard } from "../../../models/index.js";

import { ApiError, ApiResponse } from "../../../utils/apiResponse.js";

import { uploadOnCloudinary } from "../../../config/cloudinary.js";

// =====================================================
// CREATE PROMO CARD
// =====================================================

export const createPromoCard = async (req, res) => {
  try {
    const {
      eyebrow,
      title,
      description,
      buttonText,
      buttonLink,
      imagePosition,
      overlay,
      order,
      isActive,
    } = req.body;

    // -----------------------------------------
    // Validate required fields
    // -----------------------------------------

    if (!title?.trim()) {
      throw new ApiError(400, "Promo card title is required");
    }

    // -----------------------------------------
    // Files
    // -----------------------------------------

    const files = req.files || [];

    if (files.length === 0) {
      throw new ApiError(400, "Promo card image is required");
    }

    // -----------------------------------------
    // Upload image
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
      throw new ApiError(400, "Failed to upload promo card image");
    }

    // -----------------------------------------
    // Create
    // -----------------------------------------

    const promoCard = await PromoCard.create({
      eyebrow: eyebrow?.trim() || "",

      title: title.trim(),

      description: description?.trim() || "",

      buttonText: buttonText?.trim() || "Shop Now",

      buttonLink: buttonLink?.trim() || "/products",

      image: imageUrl,

      imagePosition: imagePosition?.trim() || "center",

      overlay:
        overlay?.trim() ||
        "bg-gradient-to-r from-black/60 via-black/20 to-black/5",

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
          promoCard,
        },
        "Promo card created successfully",
      ),
    );
  } catch (error) {
    console.error("Create promo card error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// GET ALL PROMO CARDS
// =====================================================

export const getPromoCards = async (req, res) => {
  try {
    const promoCards = await PromoCard.find().sort({
      order: 1,
      createdAt: 1,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          promoCards,
        },
        "Promo cards fetched successfully",
      ),
    );
  } catch (error) {
    console.error("Get promo cards error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// GET PROMO CARD BY ID
// =====================================================

export const getPromoCardById = async (req, res) => {
  try {
    const { id } = req.params;

    const promoCard = await PromoCard.findById(id);

    if (!promoCard) {
      throw new ApiError(404, "Promo card not found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          promoCard,
        },
        "Promo card fetched successfully",
      ),
    );
  } catch (error) {
    console.error("Get promo card error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// UPDATE PROMO CARD
// =====================================================

export const updatePromoCard = async (req, res) => {
  try {
    const { id } = req.params;

    const promoCard = await PromoCard.findById(id);

    if (!promoCard) {
      throw new ApiError(404, "Promo card not found");
    }

    const {
      eyebrow,
      title,
      description,
      buttonText,
      buttonLink,
      imagePosition,
      overlay,
      order,
      isActive,
    } = req.body;

    // -----------------------------------------
    // Validate title
    // -----------------------------------------

    if (title !== undefined && !title?.trim()) {
      throw new ApiError(400, "Promo card title cannot be empty");
    }

    // -----------------------------------------
    // New image
    // -----------------------------------------

    const files = req.files || [];

    if (files.length > 0) {
      for (const file of files) {
        try {
          const uploaded = await uploadOnCloudinary(file.path);

          if (uploaded) {
            promoCard.image = uploaded.secure_url;

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

    if (eyebrow !== undefined) {
      promoCard.eyebrow = eyebrow.trim();
    }

    if (title !== undefined) {
      promoCard.title = title.trim();
    }

    if (description !== undefined) {
      promoCard.description = description.trim();
    }

    if (buttonText !== undefined) {
      promoCard.buttonText = buttonText.trim();
    }

    if (buttonLink !== undefined) {
      promoCard.buttonLink = buttonLink.trim();
    }

    if (imagePosition !== undefined) {
      promoCard.imagePosition = imagePosition.trim();
    }

    if (overlay !== undefined) {
      promoCard.overlay = overlay.trim();
    }

    if (order !== undefined && order !== "") {
      promoCard.order = Number(order);
    }

    if (isActive !== undefined) {
      promoCard.isActive = isActive === true || isActive === "true";
    }

    await promoCard.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          promoCard,
        },
        "Promo card updated successfully",
      ),
    );
  } catch (error) {
    console.error("Update promo card error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// DELETE PROMO CARD
// =====================================================

export const deletePromoCard = async (req, res) => {
  try {
    const { id } = req.params;

    const promoCard = await PromoCard.findByIdAndDelete(id);

    if (!promoCard) {
      throw new ApiError(404, "Promo card not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Promo card deleted successfully"));
  } catch (error) {
    console.error("Delete promo card error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// TOGGLE STATUS
// =====================================================

export const togglePromoCardStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const promoCard = await PromoCard.findById(id);

    if (!promoCard) {
      throw new ApiError(404, "Promo card not found");
    }

    promoCard.isActive = !promoCard.isActive;

    await promoCard.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          promoCard,
        },
        `Promo card ${
          promoCard.isActive ? "activated" : "deactivated"
        } successfully`,
      ),
    );
  } catch (error) {
    console.error("Toggle promo card status error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

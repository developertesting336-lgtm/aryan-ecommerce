import fs from "fs";

import { PromoGridItem } from "../../../models/index.js";

import { ApiError, ApiResponse } from "../../../utils/apiResponse.js";

import { uploadOnCloudinary } from "../../../config/cloudinary.js";

// =====================================================
// CREATE PROMO GRID ITEM
// =====================================================

export const createPromoGridItem = async (req, res) => {
  try {
    const {
      type,
      label,
      title,
      titleLines,
      buttonText,
      buttonLink,
      backgroundPosition,
      backgroundSize,
      gradient,
      dark,
      order,
      isActive,
    } = req.body;

    // -----------------------------------------
    // Validate
    // -----------------------------------------

    if (!title?.trim()) {
      throw new ApiError(400, "Promo grid title is required");
    }

    if (type && !["large", "wide", "small"].includes(type)) {
      throw new ApiError(400, "Invalid promo grid type");
    }

    // -----------------------------------------
    // Files
    // -----------------------------------------

    const files = req.files || [];

    let imageUrl = "";

    if (files.length > 0) {
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
    }

    // -----------------------------------------
    // Parse titleLines
    // -----------------------------------------

    let parsedTitleLines = [];

    if (titleLines) {
      if (typeof titleLines === "string") {
        try {
          parsedTitleLines = JSON.parse(titleLines);
        } catch {
          parsedTitleLines = titleLines
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
        }
      } else if (Array.isArray(titleLines)) {
        parsedTitleLines = titleLines;
      }
    }

    // -----------------------------------------
    // Create
    // -----------------------------------------

    const promoGridItem = await PromoGridItem.create({
      type: type || "small",

      label: label?.trim() || "",

      title: title.trim(),

      titleLines: parsedTitleLines,

      buttonText: buttonText?.trim() || "",

      buttonLink: buttonLink?.trim() || "",

      image: imageUrl,

      backgroundPosition: backgroundPosition?.trim() || "center",

      backgroundSize: backgroundSize?.trim() || "cover",

      gradient: gradient === true || gradient === "true",

      dark: dark === true || dark === "true",

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
          promoGridItem,
        },
        "Promo grid item created successfully",
      ),
    );
  } catch (error) {
    console.error("Create promo grid item error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// GET ALL PROMO GRID ITEMS
// =====================================================

export const getPromoGridItems = async (req, res) => {
  try {
    const promoGridItems = await PromoGridItem.find().sort({
      order: 1,
      createdAt: 1,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          promoGridItems,
        },
        "Promo grid items fetched successfully",
      ),
    );
  } catch (error) {
    console.error("Get promo grid items error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// GET PROMO GRID ITEM BY ID
// =====================================================

export const getPromoGridItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const promoGridItem = await PromoGridItem.findById(id);

    if (!promoGridItem) {
      throw new ApiError(404, "Promo grid item not found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          promoGridItem,
        },
        "Promo grid item fetched successfully",
      ),
    );
  } catch (error) {
    console.error("Get promo grid item error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// UPDATE PROMO GRID ITEM
// =====================================================

export const updatePromoGridItem = async (req, res) => {
  try {
    const { id } = req.params;

    const promoGridItem = await PromoGridItem.findById(id);

    if (!promoGridItem) {
      throw new ApiError(404, "Promo grid item not found");
    }

    const {
      type,
      label,
      title,
      titleLines,
      buttonText,
      buttonLink,
      backgroundPosition,
      backgroundSize,
      gradient,
      dark,
      order,
      isActive,
    } = req.body;

    // -----------------------------------------
    // Validate
    // -----------------------------------------

    if (title !== undefined && !title?.trim()) {
      throw new ApiError(400, "Promo grid title cannot be empty");
    }

    if (type && !["large", "wide", "small"].includes(type)) {
      throw new ApiError(400, "Invalid promo grid type");
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
            promoGridItem.image = uploaded.secure_url;
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

    if (type !== undefined) {
      promoGridItem.type = type;
    }

    if (label !== undefined) {
      promoGridItem.label = label.trim();
    }

    if (title !== undefined) {
      promoGridItem.title = title.trim();
    }

    if (titleLines !== undefined) {
      let parsedTitleLines = [];

      if (typeof titleLines === "string") {
        try {
          parsedTitleLines = JSON.parse(titleLines);
        } catch {
          parsedTitleLines = titleLines
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
        }
      } else if (Array.isArray(titleLines)) {
        parsedTitleLines = titleLines;
      }

      promoGridItem.titleLines = parsedTitleLines;
    }

    if (buttonText !== undefined) {
      promoGridItem.buttonText = buttonText.trim();
    }

    if (buttonLink !== undefined) {
      promoGridItem.buttonLink = buttonLink.trim();
    }

    if (backgroundPosition !== undefined) {
      promoGridItem.backgroundPosition = backgroundPosition.trim();
    }

    if (backgroundSize !== undefined) {
      promoGridItem.backgroundSize = backgroundSize.trim();
    }

    if (gradient !== undefined) {
      promoGridItem.gradient = gradient === true || gradient === "true";
    }

    if (dark !== undefined) {
      promoGridItem.dark = dark === true || dark === "true";
    }

    if (order !== undefined && order !== "") {
      promoGridItem.order = Number(order);
    }

    if (isActive !== undefined) {
      promoGridItem.isActive = isActive === true || isActive === "true";
    }

    await promoGridItem.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          promoGridItem,
        },
        "Promo grid item updated successfully",
      ),
    );
  } catch (error) {
    console.error("Update promo grid item error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// DELETE PROMO GRID ITEM
// =====================================================

export const deletePromoGridItem = async (req, res) => {
  try {
    const { id } = req.params;

    const promoGridItem = await PromoGridItem.findByIdAndDelete(id);

    if (!promoGridItem) {
      throw new ApiError(404, "Promo grid item not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Promo grid item deleted successfully"));
  } catch (error) {
    console.error("Delete promo grid item error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// TOGGLE STATUS
// =====================================================

export const togglePromoGridItemStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const promoGridItem = await PromoGridItem.findById(id);

    if (!promoGridItem) {
      throw new ApiError(404, "Promo grid item not found");
    }

    promoGridItem.isActive = !promoGridItem.isActive;

    await promoGridItem.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          promoGridItem,
        },
        `Promo grid item ${
          promoGridItem.isActive ? "activated" : "deactivated"
        } successfully`,
      ),
    );
  } catch (error) {
    console.error("Toggle promo grid item status error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

import fs from "fs";

import { ShopByNeed } from "../../../models/index.js";

import { ApiError, ApiResponse } from "../../../utils/apiResponse.js";

import { uploadOnCloudinary } from "../../../config/cloudinary.js";

// =====================================================
// CREATE SHOP BY NEED ITEM
// =====================================================

export const createShopByNeedItem = async (req, res) => {
  try {
    const {
      title,
      description,
      eyebrow,
      icon,
      query,
      category,
      order,
      isActive,
    } = req.body;

    // -----------------------------------------
    // Validate required fields
    // -----------------------------------------

    if (!title?.trim()) {
      throw new ApiError(400, "Shop By Need title is required");
    }

    if (!query?.trim() && !category) {
      throw new ApiError(400, "Query or category is required");
    }

    // -----------------------------------------
    // Files
    // -----------------------------------------

    const images = req.files?.images || [];
    const videos = req.files?.videos || [];

    let videoUrl = "";
    let fallbackImageUrl = "";

    // -----------------------------------------
    // Upload Images
    // -----------------------------------------

    for (const file of images) {
      try {
        const uploaded = await uploadOnCloudinary(file.path);

        if (uploaded) {
          fallbackImageUrl = uploaded.secure_url;
        }
      } finally {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    // -----------------------------------------
    // Upload Videos
    // -----------------------------------------

    for (const file of videos) {
      try {
        const uploaded = await uploadOnCloudinary(file.path);

        if (uploaded) {
          videoUrl = uploaded.secure_url;
        }
      } finally {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    // -----------------------------------------
    // Create item
    // -----------------------------------------

    const shopByNeed = await ShopByNeed.create({
      title: title.trim(),

      description: description?.trim() || "",

      eyebrow: eyebrow?.trim() || "",

      icon: icon?.trim() || "ShoppingBag",

      query: query?.trim() || "",

      category: category || undefined,

      video: videoUrl,

      fallbackImage: fallbackImageUrl,

      order:
        order !== undefined && order !== ""
          ? Number(order)
          : 0,

      isActive:
        isActive !== undefined
          ? isActive === true || isActive === "true"
          : true,
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          shopByNeed,
        },
        "Shop By Need item created successfully",
      ),
    );
  } catch (error) {
    console.error("Create Shop By Need error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// GET ALL SHOP BY NEED ITEMS
// =====================================================

export const getShopByNeedItems = async (req, res) => {
  try {
    const shopByNeedItems = await ShopByNeed.find().sort({
      order: 1,
      createdAt: 1,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          shopByNeedItems,
        },
        "Shop By Need items fetched successfully",
      ),
    );
  } catch (error) {
    console.error("Get Shop By Need items error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// GET SHOP BY NEED ITEM BY ID
// =====================================================

export const getShopByNeedItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const shopByNeed = await ShopByNeed.findById(id);

    if (!shopByNeed) {
      throw new ApiError(404, "Shop By Need item not found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          shopByNeed,
        },
        "Shop By Need item fetched successfully",
      ),
    );
  } catch (error) {
    console.error("Get Shop By Need item error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// UPDATE SHOP BY NEED ITEM
// =====================================================

export const updateShopByNeedItem = async (req, res) => {
  try {
    const { id } = req.params;

    // -----------------------------------------
    // Find existing item
    // -----------------------------------------

    const shopByNeed = await ShopByNeed.findById(id);

    if (!shopByNeed) {
      throw new ApiError(404, "Shop By Need item not found");
    }

    const {
      title,
      description,
      eyebrow,
      icon,
      query,
      category,
      order,
      isActive,
    } = req.body;

    // -----------------------------------------
    // Validate
    // -----------------------------------------

    if (title !== undefined && !title?.trim()) {
      throw new ApiError(
        400,
        "Shop By Need title cannot be empty"
      );
    }

    // -----------------------------------------
    // Files
    // -----------------------------------------

    const images = req.files?.images || [];
    const videos = req.files?.videos || [];

    // -----------------------------------------
    // Upload new image
    // -----------------------------------------

    for (const file of images) {
      const uploaded = await uploadOnCloudinary(
        file.path,
        "image"
      );

      if (uploaded) {
        shopByNeed.fallbackImage = uploaded.secure_url;
      }
    }

    // -----------------------------------------
    // Upload new video
    // -----------------------------------------

    for (const file of videos) {
      const uploaded = await uploadOnCloudinary(
        file.path,
        "video"
      );

      if (uploaded) {
        shopByNeed.video = uploaded.secure_url;
      }
    }

    // -----------------------------------------
    // Update fields
    // -----------------------------------------

    if (title !== undefined) {
      shopByNeed.title = title.trim();
    }

    if (description !== undefined) {
      shopByNeed.description = description.trim();
    }

    if (eyebrow !== undefined) {
      shopByNeed.eyebrow = eyebrow.trim();
    }

    if (icon !== undefined) {
      shopByNeed.icon = icon.trim();
    }

    if (query !== undefined) {
      shopByNeed.query = query.trim();
    }

    if (category !== undefined) {
      shopByNeed.category = category || undefined;
    }

    if (order !== undefined && order !== "") {
      shopByNeed.order = Number(order);
    }

    if (isActive !== undefined) {
      shopByNeed.isActive =
        isActive === true || isActive === "true";
    }

    // -----------------------------------------
    // Save
    // -----------------------------------------

    await shopByNeed.save();

    // -----------------------------------------
    // Response
    // -----------------------------------------

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          shopByNeed,
        },
        "Shop By Need item updated successfully"
      )
    );

  } catch (error) {
    console.error(
      "Update Shop By Need error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// =====================================================
// DELETE SHOP BY NEED ITEM
// =====================================================

export const deleteShopByNeedItem = async (req, res) => {
  try {
    const { id } = req.params;

    const shopByNeed = await ShopByNeed.findByIdAndDelete(id);

    if (!shopByNeed) {
      throw new ApiError(404, "Shop By Need item not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Shop By Need item deleted successfully"));
  } catch (error) {
    console.error("Delete Shop By Need error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// =====================================================
// TOGGLE STATUS
// =====================================================

export const toggleShopByNeedItemStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const shopByNeed = await ShopByNeed.findById(id);

    if (!shopByNeed) {
      throw new ApiError(404, "Shop By Need item not found");
    }

    shopByNeed.isActive = !shopByNeed.isActive;

    await shopByNeed.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          shopByNeed,
        },
        `Shop By Need item ${
          shopByNeed.isActive ? "activated" : "deactivated"
        } successfully`,
      ),
    );
  } catch (error) {
    console.error("Toggle Shop By Need status error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

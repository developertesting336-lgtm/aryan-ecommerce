import { Cart } from "../models/cart.model.js";
import { Product, User, Category } from "../models/index.js";
import { ApiError, ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

// CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      image,
      parent,
      level,
      sortOrder,
      isActive,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Generate slug if not provided
    const categorySlug =
      slug ||
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    // Check duplicate slug
    const existingCategory = await Category.findOne({
      slug: categorySlug,
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category with this slug already exists",
      });
    }

    // Validate parent
    let categoryLevel = 0;

    if (parent) {
      if (!mongoose.Types.ObjectId.isValid(parent)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent category ID",
        });
      }

      const parentCategory = await Category.findById(parent);

      if (!parentCategory) {
        return res.status(404).json({
          success: false,
          message: "Parent category not found",
        });
      }

      categoryLevel = (parentCategory.level || 0) + 1;
    }

    const category = await Category.create({
      name,
      slug: categorySlug,
      description,
      image,
      parent: parent || null,
      level: level ?? categoryLevel,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};


// GET ALL CATEGORIES
export const getCategories = async (req, res) => {
  try {
      
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      parent,
    } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);

    const filter = {};

    // Search
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Active filter
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    // Parent filter
    if (parent === "null") {
      filter.parent = null;
    } else if (parent) {
      if (!mongoose.Types.ObjectId.isValid(parent)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent category ID",
        });
      }

      filter.parent = parent;
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [categories, total] = await Promise.all([
      Category.find(filter)
        .populate("parent", "name slug level")
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .sort({
          level: 1,
          sortOrder: 1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber),

      Category.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: categories,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};


// GET SINGLE CATEGORY
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(id)
      .populate("parent", "name slug level")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message,
    });
  }
};


// UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const {
      name,
      slug,
      description,
      image,
      parent,
      level,
      sortOrder,
      isActive,
    } = req.body;

    // Check duplicate slug
    if (slug && slug !== category.slug) {
      const existingCategory = await Category.findOne({
        slug,
        _id: { $ne: id },
      });

      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: "Category with this slug already exists",
        });
      }

      category.slug = slug;
    }

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;

    // Parent update
    if (parent !== undefined) {
      if (parent === null || parent === "") {
        category.parent = null;
        category.level = 0;
      } else {
        if (!mongoose.Types.ObjectId.isValid(parent)) {
          return res.status(400).json({
            success: false,
            message: "Invalid parent category ID",
          });
        }

        // Prevent category from becoming its own parent
        if (parent.toString() === id.toString()) {
          return res.status(400).json({
            success: false,
            message: "Category cannot be its own parent",
          });
        }

        const parentCategory = await Category.findById(parent);

        if (!parentCategory) {
          return res.status(404).json({
            success: false,
            message: "Parent category not found",
          });
        }

        category.parent = parent;
        category.level = (parentCategory.level || 0) + 1;
      }
    }

    // Explicit level takes priority
    if (level !== undefined) {
      category.level = level;
    }

    category.updatedBy = req.user?._id;

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};


// DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if category has children
    const childCategories = await Category.countDocuments({
      parent: id,
    });

    if (childCategories > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category because it has child categories",
      });
    }

    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};


// GET CATEGORY CHILDREN
export const getCategoryChildren = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const children = await Category.find({
      parent: id,
      isActive: true,
    }).sort({
      sortOrder: 1,
      name: 1,
    });

    return res.status(200).json({
      success: true,
      data: children,
    });
  } catch (error) {
    console.error("Get category children error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch child categories",
      error: error.message,
    });
  }
};


// GET ROOT CATEGORIES
export const getRootCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      parent: null,
      isActive: true,
    })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({
        sortOrder: 1,
        name: 1,
      });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get root categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch root categories",
      error: error.message,
    });
  }
};






export const getstatsData = async (req, res) => {
  try {
      const [totalCategories,parentCategories,subCategories,activeCategories] = await Promise.all([
          Category.countDocuments(),
           Category.countDocuments({ parent: null }),
  Category.countDocuments({ parent: { $ne: null } }),
  Category.countDocuments({ isActive: true }),
        ]);
        const stats = {totalCategories,parentCategories,subCategories,activeCategories}

    // return res.status(200).json({
    //   success: true,
    //   data: stats,
    // });
     return res.status(200).json(
          new ApiResponse(
            200,{stats},"stats data fetched successfully"
          )
        );
  } catch (error) {
    console.error("Get root categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch root categories",
      error: error.message,
    });
  }
};
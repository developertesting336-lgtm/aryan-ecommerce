import { Product, User, Category, ProductRelation } from "../models/index.js";
import { ApiError, ApiResponse } from "../utils/apiResponse.js";
import { generateSlug } from "../utils/common.js";
import { prepareProductVariants } from "../utils/productVariantHelper.js";
import mongoose from "mongoose";
import {uploadOnCloudinary} from "../config/cloudinary.js";
import fs from "fs";

// =====================================================
// CREATE PRODUCT
// =====================================================

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      brand,
      price,
      mrp,
      stock,
      sku,
      accessories,
      variants,
  hasVariants,
    } = req.body;

    // -----------------------------------------
    // Validate user
    // -----------------------------------------

    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.role !== "vendor" && user.role !== "admin") {
      throw new ApiError(
        403,
        "You are not authorized to create products"
      );
    }

    // -----------------------------------------
    // Validate required fields
    // -----------------------------------------

    if (!name?.trim() || !description?.trim() || !category || price === undefined) {
      throw new ApiError(
        400,
        "Name, description, category and price are required"
      );
    }

    // -----------------------------------------
    // Validate price
    // -----------------------------------------

    if (Number(price) < 0) {
      throw new ApiError(400, "Price cannot be negative");
    }

    if (mrp !== undefined && Number(mrp) < 0) {
      throw new ApiError(400, "MRP cannot be negative");
    }

    if (stock !== undefined && Number(stock) < 0) {
      throw new ApiError(400, "Stock cannot be negative");
    }

    // -----------------------------------------
    // Check category
    // -----------------------------------------

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      throw new ApiError(404, "Category not found");
    }

    // -----------------------------------------
    // Files
    // -----------------------------------------

    const files = req.files || [];

    if (files.length === 0) {
      throw new ApiError(
        400,
        "At least one product image is required"
      );
    }

    // -----------------------------------------
    // Upload media to Cloudinary
    // -----------------------------------------

    const media = [];

    for (const file of files) {
      try {
        const uploaded = await uploadOnCloudinary(file.path);

        if (!uploaded) {
          continue;
        }

        media.push({
          type: file.mimetype?.startsWith("video")
            ? "video"
            : "image",
          url: uploaded.secure_url,
        });
      } finally {
        // Delete local file after upload
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    if (media.length === 0) {
      throw new ApiError(
        400,
        "Failed to upload product media"
      );
    }

    // -----------------------------------------
    // Product images
    // -----------------------------------------

    const imagePaths = media
      .filter((item) => item.type === "image")
      .map((item) => item.url);

    if (imagePaths.length === 0) {
      throw new ApiError(
        400,
        "At least one product image is required"
      );
    }

    // -----------------------------------------
    // Generate slug
    // -----------------------------------------

    const slug = generateSlug(name);

    // -----------------------------------------
    // Check duplicate slug
    // -----------------------------------------

    const existingProduct = await Product.findOne({ slug });

    if (existingProduct) {
      throw new ApiError(
        409,
        "A product with this name already exists"
      );
    }

    // -----------------------------------------
    // Create product
    // -----------------------------------------

const preparedVariants = prepareProductVariants({
  variants,
  productName: name,
  brand,
  hasVariants,
});

    const product = await Product.create({
      name: name.trim(),
      slug,
      description: description.trim(),

      category,

      brand: brand?.trim() || undefined,

      images: imagePaths,

      price: Number(price),

      mrp:
        mrp !== undefined && mrp !== ""
          ? Number(mrp)
          : undefined,

      stock:
        stock !== undefined && stock !== ""
          ? Number(stock)
          : 0,

      sku: sku?.trim() || undefined,

      vendor: req.user._id,
      hasVariants,
       variants: preparedVariants,
      // Admin can make it active immediately.
      // Vendor products start as draft.
      status: user.role === "admin" ? "active" : "draft",
    });

    // -----------------------------------------
    // Create product relations
    // -----------------------------------------

    if (accessories) {
      let accessoryIds = accessories;

      // FormData sends arrays as strings
      if (typeof accessories === "string") {
        try {
          accessoryIds = JSON.parse(accessories);
        } catch (error) {
          accessoryIds = [];
        }
      }

      if (Array.isArray(accessoryIds) && accessoryIds.length > 0) {
        const relations = accessoryIds
          .filter(
            (id) =>
              id &&
              id.toString() !== product._id.toString()
          )
          .map((relatedProductId) => ({
            product: relatedProductId,
            relatedProduct: product._id,
            type: "addon",
            isActive: true,
          }));

        if (relations.length > 0) {
          await ProductRelation.insertMany(relations);
        }
      }
    }

    // -----------------------------------------
    // Return product
    // -----------------------------------------

    const createdProduct = await Product.findById(product._id)
      .populate("category")
      .populate("vendor", "name email");

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          product: createdProduct,
        },
        "Product created successfully"
      )
    );
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};



// =====================================================
// GET ALL PRODUCTS
// =====================================================

export const getProducts = async (req, res) => {
  try {
const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 10;
const skip = (page - 1) * limit;
const products = await Product.find()
  .populate({
    path: "category",
    populate: {
      path: "parent",
      populate: {
        path: "parent",
      },
    },
  })
  .populate("vendor", "firstName email")
  .sort({ createdAt: -1 }) .skip(skip)
  .limit(limit);
  const total = await Product.countDocuments()
    return res.status(200).json(
      new ApiResponse(
        200,
        { products, pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }, },
        "Products fetched successfully"
      )
    );

  } catch (error) {
    console.log("Get products error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getProductsByFilter = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      inStock,
      sort,
      search,
    } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);

    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};

    // Category
    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }
  const children = await Category.find({
            parent: category,
            isActive: true,
          }).sort({
            sortOrder: 1,
            name: 1,
          });
          filter.category = category ;
          console.log("children",children)
      
    }

    // Price
    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Stock
    if (inStock !== undefined) {
      filter.stock =
        inStock === "true"
          ? { $gt: 0 }
          : { $lte: 0 };
    }

    // Search
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Sort
    let sortOption = {
      createdAt: -1,
    };

    switch (sort) {
      case "price_asc":
        sortOption = { price: 1 };
        break;

      case "price_desc":
        sortOption = { price: -1 };
        break;

      case "name_asc":
        sortOption = { name: 1 };
        break;

      case "name_desc":
        sortOption = { name: -1 };
        break;

      case "newest":
        sortOption = { createdAt: -1 };
        break;

      case "oldest":
        sortOption = { createdAt: 1 };
        break;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate({
          path: "category",
          populate: {
            path: "parent",
            populate: {
              path: "parent",
            },
          },
        })
        .populate("vendor", "firstName email")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNumber),

      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// =====================================================
// GET VENDOR PRODUCTS
// =====================================================

export const getVendorsProducts = async (req, res) => {
  try {

    const products = await Product.find({
      vendor: req.user._id,
    })
      .populate("category", "name slug parent level")
      .sort({ createdAt: -1 });

    return res.status(200).json(
      new ApiResponse(
        200,
        { products },
        "Vendor products fetched successfully"
      )
    );

  } catch (error) {
    console.log("Get vendor products error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};




export const getProductById = async (req,res) =>{
  try {
    const {id} = req.params
const product = await Product.findOne(
  req.user.role === "admin"
    ? { _id: id }
    : { _id: id, vendor: req.user._id }
);     if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {product},
        "Product data fetched successfully"
      )
    );
  } catch (error) {
    console.log("error", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}





export const editProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // -----------------------------------------
    // Validate product ID
    // -----------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid product ID");
    }

    // -----------------------------------------
    // Validate user
    // -----------------------------------------

    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.role !== "vendor" && user.role !== "admin") {
      throw new ApiError(
        403,
        "You are not authorized to edit products"
      );
    }

    // -----------------------------------------
    // Find product
    // -----------------------------------------

    const product = await Product.findOne(
      user.role === "admin"
        ? { _id: id }
        : { _id: id, vendor: req.user._id }
    );

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // -----------------------------------------
    // Request body
    // -----------------------------------------

    const {
      name,
      description,
      category,
      brand,
      price,
      mrp,
      stock,
      sku,
      accessories,
      variants,
      hasVariants,
    } = req.body;

    const updateFields = {};

    // -----------------------------------------
    // Validate + update name
    // -----------------------------------------

    if (name !== undefined && name !== null) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        throw new ApiError(
          400,
          "Product name cannot be empty"
        );
      }

      updateFields.name = trimmedName;

      const newSlug = generateSlug(trimmedName);

      // Check duplicate slug excluding current product
      const existingProduct = await Product.findOne({
        slug: newSlug,
        _id: { $ne: id },
      });

      if (existingProduct) {
        throw new ApiError(
          409,
          "A product with this name already exists"
        );
      }

      updateFields.slug = newSlug;
    }

    // -----------------------------------------
    // Update description
    // -----------------------------------------

    if (description !== undefined && description !== null) {
      const trimmedDescription = description.trim();

      if (!trimmedDescription) {
        throw new ApiError(
          400,
          "Product description cannot be empty"
        );
      }

      updateFields.description = trimmedDescription;
    }

    // -----------------------------------------
    // Update category
    // -----------------------------------------

    if (category !== undefined && category !== null) {
      const categoryExists = await Category.findById(category);

      if (!categoryExists) {
        throw new ApiError(404, "Category not found");
      }

      updateFields.category = category;
    }

    // -----------------------------------------
    // Update brand
    // -----------------------------------------

    if (brand !== undefined && brand !== null) {
      updateFields.brand = brand.trim() || undefined;
    }

    // -----------------------------------------
    // Validate + update price
    // -----------------------------------------

    if (price !== undefined && price !== null && price !== "") {
      if (Number(price) < 0) {
        throw new ApiError(
          400,
          "Price cannot be negative"
        );
      }

      updateFields.price = Number(price);
    }

    // -----------------------------------------
    // Validate + update MRP
    // -----------------------------------------

    if (mrp !== undefined && mrp !== null && mrp !== "") {
      if (Number(mrp) < 0) {
        throw new ApiError(
          400,
          "MRP cannot be negative"
        );
      }

      updateFields.mrp = Number(mrp);
    }

    // -----------------------------------------
    // Validate + update stock
    // -----------------------------------------

    if (stock !== undefined && stock !== null && stock !== "") {
      if (Number(stock) < 0) {
        throw new ApiError(
          400,
          "Stock cannot be negative"
        );
      }

      updateFields.stock = Number(stock);
    }

    // -----------------------------------------
    // Update SKU
    // -----------------------------------------

    if (sku !== undefined && sku !== null) {
      updateFields.sku = sku.trim() || undefined;
    }

    // -----------------------------------------
    // Handle variants
    // -----------------------------------------

    if (
      variants !== undefined ||
      hasVariants !== undefined
    ) {
      const preparedVariants = prepareProductVariants({
        variants,
        productName:
          name !== undefined
            ? name
            : product.name,
        brand:
          brand !== undefined
            ? brand
            : product.brand,
        hasVariants:
          hasVariants !== undefined
            ? hasVariants
            : product.hasVariants,
      });

      updateFields.variants = preparedVariants;

      if (hasVariants !== undefined) {
        updateFields.hasVariants =
          hasVariants === true ||
          hasVariants === "true";
      }
    }

    // -----------------------------------------
    // Upload new media
    // -----------------------------------------

    const files = req.files || [];

    let uploadedMedia = [];

    if (files.length > 0) {
      for (const file of files) {
        try {
          const uploaded = await uploadOnCloudinary(
            file.path
          );

          if (!uploaded) {
            continue;
          }

          uploadedMedia.push({
            type: file.mimetype?.startsWith("video")
              ? "video"
              : "image",
            url: uploaded.secure_url,
          });
        } finally {
          // Delete local file after upload
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }

      if (uploadedMedia.length === 0) {
        throw new ApiError(
          400,
          "Failed to upload product media"
        );
      }
    }

    // -----------------------------------------
    // Handle product images
    // -----------------------------------------

    if (uploadedMedia.length > 0) {
      const newImagePaths = uploadedMedia
        .filter((item) => item.type === "image")
        .map((item) => item.url);

      if (newImagePaths.length > 0) {
        updateFields.images = [
          ...(product.images || []),
          ...newImagePaths,
        ];
      }
    }

    // -----------------------------------------
    // Check whether anything is being updated
    // -----------------------------------------

    if (Object.keys(updateFields).length === 0) {
      throw new ApiError(
        400,
        "No fields provided for update"
      );
    }

    // -----------------------------------------
    // Update product
    // -----------------------------------------

    const updatedProduct =
      await Product.findOneAndUpdate(
        user.role === "admin"
          ? { _id: id }
          : {
              _id: id,
              vendor: req.user._id,
            },
        {
          $set: updateFields,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedProduct) {
      throw new ApiError(
        404,
        "Product not found"
      );
    }

    // -----------------------------------------
    // Update accessories
    // -----------------------------------------

    if (accessories !== undefined) {
      let accessoryIds = accessories;

      // FormData sends arrays as strings
      if (typeof accessories === "string") {
        try {
          accessoryIds = JSON.parse(accessories);
        } catch (error) {
          accessoryIds = [];
        }
      }

      if (!Array.isArray(accessoryIds)) {
        accessoryIds = [];
      }

      // Remove existing accessory relations
      await ProductRelation.deleteMany({
        relatedProduct: updatedProduct._id,
        type: "addon",
      });

      // Create new relations
      const relations = accessoryIds
        .filter(
          (relatedProductId) =>
            relatedProductId &&
            relatedProductId.toString() !==
              updatedProduct._id.toString()
        )
        .map((relatedProductId) => ({
          product: relatedProductId,
          relatedProduct: updatedProduct._id,
          type: "addon",
          isActive: true,
        }));

      if (relations.length > 0) {
        await ProductRelation.insertMany(
          relations
        );
      }
    }

    // -----------------------------------------
    // Return updated product
    // -----------------------------------------

    const finalProduct = await Product.findById(
      updatedProduct._id
    )
      .populate("category")
      .populate("vendor", "name email");

    // -----------------------------------------
    // Success response
    // -----------------------------------------

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          product: finalProduct,
        },
        "Product updated successfully"
      )
    );
  } catch (error) {
    console.error(
      "Edit product error:",
      error
    );

    // Duplicate slug / unique field
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A product with this name already exists",
      });
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};





export const searchProducts = async (req,res) =>{
  try {
    console.log("req.search",req.query.search)
    const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 10;
const skip = (page - 1) * limit;
const search = req.query.search?.trim() || "";

let categoryIds = [];

if (search) {
  // Find categories matching the search
  const matchedCategories = await Category.find({
    $or: [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        slug: {
          $regex: search,
          $options: "i",
        },
      },
    ],
  }).select("_id");

  const matchedIds = matchedCategories.map((cat) => cat._id);

  // Find categories whose parent is one of the matched categories
  const childCategories = await Category.find({
    parent: { $in: matchedIds },
  }).select("_id");

  // Find grandchildren
  const grandChildCategories = await Category.find({
    parent: { $in: childCategories.map((cat) => cat._id) },
  }).select("_id");

  categoryIds = [
    ...matchedIds,
    ...childCategories.map((cat) => cat._id),
    ...grandChildCategories.map((cat) => cat._id),
  ];
}

const product = await Product.find({
  ...(search && {
    $or: [
      // Search product name
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },

      // Search category / parent / grandparent
      {
        category: {
          $in: categoryIds,
        },
      },
    ],
  }),
}).populate({
  path: "category",
  populate: {
    path: "parent",
    populate: {
      path: "parent",
    },
  },
}).sort({ createdAt: -1 }) .skip(skip)
  .limit(limit);
  const total = await Product.countDocuments();


     if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {product,
          pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
        },
        "Product data fetched successfully"
      )
    );
  } catch (error) {
    console.log("error", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}

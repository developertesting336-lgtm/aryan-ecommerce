import { Order, OrderItem, Product, User, Review } from "../models/index.js";
import { ApiError, ApiResponse } from "../utils/apiResponse.js";
import { OrderStatus,FulfillmentStatus,PaymentStatus,fulfillmentTransitions,ALLOWED_TRANSITIONS,PRODUCT_STATUSES  } from "../config/constants.js";
import { generateSlug } from "../utils/common.js";
import mongoose from "mongoose";
import { approveReferrals, rejectReferrals } from "./referral.controller.js";

export const adminDashboard = async (req, res) => {
  try {
    // BASIC DASHBOARD DATA
    const [orders, products, users, revenueResult] = await Promise.all([
      Order.countDocuments(),

      Product.countDocuments(),

      // User.countDocuments(),
      OrderItem.aggregate([
        {
          $group: {
            _id: null,
            revenue: { $sum: "$commissionAmount" },
          },
        },
      ]),
    

      Order.aggregate([
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total" },
          },
        },
      ]),
    ]);

    const revenue = revenueResult[0]?.revenue || 0;
    const adminEarining = users[0]?.revenue || 0;
    // RECENT ORDERS
    const recentOrdersPromise = OrderItem.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "order",
          foreignField: "_id",
          as: "orderdetails",
        },
      },
      {
        $unwind: "$orderdetails",
      },
      {
        $lookup: {
          from: "users",
          localField: "orderdetails.user",
          foreignField: "_id",
          as: "userdetails",
        },
      },
      {
        $unwind: "$userdetails",
      },

      // Most recent orders first
      {
        $sort: {
          "orderdetails.createdAt": -1,
        },
      },

      // If the same order has multiple OrderItems,
      // keep only one record for that order
      {
        $group: {
          _id: "$orderdetails._id",
          orderNumber: {
            $first: "$orderdetails.orderNumber",
          },
          productName: {
            $first: "$productName",
          },
          price: {
            $first: "$price",
          },
          status: {
            $first: "$orderdetails.status",
          },
          userName: {
            $first: "$userdetails.firstName",
          },
          createdAt: {
            $first: "$orderdetails.createdAt",
          },
        },
      },

      // Now get 5 unique orders
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 5,
      },

      {
        $project: {
          _id: 0,
          orderNumber: 1,
          productName: 1,
          price: 1,
          status: 1,
          userName: 1,
          createdAt: 1,
        },
      },
    ]);

    // SALES OVERVIEW
    const requestedRange = req.query.filter || "7days";

    const validRanges = ["today", "7days", "30days", "year"];

    const range = validRanges.includes(requestedRange)
      ? requestedRange
      : "7days";

    const now = new Date();

    let startDate;
    const endDate = now;

    if (range === "today") {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "7days") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === "30days") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
    } else if (range === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const salesOverviewPromise = Order.find({
      fulfillmentStatus: FulfillmentStatus.DELIVERED,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).select("total createdAt");

    // ALL INDEPENDENT QUERIES IN PARALLEL
    const [
      recentOrders,
      cancelledOrders,
      deliveredOrders,
      shippedOrders,
      pendingOrders,
      topProducts,
      salesOverview,
    ] = await Promise.all([
      // RECENT ORDERS
      recentOrdersPromise,

      // ORDER SUMMARY
       Order.countDocuments({
        fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
      }),
      

      Order.countDocuments({
        fulfillmentStatus: FulfillmentStatus.DELIVERED,
      }),

      Order.countDocuments({
        fulfillmentStatus: FulfillmentStatus.SHIPPED,
      }),

     Order.countDocuments({
        status: OrderStatus.CANCELLED,
      }),

      // TOP PRODUCTS
      OrderItem.aggregate([
       
        {
          $lookup: {
            from: "orders",
            localField: "order",
            foreignField: "_id",
            as: "orderdetails",
          },
        },
        {
          $unwind: "$orderdetails",
        },
        {
          $lookup: {
            from: "products",
            localField: "product",
            foreignField: "_id",
            as: "productdetails",
          },
        },
        {
          $unwind: "$productdetails",
        },
        {
          $lookup: {
            from: "categories",
            localField: "productdetails.category",
            foreignField: "_id",
            as: "categorydetails",
          },
        },
        {
          $unwind: "$categorydetails",
        },
        {
          $match: {
            "orderdetails.fulfillmentStatus":
              FulfillmentStatus.DELIVERED,
          },
        },
        {
          $group: {
            _id: "$product",
            productName: {
              $first: "$productdetails.name",
            },
            category: {
              $first: "$categorydetails.name",
            },
            sellingUnits: {
              $sum: "$quantity",
            },
          },
        },
        {
          $sort: {
            sellingUnits: -1,
          },
        },
        {
          $project: {
            productName: 1,
            category: 1,
            sellingUnits: 1,
          },
        },
        {$limit:5}
      ]),

      // SALES OVERVIEW
      salesOverviewPromise,
    ]);

    // ORDER SUMMARY PERCENTAGES
    const getcancelled =Math.round(
      orders > 0 ? (cancelledOrders / orders) * 100 : 0);

    const getPending =Math.round(
      orders > 0 ? (pendingOrders / orders) * 100 : 0);

    const getProcessing =Math.round(
      orders > 0 ? (shippedOrders / orders) * 100 : 0);

    const getDelivered =Math.round(
      orders > 0 ? (deliveredOrders / orders) * 100 : 0);

    const orderSummery = [
      getcancelled,
      getDelivered,
      getProcessing,
      getPending,
    ];
const stats = {orders,products,adminEarining,revenue}
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          stats,
          recentOrders,
          topProducts,
          orderSummery,
          salesOverview,
        },
        "Dashboard data fetched successfully"
      )
    );
  } catch (error) {
    console.log("error", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};


export const adminProducts = async (req,res) => {
  try {
    const totalProducts = await Product.countDocuments({});
    const activeProducts = await Product.countDocuments({status:"active"});
    const lowStockProducts = await Product.countDocuments({stock:{ $lt: 10 } });
    const outofStocksProducts = await Product.countDocuments({stock:0});
    const result = await Promise.all([totalProducts,activeProducts,lowStockProducts,outofStocksProducts]);
const stats ={totalProducts,activeProducts,lowStockProducts,outofStocksProducts}
const page = Math.max(parseInt(req.query.page) || 1, 1);
const limit = Math.max(parseInt(req.query.limit) || 10, 1);
const skip = (page - 1) * limit;
    const products = await Product.aggregate([
      {$sort:{createdAt:-1}},
       { $skip: skip },
  { $limit: limit },
      {
        $lookup:{
          from:"categories",
          localField:"category",
          foreignField:"_id",
          as:"categorydetails"
        }
      },
      {
         $unwind: "$categorydetails",
      },
      
{ $lookup:{
          from:"orderitems",
          localField:"_id",
          foreignField:"product",
          as:"orderItemdetails",
      }},
           {
         $unwind: {
          path: "$orderItemdetails",
      preserveNullAndEmptyArrays: true
         },
      },
      {
         $group: {
            _id: "$_id",
            name: {
              $first: "$name",
            },
            price:{
              $first : "$price"
            },
            mrp:{
              $first : "$mrp"
            },
             stock:{
              $first : "$stock"
            },
            status:{
              $first : "$status"
            },
            images:{
              $first : "$images"
            },
            category: {
              $first: "$categorydetails.name",
            },
            sellingUnits: {
              $sum: "$orderItemdetails.quantity",
            },
          },
      }
    ])
       return res.status(200).json(
      new ApiResponse(
        200,
        {
          stats,
          products
        },
        "adminProducts data fetched successfully"
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

export const adminUsers = async (req,res) => {
  try {
    const totalUsers = await   User.countDocuments({});
    const activeUsers = await  User.countDocuments({status:"active"});
    const blockedUsers = await  User.countDocuments({status:"blocked"});
const revenue = await Order.aggregate([
  {
    $match: {
      paymentStatus: PaymentStatus.PAID,
    },
  },
  {
    $group: {
      _id: null,
      Revenue: { $sum: "$total" },
    },
  },
]);
const Revenue = revenue[0]?.Revenue || 0;
    const result = await Promise.all([totalUsers,activeUsers,blockedUsers,revenue]);
const stats ={totalUsers,activeUsers,blockedUsers,Revenue}
const page = Math.max(parseInt(req.query.page) || 1, 1);
const limit = Math.max(parseInt(req.query.limit) || 10, 1);
const skip = (page - 1) * limit;
    const users = await User.find({}).skip(skip).limit(limit)
       return res.status(200).json(
      new ApiResponse(
        200,
        {
          page,
          stats,
          users
        },
        "adminUsers data fetched successfully"
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


export const adminOrders = async (req,res) => {
  try {
    
    const totalOrders = await   Order.countDocuments({});
    const deliveredOrders = await  Order.countDocuments({fulfillmentStatus:FulfillmentStatus.DELIVERED});
    const pendingOrders = await  Order.countDocuments({fulfillmentStatus:FulfillmentStatus.UNFULFILLED});
const revenue = await Order.aggregate([
  {
    $match: {
      paymentStatus: PaymentStatus.PAID,
    },
  },
  {
    $group: {
      _id: null,
      Revenue: { $sum: "$total" },
    },
  },
]);
const Revenue = revenue[0]?.Revenue || 0;
    const result = await Promise.all([totalOrders,pendingOrders,deliveredOrders,revenue]);
const stats ={totalOrders,pendingOrders,deliveredOrders,Revenue}
const page = Math.max(parseInt(req.query.page) || 1, 1);
const limit = Math.max(parseInt(req.query.limit) || 10, 1);
const skip = (page - 1) * limit;

const orders = await Order.aggregate([
  { $sort: { createdAt: -1 } },

    { $skip: skip },
  { $limit: limit },
  {$lookup:{
    from:"users",
    localField:"user",
    foreignField:"_id",
    as:"userdetails"
  }},
  {
    $unwind: {
          path: "$userdetails",
      preserveNullAndEmptyArrays: true
         },
  },
  {
    $lookup:{
    from:"orderitems",
    localField:"_id",
    foreignField:"order",
    as:"orderitmesdetails"
  }
  },
   {
    $unwind: {
      path: "$orderitmesdetails",
      preserveNullAndEmptyArrays: true
    }
  },
  {$set:{
    orderNumber:"$orderNumber",
    name:"$userdetails.firstName",
    email:"$userdetails.email",
     items:{$sum:"$orderitmesdetails.quantity"},
    paymentStatus:"$paymentStatus",
    status:"$fulfillmentStatus",
    createdAt:"$createdAt",
    amount:"$orderitmesdetails.total"
  }},
  {
    $project:{
      orderNumber:1,
      name:1,
      email:1,
      amount:1,
      items:1,
      paymentStatus:1,
      status:1,
      createdAt:1,
      amount:1,
    }
  },
   
])

return res.status(200).json(
      new ApiResponse(
        200,
        {
          stats,
          orders
        },
        "adminProducts data fetched successfully"
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

export const adminEditProducts = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid product ID");
    }

    const {
      name,
      description,
      category,
      price,
      stock,
    } = req.body;

    const updateFields = {};

    // 2. Update name + slug
    if (name !== undefined && name !== null) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        throw new ApiError(400, "Product name cannot be empty");
      }

      updateFields.name = trimmedName;
      updateFields.slug = generateSlug(trimmedName);
    }

    // 3. Update description
    if (description !== undefined && description !== null) {
      updateFields.description = description.trim();
    }

    // 4. Update category
    if (category !== undefined && category !== null) {
      updateFields.category = category;
    }

    // 5. Update price
    if (price !== undefined && price !== null) {
      updateFields.price = price;
    }

    // 6. Update stock
    if (stock !== undefined && stock !== null) {
      updateFields.stock = stock;
    }

    // 7. Add new images to existing images
    let newImages = [];

    if (req.files?.length > 0) {
      newImages = req.files.map((file) => file.filename);
    }

    // 8. Check whether anything is being updated
    if (
      Object.keys(updateFields).length === 0 &&
      newImages.length === 0
    ) {
      throw new ApiError(400, "No fields provided for update");
    }

    // 9. Build MongoDB update operation
    const updateOperation = {};

    // Normal fields
    if (Object.keys(updateFields).length > 0) {
      updateOperation.$set = updateFields;
    }

    // Add images instead of replacing existing images
    if (newImages.length > 0) {
      updateOperation.$push = {
        images: {
          $each: newImages,
        },
      };
    }

    // 10. Update product
    const product = await Product.findByIdAndUpdate(
      id,
      updateOperation,
      {
        new: true,
        runValidators: true,
      }
    );

    // 11. Product not found
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // 12. Success response
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });

  } catch (error) {
    console.error("adminEditProducts error:", error);

    // Duplicate slug
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A product with this name already exists",
      });
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};


export const getProductById = async (req,res) =>{
  try {
    const {id} = req.params
    const product =  await Product.findById(id);
     if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {product},
        "adminProduct data fetched successfully"
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

export const adminUpdateOrderStatus = async (req,res) => {
  try {
   const { id } = req.params;
    const { fulfillmentStatus } = req.body;

    // Validate status
    if (!fulfillmentStatus) {
      throw new ApiError(400, "Fulfillment status is required");
    }

    // Find order
    const order = await Order.findById(id);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    const currentStatus = order.fulfillmentStatus;

    // Get allowed next statuses
    const allowedStatuses =
      fulfillmentTransitions[currentStatus];

    // Invalid current status
    if (!allowedStatuses) {
      throw new ApiError(
        400,
        `Invalid current fulfillment status: ${currentStatus}`
      );
    }

    // Check transition
    if (!allowedStatuses.includes(fulfillmentStatus)) {
      throw new ApiError(
        400,
        `Cannot change fulfillment status from ${currentStatus} to ${fulfillmentStatus}`
      );
    }

    // Update status
    order.fulfillmentStatus = fulfillmentStatus;

    await order.save();
if (order.fulfillmentStatus === "DELIVERED") {
  await approveReferrals(order._id);
} else if (
  ["RETURNED", "CANCELLED"].includes(order.fulfillmentStatus) ||
  order.status === "CANCELLED"
) {
  await rejectReferrals(order);
}
    return res.status(200).json({
      success: true,
      message: `Fulfillment status changed from ${currentStatus} to ${fulfillmentStatus}`,
      order,
    });

  } catch (error) {
    console.log("error", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}



export const getOrderById = async(req,res)=>{
    try {
      const {id} = req.params
        const order = await Order.findById(id);

    if (!order) {
      throw new ApiError(404, "User not found");
    } 

     return res.status(200).json(
      new ApiResponse(
        200,
        { order },
        "Product created successfully"
      )
    );
} catch (error) {
         console.log("Get products error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
    }
}

export const getAdminUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }

    const user = await User.findById(userId).select("firstName lastName email role status createdAt");
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments({ user: userId });
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const orderIds = orders.map((o) => o._id);
    const items = await OrderItem.find({ order: { $in: orderIds } })
      .populate("product", "name images price")
      .lean();

    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: items.filter((item) => String(item.order) === String(order._id)),
    }));

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user,
          orders: ordersWithItems,
          pagination: {
            totalOrders,
            page,
            limit,
            totalPages: Math.ceil(totalOrders / limit) || 1,
          },
        },
        "User orders fetched successfully"
      )
    );
  } catch (error) {
    console.error("getAdminUserOrders error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch user orders",
    });
  }
};

export const getAdminUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }

    const user = await User.findById(userId).select("firstName lastName email role status createdAt");
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const totalReviews = await Review.countDocuments({ user: userId });
    const reviews = await Review.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("product", "name images price slug")
      .lean();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user,
          reviews,
          pagination: {
            totalReviews,
            page,
            limit,
            totalPages: Math.ceil(totalReviews / limit) || 1,
          },
        },
        "User reviews fetched successfully"
      )
    );
  } catch (error) {
    console.error("getAdminUserReviews error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch user reviews",
    });
  }
};


// const PRODUCT_STATUSES = ["pending", "active", "rejected", "inactive"];

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /admin/products/by-status?status=pending&page=1&limit=5&search=
// status can also be "all"
export const getProductsByStatus = async (req, res) => {
  try {
    const status = req.query.status || "pending";

    if (status !== "all" && !PRODUCT_STATUSES.includes(status)) {
      throw new ApiError(400, `Status must be one of: all, ${PRODUCT_STATUSES.join(", ")}`);
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const query = status === "all" ? {} : { status };

    const search = req.query.search?.trim();
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      query.$or = [{ name: regex }, { sku: regex }];
    }

    const [
      totalProducts,
      pendingProducts,
      activeProducts,
      rejectedProducts,
      inactiveProducts,
      products,
      filteredTotal,
    ] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ status: "pending" }),
      Product.countDocuments({ status: "active" }),
      Product.countDocuments({ status: "rejected" }),
      Product.countDocuments({ status: "inactive" }),
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category", "name slug")
        .populate("vendor", "firstName lastName email")
        .lean(),
      Product.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          products,
          stats: {
            totalProducts,
            pendingProducts,
            activeProducts,
            rejectedProducts,
            inactiveProducts,
          },
          pagination: {
            totalProducts: filteredTotal,
            page,
            limit,
            totalPages: Math.ceil(filteredTotal / limit) || 1,
          },
        },
        "Products fetched successfully"
      )
    );
  } catch (error) {
    console.error("getProductsByStatus error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};


// key = new status, value = statuses it is allowed to change from
// const ALLOWED_TRANSITIONS = {
//   active: ["pending", "rejected", "inactive"], // approve / re-approve / re-activate
//   rejected: ["pending"],                       // reject
//   inactive: ["active"],                        // take down a live product
// };

// PATCH /admin/products/:id/status   body: { status, reason? }
export const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid product ID");
    }

    if (!ALLOWED_TRANSITIONS[status]) {
      throw new ApiError(400, "Status must be active, rejected or inactive");
    }

    const update = {
      status,
      reviewedAt: new Date(),
      reviewedBy: req.user._id,
    };

    if (status === "rejected") {
      const trimmedReason = reason?.trim();
      if (!trimmedReason || trimmedReason.length < 10) {
        throw new ApiError(400, "Rejection reason must be at least 10 characters");
      }
      update.rejectionReason = trimmedReason;
    }

    if (status === "active") {
      update.$unset = { rejectionReason: "" };
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, status: { $in: ALLOWED_TRANSITIONS[status] } },
      update,
      { new: true }
    );

    if (!product) {
      throw new ApiError(404, `Product not found or cannot be changed to ${status}`);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, product, `Product marked as ${status}`));
  } catch (error) {
    console.error("updateProductStatus error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update product status",
    });
  }
};



export const searchAdminUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 4, 1);
    const skip = (page - 1) * limit;

    const search = req.query.search?.trim() || "";
    const status = req.query.status?.trim().toLowerCase() || "";

    const filter = {};

    if (search) {
      const safeSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { firstName: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
        { phone: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    const filteredTotal = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          users,
          page,
          limit,
          filteredTotal,
          totalPages: Math.ceil(filteredTotal / limit),
        },
        "Customers searched successfully"
      )
    );

  } catch (error) {
    console.log("Search Admin Users Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

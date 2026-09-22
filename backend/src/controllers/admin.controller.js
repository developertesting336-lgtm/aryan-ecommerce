import { Order, OrderItem, Product, User } from "../models/index.js";
import { ApiError, ApiResponse } from "../utils/apiResponse.js";
import { OrderStatus,FulfillmentStatus,PaymentStatus,fulfillmentTransitions } from "../config/constants.js";
import { generateSlug } from "../utils/common.js";
import mongoose from "mongoose";

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
             stock:{
              $first : "$stock"
            },
            status:{
              $first : "$status"
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
import { Order, OrderItem, Product, User } from "../models/index.js";
import { ApiError, ApiResponse } from "../utils/apiResponse.js";
import { OrderStatus,FulfillmentStatus,PaymentStatus,fulfillmentTransitions } from "../config/constants.js";
import { generateSlug } from "../utils/common.js";
import mongoose from "mongoose";
export const vendorDashboard = async (req, res) => {
  try {
   const vendorId = new mongoose.Types.ObjectId(req.user._id);

    const totalProducts = await Product.countDocuments({
      vendor: vendorId,
    });

    const orders = await OrderItem.aggregate([
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
        $match: {
          "productdetails.vendor": vendorId,
        },
      },
    //   {$count:"productdetails"}
    ]);
// console.log("dashorder",orders)
    const revenueResult= await OrderItem.aggregate([
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
        $match: {
          "productdetails.vendor": vendorId,
        },
      },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total" },
          },
        },
      ])
    

    const totalSales = revenueResult[0]?.revenue || 0;
 const earnings= await OrderItem.aggregate([
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
        $match: {
          "productdetails.vendor": vendorId,
        },
      },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$vendorEarning" },
          },
        },
      ])
          const netEarnings = earnings[0]?.revenue || 0;

    const stats = {
      totalOrders: orders.length,
      totalProducts,
      totalSales,
      netEarnings
    };
      // ORDER SUMMARY
const getdeliveredOrders = await OrderItem.aggregate([
  {
    $lookup: {
      from: "products",
      localField: "product",
      foreignField: "_id",
      pipeline: [
        {
          $match: {
            vendor: vendorId,
          },
        },
      ],
      as: "productdetails",
    },
  },
  {
    $match: {
      productdetails: { $ne: [] },
    },
  },
  {
    $lookup: {
      from: "orders",
      localField: "order",
      foreignField: "_id",
      pipeline: [
        {
          $match: {
            fulfillmentStatus: FulfillmentStatus.DELIVERED,
          },
        },
      ],
      as: "orderdetails",
    },
  },
  {
    $match: {
      orderdetails: { $ne: [] },
    },
  },
  {
    $count: "count",
  },
]);

const getcancelledOrders = await OrderItem.aggregate([
  {
    $lookup: {
      from: "products",
      localField: "product",
      foreignField: "_id",
      pipeline: [
        {
          $match: {
            vendor: vendorId,
          },
        },
      ],
      as: "productdetails",
    },
  },
  {
    $match: {
      productdetails: { $ne: [] },
    },
  },
  {
    $lookup: {
      from: "orders",
      localField: "order",
      foreignField: "_id",
      pipeline: [
        {
          $match: {
            status: OrderStatus.CANCELLED,
          },
        },
      ],
      as: "orderdetails",
    },
  },
  {
    $match: {
      orderdetails: { $ne: [] },
    },
  },
  {
    $count: "count",
  },
]);

const getpendingOrders = await OrderItem.aggregate([
  {
    $lookup: {
      from: "products",
      localField: "product",
      foreignField: "_id",
      pipeline: [
        {
          $match: {
            vendor: vendorId,
          },
        },
      ],
      as: "productdetails",
    },
  },
  {
    $match: {
      productdetails: { $ne: [] },
    },
  },
  {
    $lookup: {
      from: "orders",
      localField: "order",
      foreignField: "_id",
      pipeline: [
        {
          $match: {
            fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
          },
        },
      ],
      as: "orderdetails",
    },
  },
  {
    $match: {
      orderdetails: { $ne: [] },
    },
  },
  {
    $count: "count",
  },
]);

const getshippedOrders = await OrderItem.aggregate([
  {
    $lookup: {
      from: "products",
      localField: "product",
      foreignField: "_id",
      pipeline: [
        {
          $match: {
            vendor: vendorId,
          },
        },
      ],
      as: "productdetails",
    },
  },
  {
    $match: {
      productdetails: { $ne: [] },
    },
  },
  {
    $lookup: {
      from: "orders",
      localField: "order",
      foreignField: "_id",
      pipeline: [
        {
          $match: {
            fulfillmentStatus: FulfillmentStatus.SHIPPED,
          },
        },
      ],
      as: "orderdetails",
    },
  },
  {
    $match: {
      orderdetails: { $ne: [] },
    },
  },
  {
    $count: "count",
  },
]);
const getprocessingOrders = await OrderItem.aggregate([
  {
    $lookup: {
      from: "products",
      localField: "product",
      foreignField: "_id",
      pipeline: [
        {
          $match: {
            vendor: vendorId,
          },
        },
      ],
      as: "productdetails",
    },
  },
  {
    $match: {
      productdetails: { $ne: [] },
    },
  },
  {
    $lookup: {
      from: "orders",
      localField: "order",
      foreignField: "_id",
      pipeline: [
        {
          $match: {
            fulfillmentStatus: FulfillmentStatus.PROCESSING,
          },
        },
      ],
      as: "orderdetails",
    },
  },
  {
    $match: {
      orderdetails: { $ne: [] },
    },
  },
  {
    $count: "count",
  },
]);

const deliveredOrders = getdeliveredOrders[0]?.count || 0;
const pendingOrders = getpendingOrders[0]?.count || 0;
const shippedOrders = getshippedOrders[0]?.count || 0;
const processingOrders = getprocessingOrders[0]?.count || 0;
const cancelledOrders = getcancelledOrders[0]?.count || 0;
  const getcancelled =Math.round(
      orders.length > 0 ? (cancelledOrders / orders.length) * 100 : 0);

    const getPending =Math.round(
      orders.length > 0 ? (pendingOrders / orders.length) * 100 : 0);

    const getProcessing =Math.round(
      orders.length > 0 ? (processingOrders / orders.length) * 100 : 0);

    const getShipping =Math.round(
      orders.length > 0 ? (shippedOrders / orders.length) * 100 : 0);

    const getDelivered =Math.round(
      orders.length > 0 ? (deliveredOrders / orders.length) * 100 : 0);

    const orderSummery = {
     cancelled: getcancelled,
      delivered:getDelivered,
     processing: getProcessing,
      pending:getPending,
      shipped:getShipping
    }

    //inventory stocks
    const inventoryAlerts = await Product.find({vendor:vendorId}).sort({stock:1}).select("name _id stock");

        //recent orders
     const recentOrders = await OrderItem.aggregate([
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
        $match: {
          "productdetails.vendor": vendorId,
        },
      },
      {$lookup:{
        from: "orders",
          localField: "order",
          foreignField: "_id",
          as: "orderdetails",
        pipeline:[
          {$lookup:{
            from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userdetails",
          }}
        ]
      }},
      {
        $unwind: "$orderdetails",
      },
      {
        $unwind: "$orderdetails.userdetails",
      },
    {$set:{
      orderNumber:"$orderdetails.orderNumber",
      productName:"$productdetails.name",
      user:"$orderdetails.userdetails.firstName",
      amount:"$total",
      status:"$orderdetails.fulfillmentStatus"
    }},
    {$project:{
      orderNumber:1,
      productName:1,
      user:1,
      amount:1,
      status:1,
    }}
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
    // find({
    //       fulfillmentStatus: FulfillmentStatus.DELIVERED,
    //       createdAt: {
    //         $gte: startDate,
    //         $lte: endDate,
    //       },
    //     }).select("total createdAt");
        const salesOverview = await OrderItem.aggregate([
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
        $match: {
          "productdetails.vendor": vendorId,
        },
      },
     {
  $lookup: {
    from: "orders",
    localField: "order",
    foreignField: "_id",
    as: "orderdetails",
    pipeline: [
      {
        $match: {
          fulfillmentStatus: FulfillmentStatus.DELIVERED,
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
    ],
  },
},
      {
        $unwind: "$orderdetails",
      },
      {$project:{
        total:"$orderdetails.total",
        createdAt:"$orderdetails.createdAt"
      }}
      ])
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          stats,orderSummery,inventoryAlerts,recentOrders,salesOverview
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

export const vendorProducts = async (req,res) => {
  try {
    const totalProducts = await Product.countDocuments({vendor:req.user._id});
    const activeProducts = await Product.countDocuments({vendor:req.user._id,status:"active"});
    const lowStockProducts = await Product.countDocuments({vendor:req.user._id,stock:{ $lt: 10 } });
    const outofStocksProducts = await Product.countDocuments({vendor:req.user._id,stock:0});
    const result = await Promise.all([totalProducts,activeProducts,lowStockProducts,outofStocksProducts]);
const stats ={totalProducts,activeProducts,lowStockProducts,outofStocksProducts}
const page = Math.max(parseInt(req.query.page) || 1, 1);
const limit = Math.max(parseInt(req.query.limit) || 10, 1);
const skip = (page - 1) * limit;
    const products = await Product.aggregate([
       { $skip: skip },
  { $limit: limit },
  {$match:{vendor:req.user._id}},
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
    ]);
       return res.status(200).json(
      new ApiResponse(
        200,
        {
          stats,
          products
        },
        "vendorProducts data fetched successfully"
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

export const vendorUsers = async (req,res) => {
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
        "vendorUsers data fetched successfully"
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


export const vendorOrders = async (req,res) => {
  try {

const totalOrders = await  OrderItem.countDocuments({
  vendor: req.user._id
});
const getdeliveredOrders = await OrderItem.aggregate([
  {$match:{vendor:req.user._id}},
  {$lookup:{
    from :"orders",
    localField:"order",
    foreignField:"_id",
    as:"orderdetails",
    pipeline:[
      {$match:{fulfillmentStatus:FulfillmentStatus.DELIVERED}}
    ]
  }},
  {$unwind:"$orderdetails"},
  {$count:"count"},
  {$project:{
     count:1
  }}
]);
const getpendingOrders = await OrderItem.aggregate([
  {$match:{vendor:req.user._id}},
  {$lookup:{
    from :"orders",
    localField:"order",
    foreignField:"_id",
    as:"orderdetails",
    pipeline:[
      {$match:{fulfillmentStatus:FulfillmentStatus.UNFULFILLED}}
    ]
  }},
  {$unwind:"$orderdetails"},
  {$count:"count"},
  {$project:{
     count:1
  }}
]);
const getRevenue = await OrderItem.aggregate([
  {$match:{vendor:req.user._id}},
  {$lookup:{
    from :"orders",
    localField:"order",
    foreignField:"_id",
    as:"orderdetails",
    pipeline:[
      {$match:{paymentStatus:PaymentStatus.PAID}}
    ]
  }},
  {$unwind:"$orderdetails"},
  { $group: {
      _id: null,
      Revenue: { $sum: "$total" },
    },},
  
]);
const deliveredOrders = getdeliveredOrders[0]?.count || 0;
const pendingOrders = getpendingOrders[0]?.count || 0;
const Revenue = getRevenue[0]?.Revenue || 0;


    const result = await Promise.all([totalOrders,pendingOrders,deliveredOrders,Revenue]);
const stats ={totalOrders,pendingOrders,deliveredOrders,Revenue}
const page = Math.max(parseInt(req.query.page) || 1, 1);
const limit = Math.max(parseInt(req.query.limit) || 10, 1);
const skip = (page - 1) * limit;

const orders = await Order.aggregate([
  { $sort: { createdAt: -1 } },

  // 1. Find order items belonging to this vendor
  {
    $lookup: {
      from: "orderitems",
      let: { orderId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$order", "$$orderId"] },
                { $eq: ["$vendor", req.user._id] }
              ]
            }
          }
        }
      ],
      as: "vendorItems"
    }
  },

  // 2. Remove orders where this vendor has no items
  {
    $match: {
      "vendorItems.0": { $exists: true }
    }
  },

  // 3. Get customer
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "userdetails"
    }
  },

  {
    $unwind: {
      path: "$userdetails",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $unwind: {
      path: "$vendorItems",
      preserveNullAndEmptyArrays: true
    }
  },

  // 4. Calculate vendor's item quantity
  {
    $set: {
      orderNumber: "$orderNumber",
      name: "$userdetails.firstName",
      email: "$userdetails.email",

      items: {
        $sum: "$vendorItems.quantity"
      },

      paymentStatus: "$paymentStatus",
      status: "$fulfillmentStatus",
      createdAt: "$createdAt",
      amount:"$vendorItems.total",
    }
  },

  // 5. Return only required fields
  {
    $project: {
      orderNumber: 1,
      name: 1,
      email: 1,
      amount: 1,
      items: 1,
      paymentStatus: 1,
      status: 1,
      createdAt: 1,
      amount:1,
    }
  },

  // 6. Pagination MUST come after filtering
  {
    $skip: skip
  },

  {
    $limit: limit
  }
]);


return res.status(200).json(
      new ApiResponse(
        200,
        {
          stats,
          orders
        },
        "vendorProducts data fetched successfully"
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

export const vendorEditProducts = async (req, res) => {
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
   const product = await Product.findOneAndUpdate(
  { _id: id, vendor: req.user._id },
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
    console.error("vendorEditProducts error:", error);

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
    const product =  await Product.findOne({_id:id,vendor:req.user._id});
     if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {product},
        "vendorProduct data fetched successfully"
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

export const vendorUpdateOrderStatus = async (req,res) => {
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
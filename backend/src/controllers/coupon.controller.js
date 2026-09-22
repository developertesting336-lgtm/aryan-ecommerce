import { Order, OrderItem, Product, User, Coupon,CouponUsage } from "../models/index.js";
import { ApiError, ApiResponse } from "../utils/apiResponse.js";
import {generateCouponCode} from "../utils/common.js"
import {COUPON_MESSAGES} from "../config/constants.js";

export function calculateDiscount({
  coupon,
  eligibleAmount,
}) {
  if (coupon.discountType === "fixed") {
    return Math.min(
      coupon.discountValue,
      eligibleAmount
    );
  }

  let discount =
    (eligibleAmount * coupon.discountValue) / 100;

  if (coupon.maxDiscountAmount !== null) {
    discount = Math.min(
      discount,
      coupon.maxDiscountAmount
    );
  }

  return Math.min(discount, eligibleAmount);
}

export async function validateCoupon({
  coupon,
  user,
  cart,
}) {
  // 1. Active?
  // 2. Deleted?
  // 3. Started?
  // 4. Expired?
  // 5. Global usage limit?
  // 6. User eligible?
  // 7. User usage limit?
  // 8. Minimum order?
  // 9. Product eligibility?
  // 10. Calculate discount?
console.log("cart price",cart)
const now = new Date();
const startDate = new Date(coupon.startDate);
const endDate = new Date(coupon.endDate);

if(!coupon.isActive){
   throw new ApiError(400,COUPON_MESSAGES.INACTIVE);
}

if(coupon.deletedAt!==null){
   throw new ApiError(400,COUPON_MESSAGES.DELETED);
}

if(now < startDate){
  throw new ApiError(400,COUPON_MESSAGES.NOT_STARTED);
}

if(now>endDate){
  throw new ApiError(400,COUPON_MESSAGES.EXPIRED);
}

if(coupon.totalUsageLimit !== null && coupon.usedCount>=coupon.totalUsageLimit){
  throw new ApiError(400,COUPON_MESSAGES.GLOBAL_LIMIT_REACHED);
}

if(cart.price<coupon.minOrderAmount){
  throw new ApiError(400,COUPON_MESSAGES.MINIMUM_ORDER_NOT_MET);
}

 const userUsageCount = await CouponUsage.countDocuments({
    coupon: coupon._id,
    user: user._id,
  });
// console.log("couponlimit",userUsageCount)
  if ( coupon.usageLimitPerUser !== null && userUsageCount >= coupon.usageLimitPerUser) {
    throw new ApiError(400,COUPON_MESSAGES.USER_LIMIT_REACHED);
  }
}

export const createCoupon = async(req,res)=>{
  try {
   const {
  name,
  description,
  discountType,
  discountValue,
  maxDiscountAmount,
  minOrderAmount,
  currency,
  startsAt,
  expiresAt,
  isActive,
  totalUsageLimit,
  usedCount,
  usageLimitPerUser,
  eligibility,
  eligibleUsers,
  applicability,
  products,
  categories,
  excludedProducts,
  excludedCategories,
  deletedAt
} = req.body;

const couponType = req.user.role==="admin"? "PLATFORM" : "VENDOR";
const vendor = req.user.role==="admin"?  null : req.user._id;
const couponData = {
  name,
  description,
  discountType,
  discountValue,
  maxDiscountAmount,
  minOrderAmount,
  currency,
  startsAt,
  expiresAt,
  isActive,
  totalUsageLimit,
  usedCount,
  usageLimitPerUser,
  eligibility,
  eligibleUsers,
  applicability,
  products,
  categories,
  excludedProducts,
  excludedCategories,
  deletedAt,
  code: generateCouponCode(),
  createdBy: req.user._id,
couponType,
vendor
};

    const coupon = await Coupon.create(couponData);
       return res.status(200).json(
          new ApiResponse(
            200,
            {
              coupon
            },
            "coupon created successfully"
          )
        );
  } catch (error) {
     console.log("error",error)
   return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}

export const getCoupons = async(req,res)=>{
  try {
    const coupons =await Coupon.find({createdBy:req.user._id});
 return res.status(200).json(
          new ApiResponse(
            200,
            {
              coupons
            },
            "coupons fetched successfully"
          )
        );
  } catch (error) {
    console.log("error",error)
   return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}


export const getCouponById = async(req,res)=>{
  try {
    const {id} = req.params;
    const coupon =await Coupon.findById(id);
    if (!coupon) {
            throw new ApiError(409, "Coupon does not exist");
        }
 return res.status(200).json(
          new ApiResponse(
            200,
            {
              coupon
            },
            "coupon fetched successfully"
          )
        );
  } catch (error) {
    console.log("error",error)
   return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}


export const deleteCoupon = async(req,res)=>{
  try {
   const {id} = req.params;
    const coupon = await Coupon.findByIdAndUpdate(id,
      {isActive:false}, {
        new: true,
        runValidators: true,
      }
    );
       return res.status(200).json(
          new ApiResponse(
            200,
            {
              coupon
            },
            "coupon deleted successfully"
          )
        );
  } catch (error) {
     console.log("error",error)
   return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}



export const updateCoupon = async(req,res)=>{
  try {
    const {id}= req.params;
  const {
  name,
  description,
  discountType,
  discountValue,
  maxDiscountAmount,
  minOrderAmount,
  currency,
  startsAt,
  expiresAt,
  isActive,
  totalUsageLimit,
  usedCount,
  usageLimitPerUser,
  eligibility,
  eligibleUsers,
  applicability,
  products,
  categories,
  excludedProducts,
  excludedCategories,
  deletedAt
} = req.body;

const couponData = {
  name,
  description,
  discountType,
  discountValue,
  maxDiscountAmount,
  minOrderAmount,
  currency,
  startsAt,
  expiresAt,
  isActive,
  totalUsageLimit,
  usedCount,
  usageLimitPerUser,
  eligibility,
  eligibleUsers,
  applicability,
  products,
  categories,
  excludedProducts,
  excludedCategories,
  deletedAt,
  code: generateCouponCode(),
  createdBy: req.user._id
};
    const coupon = await Coupon.findByIdAndUpdate(id,couponData,
      {
        new: true,
        runValidators: true,
      }
    );
       return res.status(200).json(
          new ApiResponse(
            200,
            {
              coupon
            },
            "coupon updated successfully"
          )
        );
  } catch (error) {
     console.log("error",error)
   return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}

//coupon usage

export const couponUsage= async(couponId,order)=>{
  try {
    console.log("body",{couponId,order})
    const coupon = await Coupon.findById(couponId);
    console.log("coupusae",coupon)
    const data= {
      coupon:coupon?._id,
      user:order?.user,
      order:order?._id,
      couponCode:coupon?.code,
      discountAmount:coupon?.discountValue,
      orderAmount:order?.total,
      vendor:coupon?.createdBy
    }
    console.log("dta",data)
    const couponUsage = await CouponUsage.create(data);
    coupon.usedCount=+1;
    await coupon.save();
     return couponUsage
           
  } catch (error) {
     console.log("error",error)
   
  }
}



// export const calculateDiscountForOrder = async (
//   user,
//   code,
//   itemsToOrder
// ) => {
//   const coupon = await Coupon.findOne({
//     code: code?.trim().toUpperCase(),
//   });

//   if (!coupon) {
//     throw new ApiError(409, "Coupon does not exist");
//   }

//   // Total cart/order amount
//   const cartSubtotal = itemsToOrder.reduce(
//     (total, item) =>
//       total +
//       Number(item.product.price) * Number(item.quantity),
//     0
//   );

//   // Products belonging to coupon vendor
//   const eligibleItems = itemsToOrder.filter(
//     (item) =>
//       item.product.vendor?.toString() ===
//       coupon.createdBy?.toString()
//   );

//   if (eligibleItems.length === 0) {
//     throw new ApiError(
//       400,
//       "Coupon is not applicable to any product in this order"
//     );
//   }

//   // Amount eligible for discount
//   const eligibleAmount = eligibleItems.reduce(
//     (total, item) =>
//       total +
//       Number(item.product.price) * Number(item.quantity),
//     0
//   );

//   await validateCoupon({
//     coupon,
//     user,
//     cart: {
//       price: cartSubtotal,
//       products: eligibleItems.map(
//         (item) => item.product
//       ),
//     },
//   });

//   const discount = calculateDiscount({
//     coupon,
//     eligibleAmount,
//   });

//   const discountAmount = Math.min(
//     Number(discount || 0),
//     eligibleAmount
//   );

//   return {
//     coupon: coupon._id,
//     couponCode: coupon.code,
//     discountAmount,
//     totalAmount: cartSubtotal - discountAmount,
//     discountType: coupon.discountType,
//     discountValue: coupon.discountValue,
//     maxDiscountAmount: coupon.maxDiscountAmount,
//   };
// };


export const calculateDiscountForOrder = async (
  user,
  code,
  itemsToOrder
) => {
  if (!code?.trim()) {
    return {
      coupon: null,
      couponCode: "",
      discountAmount: 0,
      eligibleAmount: 0,
      eligibleItems: [],
      totalAmount: 0,
    };
  }

  // -----------------------------------------
  // Find coupon
  // -----------------------------------------

  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
  });

  if (!coupon) {
    throw new ApiError(
      409,
      "Coupon does not exist"
    );
  }

  // -----------------------------------------
  // Calculate complete cart/order subtotal
  // -----------------------------------------

  const cartSubtotal = itemsToOrder.reduce(
    (total, item) =>
      total +
      Number(item.product.price) *
        Number(item.quantity),
    0
  );

  // -----------------------------------------
  // Find products eligible for coupon
  // -----------------------------------------

  const eligibleItems = itemsToOrder.filter(
    (item) =>
      item.product.vendor?.toString() ===
      coupon.createdBy?.toString()
  );

  if (eligibleItems.length === 0) {
    throw new ApiError(
      400,
      "Coupon is not applicable to any product in this order"
    );
  }

  // -----------------------------------------
  // Calculate coupon eligible amount
  // -----------------------------------------

  const eligibleAmount = eligibleItems.reduce(
    (total, item) =>
      total +
      Number(item.product.price) *
        Number(item.quantity),
    0
  );

  console.log({
    cartSubtotal,
    eligibleAmount,
    couponVendor: coupon.createdBy,
    eligibleProducts: eligibleItems.map(
      (item) => item.product._id
    ),
  });

  // -----------------------------------------
  // Validate coupon
  // -----------------------------------------

  await validateCoupon({
    coupon,
    user,
    cart: {
      price: cartSubtotal,
      products: eligibleItems.map(
        (item) => item.product
      ),
    },
  });

  // -----------------------------------------
  // Calculate discount
  // -----------------------------------------

  const calculatedDiscount =
    calculateDiscount({
      coupon,
      eligibleAmount,
    });

  const discountAmount = Math.min(
    Number(calculatedDiscount || 0),
    eligibleAmount
  );

  // -----------------------------------------
  // Return everything createOrder needs
  // -----------------------------------------

  return {
    coupon: coupon._id,
    couponCode: coupon.code,
    discountAmount,
    eligibleAmount,
    eligibleItems,
    totalAmount:
      cartSubtotal - discountAmount,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxDiscountAmount:
      coupon.maxDiscountAmount,
  };
};


export const applyCoupon = async (req, res) => {
  try {
    const { code,  productIds } = req.body;
console.log(" code,  productIds", code,  productIds)
    if (!code) {
      throw new ApiError(400, "Coupon code is required");
    }

    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new ApiError(400, "At least one product is required");
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
    });
console.log("coupon appl",coupon)
    if (!coupon) {
      throw new ApiError(404, "Coupon does not exist");
    }

    console.log("code:", code);
    console.log("productIds:", productIds);

    // Get all selected products
   
const products = await Product.find({
  _id: { $in: productIds },
  vendor: coupon.createdBy,
}).select("-description");

console.log("products from apply",products)
    if (!products.length) {
      throw new ApiError(404, "Coupon is not applicable to one or more selected products");
    }


    // Calculate cart/selected products amount
    const eligibleAmount = products.reduce(
      (total, product) => total + product.price,
      0
    );

    // Validate coupon
    await validateCoupon({
      coupon,
      user: req.user,
      cart: {
        price: eligibleAmount,
        products,
        // discountTotal:getvendorProducts(products,coupon)
      },
    });

    // Calculate discount
    const discount = calculateDiscount({
      coupon,
      eligibleAmount,
    });

    const totalAmount = eligibleAmount - discount;

    const result = {
      couponCode: coupon.code,
      name: coupon.name,
      productPrice: eligibleAmount,
      discountAmount: discount,
      totalAmount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount,
    };

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          result,
        },
        "Coupon discount calculated successfully"
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
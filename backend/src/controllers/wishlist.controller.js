import { Product, User ,Wishlist} from "../models/index.js"
import { ApiError,ApiResponse } from "../utils/apiResponse.js";

export const addProducts =async(req,res)=>{
    try {
            console.log("addproducts/wish API hit");
            const {productId} = req.params;
        const user = await User.findOne({_id:req.user._id});
        
     if (!user) {
  throw new ApiError(409,  "User not found");
}
// const product = await Product.findOne({})
let wishlist = await Wishlist.findOne({user:req.user._id});

if (!wishlist) {
  wishlist = new Wishlist({
    user: user._id,
    products: [],
  });
}
// console.log("wihs",wishlist)
const existingItem = wishlist.products.find(
  item => item.toString() === productId
);
// console.log("existingItem",existingItem)

if (!existingItem) {
  wishlist.products.push(productId);
  await wishlist.save();
await wishlist.populate('products')

     return res.status(200).json(
new ApiResponse(201,{wishlist},  "Product added to wishlist"));
}
return res.status(400).json({
  success: false,
  message: "Product already exists in wishlist"
});


    } catch (error) {
        console.log("error",error)
   return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
    }
}


export const getProducts =async(req,res)=>{
    try {
            console.log("get/wish API hit");
        const user = await User.findOne({_id:req.user._id});
        
     if (!user) {
  throw new ApiError(409,  "User not found");
}
const wishlist = await Wishlist.findOne({user:req.user._id})  .populate("products");

// const product = await Product.findOne({})

        return res.status(200).json(
new ApiResponse(201,{wishlist}, "list fetched  successfully"));
    } catch (error) {
        console.log("error",error)
   return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
    }
}

export const deleteProducts =async(req,res)=>{
    try {
            console.log("deleteproducts/wish API hit");
            const {productId} = req.params;
        const user = await User.findOne({_id:req.user._id});
        
     if (!user) {
  throw new ApiError(409,  "User not found");
}
// const product = await Product.findOne({})
let wishlist = await Wishlist.findOne({user:req.user._id});

if (!wishlist) {
  wishlist = new Wishlist({
    user: user._id,
    products: [],
  });
}
// console.log("wihs",wishlist)
const existingItem = wishlist.products.find(
  item => item.toString() === productId
);
// console.log("existingItem",existingItem)

if (existingItem) {
  wishlist.products.pull(productId);
  await wishlist.save();
await wishlist.populate('products')
     return res.status(200).json(
new ApiResponse(201,{wishlist},  "Product removed from  wishlist"));
}
return res.status(400).json({
  success: false,
  message: "Product already exists in wishlist"
})
  } catch (error) {
        console.log("error",error)
   return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
    }
}


import { ProductRelation } from "../models/ProductRelation.model.js";
import { ApiError,ApiResponse } from "../utils/apiResponse.js";


export const getProducts = async (req, res) => {
  try {
const {product} = req.params
const products= await ProductRelation.find({product:product}).populate("relatedProduct","-description").populate("product","-description");
// const products= await ProductRelation.find({  $or: [
//     { product: product },
//     { relatedProduct: product }
//   ]}).populate("relatedProduct","-description").populate("product","-description");

    return res.status(200).json(
      new ApiResponse(
        200,
        { products },
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
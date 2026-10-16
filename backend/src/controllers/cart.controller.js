import { Cart } from "../models/cart.model.js";
import { Product, User } from "../models/index.js";
import { ApiError, ApiResponse } from "../utils/apiResponse.js";

export const addProducts = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const requestedQuantity = Number(quantity) || 1;
    if (requestedQuantity < 1) {
      throw new ApiError(400, "Quantity must be at least 1");
    }

    // product + cart fetched in parallel (1 round trip instead of 2)
    const [product, existingCart] = await Promise.all([
      Product.findById(productId).select("vendor price").lean(),
      Cart.findOne({ user: req.user._id }),
    ]);

    if (!product) throw new ApiError(404, "product not found");

    // req.user is already loaded by the auth middleware, so no User.findOne
    const cart = existingCart || new Cart({ user: req.user._id, items: [] });

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (existingItem) {
      existingItem.quantity += requestedQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity: requestedQuantity,
        price: product.price, // from DB, not from the client
        vendor: product.vendor,
      });
    }

    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    await cart.save();
    await cart.populate({ path: "items.product", select: "name price images" });

    return res
      .status(200)
      .json(new ApiResponse(200, { cart }, "product added successfully"));
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCart = async (req, res) => {
  try {
    console.log("get/cart API hit");
    const user = await User.findOne({ _id: req.user._id });

    if (!user) {
      throw new ApiError(409, "User not found");
    }
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );

    // const product = await Product.findOne({})

    return res
      .status(200)
      .json(new ApiResponse(201, { cart }, "image uploaded successfully"));
  } catch (error) {
    console.log("error", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const decreaseQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    // console.log("decrease");
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId.toString(),
    );

    if (!item) {
      return res.status(404).json({
        message: "Product not found in cart",
      });
    }

    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      cart.items.pull(item._id);
    }
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    await cart.save();
    await cart.populate("items.product");

    return res
      .status(200)
      .json(new ApiResponse(201, { cart }, "Cart updated successfully"));
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

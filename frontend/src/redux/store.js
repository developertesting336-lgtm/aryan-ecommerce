import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import categoryReducer from "./slices/categorySlice";
import orderReducer from "./slices/orderSlice";
import paymentReducer from "./slices/paymentSlice";
import addressReducer from "./slices/addressSlice";
import adminReducer from "./slices/adminSlice";
import vendorReducer from "./slices/vendorSlice";
import couponReducer from "./slices/couponSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer, // ✅ FIX
    category: categoryReducer,
    order:orderReducer,
    payment: paymentReducer,
    address: addressReducer,
    admin: adminReducer,
    vendor: vendorReducer,
    coupon: couponReducer,
  }
}); 
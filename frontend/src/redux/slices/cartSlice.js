import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addProductApi,getCartApi,decreaseQuantityApi
} from "../../api/cartApi";


// Register User
export const addProduct = createAsyncThunk(
  "cart/addProduct",
  async (cartData, { rejectWithValue }) => {
    try {
        console.log("createcart")
      const response = await addProductApi(cartData);
      console.log("cartdata",response.data)
      // return response.data.cart;
             return {
        cart: response.data.cart,
        message: response.message,
      };

    } catch (error) {
      return rejectWithValue(
        error.response.data?.message
      );
    }
  }
);


export const getCart = createAsyncThunk(
   "cart/getcart",
  async (_, { rejectWithValue }) => {
    try {
      console.log("getcart")
      const response = await getCartApi();
console.log("carta",response?.data?.cart)


      return response.data.cart;

    } catch (error) {
      return rejectWithValue(
      error.response?.data?.message || "Login failed"
      );
    }
  }
);

export const decreaseQuantity = createAsyncThunk(
  "cart/decreaseQuantity",

  async (productId, { rejectWithValue }) => {
    try {
      console.log("decreaseQuantityApi");

      const response = await decreaseQuantityApi(productId);

      console.log("quantity response:", response);

      return {
        cart: response.data.cart,
        message: response.message,
      };

    } catch (error) {
      console.error("API decrease error:", error);

      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to decrease quantity"
      );
    }
  }
);





const cartSlice = createSlice({

name: "cart",

initialState: {
  cart: {
    items: [],
    totalPrice: 0,
  },
  loading: false,
  error: null,
},

  reducers: {

  },


  extraReducers: (builder)=>{


    builder

    // Register
    .addCase(addProduct.pending,(state)=>{
      state.loading=true;
    })

    .addCase(addProduct.fulfilled,(state,action)=>{
      state.loading=false;
      state.cart=action.payload.cart;
    })

    .addCase(addProduct.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload;
    })

    .addCase(getCart.pending,(state)=>{
      state.loading=true;
    })

    .addCase(getCart.fulfilled,(state,action)=>{
      state.loading=false;
      state.cart=action.payload;
    //   state.items=action.payload.cart
    // state.cart.items.push(action.payload.items)
    // state.cart.items=action.payload.items
    })

    .addCase(getCart.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload;
    })
    .addCase(decreaseQuantity.pending,(state)=>{
      state.loading=true;
    })

    .addCase(decreaseQuantity.fulfilled,(state,action)=>{
      state.loading=false;
      state.cart=action.payload.cart;
    })

    .addCase(decreaseQuantity.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload;
    })

  }

});


// export const {
//   logout,
//   clearError
// } = authSlice.actions;


export default cartSlice.reducer;
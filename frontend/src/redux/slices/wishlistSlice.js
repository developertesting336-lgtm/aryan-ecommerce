import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  addProductApi,
  getWishlistIdApi,
  deleteProductsApi
} from "../../api/wishlist";


export const addProductInWish = createAsyncThunk(
  "wishlist/addProductInWish",

  async (productId, { rejectWithValue }) => {
    try {
      console.log("addwish");

      const response = await addProductApi(productId);

      console.log("wishlist response:", response);

      // return response.data;
       return {
        wishlist: response.data.wishlist,
        message: response.message,
      };

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Failed to add product to wishlist"
      );
    }
  }
);


export const getWishlist = createAsyncThunk(
  "wishlist/getWishlist",

  async (_, { rejectWithValue }) => {
    try {
      console.log("getWishlist");

      const response = await getWishlistIdApi();

      console.log("wishlist:", response);

      return response.data.wishlist;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Failed to get wishlist"
      );
    }
  }
);


export const deleteProducts = createAsyncThunk(
  "wishlist/deleteProducts",

  async (productId, { rejectWithValue }) => {
    try {
      console.log("delete:", productId);

      const response = await deleteProductsApi(productId);

      console.log("delete response:", response);

      // return response.data.wishlist;
       return {
        wishlist: response.data.wishlist,
        message: response.message,
      };

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Failed to delete product"
      );
    }
  }
);


const wishListSlice = createSlice({
  name: "wishlist",

  initialState: {
    wishlist: {
      products: []
    },

    loading: false,
    error: null
  },

  reducers: {},

  extraReducers: (builder) => {

    // ADD TO WISHLIST
    builder
      .addCase(addProductInWish.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(addProductInWish.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload.wishlist;
      })

      .addCase(addProductInWish.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


    // GET WISHLIST
    builder
      .addCase(getWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
      })

      .addCase(getWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


    // DELETE FROM WISHLIST
    builder
      .addCase(deleteProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload.wishlist;
      })

      .addCase(deleteProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

  }
});


export default wishListSlice.reducer;
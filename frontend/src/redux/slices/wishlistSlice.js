import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  addProductApi,
  getWishlistIdApi,
  deleteProductsApi,
} from "../../api/wishlist";

/* ======================= THUNKS ======================= */

export const addProductInWish = createAsyncThunk(
  "wishlist/addProductInWish",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await addProductApi(productId);
      return {
        wishlist: response.data.wishlist,
        message: response.data?.message || response.message,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to add product to wishlist"
      );
    }
  }
);

export const getWishlist = createAsyncThunk(
  "wishlist/getWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getWishlistIdApi();
      return response.data.wishlist;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to get wishlist"
      );
    }
  }
);

export const deleteProducts = createAsyncThunk(
  "wishlist/deleteProducts",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await deleteProductsApi(productId);
      return {
        wishlist: response.data.wishlist,
        message: response.data?.message || response.message,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete product"
      );
    }
  }
);

/* ======================= HELPERS ======================= */

const getItemId = (item) => {
  const id =
    item?._id ||
    item?.productId?._id ||
    item?.productId ||
    item?.product?._id;
  return id ? String(id) : "";
};

const ensureWishlist = (state) => {
  if (!state.wishlist || typeof state.wishlist !== "object") {
    state.wishlist = { products: [] };
  }
  if (!Array.isArray(state.wishlist.products)) {
    state.wishlist.products = [];
  }
};

/* ======================= SLICE ======================= */

const wishListSlice = createSlice({
  name: "wishlist",

  initialState: {
    wishlist: { products: [] },

    // `loading` and `error` belong to getWishlist ONLY.
    // Add/remove are optimistic, so they never show a loader or an error screen.
    loading: false,
    error: null,

    // Number of add/remove requests still in flight.
    // Server snapshots are ignored until this is back to 0.
    pendingMutations: 0,
  },

  reducers: {
    optimisticAddWishlist: (state, action) => {
      // Always count it: the matching thunk is always dispatched.
      state.pendingMutations += 1;

      ensureWishlist(state);
      const productId = String(action.payload);

      const exists = state.wishlist.products.some(
        (item) => getItemId(item) === productId
      );

      if (!exists) {
        state.wishlist.products.push({ _id: productId });
      }
    },

    optimisticRemoveWishlist: (state, action) => {
      state.pendingMutations += 1;

      ensureWishlist(state);
      const productId = String(action.payload);

      state.wishlist.products = state.wishlist.products.filter(
        (item) => getItemId(item) !== productId
      );
    },
  },

  extraReducers: (builder) => {
    /* ---------- ADD ---------- */
    builder
      .addCase(addProductInWish.fulfilled, (state, action) => {
        state.pendingMutations = Math.max(0, state.pendingMutations - 1);
        // Only the LAST response replaces the wishlist
        if (state.pendingMutations === 0 && action.payload?.wishlist) {
          state.wishlist = action.payload.wishlist;
        }
      })
      .addCase(addProductInWish.rejected, (state) => {
        state.pendingMutations = Math.max(0, state.pendingMutations - 1);
      });

    /* ---------- DELETE ---------- */
    builder
      .addCase(deleteProducts.fulfilled, (state, action) => {
        state.pendingMutations = Math.max(0, state.pendingMutations - 1);
        if (state.pendingMutations === 0 && action.payload?.wishlist) {
          state.wishlist = action.payload.wishlist;
        }
      })
      .addCase(deleteProducts.rejected, (state) => {
        state.pendingMutations = Math.max(0, state.pendingMutations - 1);
      });

    /* ---------- GET ---------- */
    builder
      .addCase(getWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.loading = false;
        // Don't overwrite the UI while toggles are still in flight
        if (state.pendingMutations === 0) {
          state.wishlist = action.payload || { products: [] };
        }
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { optimisticAddWishlist, optimisticRemoveWishlist } =
  wishListSlice.actions;

export default wishListSlice.reducer;
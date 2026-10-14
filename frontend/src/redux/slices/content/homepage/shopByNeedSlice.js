import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getShopByNeedItemsApi,
  getShopByNeedItemByIdApi,
  createShopByNeedItemApi,
  updateShopByNeedItemApi,
  deleteShopByNeedItemApi,
  toggleShopByNeedItemStatusApi,
} from "../../../../api/content/homepage/shopByNeedApi";

// =====================================================
// GET ALL SHOP BY NEED ITEMS
// =====================================================

export const getShopByNeedItems = createAsyncThunk(
  "shopByNeed/getShopByNeedItems",

  async (_, { rejectWithValue }) => {
    try {
      const response =
        await getShopByNeedItemsApi();

      console.log(
        "Shop by need response:",
        response
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to get shop by need items."
      );
    }
  }
);

// =====================================================
// GET SHOP BY NEED ITEM BY ID
// =====================================================

export const getShopByNeedItemById =
  createAsyncThunk(
    "shopByNeed/getShopByNeedItemById",

    async (id, { rejectWithValue }) => {
      try {
        const response =
          await getShopByNeedItemByIdApi(id);

        return response.data;
      } catch (error) {
        return rejectWithValue(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Failed to get shop by need item."
        );
      }
    }
  );

// =====================================================
// CREATE SHOP BY NEED ITEM
// =====================================================

export const createShopByNeedItem =
  createAsyncThunk(
    "shopByNeed/createShopByNeedItem",

    async (data, { rejectWithValue }) => {
      try {
        const response =
          await createShopByNeedItemApi(data);

        return response.data;
      } catch (error) {
        return rejectWithValue(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Failed to create shop by need item."
        );
      }
    }
  );

// =====================================================
// UPDATE SHOP BY NEED ITEM
// =====================================================

export const updateShopByNeedItem =
  createAsyncThunk(
    "shopByNeed/updateShopByNeedItem",

    async ({ id, data }, { rejectWithValue }) => {
      try {
        const response =
          await updateShopByNeedItemApi(id, data);

        return response.data;
      } catch (error) {
        return rejectWithValue(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Failed to update shop by need item."
        );
      }
    }
  );

// =====================================================
// DELETE SHOP BY NEED ITEM
// =====================================================

export const deleteShopByNeedItem =
  createAsyncThunk(
    "shopByNeed/deleteShopByNeedItem",

    async (id, { rejectWithValue }) => {
      try {
        const response =
          await deleteShopByNeedItemApi(id);

        return {
          id,
          ...response.data,
        };
      } catch (error) {
        return rejectWithValue(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Failed to delete shop by need item."
        );
      }
    }
  );

// =====================================================
// TOGGLE SHOP BY NEED STATUS
// =====================================================

export const toggleShopByNeedItemStatus =
  createAsyncThunk(
    "shopByNeed/toggleShopByNeedItemStatus",

    async (id, { rejectWithValue }) => {
      try {
        const response =
          await toggleShopByNeedItemStatusApi(id);

        return response.data;
      } catch (error) {
        return rejectWithValue(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Failed to update shop by need status."
        );
      }
    }
  );

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  shopByNeedItems: [],
  selectedShopByNeedItem: null,

  loading: false,
  error: null,

  createLoading: false,
  createError: null,
  createSuccess: false,

  updateLoading: false,
  updateError: null,
  updateSuccess: false,

  deleteLoading: false,
  deleteError: null,
};

// =====================================================
// SLICE
// =====================================================

const shopByNeedSlice = createSlice({
  name: "shopByNeed",

  initialState,

  reducers: {
    clearShopByNeedError: (state) => {
      state.error = null;
    },

    clearShopByNeedStatus: (state) => {
      state.createError = null;
      state.createSuccess = false;

      state.updateError = null;
      state.updateSuccess = false;

      state.deleteError = null;
    },

    clearSelectedShopByNeedItem: (state) => {
      state.selectedShopByNeedItem = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =================================================
      // GET ALL
      // =================================================

      .addCase(
        getShopByNeedItems.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getShopByNeedItems.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.shopByNeedItems =
            action.payload?.shopByNeedItems ||
            action.payload?.items ||
            action.payload ||
            [];
        }
      )

      .addCase(
        getShopByNeedItems.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to get shop by need items.";
        }
      )

      // =================================================
      // GET BY ID
      // =================================================

      .addCase(
        getShopByNeedItemById.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getShopByNeedItemById.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.selectedShopByNeedItem =
            action.payload?.shopByNeedItem ||
            action.payload;
        }
      )

      .addCase(
        getShopByNeedItemById.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      // =================================================
      // CREATE
      // =================================================

      .addCase(
        createShopByNeedItem.pending,
        (state) => {
          state.createLoading = true;
          state.createError = null;
          state.createSuccess = false;
        }
      )

      .addCase(
        createShopByNeedItem.fulfilled,
        (state, action) => {
          state.createLoading = false;
          state.createError = null;
          state.createSuccess = true;

          const created =
            action.payload?.shopByNeedItem ||
            action.payload;

          if (
            created &&
            typeof created === "object" &&
            created._id
          ) {
            state.shopByNeedItems.unshift(created);
          }
        }
      )

      .addCase(
        createShopByNeedItem.rejected,
        (state, action) => {
          state.createLoading = false;
          state.createError =
            action.payload ||
            "Failed to create shop by need item.";
          state.createSuccess = false;
        }
      )

      // =================================================
      // UPDATE
      // =================================================

      .addCase(
        updateShopByNeedItem.pending,
        (state) => {
          state.updateLoading = true;
          state.updateError = null;
          state.updateSuccess = false;
        }
      )

      .addCase(
        updateShopByNeedItem.fulfilled,
        (state, action) => {
          state.updateLoading = false;
          state.updateError = null;
          state.updateSuccess = true;

          const updated =
            action.payload?.shopByNeedItem ||
            action.payload;

          if (
            updated &&
            typeof updated === "object" &&
            updated._id
          ) {
            const index =
              state.shopByNeedItems.findIndex(
                (item) =>
                  item._id === updated._id
              );

            if (index !== -1) {
              state.shopByNeedItems[index] =
                updated;
            }
          }
        }
      )

      .addCase(
        updateShopByNeedItem.rejected,
        (state, action) => {
          state.updateLoading = false;
          state.updateError =
            action.payload ||
            "Failed to update shop by need item.";
        }
      )

      // =================================================
      // DELETE
      // =================================================

      .addCase(
        deleteShopByNeedItem.pending,
        (state) => {
          state.deleteLoading = true;
          state.deleteError = null;
        }
      )

      .addCase(
        deleteShopByNeedItem.fulfilled,
        (state, action) => {
          state.deleteLoading = false;
          state.deleteError = null;

          state.shopByNeedItems =
            state.shopByNeedItems.filter(
              (item) =>
                item._id !== action.payload.id
            );
        }
      )

      .addCase(
        deleteShopByNeedItem.rejected,
        (state, action) => {
          state.deleteLoading = false;
          state.deleteError =
            action.payload ||
            "Failed to delete shop by need item.";
        }
      )

      // =================================================
      // TOGGLE STATUS
      // =================================================

      .addCase(
        toggleShopByNeedItemStatus.fulfilled,
        (state, action) => {
          const updated =
            action.payload?.shopByNeedItem ||
            action.payload;

          if (
            updated &&
            typeof updated === "object" &&
            updated._id
          ) {
            const index =
              state.shopByNeedItems.findIndex(
                (item) =>
                  item._id === updated._id
              );

            if (index !== -1) {
              state.shopByNeedItems[index] =
                updated;
            }
          }
        }
      );
  },
});

// =====================================================
// ACTIONS
// =====================================================

export const {
  clearShopByNeedError,
  clearShopByNeedStatus,
  clearSelectedShopByNeedItem,
} = shopByNeedSlice.actions;

// =====================================================
// REDUCER
// =====================================================

export default shopByNeedSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getPromoGridItemsApi,
  getPromoGridItemByIdApi,
  createPromoGridItemApi,
  updatePromoGridItemApi,
  deletePromoGridItemApi,
  togglePromoGridItemStatusApi,
} from "../../../../api/content/homepage/promoGridApi";

// =====================================================
// GET ALL PROMO GRID ITEMS
// =====================================================

export const getPromoGridItems = createAsyncThunk(
  "promoGrid/getPromoGridItems",

  async (_, { rejectWithValue }) => {
    try {
      const response = await getPromoGridItemsApi();

      console.log("Promo grid response:", response);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to get promo grid items."
      );
    }
  }
);

// =====================================================
// GET PROMO GRID ITEM BY ID
// =====================================================

export const getPromoGridItemById = createAsyncThunk(
  "promoGrid/getPromoGridItemById",

  async (id, { rejectWithValue }) => {
    try {
      const response =
        await getPromoGridItemByIdApi(id);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to get promo grid item."
      );
    }
  }
);

// =====================================================
// CREATE PROMO GRID ITEM
// =====================================================

export const createPromoGridItem = createAsyncThunk(
  "promoGrid/createPromoGridItem",

  async (data, { rejectWithValue }) => {
    try {
      const response =
        await createPromoGridItemApi(data);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to create promo grid item."
      );
    }
  }
);

// =====================================================
// UPDATE PROMO GRID ITEM
// =====================================================

export const updatePromoGridItem = createAsyncThunk(
  "promoGrid/updatePromoGridItem",

  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response =
        await updatePromoGridItemApi(id, data);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to update promo grid item."
      );
    }
  }
);

// =====================================================
// DELETE PROMO GRID ITEM
// =====================================================

export const deletePromoGridItem = createAsyncThunk(
  "promoGrid/deletePromoGridItem",

  async (id, { rejectWithValue }) => {
    try {
      const response =
        await deletePromoGridItemApi(id);

      return {
        id,
        ...response.data,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to delete promo grid item."
      );
    }
  }
);

// =====================================================
// TOGGLE PROMO GRID STATUS
// =====================================================

export const togglePromoGridItemStatus =
  createAsyncThunk(
    "promoGrid/togglePromoGridItemStatus",

    async (id, { rejectWithValue }) => {
      try {
        const response =
          await togglePromoGridItemStatusApi(id);

        return response.data;
      } catch (error) {
        return rejectWithValue(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Failed to update promo grid status."
        );
      }
    }
  );

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  promoGridItems: [],
  selectedPromoGridItem: null,

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

const promoGridSlice = createSlice({
  name: "promoGrid",

  initialState,

  reducers: {
    clearPromoGridError: (state) => {
      state.error = null;
    },

    clearPromoGridStatus: (state) => {
      state.createError = null;
      state.createSuccess = false;

      state.updateError = null;
      state.updateSuccess = false;

      state.deleteError = null;
    },

    clearSelectedPromoGridItem: (state) => {
      state.selectedPromoGridItem = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =================================================
      // GET ALL
      // =================================================

      .addCase(getPromoGridItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        getPromoGridItems.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.promoGridItems =
            action.payload?.promoGridItems ||
            action.payload?.items ||
            action.payload ||
            [];
        }
      )

      .addCase(
        getPromoGridItems.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to get promo grid items.";
        }
      )

      // =================================================
      // GET BY ID
      // =================================================

      .addCase(
        getPromoGridItemById.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getPromoGridItemById.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.selectedPromoGridItem =
            action.payload?.promoGridItem ||
            action.payload;
        }
      )

      .addCase(
        getPromoGridItemById.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      // =================================================
      // CREATE
      // =================================================

      .addCase(
        createPromoGridItem.pending,
        (state) => {
          state.createLoading = true;
          state.createError = null;
          state.createSuccess = false;
        }
      )

      .addCase(
        createPromoGridItem.fulfilled,
        (state, action) => {
          state.createLoading = false;
          state.createError = null;
          state.createSuccess = true;

          const created =
            action.payload?.promoGridItem ||
            action.payload;

          if (
            created &&
            typeof created === "object" &&
            created._id
          ) {
            state.promoGridItems.unshift(created);
          }
        }
      )

      .addCase(
        createPromoGridItem.rejected,
        (state, action) => {
          state.createLoading = false;
          state.createError =
            action.payload ||
            "Failed to create promo grid item.";
          state.createSuccess = false;
        }
      )

      // =================================================
      // UPDATE
      // =================================================

      .addCase(
        updatePromoGridItem.pending,
        (state) => {
          state.updateLoading = true;
          state.updateError = null;
          state.updateSuccess = false;
        }
      )

      .addCase(
        updatePromoGridItem.fulfilled,
        (state, action) => {
          state.updateLoading = false;
          state.updateError = null;
          state.updateSuccess = true;

          const updated =
            action.payload?.promoGridItem ||
            action.payload;

          if (
            updated &&
            typeof updated === "object" &&
            updated._id
          ) {
            const index =
              state.promoGridItems.findIndex(
                (item) =>
                  item._id === updated._id
              );

            if (index !== -1) {
              state.promoGridItems[index] = updated;
            }
          }
        }
      )

      .addCase(
        updatePromoGridItem.rejected,
        (state, action) => {
          state.updateLoading = false;
          state.updateError =
            action.payload ||
            "Failed to update promo grid item.";
        }
      )

      // =================================================
      // DELETE
      // =================================================

      .addCase(
        deletePromoGridItem.pending,
        (state) => {
          state.deleteLoading = true;
          state.deleteError = null;
        }
      )

      .addCase(
        deletePromoGridItem.fulfilled,
        (state, action) => {
          state.deleteLoading = false;
          state.deleteError = null;

          state.promoGridItems =
            state.promoGridItems.filter(
              (item) =>
                item._id !== action.payload.id
            );
        }
      )

      .addCase(
        deletePromoGridItem.rejected,
        (state, action) => {
          state.deleteLoading = false;
          state.deleteError =
            action.payload ||
            "Failed to delete promo grid item.";
        }
      )

      // =================================================
      // TOGGLE STATUS
      // =================================================

      .addCase(
        togglePromoGridItemStatus.fulfilled,
        (state, action) => {
          const updated =
            action.payload?.promoGridItem ||
            action.payload;

          if (
            updated &&
            typeof updated === "object" &&
            updated._id
          ) {
            const index =
              state.promoGridItems.findIndex(
                (item) =>
                  item._id === updated._id
              );

            if (index !== -1) {
              state.promoGridItems[index] = updated;
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
  clearPromoGridError,
  clearPromoGridStatus,
  clearSelectedPromoGridItem,
} = promoGridSlice.actions;

// =====================================================
// REDUCER
// =====================================================

export default promoGridSlice.reducer;
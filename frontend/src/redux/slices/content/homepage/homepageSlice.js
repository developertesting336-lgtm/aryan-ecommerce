import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { getHomepageApi } from "../../../../api/content/homepage/homepageApi";

// =====================================================
// GET HOMEPAGE
// =====================================================

export const getHomepage = createAsyncThunk(
  "homepage/getHomepage",

  async (_, { rejectWithValue }) => {
    try {
      const response = await getHomepageApi();

      console.log("Homepage response:", response);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to load homepage."
      );
    }
  }
);

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  hero: [],
  promoCards: [],
  categories: [],
  promoGrid: [],
  shopByNeed: [],
  featuredProducts: [],

  loading: false,
  error: null,
};

// =====================================================
// SLICE
// =====================================================

const homepageSlice = createSlice({
  name: "homepage",

  initialState,

  reducers: {
    clearHomepageError: (state) => {
      state.error = null;
    },

    clearHomepage: (state) => {
      state.hero = [];
      state.promoCards = [];
      state.categories = [];
      state.promoGrid = [];
      state.shopByNeed = [];
      state.featuredProducts = [];

      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =================================================
      // GET HOMEPAGE
      // =================================================

      .addCase(getHomepage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getHomepage.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const data = action.payload || {};

        state.hero = data.hero || [];
        state.promoCards = data.promoCards || [];
        state.categories = data.categories || [];
        state.promoGrid = data.promoGrid || [];
        state.shopByNeed = data.shopByNeed || [];
        state.featuredProducts = data.featuredProducts || [];
      })

      .addCase(getHomepage.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload || "Failed to load homepage.";
      });
  },
});

export const {
  clearHomepageError,
  clearHomepage,
} = homepageSlice.actions;

export default homepageSlice.reducer;
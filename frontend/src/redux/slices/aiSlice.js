import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRecommendationsApi,generateDescriptionApi,chatApi,getCartRecommendationsApi   } from "../../api/aiApi";

// =====================================================
// GET RECOMMENDED PRODUCTS
// =====================================================

export const getRecommendedProducts = createAsyncThunk(
  "ai/getRecommendedProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRecommendationsApi();

      // backend returns { source: "ai" | "cache" | "fallback", products: [...] }
      return {
        products: response.products || [],
        source: response.source,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to get recommendations."
      );
    }
  }
);

// =====================================================
// GENERATE PRODUCT DESCRIPTION
// =====================================================

export const generateDescription = createAsyncThunk(
  "ai/generateDescription",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await generateDescriptionApi(payload);
      return response.description;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate description."
      );
    }
  }
);

// =====================================================
// SHOPPING CHATBOT
// =====================================================

export const sendChatMessage = createAsyncThunk(
  "ai/sendChatMessage",
  async (payload, { rejectWithValue }) => {
    try {
      return await chatApi(payload); // { reply, products }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Chat is unavailable right now."
      );
    }
  }
);

// =====================================================
// GET CART-BASED RECOMMENDATIONS
// =====================================================

export const getCartRecommendations = createAsyncThunk(
  "ai/getCartRecommendations",
  async ({ ids } = {}, { rejectWithValue }) => {
    try {
      const response = await getCartRecommendationsApi(ids);
      // backend returns { source: "ai" | "rules" | "cache" | "popular", products: [...] }
      return {
        products: response.products || [],
        source: response.source,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to get recommendations."
      );
    }
  }
);
// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  recommendedProducts: [],
  source: null,
  recommendLoading: false,
  recommendFetched: false,   // NEW
  recommendError: null,
  generateLoading: false,
generateError: null,
  cartRecommendations: [],
  cartRecSource: null,
  cartRecLoading: false,
  cartRecError: null,
  cartRecRequestId: null, // ignore out-of-date responses
};

// =====================================================
// SLICE
// =====================================================

const aiSlice = createSlice({
  name: "ai",
  initialState,

  reducers: {
   clearRecommendations: (state) => {
  state.recommendedProducts = [];
  state.source = null;
  state.recommendError = null;
  state.recommendFetched = false;   // NEW
},
    clearCartRecommendations: (state) => {
      state.cartRecommendations = [];
      state.cartRecSource = null;
      state.cartRecError = null;
      state.cartRecRequestId = null;
    },
  },

  extraReducers: (builder) => {
    builder
   .addCase(getRecommendedProducts.pending, (state) => {
  state.recommendLoading = true;
  state.recommendError = null;
})

.addCase(getRecommendedProducts.fulfilled, (state, action) => {
  state.recommendLoading = false;
  state.recommendFetched = true;    // NEW
  state.recommendedProducts = action.payload.products;
  state.source = action.payload.source;
})

.addCase(getRecommendedProducts.rejected, (state, action) => {
  state.recommendLoading = false;
  state.recommendFetched = true;    // NEW
  state.recommendedProducts = [];
  state.recommendError = action.payload || "Failed to get recommendations.";
})

.addCase(generateDescription.pending, (state) => {
  state.generateLoading = true;
  state.generateError = null;
})
.addCase(generateDescription.fulfilled, (state) => {
  state.generateLoading = false;
})
.addCase(generateDescription.rejected, (state, action) => {
  state.generateLoading = false;
  state.generateError = action.payload || "Failed to generate description.";
})
      .addCase(getCartRecommendations.pending, (state, action) => {
        state.cartRecLoading = true;
        state.cartRecError = null;
        state.cartRecRequestId = action.meta.requestId;
        // old list is kept, so the section doesn't flicker while refetching
      })
      .addCase(getCartRecommendations.fulfilled, (state, action) => {
        if (state.cartRecRequestId !== action.meta.requestId) return; // stale
        state.cartRecLoading = false;
        state.cartRecommendations = action.payload.products;
        state.cartRecSource = action.payload.source;
      })
      .addCase(getCartRecommendations.rejected, (state, action) => {
        if (state.cartRecRequestId !== action.meta.requestId) return; // stale
        state.cartRecLoading = false;
        state.cartRecError = action.payload || "Failed to get recommendations.";
      });
  },
});


export const { clearRecommendations,clearCartRecommendations  } = aiSlice.actions;
export default aiSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRecommendationsApi,generateDescriptionApi,chatApi   } from "../../api/aiApi";

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
});
  },
});


export const { clearRecommendations } = aiSlice.actions;
export default aiSlice.reducer;
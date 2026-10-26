import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createReferralLinkApi,
  getMyPointsApi,
  getMyReferralsApi,
  getPointsHistoryApi,
} from "../../api/referralApi";

const getError = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

// =====================================================
// CREATE SHARE LINK
// =====================================================

export const createReferralLink = createAsyncThunk(
  "referral/createLink",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await createReferralLinkApi(productId);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to create link"));
    }
  }
);

// =====================================================
// GET POINTS (available + pending)
// =====================================================

export const getMyPoints = createAsyncThunk(
  "referral/getMyPoints",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyPointsApi();
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to load points"));
    }
  }
);

// =====================================================
// GET MY REFERRALS
// =====================================================

export const getMyReferrals = createAsyncThunk(
  "referral/getMyReferrals",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyReferralsApi();
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to load referrals"));
    }
  }
);

// =====================================================
// GET POINTS HISTORY
// =====================================================

export const getPointsHistory = createAsyncThunk(
  "referral/getPointsHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPointsHistoryApi();
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to load history"));
    }
  }
);

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  available: 0,
  pending: 0,
  referrals: [],
  history: [],
  loading: false,
  error: null,
};

// =====================================================
// SLICE
// =====================================================

const referralSlice = createSlice({
  name: "referral",
  initialState,
  reducers: {
    clearReferralError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMyPoints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyPoints.fulfilled, (state, action) => {
        state.loading = false;
        state.available = action.payload?.available || 0;
        state.pending = action.payload?.pending || 0;
      })
      .addCase(getMyPoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getMyReferrals.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyReferrals.fulfilled, (state, action) => {
        state.loading = false;
        state.referrals = action.payload?.referrals || [];
      })
      .addCase(getMyReferrals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getPointsHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPointsHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload?.history || [];
      })
      .addCase(getPointsHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReferralError } = referralSlice.actions;

export default referralSlice.reducer;
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getReviewDashboardApi,
  getReviewTimelineApi,
  getAdminReviewsApi,
  getReviewByIdApi,
  updateReviewApprovalApi,
  bulkReviewsApi,
  deleteReviewApi,
} from "../../api/adminReviewApi";

const getError = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  fallback;

// =====================================================
// DASHBOARD ("Reviews" page)
// =====================================================

export const getReviewDashboard = createAsyncThunk(
  "adminReview/getDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getReviewDashboardApi();
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to load reviews."));
    }
  }
);

export const getReviewTimeline = createAsyncThunk(
  "adminReview/getTimeline",
  async (range = 7, { rejectWithValue }) => {
    try {
      const response = await getReviewTimelineApi(range);
      return { range, data: response.data?.data || [] };
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to load chart."));
    }
  }
);

// =====================================================
// LIST PAGE
// =====================================================

export const getAdminReviews = createAsyncThunk(
  "adminReview/getList",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, page, limit } = getState().adminReview.list;
      const response = await getAdminReviewsApi({ ...filters, page, limit });
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to load reviews."));
    }
  }
);

export const getReviewById = createAsyncThunk(
  "adminReview/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getReviewByIdApi(id);
      return response.data?.data?.review;
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to load review."));
    }
  }
);

export const toggleReviewApproval = createAsyncThunk(
  "adminReview/toggleApproval",
  async ({ id, isApproved }, { rejectWithValue }) => {
    try {
      await updateReviewApprovalApi(id, isApproved);
      return { id, isApproved };
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to update review."));
    }
  }
);

export const bulkUpdateReviews = createAsyncThunk(
  "adminReview/bulkUpdate",
  async ({ ids, action }, { rejectWithValue }) => {
    try {
      await bulkReviewsApi(ids, action);
      return { ids, action };
    } catch (error) {
      return rejectWithValue(getError(error, "Bulk action failed."));
    }
  }
);

export const deleteReview = createAsyncThunk(
  "adminReview/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteReviewApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(getError(error, "Failed to delete review."));
    }
  }
);

// =====================================================
// INITIAL STATE
// =====================================================

const defaultFilters = {
  search: "",
  status: "all",       // all | approved | hidden
  ratingMin: null,
  ratingMax: null,
  verified: "all",     // all | verified | unverified
  hasImages: false,
  product: null,
  dateFrom: null,
  dateTo: null,
  sort: "newest",      // newest | oldest | highest | lowest
};

const initialState = {
  // Dashboard
  stats: {
    total: 0,
    approved: 0,
    hidden: 0,
    avgRating: 0,
    thisMonth: 0,
  },
  distribution: [],    // [{ rating: 5, count: 742 }, ...]
  quickCounts: {
    hidden: 0,
    lowRated: 0,
    unverified: 0,
    withImages: 0,
  },
  recent: [],
  timeline: { range: 7, data: [] },

  // List page
  list: {
    reviews: [],
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    selectedIds: [],
    filters: defaultFilters,
  },

  // Detail modal
  review: null,

  // Separate flags so one section doesn't block another
  loading: {
    dashboard: false,
    timeline: false,
    list: false,
    detail: false,
    action: false,
  },

  error: null,
};

// =====================================================
// SLICE
// =====================================================

const adminReviewSlice = createSlice({
  name: "adminReview",

  initialState,

  reducers: {
    setReviewFilters: (state, action) => {
      state.list.filters = { ...state.list.filters, ...action.payload };
      state.list.page = 1;
      state.list.selectedIds = [];
    },

    resetReviewFilters: (state) => {
      state.list.filters = defaultFilters;
      state.list.page = 1;
      state.list.selectedIds = [];
    },

    setReviewPage: (state, action) => {
      state.list.page = action.payload;
      state.list.selectedIds = [];
    },

    toggleReviewSelect: (state, action) => {
      const ids = state.list.selectedIds;
      state.list.selectedIds = ids.includes(action.payload)
        ? ids.filter((id) => id !== action.payload)
        : [...ids, action.payload];
    },

    selectAllReviews: (state) => {
      state.list.selectedIds = state.list.reviews.map((r) => r._id);
    },

    clearReviewSelection: (state) => {
      state.list.selectedIds = [];
    },

    clearReview: (state) => {
      state.review = null;
    },

    clearReviewError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =================================================
      // DASHBOARD
      // =================================================

      .addCase(getReviewDashboard.pending, (state) => {
        state.loading.dashboard = true;
        state.error = null;
      })
      .addCase(getReviewDashboard.fulfilled, (state, action) => {
        state.loading.dashboard = false;
        state.stats = action.payload?.stats || initialState.stats;
        state.distribution = action.payload?.distribution || [];
        state.quickCounts =
          action.payload?.quickCounts || initialState.quickCounts;
        state.recent = action.payload?.recent || [];
      })
      .addCase(getReviewDashboard.rejected, (state, action) => {
        state.loading.dashboard = false;
        state.error = action.payload || "Failed to load reviews.";
      })

      // =================================================
      // TIMELINE
      // =================================================

      .addCase(getReviewTimeline.pending, (state) => {
        state.loading.timeline = true;
      })
      .addCase(getReviewTimeline.fulfilled, (state, action) => {
        state.loading.timeline = false;
        state.timeline = action.payload;
      })
      .addCase(getReviewTimeline.rejected, (state, action) => {
        state.loading.timeline = false;
        state.error = action.payload || "Failed to load chart.";
      })

      // =================================================
      // LIST
      // =================================================

      .addCase(getAdminReviews.pending, (state) => {
        state.loading.list = true;
        state.error = null;
      })
      .addCase(getAdminReviews.fulfilled, (state, action) => {
        state.loading.list = false;
        state.list.reviews = action.payload?.reviews || [];
        state.list.total = action.payload?.total || 0;
        state.list.totalPages = action.payload?.totalPages || 1;
      })
      .addCase(getAdminReviews.rejected, (state, action) => {
        state.loading.list = false;
        state.error = action.payload || "Failed to load reviews.";
      })

      // =================================================
      // DETAIL
      // =================================================

      .addCase(getReviewById.pending, (state) => {
        state.loading.detail = true;
      })
      .addCase(getReviewById.fulfilled, (state, action) => {
        state.loading.detail = false;
        state.review = action.payload;
      })
      .addCase(getReviewById.rejected, (state, action) => {
        state.loading.detail = false;
        state.error = action.payload || "Failed to load review.";
      })

      // =================================================
      // APPROVE / HIDE ONE (updates list, recent, and open modal)
      // =================================================

      .addCase(toggleReviewApproval.pending, (state) => {
        state.loading.action = true;
      })
      .addCase(toggleReviewApproval.fulfilled, (state, action) => {
        state.loading.action = false;
        const { id, isApproved } = action.payload;

        [...state.list.reviews, ...state.recent].forEach((r) => {
          if (r._id === id) r.isApproved = isApproved;
        });

        if (state.review?._id === id) state.review.isApproved = isApproved;
      })
      .addCase(toggleReviewApproval.rejected, (state, action) => {
        state.loading.action = false;
        state.error = action.payload || "Failed to update review.";
      })

      // =================================================
      // BULK
      // =================================================

      .addCase(bulkUpdateReviews.pending, (state) => {
        state.loading.action = true;
      })
      .addCase(bulkUpdateReviews.fulfilled, (state, action) => {
        state.loading.action = false;
        const { ids, action: type } = action.payload;

        if (type === "delete") {
          state.list.reviews = state.list.reviews.filter(
            (r) => !ids.includes(r._id)
          );
          state.recent = state.recent.filter((r) => !ids.includes(r._id));
        } else {
          state.list.reviews.forEach((r) => {
            if (ids.includes(r._id)) r.isApproved = type === "approve";
          });
        }

        state.list.selectedIds = [];
      })
      .addCase(bulkUpdateReviews.rejected, (state, action) => {
        state.loading.action = false;
        state.error = action.payload || "Bulk action failed.";
      })

      // =================================================
      // DELETE ONE
      // =================================================

      .addCase(deleteReview.pending, (state) => {
        state.loading.action = true;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading.action = false;
        state.list.reviews = state.list.reviews.filter(
          (r) => r._id !== action.payload
        );
        state.recent = state.recent.filter((r) => r._id !== action.payload);
        if (state.review?._id === action.payload) state.review = null;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading.action = false;
        state.error = action.payload || "Failed to delete review.";
      });
  },
});

// =====================================================
// ACTIONS
// =====================================================

export const {
  setReviewFilters,
  resetReviewFilters,
  setReviewPage,
  toggleReviewSelect,
  selectAllReviews,
  clearReviewSelection,
  clearReview,
  clearReviewError,
} = adminReviewSlice.actions;

// =====================================================
// REDUCER
// =====================================================

export default adminReviewSlice.reducer;
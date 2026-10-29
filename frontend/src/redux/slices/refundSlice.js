import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  checkOrderEligibilityApi,
  createRefundRequestApi,
  getUserRefundsApi,
  getRefundByIdApi,
  getAdminRefundsApi,
  getAdminRefundByIdApi,
  adminUpdateRefundStatusApi,
  adminReceiveItemsApi,
  adminProcessRefundApi,
} from "../../api/refundApi";

// ==========================================
// ASYNC THUNKS - CUSTOMER
// ==========================================

export const checkOrderEligibility = createAsyncThunk(
  "refund/checkEligibility",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await checkOrderEligibilityApi(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to check eligibility"
      );
    }
  }
);

export const createRefundRequest = createAsyncThunk(
  "refund/createRequest",
  async (data, { rejectWithValue }) => {
    try {
      const response = await createRefundRequestApi(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit return request"
      );
    }
  }
);

export const getUserRefunds = createAsyncThunk(
  "refund/getUserRefunds",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserRefundsApi();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch refund requests"
      );
    }
  }
);

export const getRefundById = createAsyncThunk(
  "refund/getRefundById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getRefundByIdApi(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch refund details"
      );
    }
  }
);

// ==========================================
// ASYNC THUNKS - ADMIN
// ==========================================

export const getAdminRefunds = createAsyncThunk(
  "refund/getAdminRefunds",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getAdminRefundsApi(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin refunds"
      );
    }
  }
);

export const getAdminRefundById = createAsyncThunk(
  "refund/getAdminRefundById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getAdminRefundByIdApi(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch refund details"
      );
    }
  }
);

export const adminUpdateRefundStatus = createAsyncThunk(
  "refund/adminUpdateStatus",
  async ({ id, status, rejectionReason, adminNotes }, { rejectWithValue }) => {
    try {
      const response = await adminUpdateRefundStatusApi(id, {
        status,
        rejectionReason,
        adminNotes,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update refund status"
      );
    }
  }
);

export const adminReceiveItems = createAsyncThunk(
  "refund/adminReceiveItems",
  async ({ id, items, adminNotes }, { rejectWithValue }) => {
    try {
      const response = await adminReceiveItemsApi(id, { items, adminNotes });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark items received"
      );
    }
  }
);

export const adminProcessRefund = createAsyncThunk(
  "refund/adminProcessRefund",
  async (
    { id, paymentGateway, manualReference, adminNotes },
    { rejectWithValue }
  ) => {
    try {
      const response = await adminProcessRefundApi(id, {
        paymentGateway,
        manualReference,
        adminNotes,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to process refund"
      );
    }
  }
);

// ==========================================
// SLICE
// ==========================================

const refundSlice = createSlice({
  name: "refund",
  initialState: {
    refunds: [],
    currentRefund: null,
    eligibility: null,
    adminRefunds: [],
    adminStats: {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      receivedRequests: 0,
      refundedRequests: 0,
      totalRefundedAmount: 0,
    },
    adminPagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
    loading: false,
    eligibilityLoading: false,
    submitting: false,
    adminActionLoading: false,
    error: null,
  },
  reducers: {
    clearEligibility: (state) => {
      state.eligibility = null;
    },
    clearCurrentRefund: (state) => {
      state.currentRefund = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Eligibility
      .addCase(checkOrderEligibility.pending, (state) => {
        state.eligibilityLoading = true;
        state.error = null;
      })
      .addCase(checkOrderEligibility.fulfilled, (state, action) => {
        state.eligibilityLoading = false;
        state.eligibility = action.payload;
      })
      .addCase(checkOrderEligibility.rejected, (state, action) => {
        state.eligibilityLoading = false;
        state.error = action.payload;
      })

      // Create Request
      .addCase(createRefundRequest.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createRefundRequest.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload?.refundRequest) {
          state.refunds.unshift(action.payload.refundRequest);
        }
      })
      .addCase(createRefundRequest.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Get User Refunds
      .addCase(getUserRefunds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserRefunds.fulfilled, (state, action) => {
        state.loading = false;
        state.refunds = action.payload?.refunds || [];
      })
      .addCase(getUserRefunds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Refund By Id
      .addCase(getRefundById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRefundById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRefund = action.payload?.refundRequest || null;
      })
      .addCase(getRefundById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin Get Refunds
      .addCase(getAdminRefunds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminRefunds.fulfilled, (state, action) => {
        state.loading = false;
        state.adminRefunds = action.payload?.refunds || [];
        state.adminStats = action.payload?.stats || state.adminStats;
        state.adminPagination =
          action.payload?.pagination || state.adminPagination;
      })
      .addCase(getAdminRefunds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin Get Refund By Id
      .addCase(getAdminRefundById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminRefundById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRefund = action.payload?.refundRequest || null;
      })
      .addCase(getAdminRefundById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin Update Status
      .addCase(adminUpdateRefundStatus.pending, (state) => {
        state.adminActionLoading = true;
        state.error = null;
      })
      .addCase(adminUpdateRefundStatus.fulfilled, (state, action) => {
        state.adminActionLoading = false;
        const updated = action.payload?.refundRequest;
        if (updated) {
          state.currentRefund = updated;
          state.adminRefunds = state.adminRefunds.map((r) =>
            r._id === updated._id ? { ...r, ...updated } : r
          );
        }
      })
      .addCase(adminUpdateRefundStatus.rejected, (state, action) => {
        state.adminActionLoading = false;
        state.error = action.payload;
      })

      // Admin Receive Items
      .addCase(adminReceiveItems.pending, (state) => {
        state.adminActionLoading = true;
        state.error = null;
      })
      .addCase(adminReceiveItems.fulfilled, (state, action) => {
        state.adminActionLoading = false;
        const updated = action.payload?.refundRequest;
        if (updated) {
          state.currentRefund = updated;
          state.adminRefunds = state.adminRefunds.map((r) =>
            r._id === updated._id ? { ...r, ...updated } : r
          );
        }
      })
      .addCase(adminReceiveItems.rejected, (state, action) => {
        state.adminActionLoading = false;
        state.error = action.payload;
      })

      // Admin Process Refund
      .addCase(adminProcessRefund.pending, (state) => {
        state.adminActionLoading = true;
        state.error = null;
      })
      .addCase(adminProcessRefund.fulfilled, (state, action) => {
        state.adminActionLoading = false;
        const updated = action.payload?.refundRequest;
        if (updated) {
          state.currentRefund = updated;
          state.adminRefunds = state.adminRefunds.map((r) =>
            r._id === updated._id ? { ...r, ...updated } : r
          );
        }
      })
      .addCase(adminProcessRefund.rejected, (state, action) => {
        state.adminActionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearEligibility, clearCurrentRefund, clearError } =
  refundSlice.actions;

export default refundSlice.reducer;

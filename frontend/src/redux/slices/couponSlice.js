import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {createCouponAPI,getCouponsApi,getCouponByIdApi, applyCouponAPI} from "../../api/couponApi"
const BASE_URL = import.meta.env.VITE_API_URL;

// Get authentication token
const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// ============================================
// GET ALL COUPONS
// ============================================
export const getCoupons = createAsyncThunk(
  "coupon/getCoupons",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getCouponsApi()
      console.log("coupon",response)
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch coupons"
      );
    }
  }
);

// ============================================
// GET COUPON BY ID
// ============================================
export const getCouponById = createAsyncThunk(
  "coupon/getCouponById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getCouponByIdApi(id)
console.log("getCouponByIdApi",response)
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch coupon"
      );
    }
  }
);

// ============================================
// CREATE COUPON
// ============================================
export const createCoupon = createAsyncThunk(
  "coupon/createCoupon",
  async (couponData, { rejectWithValue }) => {
    try {
      const response = await createCouponAPI(couponData)
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create coupon"
      );
    }
  }
);

// ============================================
// UPDATE COUPON
// ============================================
export const updateCoupon = createAsyncThunk(
  "coupon/updateCoupon",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/admin/coupons/${id}`,
        data,
        getAuthConfig()
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update coupon"
      );
    }
  }
);

// ============================================
// DELETE COUPON
// ============================================
export const deleteCoupon = createAsyncThunk(
  "coupon/deleteCoupon",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${BASE_URL}/admin/coupons/${id}`,
        getAuthConfig()
      );

      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete coupon"
      );
    }
  }
);

// ============================================
// TOGGLE COUPON STATUS
// ============================================
export const toggleCouponStatus = createAsyncThunk(
  "coupon/toggleCouponStatus",
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/admin/coupons/${id}/status`,
        { isActive },
        getAuthConfig()
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update coupon status"
      );
    }
  }
);

// ============================================
// APPLY COUPON
// ============================================
export const applyCoupon = createAsyncThunk(
  "coupon/applyCoupon",
  async ({ code,  productIds }, { rejectWithValue }) => {
    try {
      const response = await applyCouponAPI({code,  productIds})
   console.log("response apply",response)
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to apply coupon"
      );
    }
  }
);



// ============================================
// INITIAL STATE
// ============================================
const initialState = {
  coupons: [],
  selectedCoupon: null,
 appliedCoupon: null,

  couponLoading: false,
  couponError: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },

  loading: false,
  detailsLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,

  error: null,
  success: null,
};

// ============================================
// SLICE
// ============================================
const couponSlice = createSlice({
  name: "coupon",

  initialState,

  reducers: {
    clearCouponError: (state) => {
      state.error = null;
    },

    clearCouponSuccess: (state) => {
      state.success = null;
    },

    clearSelectedCoupon: (state) => {
      state.selectedCoupon = null;
    },

    resetCouponState: () => initialState,
    clearCouponError: (state) => {
    state.error = null;
    state.couponError = null;
  },

  clearCouponSuccess: (state) => {
    state.success = null;
  },

  clearAppliedCoupon: (state) => {
    state.appliedCoupon = null;
    state.couponError = null;
  },

  clearSelectedCoupon: (state) => {
    state.selectedCoupon = null;
  },

  resetCouponState: () => initialState,
  },

  extraReducers: (builder) => {
    builder

      // ============================
      // GET COUPONS
      // ============================
      .addCase(getCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getCoupons.fulfilled, (state, action) => {
        state.loading = false;

        const payload = action.payload?.data || action.payload;
        console.log("pay",payload)
        state.coupons =
          payload?.coupons ||
          payload?.items ||
          (Array.isArray(payload) ? payload : []);

        if (payload?.pagination) {
          state.pagination = {
            ...state.pagination,
            ...payload.pagination,
          };
        }
      })

      .addCase(getCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ============================
      // GET COUPON
      // ============================
      .addCase(getCouponById.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })

      .addCase(getCouponById.fulfilled, (state, action) => {
        state.detailsLoading = false;

        state.selectedCoupon =
          action.payload?.data.coupon || action.payload;
          console.log("pauylod",action.payload.data)
      })

      .addCase(getCouponById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // ============================
      // CREATE
      // ============================
      .addCase(createCoupon.pending, (state) => {
        state.createLoading = true;
        state.error = null;
        state.success = null;
      })

      .addCase(createCoupon.fulfilled, (state, action) => {
        state.createLoading = false;

        const coupon =
          action.payload?.data || action.payload;

        if (coupon) {
          state.coupons.unshift(coupon);
        }

        state.success = "Coupon created successfully";
      })

      .addCase(createCoupon.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // ============================
      // UPDATE
      // ============================
      .addCase(updateCoupon.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.success = null;
      })

      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.updateLoading = false;

        const updatedCoupon =
          action.payload?.data || action.payload;

        if (updatedCoupon) {
          state.selectedCoupon = updatedCoupon;

          const index = state.coupons.findIndex(
            (coupon) => coupon._id === updatedCoupon._id
          );

          if (index !== -1) {
            state.coupons[index] = updatedCoupon;
          }
        }

        state.success = "Coupon updated successfully";
      })

      .addCase(updateCoupon.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // ============================
      // DELETE
      // ============================
      .addCase(deleteCoupon.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })

      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.deleteLoading = false;

        state.coupons = state.coupons.filter(
          (coupon) => coupon._id !== action.payload
        );

        state.success = "Coupon deleted successfully";
      })

      .addCase(deleteCoupon.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })

      // ============================
      // STATUS
      // ============================
      .addCase(toggleCouponStatus.pending, (state) => {
        state.error = null;
      })

      .addCase(toggleCouponStatus.fulfilled, (state, action) => {
        const updatedCoupon =
          action.payload?.data || action.payload;

        if (!updatedCoupon) return;

        const index = state.coupons.findIndex(
          (coupon) => coupon._id === updatedCoupon._id
        );

        if (index !== -1) {
          state.coupons[index] = updatedCoupon;
        }

        if (
          state.selectedCoupon?._id === updatedCoupon._id
        ) {
          state.selectedCoupon = updatedCoupon;
        }

        state.success = "Coupon status updated";
      })

      .addCase(toggleCouponStatus.rejected, (state, action) => {
        state.error = action.payload;
      })
      // ============================
// APPLY COUPON
// ============================
.addCase(applyCoupon.pending, (state) => {
  state.couponLoading = true;
  state.couponError = null;
})

.addCase(applyCoupon.fulfilled, (state, action) => {
  state.couponLoading = false;

  const result =
    action.payload?.data?.result ||
    action.payload?.result ||
    action.payload?.data;

  state.appliedCoupon = result || null;
  state.couponError = null;
})

.addCase(applyCoupon.rejected, (state, action) => {
  state.couponLoading = false;
  state.appliedCoupon = null;
  state.couponError =
    action.payload || "Unable to apply coupon";
})

  },
});

export const {
  clearCouponError,
  clearCouponSuccess,
  clearAppliedCoupon,
  clearSelectedCoupon,
  resetCouponState,
} = couponSlice.actions;

export default couponSlice.reducer;
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getVendorDashboardApi,getVendorProductsApi,getVendorOrdersApi } from "../../api/vendorApi";

const BASE_URL = import.meta.env.VITE_API_URL;

/* =====================================================
   GET VENDOR DASHBOARD
===================================================== */

export const getVendorDashboard = createAsyncThunk(
  "vendor/getVendorDashboard",
  async (filter, { rejectWithValue }) => {
    try {
      
       const response = await getVendorDashboardApi(filter);
      console.log("resvend",response)
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to load vendor dashboard"
      );
    }
  }
);
export const getVendorProducts = createAsyncThunk(
  "vendor/getVendorProducts",
  async ({ page = 1, limit = 4 } = {}, { rejectWithValue }) => {
    try {
      
       const response = await getVendorProductsApi(page,limit);
      console.log("vendpro",response)
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to load vendor dashboard"
      );
    }
  }
);
export const getVendorOrders = createAsyncThunk(
  "vendor/getVendorOrders",
  async ({ page = 1, limit = 4 } = {}, { rejectWithValue }) => {
    try {
      
       const response = await getVendorOrdersApi(page,limit);
      console.log("vendor orders",response)
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to load vendor dashboard"
      );
    }
  }
);

/* =====================================================
   INITIAL STATE
===================================================== */

const initialState = {
  stats: {
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    netEarnings: 0,
  },

  sales: [],

  orderSummary: {
    delivered: 0,
    processing: 0,
    pending: 0,
    cancelled: 0,
  },

  recentOrders: [],
orders:[],
  inventoryAlerts: [],

  loading: false,

  error: null,
};

/* =====================================================
   SLICE
===================================================== */

const vendorSlice = createSlice({
  name: "vendor",

  initialState,

  reducers: {
    clearVendorError: (state) => {
      state.error = null;
    },

    resetVendorDashboard: (state) => {
      state.stats = {
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        netEarnings: 0,
      };

      state.sales = [];

      state.orderSummary = {
        delivered: 0,
        processing: 0,
        pending: 0,
        cancelled: 0,
      };

      state.recentOrders = [];
      
      state.inventoryAlerts = [];

      state.loading = false;

      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ============================================
         PENDING
      ============================================ */

      .addCase(
        getVendorDashboard.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      /* ============================================
         SUCCESS
      ============================================ */

      .addCase(
        getVendorDashboard.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          const data = action.payload?.data || action.payload;
           console.log("data",data)
          state.stats = {
            totalSales:
              data?.stats?.totalSales ?? 0,

            totalOrders:
              data?.stats?.totalOrders ?? 0,

            totalProducts:
              data?.stats?.totalProducts ?? 0,

            netEarnings:
              data?.stats?.netEarnings ?? 0,
          };

          state.sales = data?.salesOverview || [];
console.log("state.sales",state.sales)
          state.orderSummary = {
            delivered:
              data?.orderSummery  ?.delivered ?? 0,

            processing:
              data?.orderSummery  ?.processing ?? 0,

              shipped:
      data?.orderSummery?.shipped ?? 0,

            pending:
              data?.orderSummery  ?.pending ?? 0,

            cancelled:
              data?.orderSummery  ?.cancelled ?? 0,
          };
          state.recentOrders =
            data?.recentOrders || [];

          state.inventoryAlerts =
            data?.inventoryAlerts || [];
            
        }
      )

      /* ============================================
         ERROR
      ============================================ */

      .addCase(
        getVendorDashboard.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Something went wrong while loading dashboard";
        }
      )

       
            .addCase(getVendorProducts.pending, (state) => {
              state.loading = true;
              state.error = null;
            })
      
            .addCase(getVendorProducts.fulfilled, (state, action) => {
              state.loading = false;
              state.error = null;
      
              state.stats =
                action.payload?.stats || {
                  revenue: 0,
                  orders: 0,
                  users: 0,
                  products: 0,
                };
      
              state.products =
                action.payload?.products || [];
                console.log("slicevendpro",action.payload)
            })
      
            .addCase(getVendorProducts.rejected, (state, action) => {
              state.loading = false;
      
              state.error =
                action.payload || "Failed to load dashboard.";
            })

                .addCase(getVendorOrders.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                  })
            
                  .addCase(getVendorOrders.fulfilled, (state, action) => {
                    state.loading = false;
                    state.error = null;
            
                    state.stats =
                      action.payload?.stats || {
                        totalUsers: 0,
                        activeUsers: 0,
                        blockedUsers: 0,
                        revenue: 0,
                      };
            
                    state.orders =
                      action.payload?.orders || [];
                  })
            
                  .addCase(getVendorOrders.rejected, (state, action) => {
                    state.loading = false;
            
                    state.error =
                      action.payload || "Failed to load dashboard.";
                  })
  },
});

/* =====================================================
   EXPORT
===================================================== */

export const {
  clearVendorError,
  resetVendorDashboard,
} = vendorSlice.actions;

export default vendorSlice.reducer;
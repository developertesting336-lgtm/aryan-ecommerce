import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getAdminDashboardApi, getAdminProductsApi, getAdminUsersApi,
   getAdminOrdersApi,getProductByIdApi,adminEditProductsApi,updateProductStatusApi,getProductsByStatusApi } from "../../api/adminApi";

// =====================================================
// GET ADMIN DASHBOARD
// =====================================================

export const getAdminDashboard = createAsyncThunk(
  "admin/getDashboard",
  async (filter, { rejectWithValue }) => {
    try {
      const response = await getAdminDashboardApi(filter);

      console.log("Admin Dashboard:", response);

      return response.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to load dashboard."
      );
    }
  }
);

export const getAdminProducts = createAsyncThunk(
  "admin/getAdminProducts",
  async ({ page = 1, limit = 4 } = {}, { rejectWithValue }) => {
    try {
      const response = await getAdminProductsApi(page,limit);

      // console.log("Admin products:", response);

      return response.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to load dashboard."
      );
    }
  }
);
export const getAdminUsers = createAsyncThunk(
  "admin/getAdminUsers",
  async ({ page = 1, limit = 4 } = {}, { rejectWithValue }) => {
    try {
      const response = await getAdminUsersApi(page,limit);

      // console.log("Admin users:", response);

      return response.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to load dashboard."
      );
    }
  }
);
export const getAdminOrders = createAsyncThunk(
  "admin/getAdminOrders",
  async ({ page = 1, limit = 4 } = {}, { rejectWithValue }) => {
    try {
      const response = await getAdminOrdersApi(page,limit);

      // console.log("Admin orders:", response);

      return response.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to load dashboard."
      );
    }
  }
);

export const getProductById = createAsyncThunk(
  "admin/getProductById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getProductByIdApi(id);
      console.log("admin pro",response)
      return response.data.data;

    } catch (error) {
      return rejectWithValue(
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong"
  );
    }
  }
);

export const editProduct = createAsyncThunk( "admin/editProduct", async ({ id, data }, { rejectWithValue }) => {
   try {
     const response = await adminEditProductsApi(id, data);
      return response.data; 
    } catch (error) {
       return    rejectWithValue( error.response?.data?.message || "Failed to update product" ); } } );

export const getProductsByStatus = createAsyncThunk(
  "admin/getProductsByStatus",
  async ({ status = "pending", page = 1, limit = 5, search = "" } = {}, { rejectWithValue }) => {
    try {
      const response = await getProductsByStatusApi(status, page, limit, search);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to load products."
      );
    }
  }
);

export const updateProductStatus = createAsyncThunk(
  "admin/updateProductStatus",
  async ({ id, status, reason }, { rejectWithValue }) => {
    try {
      const response = await updateProductStatusApi(id, status, reason);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update product status."
      );
    }
  }
);

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  stats: {
    revenue: 0,
    orders: 0,
    users: 0,
    products: 0,
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
  },
product:null,
  sales: [],

  recentOrders: [],
orders:[],
  topProducts: [],
products :[],
users :[],
  loading: false,

  error: null,

    // product approvals
  approvalProducts: [],
  approvalStats: {
    totalProducts: 0,
    pendingProducts: 0,
    activeProducts: 0,
    rejectedProducts: 0,
    inactiveProducts: 0,
  },
  approvalPagination: { totalProducts: 0, page: 1, limit: 5, totalPages: 1 },
  approvalLoading: false,
  approvalError: null,
  statusUpdating: false,
};

// =====================================================
// SLICE
// =====================================================

const adminSlice = createSlice({
  name: "admin",

  initialState,

  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =================================================
      // GET ADMIN DASHBOARD
      // =================================================

      .addCase(getAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.stats =
          action.payload?.stats || {
            revenue: 0,
            orders: 0,
            users: 0,
            products: 0,
          };
         state.orderSummery = action.payload.orderSummery || [];
         state.salesOverview = action.payload.salesOverview || [];
        state.sales = action.payload?.sales || [];

        state.recentOrders =
          action.payload?.recentOrders || [];

        state.topProducts =
          action.payload?.topProducts || [];
      })

      .addCase(getAdminDashboard.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload || "Failed to load dashboard.";
      })
      .addCase(getAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAdminProducts.fulfilled, (state, action) => {
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
      })

      .addCase(getAdminProducts.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload || "Failed to load dashboard.";
      })
      .addCase(getAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.stats =
          action.payload?.stats || {
            totalUsers: 0,
            activeUsers: 0,
            blockedUsers: 0,
            revenue: 0,
          };

        state.users =
          action.payload?.users || [];
      })

      .addCase(getAdminUsers.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload || "Failed to load dashboard.";
      })
      .addCase(getAdminOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAdminOrders.fulfilled, (state, action) => {
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

      .addCase(getAdminOrders.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload || "Failed to load dashboard.";
      })

       .addCase(getProductById.pending,(state)=>{
            state.loading=true;
          })
      
          .addCase(getProductById.fulfilled,(state,action)=>{
            state.loading=false;
            state.product=action.payload.product;
          })
      
          .addCase(getProductById.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
          })

                // =================================================
      // GET PRODUCTS BY STATUS
      // =================================================
      .addCase(getProductsByStatus.pending, (state) => {
        state.approvalLoading = true;
        state.approvalError = null;
      })

      .addCase(getProductsByStatus.fulfilled, (state, action) => {
        state.approvalLoading = false;
        state.approvalProducts = action.payload?.products || [];
        state.approvalStats = action.payload?.stats || initialState.approvalStats;
        state.approvalPagination =
          action.payload?.pagination || initialState.approvalPagination;
      })

      .addCase(getProductsByStatus.rejected, (state, action) => {
        state.approvalLoading = false;
        state.approvalError = action.payload || "Failed to load products.";
      })

      // =================================================
      // UPDATE PRODUCT STATUS
      // =================================================
      .addCase(updateProductStatus.pending, (state) => {
        state.statusUpdating = true;
      })

      .addCase(updateProductStatus.fulfilled, (state) => {
        state.statusUpdating = false;
      })

      .addCase(updateProductStatus.rejected, (state) => {
        state.statusUpdating = false;
      });
  },
});

// =====================================================
// ACTIONS
// =====================================================

export const { clearAdminError } = adminSlice.actions;

// =====================================================
// REDUCER
// =====================================================

export default adminSlice.reducer;
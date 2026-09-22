import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  createOrderApi,
  getOrdersApi,
  getOrderItemsApi,
  getOrderStatusApi,
  updateOrderStatusApi,
  getOrderByStatusApi,
  cancelOrderApi,
  getOrderByIdApi,
  adminUpdateOrderStatuApi
} from "../../api/orderApi";


// =========================
// Create Order
// =========================
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await createOrderApi(orderData);

      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create order"
      );
    }
  }
);


// =========================
// Get Orders
// =========================
export const getOrders = createAsyncThunk(
  "order/getOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getOrdersApi();
console.log("orders",response)
      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get orders"
      );
    }
  }
);


// =========================
// Get Order Items + Address
// =========================
export const getOrderItems = createAsyncThunk(
  "order/getOrderItems",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await getOrderItemsApi(orderId);
console.log("getitem",response)
      return response.data.orderdetails;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get order details"
      );
    }
  }
);

export const getOrderById = createAsyncThunk(
  "order/getOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await getOrderByIdApi(orderId);
console.log("getorderbyidthunk",response)
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to fetch order"
      );
    }
  }
);



// =========================
// Get Order Status
// =========================
export const getOrderStatus = createAsyncThunk(
  "order/getOrderStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getOrderStatusApi();

      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get order status"
      );
    }
  }
);


// =========================
// Update Order Status
// =========================
export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await updateOrderStatusApi(orderId, status);

      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update order status"
      );
    }
  }
);


// =========================
// Get Orders By Status
// =========================
export const getOrderByStatus = createAsyncThunk(
  "order/getOrderByStatus",
  async (status, { rejectWithValue }) => {
    try {
      const response = await getOrderByStatusApi(status);

      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get orders by status"
      );
    }
  }
);


// =========================
// Cancel Order
// =========================
export const cancelOrder = createAsyncThunk(
  "order/cancelOrder",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cancelOrderApi();

      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel order"
      );
    }
  }
);

export const adminUpdateOrderStatus = createAsyncThunk(
  "order/adminUpdateOrderStatus",
  async (
    { orderId, fulfillmentStatus },
    { rejectWithValue }
  ) => {
    try {
      const response =
        await adminUpdateOrderStatuApi(
          orderId,
          fulfillmentStatus
        );

      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to update fulfillment status"
      );
    }
  }
);



// =========================
// Initial State
// =========================
const initialState = {
  order: null,

  orders: [],

  orderDetails: {
    orderItem: [],
    orderAddress: null,
  },

  orderStatus: null,

  statusOrders: [],

  loading: false,

  error: null,
};


// =========================
// Slice
// =========================
const orderSlice = createSlice({
  name: "order",

  initialState,

  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },

    clearOrderDetails: (state) => {
      state.orderDetails = {
        orderItem: [],
        orderAddress: null,
      };
    },

    clearOrder: (state) => {
      state.order = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ==========================================
      // CREATE ORDER
      // ==========================================
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;

        // Add newly created order to orders array
        if (action.payload) {
          state.orders.unshift(action.payload);
        }
      })

      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // ==========================================
      // GET ORDERS
      // ==========================================
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getOrders.fulfilled, (state, action) => {
        state.loading = false;

        // Your controller currently returns one order
        // state.order = action.payload;

        // If backend changes to return array,
        // this can easily be changed to:
        state.orders = Array.isArray(action.payload)
    ? action.payload
    : action.payload
      ? [action.payload]
      : [];
      })

      .addCase(getOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // ==========================================
      // GET ORDER ITEMS
      // ==========================================
      .addCase(getOrderItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getOrderItems.fulfilled, (state, action) => {
        state.loading = false;

        state.orderDetails = action.payload;
      })

      .addCase(getOrderItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // ==========================================
      // GET ORDER STATUS
      // ==========================================
      .addCase(getOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getOrderStatus.fulfilled, (state, action) => {
        state.loading = false;

        state.orderStatus = action.payload;
      })

      .addCase(getOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // ==========================================
      // UPDATE ORDER STATUS
      // ==========================================
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;

        state.order = action.payload;

        // Update order status object
        state.orderStatus = action.payload;

        // Update order inside orders array
        const index = state.orders.findIndex(
          (order) => order._id === action.payload._id
        );

        if (index !== -1) {
          state.orders[index] = {
            ...state.orders[index],
            ...action.payload,
          };
        }

        // Update order inside statusOrders array
        const statusIndex = state.statusOrders.findIndex(
          (order) => order._id === action.payload._id
        );

        if (statusIndex !== -1) {
          state.statusOrders[statusIndex] = {
            ...state.statusOrders[statusIndex],
            ...action.payload,
          };
        }
      })

      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // ==========================================
      // GET ORDER BY STATUS
      // ==========================================
      .addCase(getOrderByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getOrderByStatus.fulfilled, (state, action) => {
        state.loading = false;

        state.statusOrders = action.payload;
      })

      .addCase(getOrderByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // ==========================================
      // CANCEL ORDER
      // ==========================================
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;

        state.order = action.payload;
        state.orderStatus = action.payload;

        // Update cancelled order in orders
        const index = state.orders.findIndex(
          (order) => order._id === action.payload._id
        );

        if (index !== -1) {
          state.orders[index] = {
            ...state.orders[index],
            ...action.payload,
          };
        }

        // Update cancelled order in status orders
        const statusIndex = state.statusOrders.findIndex(
          (order) => order._id === action.payload._id
        );

        if (statusIndex !== -1) {
          state.statusOrders[statusIndex] = {
            ...state.statusOrders[statusIndex],
            ...action.payload,
          };
        }
      })

      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
         .addCase(getOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;

        state.order = action.payload.order;
        console.log("getidorder",action.payload)
      })

      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
            // ==========================================
      // ADMIN UPDATE FULFILLMENT STATUS
      // ==========================================
      .addCase(adminUpdateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        adminUpdateOrderStatus.fulfilled,
        (state, action) => {
          state.loading = false;

          const updatedOrder = action.payload;

          // Update current order
          state.order = {
            ...(state.order || {}),
            ...updatedOrder,
          };

          // Update order inside orders array
          const index = state.orders.findIndex(
            (order) =>
              order._id === updatedOrder._id
          );

          if (index !== -1) {
            state.orders[index] = {
              ...state.orders[index],
              ...updatedOrder,
            };
          }

          // Update order inside statusOrders array
          const statusIndex =
            state.statusOrders.findIndex(
              (order) =>
                order._id === updatedOrder._id
            );

          if (statusIndex !== -1) {
            state.statusOrders[statusIndex] = {
              ...state.statusOrders[statusIndex],
              ...updatedOrder,
            };
          }

          // Update order inside orderDetails
          if (
            state.orderDetails?.order &&
            state.orderDetails.order._id ===
              updatedOrder._id
          ) {
            state.orderDetails.order = {
              ...state.orderDetails.order,
              ...updatedOrder,
            };
          }
        }
      )

      .addCase(
        adminUpdateOrderStatus.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

  },
});


export const {
  clearOrderError,
  clearOrderDetails,
  clearOrder,
} = orderSlice.actions;


export default orderSlice.reducer;
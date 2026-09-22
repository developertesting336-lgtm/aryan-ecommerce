import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  createPaymentApi,
} from "../../api/paymentApi";


// ==========================================
// CREATE PAYMENT
// ==========================================

export const createPayment = createAsyncThunk(
  "payment/createPayment",

  async ({orderId}, { rejectWithValue }) => {
    try {
      const response = await createPaymentApi({orderId});

      return response.data;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to create payment"
      );
    }
  }
);


// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  payment: null,

  sessionId: null,

  paymentUrl: null,

  loading: false,

  error: null,
};


// ==========================================
// SLICE
// ==========================================

const paymentSlice = createSlice({
  name: "payment",

  initialState,

  reducers: {

    clearPaymentError: (state) => {
      state.error = null;
    },

    clearPayment: (state) => {
      state.payment = null;
      state.sessionId = null;
      state.paymentUrl = null;
      state.error = null;
    },

  },


  extraReducers: (builder) => {

    builder

      // ======================================
      // CREATE PAYMENT
      // ======================================

      .addCase(createPayment.pending, (state) => {

        state.loading = true;
        state.error = null;

      })


      .addCase(createPayment.fulfilled, (state, action) => {

        state.loading = false;

        state.payment = action.payload;

        state.sessionId =
          action.payload?.sessionId || null;

        state.paymentUrl =
          action.payload?.url || null;

      })


      .addCase(createPayment.rejected, (state, action) => {

        state.loading = false;

        state.error =
          action.payload ||
          "Failed to create payment";

      });

  },
});


export const {
  clearPaymentError,
  clearPayment,
} = paymentSlice.actions;


export default paymentSlice.reducer;
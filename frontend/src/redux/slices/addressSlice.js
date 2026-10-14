import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getAddressesApi,
  addAddressApi,
  updateAddressApi,
  deleteAddressApi,
} from "../../api/addressApi";

// =====================================================
// GET ADDRESSES
// =====================================================

export const getAddresses = createAsyncThunk(
  "address/getAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAddressesApi();
console.log("addres",response)
      return response.data?.addresses || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to get addresses."
      );
    }
  }
);

// =====================================================
// ADD ADDRESS
// =====================================================

export const addAddress = createAsyncThunk(
  "address/addAddress",
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await addAddressApi(addressData);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to add address."
      );
    }
  }
);

// =====================================================
// UPDATE ADDRESS
// =====================================================

export const updateAddress = createAsyncThunk(
  "address/updateAddress",
  async ({ addressId, addressData }, { rejectWithValue }) => {
    try {
      const response = await updateAddressApi(
        addressId,
        addressData
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to update address."
      );
    }
  }
);

// =====================================================
// DELETE ADDRESS
// =====================================================

export const deleteAddress = createAsyncThunk(
  "address/deleteAddress",
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await deleteAddressApi(addressId);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to delete address."
      );
    }
  }
);

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  addresses: [],

  loading: false,
  error: null,

  addLoading: false,
  addError: null,
  addSuccess: false,

  updateLoading: false,
  updateError: null,
  updateSuccess: false,

  deleteLoading: false,
  deleteError: null,
  deleteSuccess: false,
};

// =====================================================
// SLICE
// =====================================================

const addressSlice = createSlice({
  name: "address",

  initialState,

  reducers: {
    clearAddressError: (state) => {
      state.error = null;
    },

    clearAddAddressStatus: (state) => {
      state.addError = null;
      state.addSuccess = false;
    },

    clearUpdateAddressStatus: (state) => {
      state.updateError = null;
      state.updateSuccess = false;
    },

    clearDeleteAddressStatus: (state) => {
      state.deleteError = null;
      state.deleteSuccess = false;
    },
  },

  extraReducers: (builder) => {
    builder

      // =================================================
      // GET ADDRESSES
      // =================================================

      .addCase(getAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.addresses = action.payload || [];
      })

      .addCase(getAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to get addresses.";
      })

      // =================================================
      // ADD ADDRESS
      // =================================================

      .addCase(addAddress.pending, (state) => {
        state.addLoading = true;
        state.addError = null;
        state.addSuccess = false;
      })

      .addCase(addAddress.fulfilled, (state, action) => {
        state.addLoading = false;
        state.addError = null;
        state.addSuccess = true;

        // Your backend returns:
        // {
        //   success: true,
        //   message: "...",
        //   addresses: [...]
        // }

        if (Array.isArray(action.payload?.addresses)) {
          state.addresses = action.payload.addresses;
        } else if (action.payload?.address) {
          state.addresses.push(action.payload.address);
        }
      })

      .addCase(addAddress.rejected, (state, action) => {
        state.addLoading = false;
        state.addError =
          action.payload || "Failed to add address.";
        state.addSuccess = false;
      })

      // =================================================
      // UPDATE ADDRESS
      // =================================================

      .addCase(updateAddress.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })

      .addCase(updateAddress.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        state.updateSuccess = true;

        const updatedAddress = action.payload?.address;

        if (updatedAddress?._id) {
          const index = state.addresses.findIndex(
            (address) =>
              address._id === updatedAddress._id
          );

          if (index !== -1) {
            state.addresses[index] = updatedAddress;
          }
        }

        // If backend returns all addresses
        if (Array.isArray(action.payload?.addresses)) {
          state.addresses = action.payload.addresses;
        }
      })

      .addCase(updateAddress.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError =
          action.payload || "Failed to update address.";
        state.updateSuccess = false;
      })

      // =================================================
      // DELETE ADDRESS
      // =================================================

      .addCase(deleteAddress.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = false;
      })

      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = null;
        state.deleteSuccess = true;

        if (Array.isArray(action.payload?.addresses)) {
          state.addresses = action.payload.addresses;
        }
      })

      .addCase(deleteAddress.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError =
          action.payload || "Failed to delete address.";
        state.deleteSuccess = false;
      });
  },
});

// =====================================================
// ACTIONS
// =====================================================

export const {
  clearAddressError,
  clearAddAddressStatus,
  clearUpdateAddressStatus,
  clearDeleteAddressStatus,
} = addressSlice.actions;

// =====================================================
// REDUCER
// =====================================================

export default addressSlice.reducer;
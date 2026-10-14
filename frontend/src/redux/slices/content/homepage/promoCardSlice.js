import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getPromoCardsApi,
  getPromoCardByIdApi,
  createPromoCardApi,
  updatePromoCardApi,
  deletePromoCardApi,
  togglePromoCardStatusApi,
} from "../../../../api/content/homepage/promoCardApi";

// =====================================================
// GET ALL PROMO CARDS
// =====================================================

export const getPromoCards = createAsyncThunk(
  "promoCard/getPromoCards",

  async (_, { rejectWithValue }) => {
    try {
      const response = await getPromoCardsApi();

      console.log("Promo cards response:", response);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to get promo cards."
      );
    }
  }
);

// =====================================================
// GET PROMO CARD BY ID
// =====================================================

export const getPromoCardById = createAsyncThunk(
  "promoCard/getPromoCardById",

  async (id, { rejectWithValue }) => {
    try {
      const response = await getPromoCardByIdApi(id);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to get promo card."
      );
    }
  }
);

// =====================================================
// CREATE PROMO CARD
// =====================================================

export const createPromoCard = createAsyncThunk(
  "promoCard/createPromoCard",

  async (promoCardData, { rejectWithValue }) => {
    try {
      const response = await createPromoCardApi(
        promoCardData
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to create promo card."
      );
    }
  }
);

// =====================================================
// UPDATE PROMO CARD
// =====================================================

export const updatePromoCard = createAsyncThunk(
  "promoCard/updatePromoCard",

  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updatePromoCardApi(id, data);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to update promo card."
      );
    }
  }
);

// =====================================================
// DELETE PROMO CARD
// =====================================================

export const deletePromoCard = createAsyncThunk(
  "promoCard/deletePromoCard",

  async (id, { rejectWithValue }) => {
    try {
      const response = await deletePromoCardApi(id);

      return {
        id,
        ...response.data,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to delete promo card."
      );
    }
  }
);

// =====================================================
// TOGGLE PROMO CARD STATUS
// =====================================================

export const togglePromoCardStatus = createAsyncThunk(
  "promoCard/togglePromoCardStatus",

  async (id, { rejectWithValue }) => {
    try {
      const response =
        await togglePromoCardStatusApi(id);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to update promo card status."
      );
    }
  }
);

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  promoCards: [],
  selectedPromoCard: null,

  loading: false,
  error: null,

  createLoading: false,
  createError: null,
  createSuccess: false,

  updateLoading: false,
  updateError: null,
  updateSuccess: false,

  deleteLoading: false,
  deleteError: null,
};

// =====================================================
// SLICE
// =====================================================

const promoCardSlice = createSlice({
  name: "promoCard",

  initialState,

  reducers: {
    clearPromoCardError: (state) => {
      state.error = null;
    },

    clearPromoCardStatus: (state) => {
      state.createError = null;
      state.createSuccess = false;

      state.updateError = null;
      state.updateSuccess = false;

      state.deleteError = null;
    },

    clearSelectedPromoCard: (state) => {
      state.selectedPromoCard = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =================================================
      // GET ALL PROMO CARDS
      // =================================================

      .addCase(getPromoCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getPromoCards.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.promoCards =
          action.payload?.promoCards ||
          action.payload?.cards ||
          action.payload ||
          [];
      })

      .addCase(getPromoCards.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          "Failed to get promo cards.";
      })

      // =================================================
      // GET PROMO CARD BY ID
      // =================================================

      .addCase(getPromoCardById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        getPromoCardById.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.selectedPromoCard =
            action.payload?.promoCard ||
            action.payload;
        }
      )

      .addCase(
        getPromoCardById.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      // =================================================
      // CREATE PROMO CARD
      // =================================================

      .addCase(createPromoCard.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })

      .addCase(createPromoCard.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createError = null;
        state.createSuccess = true;

        const createdPromoCard =
          action.payload?.promoCard ||
          action.payload;

        if (
          createdPromoCard &&
          typeof createdPromoCard === "object" &&
          createdPromoCard._id
        ) {
          state.promoCards.unshift(createdPromoCard);
        }
      })

      .addCase(createPromoCard.rejected, (state, action) => {
        state.createLoading = false;
        state.createError =
          action.payload ||
          "Failed to create promo card.";
        state.createSuccess = false;
      })

      // =================================================
      // UPDATE PROMO CARD
      // =================================================

      .addCase(updatePromoCard.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })

      .addCase(updatePromoCard.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        state.updateSuccess = true;

        const updatedPromoCard =
          action.payload?.promoCard ||
          action.payload;

        if (
          updatedPromoCard &&
          typeof updatedPromoCard === "object" &&
          updatedPromoCard._id
        ) {
          const index = state.promoCards.findIndex(
            (item) =>
              item._id === updatedPromoCard._id
          );

          if (index !== -1) {
            state.promoCards[index] =
              updatedPromoCard;
          }
        }
      })

      .addCase(updatePromoCard.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError =
          action.payload ||
          "Failed to update promo card.";
      })

      // =================================================
      // DELETE PROMO CARD
      // =================================================

      .addCase(deletePromoCard.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })

      .addCase(deletePromoCard.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = null;

        state.promoCards =
          state.promoCards.filter(
            (item) => item._id !== action.payload.id
          );
      })

      .addCase(deletePromoCard.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError =
          action.payload ||
          "Failed to delete promo card.";
      })

      // =================================================
      // TOGGLE STATUS
      // =================================================

      .addCase(
        togglePromoCardStatus.fulfilled,
        (state, action) => {
          const updatedPromoCard =
            action.payload?.promoCard ||
            action.payload;

          if (
            updatedPromoCard &&
            typeof updatedPromoCard === "object" &&
            updatedPromoCard._id
          ) {
            const index = state.promoCards.findIndex(
              (item) =>
                item._id === updatedPromoCard._id
            );

            if (index !== -1) {
              state.promoCards[index] =
                updatedPromoCard;
            }
          }
        }
      );
  },
});

// =====================================================
// ACTIONS
// =====================================================

export const {
  clearPromoCardError,
  clearPromoCardStatus,
  clearSelectedPromoCard,
} = promoCardSlice.actions;

// =====================================================
// REDUCER
// =====================================================

export default promoCardSlice.reducer;
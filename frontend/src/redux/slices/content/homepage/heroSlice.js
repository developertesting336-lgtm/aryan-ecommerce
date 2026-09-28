import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getHeroSlidesApi,
  getHeroSlideByIdApi,
  createHeroSlideApi,
  updateHeroSlideApi,
  deleteHeroSlideApi,
  toggleHeroSlideStatusApi,
  
} from "../../../../api/content/homepage/heroApi";

// ============================================================
// HELPER
// ============================================================

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
};

// ============================================================
// GET ALL HERO SLIDES
// ============================================================

export const getHeroSlides = createAsyncThunk(
  "hero/getHeroSlides",

  async (_, { rejectWithValue }) => {
    try {
      const response = await getHeroSlidesApi();

      return response;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to get hero slides."
        )
      );
    }
  }
);

// ============================================================
// GET HERO SLIDE BY ID
// ============================================================

export const getHeroSlideById = createAsyncThunk(
  "hero/getHeroSlideById",

  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue(
          "Hero slide ID is required."
        );
      }

      const response = await getHeroSlideByIdApi(id);

      return response;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to get hero slide."
        )
      );
    }
  }
);

// ============================================================
// CREATE HERO SLIDE
// ============================================================

export const createHeroSlide = createAsyncThunk(
  "hero/createHeroSlide",

  async (heroData, { rejectWithValue }) => {
    try {
      if (!heroData) {
        return rejectWithValue(
          "Hero slide data is required."
        );
      }

      const response =
        await createHeroSlideApi(heroData);

      return response;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to create hero slide."
        )
      );
    }
  }
);

// ============================================================
// UPDATE HERO SLIDE
// ============================================================

export const updateHeroSlide = createAsyncThunk(
  "hero/updateHeroSlide",

  async ({ id, data }, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue(
          "Hero slide ID is required."
        );
      }

      if (!data) {
        return rejectWithValue(
          "Hero slide data is required."
        );
      }

      const response =
        await updateHeroSlideApi(id, data);

      return response;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to update hero slide."
        )
      );
    }
  }
);

// ============================================================
// DELETE HERO SLIDE
// ============================================================

export const deleteHeroSlide = createAsyncThunk(
  "hero/deleteHeroSlide",

  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue(
          "Hero slide ID is required."
        );
      }

      const response =
        await deleteHeroSlideApi(id);

      return {
        id,
        response,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to delete hero slide."
        )
      );
    }
  }
);

// ============================================================
// TOGGLE HERO SLIDE STATUS
// ============================================================

export const toggleHeroSlideStatus =
  createAsyncThunk(
    "hero/toggleHeroSlideStatus",

    async (id, { rejectWithValue }) => {
      try {
        if (!id) {
          return rejectWithValue(
            "Hero slide ID is required."
          );
        }

        const response =
          await toggleHeroSlideStatusApi(id);

        return response;
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            "Failed to update hero status."
          )
        );
      }
    }
  );

// ============================================================
// INITIAL STATE
// ============================================================

const initialState = {
  // ----------------------------------------------------------
  // DATA
  // ----------------------------------------------------------

  heroSlides: [],

  selectedHero: null,

  // ----------------------------------------------------------
  // GET
  // ----------------------------------------------------------

  loading: false,
  error: null,

  // ----------------------------------------------------------
  // CREATE
  // ----------------------------------------------------------

  createLoading: false,
  createError: null,
  createSuccess: false,

  // ----------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------

  updateLoading: false,
  updateError: null,
  updateSuccess: false,

  // ----------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------

  deleteLoading: false,
  deleteError: null,

  // ----------------------------------------------------------
  // STATUS
  // ----------------------------------------------------------

  statusLoading: false,
  statusError: null,
};

// ============================================================
// SLICE
// ============================================================

const heroSlice = createSlice({
  name: "hero",

  initialState,

  reducers: {
  // ========================================================
  // CLEAR GENERAL ERROR
  // ========================================================

  clearHeroError: (state) => {
    state.error = null;
  },

  // ========================================================
  // CLEAR SUCCESS STATES
  // ========================================================

  clearHeroSuccess: (state) => {
    state.createSuccess = false;
    state.updateSuccess = false;
  },

  // ========================================================
  // CLEAR ALL OPERATION STATUS
  // ========================================================

  clearHeroStatus: (state) => {
    state.createError = null;
    state.createSuccess = false;

    state.updateError = null;
    state.updateSuccess = false;

    state.deleteError = null;

    state.statusError = null;
  },

  // ========================================================
  // CLEAR SELECTED HERO
  // ========================================================

  clearSelectedHero: (state) => {
    state.selectedHero = null;
  },

  // ========================================================
  // CLEAR HERO SLIDES
  // ========================================================

  clearHeroSlides: (state) => {
    state.heroSlides = [];
  },
},

  extraReducers: (builder) => {
    builder

      // ======================================================
      // GET ALL HERO SLIDES
      // ======================================================

      .addCase(
        getHeroSlides.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getHeroSlides.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          const response = action.payload;

          state.heroSlides =
            response?.heroSlides ||
            response?.slides ||
            response?.data?.heroSlides ||
            response?.data?.slides ||
            response?.data ||
            [];
        }
      )

      .addCase(
        getHeroSlides.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to get hero slides.";
        }
      )

      // ======================================================
      // GET HERO SLIDE BY ID
      // ======================================================

      .addCase(
        getHeroSlideById.pending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.selectedHero = null;
        }
      )

      .addCase(
        getHeroSlideById.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          const response = action.payload;

          state.selectedHero =
            response?.heroSlide ||
            response?.data?.heroSlide ||
            response?.data ||
            response;
        }
      )

      .addCase(
        getHeroSlideById.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to get hero slide.";
        }
      )

      // ======================================================
      // CREATE HERO SLIDE
      // ======================================================

      .addCase(
        createHeroSlide.pending,
        (state) => {
          state.createLoading = true;
          state.createError = null;
          state.createSuccess = false;
        }
      )

      .addCase(
        createHeroSlide.fulfilled,
        (state, action) => {
          state.createLoading = false;
          state.createSuccess = true;
          state.createError = null;

          const response = action.payload;

          const created =
            response?.heroSlide ||
            response?.data?.heroSlide ||
            response?.data ||
            response;

          if (created?._id) {
            state.heroSlides.unshift(created);
          }
        }
      )

      .addCase(
        createHeroSlide.rejected,
        (state, action) => {
          state.createLoading = false;
          state.createSuccess = false;

          state.createError =
            action.payload ||
            "Failed to create hero slide.";
        }
      )

      // ======================================================
      // UPDATE HERO SLIDE
      // ======================================================

      .addCase(
        updateHeroSlide.pending,
        (state) => {
          state.updateLoading = true;
          state.updateError = null;
          state.updateSuccess = false;
        }
      )

      .addCase(
        updateHeroSlide.fulfilled,
        (state, action) => {
          state.updateLoading = false;
          state.updateSuccess = true;
          state.updateError = null;

          const response = action.payload;

          const updated =
            response?.heroSlide ||
            response?.data?.heroSlide ||
            response?.data ||
            response;

          if (updated?._id) {
            const index =
              state.heroSlides.findIndex(
                (item) =>
                  item._id === updated._id
              );

            if (index !== -1) {
              state.heroSlides[index] =
                updated;
            }
          }

          // Keep selected hero synchronized
          if (
            state.selectedHero?._id ===
            updated?._id
          ) {
            state.selectedHero = updated;
          }
        }
      )

      .addCase(
        updateHeroSlide.rejected,
        (state, action) => {
          state.updateLoading = false;
          state.updateSuccess = false;

          state.updateError =
            action.payload ||
            "Failed to update hero slide.";
        }
      )

      // ======================================================
      // DELETE HERO SLIDE
      // ======================================================

      .addCase(
        deleteHeroSlide.pending,
        (state) => {
          state.deleteLoading = true;
          state.deleteError = null;
        }
      )

      .addCase(
        deleteHeroSlide.fulfilled,
        (state, action) => {
          state.deleteLoading = false;
          state.deleteError = null;

          const deletedId =
            action.payload?.id;

          if (deletedId) {
            state.heroSlides =
              state.heroSlides.filter(
                (item) =>
                  item._id !== deletedId
              );

            // Clear selected hero if it was deleted
            if (
              state.selectedHero?._id ===
              deletedId
            ) {
              state.selectedHero = null;
            }
          }
        }
      )

      .addCase(
        deleteHeroSlide.rejected,
        (state, action) => {
          state.deleteLoading = false;

          state.deleteError =
            action.payload ||
            "Failed to delete hero slide.";
        }
      )

      // ======================================================
      // TOGGLE HERO STATUS
      // ======================================================

      .addCase(
        toggleHeroSlideStatus.pending,
        (state) => {
          state.statusLoading = true;
          state.statusError = null;
        }
      )

      .addCase(
        toggleHeroSlideStatus.fulfilled,
        (state, action) => {
          state.statusLoading = false;
          state.statusError = null;

          const response = action.payload;

          const updated =
            response?.heroSlide ||
            response?.data?.heroSlide ||
            response?.data ||
            response;

          if (updated?._id) {
            const index =
              state.heroSlides.findIndex(
                (item) =>
                  item._id === updated._id
              );

            if (index !== -1) {
              state.heroSlides[index] =
                updated;
            }

            // Keep selected hero synchronized
            if (
              state.selectedHero?._id ===
              updated._id
            ) {
              state.selectedHero =
                updated;
            }
          }
        }
      )

      .addCase(
        toggleHeroSlideStatus.rejected,
        (state, action) => {
          state.statusLoading = false;

          state.statusError =
            action.payload ||
            "Failed to update hero status.";
        }
      );
  },
});

// ============================================================
// ACTIONS
// ============================================================

export const {
  clearHeroError,
  clearHeroSuccess,
  clearHeroStatus,
  clearSelectedHero,
  clearHeroSlides,
} = heroSlice.actions;

// ============================================================
// SELECTORS
// ============================================================

export const selectHeroSlides = (state) =>
  state.hero.heroSlides;

export const selectSelectedHero = (state) =>
  state.hero.selectedHero;

export const selectHeroLoading = (state) =>
  state.hero.loading;

export const selectHeroError = (state) =>
  state.hero.error;

export const selectHeroCreateLoading = (state) =>
  state.hero.createLoading;

export const selectHeroUpdateLoading = (state) =>
  state.hero.updateLoading;

export const selectHeroDeleteLoading = (state) =>
  state.hero.deleteLoading;

export const selectHeroStatusLoading = (state) =>
  state.hero.statusLoading;

// ============================================================
// EXPORT REDUCER
// ============================================================

export default heroSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  createReviewApi,
  getProductReviewsApi,
  getReviewByIdApi,
  updateReviewApi,
  deleteReviewApi,
} from "../../api/reviewsApi";

/*
|--------------------------------------------------------------------------
| Create Review
|--------------------------------------------------------------------------
*/

export const createReview = createAsyncThunk(
  "review/createReview",

  async ({ productId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await createReviewApi(productId, reviewData);

      console.log("CREATE REVIEW RESPONSE:", response);

      return response;
    } catch (error) {
      console.log(
        "CREATE REVIEW ERROR:",
        error.response?.data
      );

      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Failed to create review",
        }
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| Get Product Reviews
|--------------------------------------------------------------------------
*/

export const getProductReviews = createAsyncThunk(
  "review/getProductReviews",

  async (
    { productId, page = 1, limit = 10 },
    { rejectWithValue }
  ) => {
    try {
        console.log("getProductReviews running")
      const response = await getProductReviewsApi(
        productId,
        page,
        limit
      );

      console.log("GET PRODUCT REVIEWS RESPONSE:", response);

      return response;
    } catch (error) {
      console.log(
        "GET PRODUCT REVIEWS ERROR:",
        error.response?.data
      );

      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Failed to get product reviews",
        }
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| Get Review By ID
|--------------------------------------------------------------------------
*/

export const getReviewById = createAsyncThunk(
  "review/getReviewById",

  async (id, { rejectWithValue }) => {
    try {
      const response = await getReviewByIdApi(id);

      console.log("GET REVIEW RESPONSE:", response);

      return response;
    } catch (error) {
      console.log(
        "GET REVIEW ERROR:",
        error.response?.data
      );

      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Failed to get review",
        }
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| Update Review
|--------------------------------------------------------------------------
*/

export const updateReview = createAsyncThunk(
  "review/updateReview",

  async ({ id, reviewData }, { rejectWithValue }) => {
    try {
      const response = await updateReviewApi(id, reviewData);

      console.log("UPDATE REVIEW RESPONSE:", response);

      return response;
    } catch (error) {
      console.log(
        "UPDATE REVIEW ERROR:",
        error.response?.data
      );

      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Failed to update review",
        }
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| Delete Review
|--------------------------------------------------------------------------
*/

export const deleteReview = createAsyncThunk(
  "review/deleteReview",

  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteReviewApi(id);

      console.log("DELETE REVIEW RESPONSE:", response);

      return response;
    } catch (error) {
      console.log(
        "DELETE REVIEW ERROR:",
        error.response?.data
      );

      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Failed to delete review",
        }
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| Initial State
|--------------------------------------------------------------------------
*/

const initialState = {
  // Product reviews list
  reviews: [],
distribution:{},
  // Single review
  selectedReview: null,

  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  // Get reviews loading
  loading: false,

  // Create review loading
  createLoading: false,

  // Update review loading
  updateLoading: false,

  // Delete review loading
  deleteLoading: false,

  // Error
  error: null,

  // Success message
  successMessage: null,
};

/*
|--------------------------------------------------------------------------
| Review Slice
|--------------------------------------------------------------------------
*/

const reviewSlice = createSlice({
  name: "review",

  initialState,

  extraReducers: (builder) => {
    builder

      /*
      |--------------------------------------------------------------------------
      | CREATE REVIEW
      |--------------------------------------------------------------------------
      */

      .addCase(createReview.pending, (state) => {
        state.createLoading = true;

        state.error = null;

        state.successMessage = null;
      })

      .addCase(createReview.fulfilled, (state, action) => {
        state.createLoading = false;

        state.error = null;

        state.successMessage =
          action.payload?.message || "Review created successfully";
      })

      .addCase(createReview.rejected, (state, action) => {
        state.createLoading = false;

        state.error =
          action.payload || {
            success: false,
            message: "Failed to create review",
          };
      })

      /*
      |--------------------------------------------------------------------------
      | GET PRODUCT REVIEWS
      |--------------------------------------------------------------------------
      */

      .addCase(getProductReviews.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(getProductReviews.fulfilled, (state, action) => {
        state.loading = false;

        state.error = null;

        /*
         * Adjust these two fields according to
         * your actual backend response structure.
         */
        state.reviews =
          action.payload?.data?.reviews ||
          action.payload?.reviews ||
          [];
          state.distribution=action.payload?.data?.distribution

        state.pagination = {
          page:
            action.payload?.data?.page ||
            action.payload?.page ||
            1,

          limit:
            action.payload?.data?.limit ||
            action.payload?.limit ||
            10,

          total:
            action.payload?.data?.total ||
            action.payload?.total ||
            0,

          totalPages:
            action.payload?.data?.totalPages ||
            action.payload?.totalPages ||
            0,
        };
      })

      .addCase(getProductReviews.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload || {
            success: false,
            message: "Failed to get product reviews",
          };
      })

      /*
      |--------------------------------------------------------------------------
      | GET REVIEW BY ID
      |--------------------------------------------------------------------------
      */

      .addCase(getReviewById.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(getReviewById.fulfilled, (state, action) => {
        state.loading = false;

        state.error = null;

        state.selectedReview =
          action.payload?.data ||
          action.payload?.review ||
          action.payload;
      })

      .addCase(getReviewById.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload || {
            success: false,
            message: "Failed to get review",
          };
      })

      /*
      |--------------------------------------------------------------------------
      | UPDATE REVIEW
      |--------------------------------------------------------------------------
      */

      .addCase(updateReview.pending, (state) => {
        state.updateLoading = true;

        state.error = null;

        state.successMessage = null;
      })

      .addCase(updateReview.fulfilled, (state, action) => {
        state.updateLoading = false;

        state.error = null;

        state.successMessage =
          action.payload?.message ||
          "Review updated successfully";
      })

      .addCase(updateReview.rejected, (state, action) => {
        state.updateLoading = false;

        state.error =
          action.payload || {
            success: false,
            message: "Failed to update review",
          };
      })

      /*
      |--------------------------------------------------------------------------
      | DELETE REVIEW
      |--------------------------------------------------------------------------
      */

      .addCase(deleteReview.pending, (state) => {
        state.deleteLoading = true;

        state.error = null;

        state.successMessage = null;
      })

      .addCase(deleteReview.fulfilled, (state, action) => {
        state.deleteLoading = false;

        state.error = null;

        state.successMessage =
          action.payload?.message ||
          "Review deleted successfully";
      })

      .addCase(deleteReview.rejected, (state, action) => {
        state.deleteLoading = false;

        state.error =
          action.payload || {
            success: false,
            message: "Failed to delete review",
          };
      });
  },
});

export default reviewSlice.reducer;

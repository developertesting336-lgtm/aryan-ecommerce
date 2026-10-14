import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createCategoryApi,
  getCategoriesApi,
  getCategoryByIdApi,
  getRootCategoriesApi,
  getCategoryChildrenApi,
  updateCategoryApi,
  deleteCategoryApi,
  getStatsApi
} from "../../api/categoryApi";


/* =========================================================
   CREATE CATEGORY
========================================================= */

export const createCategory = createAsyncThunk(
  "category/createCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await createCategoryApi(categoryData);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to create category"
      );
    }
  }
);


/* =========================================================
   GET CATEGORIES
========================================================= */

export const getCategories = createAsyncThunk(
  "category/getCategories",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getCategoriesApi(params);

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch categories"
      );
    }
  }
);

export const getStatsData = createAsyncThunk(
  "category/getStatsData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getStatsApi();
       console.log("res stsat",response)
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch categories"
      );
    }
  }
);


/* =========================================================
   GET CATEGORY BY ID
========================================================= */

export const getCategoryById = createAsyncThunk(
  "category/getCategoryById",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await getCategoryByIdApi(categoryId);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch category"
      );
    }
  }
);


/* =========================================================
   GET ROOT CATEGORIES
========================================================= */

export const getRootCategories = createAsyncThunk(
  "category/getRootCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRootCategoriesApi();
console.log("car",response)
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch root categories"
      );
    }
  }
);


/* =========================================================
   GET CATEGORY CHILDREN
========================================================= */

export const getCategoryChildren = createAsyncThunk(
  "category/getCategoryChildren",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response =
        await getCategoryChildrenApi(categoryId);

      return {
        parentId: categoryId,
        children: response.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch child categories"
      );
    }
  }
);


/* =========================================================
   UPDATE CATEGORY
========================================================= */

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async (
    { categoryId, categoryData },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateCategoryApi(
        categoryId,
        categoryData
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update category"
      );
    }
  }
);


/* =========================================================
   DELETE CATEGORY
========================================================= */

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      await deleteCategoryApi(categoryId);

      return categoryId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to delete category"
      );
    }
  }
);


/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  categories: [],

  rootCategories: [],

  children: {},
stats:{},
  selectedCategory: null,

  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },

  loading: false,

  createLoading: false,

  updateLoading: false,

  deleteLoading: false,

  error: null,

  success: false,

  message: null,
};


/* =========================================================
   SLICE
========================================================= */

const categorySlice = createSlice({
  name: "category",

  initialState,

  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },

    clearCategoryMessage: (state) => {
      state.message = null;
    },

    clearCategorySuccess: (state) => {
      state.success = false;
    },

    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },

    resetCategoryState: () => initialState,
  },

  extraReducers: (builder) => {
    builder

      /* =====================================================
         CREATE CATEGORY
      ===================================================== */

      .addCase(createCategory.pending, (state) => {
        state.createLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(createCategory.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.message = "Category created successfully";

        state.categories.unshift(action.payload);

        // Add to root categories if no parent
        if (!action.payload.parent) {
          state.rootCategories.unshift(action.payload);
        }
      })

      .addCase(createCategory.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
        state.success = false;
      })


      /* =====================================================
         GET CATEGORIES
      ===================================================== */

      .addCase(getCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;

        state.categories = action.payload.data;

        state.pagination = action.payload.pagination;
      })

      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getStatsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getStatsData.fulfilled, (state, action) => {
        state.loading = false;

        state.stats = action.payload.stats;
          console.log("stat",action.payload)
      })

      .addCase(getStatsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      /* =====================================================
         GET CATEGORY BY ID
      ===================================================== */

      .addCase(getCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.loading = false;

        state.selectedCategory = action.payload;
      })

      .addCase(getCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      /* =====================================================
         GET ROOT CATEGORIES
      ===================================================== */

      .addCase(getRootCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getRootCategories.fulfilled, (state, action) => {
        state.loading = false;

        state.rootCategories = action.payload;
      })

      .addCase(getRootCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      /* =====================================================
         GET CHILDREN
      ===================================================== */

      .addCase(getCategoryChildren.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        getCategoryChildren.fulfilled,
        (state, action) => {
          state.loading = false;

          state.children[action.payload.parentId] =
            action.payload.children;
        }
      )

      .addCase(
        getCategoryChildren.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )


      /* =====================================================
         UPDATE CATEGORY
      ===================================================== */

      .addCase(updateCategory.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(updateCategory.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.message = "Category updated successfully";

        const updatedCategory = action.payload;

        // Update categories list
        const index = state.categories.findIndex(
          (category) =>
            category._id === updatedCategory._id
        );

        if (index !== -1) {
          state.categories[index] = updatedCategory;
        }

        // Update root categories
        const rootIndex = state.rootCategories.findIndex(
          (category) =>
            category._id === updatedCategory._id
        );

        if (updatedCategory.parent) {
          if (rootIndex !== -1) {
            state.rootCategories.splice(rootIndex, 1);
          }
        } else {
          if (rootIndex !== -1) {
            state.rootCategories[rootIndex] =
              updatedCategory;
          } else {
            state.rootCategories.unshift(
              updatedCategory
            );
          }
        }

        // Update selected category
        if (
          state.selectedCategory?._id ===
          updatedCategory._id
        ) {
          state.selectedCategory = updatedCategory;
        }
      })

      .addCase(updateCategory.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
        state.success = false;
      })


      /* =====================================================
         DELETE CATEGORY
      ===================================================== */

      .addCase(deleteCategory.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.success = true;
        state.message = "Category deleted successfully";

        const deletedId = action.payload;

        // Remove from categories
        state.categories = state.categories.filter(
          (category) => category._id !== deletedId
        );

        // Remove from roots
        state.rootCategories =
          state.rootCategories.filter(
            (category) => category._id !== deletedId
          );

        // Remove children cache
        delete state.children[deletedId];

        // Remove from parent's children
        Object.keys(state.children).forEach(
          (parentId) => {
            state.children[parentId] =
              state.children[parentId].filter(
                (category) =>
                  category._id !== deletedId
              );
          }
        );

        // Clear selected
        if (
          state.selectedCategory?._id === deletedId
        ) {
          state.selectedCategory = null;
        }
      })

      .addCase(deleteCategory.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});


/* =========================================================
   ACTIONS
========================================================= */

export const {
  clearCategoryError,
  clearCategoryMessage,
  clearCategorySuccess,
  clearSelectedCategory,
  resetCategoryState,
} = categorySlice.actions;


/* =========================================================
   SELECTORS
========================================================= */

export const selectCategories = (state) =>
  state.category.categories;

export const selectRootCategories = (state) =>
  state.category.rootCategories;

export const selectSelectedCategory = (state) =>
  state.category.selectedCategory;

export const selectCategoryChildren = (state, parentId) =>
  state.category.children[parentId] || [];

export const selectCategoryLoading = (state) =>
  state.category.loading;

export const selectCategoryError = (state) =>
  state.category.error;


/* =========================================================
   REDUCER
========================================================= */

export default categorySlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createProductApi,
  getProductsApi,
  myProductsApi,
  getRealtedProductsApi,
  getProductByIdApi,
  editProductApi,
  searchProductsApi,
} from "../../api/productApi";

const errorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

// =====================================================
// CREATE PRODUCT
// =====================================================

export const createProduct = createAsyncThunk(
  "product/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const response = await createProductApi(productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(errorMessage(error, "Failed to create product."));
    }
  }
);

// =====================================================
// GET ALL PRODUCTS
// =====================================================

export const getProducts = createAsyncThunk(
  "product/getProducts",
  async ({ page = 1, limit = 1000 } = {}, { rejectWithValue }) => {
    try {
      const response = await getProductsApi(page, limit);

      return {
        products: response.data.products,
        pagination: response.data.pagination,
      };
    } catch (error) {
      return rejectWithValue(errorMessage(error, "Failed to get products."));
    }
  }
);

// =====================================================
// GET MY PRODUCTS
// =====================================================

export const getMyProducts = createAsyncThunk(
  "product/getMyProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await myProductsApi();
      return response.data.products;
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, "Failed to get your products.")
      );
    }
  }
);

// =====================================================
// GET RELATED PRODUCTS
// =====================================================

export const getRelatedProducts = createAsyncThunk(
  "product/getRelatedProducts",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await getRealtedProductsApi(productId);
      console.log("resorelsa",response)
      return response.data?.products || [];
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, "Failed to get related products.")
      );
    }
  }
);

// =====================================================
// GET PRODUCT BY ID (or slug)
// Tolerates different response shapes from the backend
// =====================================================

export const getProductById = createAsyncThunk(
  "product/getProductById",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Product id is required.");
      }

      const response = await getProductByIdApi(id);
      const body = response.data;

      return (
        body?.data?.product ||
        body?.data ||
        body?.product ||
        body ||
        null
      );
    } catch (error) {
      return rejectWithValue(errorMessage(error, "Something went wrong"));
    }
  }
);


// =====================================================
// SEARCH PRODUCTS
// =====================================================

export const searchProducts = createAsyncThunk(
  "product/searchProducts",
  async ({ search, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await searchProductsApi(search, page, limit);

      return {
        products: response.data.product,
        pagination: response.data.pagination,
      };
    } catch (error) {
      return rejectWithValue(errorMessage(error, "Something went wrong"));
    }
  }
);

// =====================================================
// EDIT PRODUCT
// =====================================================

export const editProduct = createAsyncThunk(
  "admin/editProduct",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await editProductApi(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product"
      );
    }
  }
);

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  product: [],

  selectedProduct: null,
  selectedLoading: false,
  selectedError: null,

  relatedProducts: [],
  relatedLoading: false,

  searchedproducts: [],
  pagination: { page: 1, limit: 4, total: 0, totalPages: 0 },
  loading: false,
  error: null,

  createLoading: false,
  createError: null,
  createSuccess: false,
};

// =====================================================
// SLICE
// =====================================================

const productSlice = createSlice({
  name: "product",

  initialState,

  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
    clearCreateProductStatus: (state) => {
      state.createError = null;
      state.createSuccess = false;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
      state.selectedError = null;
    },
    updateProductRatingLocally: (state, action) => {
      const { productId, rating } = action.payload || {};
      if (!productId || !rating) return;
      if (state.selectedProduct && String(state.selectedProduct._id) === String(productId)) {
        state.selectedProduct.rating = { ...state.selectedProduct.rating, ...rating };
      }
      const idx = state.product.findIndex((p) => String(p._id) === String(productId));
      if (idx !== -1) {
        state.product[idx].rating = { ...state.product[idx].rating, ...rating };
      }
    },
  },

  extraReducers: (builder) => {
    builder

      // ---------------- CREATE PRODUCT ----------------
      .addCase(createProduct.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createError = null;
        state.createSuccess = true;

        const createdProduct = action.payload?.product || action.payload;

        if (
          createdProduct &&
          typeof createdProduct === "object" &&
          createdProduct._id
        ) {
          state.product.unshift(createdProduct);
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Failed to create product.";
        state.createSuccess = false;
      })

      // ---------------- GET PRODUCTS ----------------
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.product = action.payload.products || [];
        state.pagination = action.payload.pagination || {};
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to get products.";
      })

      // ---------------- GET MY PRODUCTS ----------------
      .addCase(getMyProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.product = action.payload || [];
      })
      .addCase(getMyProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to get your products.";
      })

      // ---------------- RELATED PRODUCTS ----------------
      .addCase(getRelatedProducts.pending, (state) => {
        state.relatedLoading = true;
        state.relatedProducts = [];
      })
      .addCase(getRelatedProducts.fulfilled, (state, action) => {
        state.relatedLoading = false;
        state.relatedProducts = action.payload || [];
      })
      .addCase(getRelatedProducts.rejected, (state) => {
        state.relatedLoading = false;
        state.relatedProducts = [];
      })

      // ---------------- GET PRODUCT BY ID ----------------
      .addCase(getProductById.pending, (state) => {
        state.selectedLoading = true;
        state.selectedError = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.selectedLoading = false;
        state.selectedError = null;
        state.selectedProduct = action.payload || null;
        if (action.payload?._id && Array.isArray(state.product)) {
          const index = state.product.findIndex(
            (p) => String(p._id) === String(action.payload._id)
          );
          if (index !== -1) {
            state.product[index] = { ...state.product[index], ...action.payload };
          }
        }
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.selectedLoading = false;
        state.selectedProduct = null;
        state.selectedError = action.payload || "Failed to load product.";
      })
     
      // ---------------- EDIT PRODUCT ----------------
      .addCase(editProduct.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createError = null;

        const editedProduct = action.payload?.product || action.payload;

        if (
          editedProduct &&
          typeof editedProduct === "object" &&
          editedProduct._id
        ) {
          // Replace the item inside the array (never overwrite the array itself)
          const index = state.product.findIndex(
            (p) => p._id === editedProduct._id
          );
          if (index !== -1) {
            state.product[index] = editedProduct;
          }

          if (state.selectedProduct?._id === editedProduct._id) {
            state.selectedProduct = editedProduct;
          }
        }
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Failed to update product.";
      })

      // ---------------- SEARCH PRODUCTS ----------------
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.searchedproducts = action.payload.products || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to search products.";
        state.searchedproducts = [];
      });
  },
});

// =====================================================
// ACTIONS
// =====================================================

export const {
  clearProductError,
  clearCreateProductStatus,
  clearSelectedProduct,
  updateProductRatingLocally,
} = productSlice.actions;

// =====================================================
// REDUCER
// =====================================================

export default productSlice.reducer;
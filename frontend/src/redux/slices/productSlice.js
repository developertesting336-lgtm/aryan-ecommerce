import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createProductApi,
  getProductsApi,
  myProductsApi,
  getRealtedProductsApi,
  getProductByIdApi,
  editProductApi,
  searchProductsApi
} from "../../api/productApi";

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
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to create product."
      );
    }
  }
);

// =====================================================
// GET ALL PRODUCTS
// =====================================================

export const getProducts = createAsyncThunk(
  "product/getProducts",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await getProductsApi(page,limit);
console.log("res pro",response)
      // return response.data.products;
      return{
        products:response.data.products,
        pagination:response.data.pagination
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to get products."
      );
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
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to get your products."
      );
    }
  }
);
export const getRelatedProducts = createAsyncThunk(
  "product/getRealtedProducts",
  async (product, { rejectWithValue }) => {
    try {
      console.log("res related")
      const response = await getRealtedProductsApi(product);
     console.log("getproduct",response)
      return response.data?.products;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to get your products."
      );
    }
  }
);

export const getProductById = createAsyncThunk(
  "product/getProductById",
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

export const searchProducts = createAsyncThunk(
  "product/searchProducts",
  async ({ search, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await searchProductsApi(search,page,limit);
      console.log("search pro",response)
    //  return response.data?.product || [];
      return{
        products:response.data.product,
        pagination:response.data.pagination
      }

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
     const response = await editProductApi(id, data);
      return response.data; 
    } catch (error) {
       return rejectWithValue( error.response?.data?.message || "Failed to update product" ); } } );
// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  product: [],
relatedProducts:[],
pagination: {
    page: 1,
    limit: 4,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,

  // Create product states
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
  },

  extraReducers: (builder) => {
    builder

      // =================================================
      // CREATE PRODUCT
      // =================================================

      .addCase(createProduct.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })

      .addCase(createProduct.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createError = null;
        state.createSuccess = true;

        /*
          Depending on your backend response:

          {
            product: {...}
          }

          OR

          {
            _id: "...",
            name: "..."
          }
        */

        const createdProduct =
          action.payload?.product || action.payload;

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
        state.createError =
          action.payload || "Failed to create product.";
        state.createSuccess = false;
      })

      // =================================================
      // GET PRODUCTS
      // =================================================

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
        state.error =
          action.payload || "Failed to get products.";
      })

      // =================================================
      // GET MY PRODUCTS
      // =================================================

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
        state.error =
          action.payload || "Failed to get your products.";
      })
      .addCase(getRelatedProducts.pending, (state) => {
        state.loading = true;
        state.relatedProducts = [];
        state.error = null;
      })

      .addCase(getRelatedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.relatedProducts = action.payload || [];
      })

      .addCase(getRelatedProducts.rejected, (state, action) => {
        state.loading = false;
        state.relatedProducts = [];
        state.error =
          action.payload || "Failed to get your products.";
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

                     .addCase(editProduct.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        // state.createSuccess = false;
      })

      .addCase(editProduct.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createError = null;
        // state.createSuccess = true;

        /*
          Depending on your backend response:

          {
            product: {...}
          }

          OR

          {
            _id: "...",
            name: "..."
          }
        */

        const editedProduct =
          action.payload?.product || action.payload;

        if (
          editedProduct &&
          typeof editedProduct === "object" &&
          editedProduct._id
        ) {
          state.product.unshift(editedProduct);
        }
      })

      .addCase(editProduct.rejected, (state, action) => {
        state.createLoading = false;
        state.createError =
          action.payload || "Failed to create product.";
        // state.createSuccess = false;
      })

     .addCase(searchProducts.pending, (state) => {
  state.loading = true;
  state.error = null;
})

.addCase(searchProducts.fulfilled, (state, action) => {
  state.loading = false;
  state.error = null;

   state.product = action.payload.products || [];
 state.pagination = action.payload.pagination;
  console.log("searched products:", action.payload);
})

.addCase(searchProducts.rejected, (state, action) => {
  state.loading = false;

  state.error =
    action.payload || "Failed to search products.";

  state.product = [];
});

  },
});

// =====================================================
// ACTIONS
// =====================================================

export const {
  clearProductError,
  clearCreateProductStatus,
} = productSlice.actions;

// =====================================================
// REDUCER
// =====================================================

export default productSlice.reducer;
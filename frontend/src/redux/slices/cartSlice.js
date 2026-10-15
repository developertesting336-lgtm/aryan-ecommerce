import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addProductApi,getCartApi,decreaseQuantityApi
} from "../../api/cartApi";


// Register User
export const addProduct = createAsyncThunk(
  "cart/addProduct",
  async (cartData, { rejectWithValue }) => {
    try {
        console.log("createcart")
      const response = await addProductApi(cartData);
      console.log("cartdata",response.data)
      // return response.data.cart;
             return {
        cart: response.data.cart,
        message: response.message,
      };

    } catch (error) {
      return rejectWithValue(
        error.response.data?.message
      );
    }
  }
);


export const getCart = createAsyncThunk(
   "cart/getcart",
  async (_, { rejectWithValue }) => {
    try {
      console.log("getcart")
      const response = await getCartApi();
console.log("carta",response?.data?.cart)


      return response.data.cart;

    } catch (error) {
      return rejectWithValue(
      error.response?.data?.message || "Login failed"
      );
    }
  }
);

export const decreaseQuantity = createAsyncThunk(
  "cart/decreaseQuantity",

  async (productId, { rejectWithValue }) => {
    try {
      console.log("decreaseQuantityApi");

      const response = await decreaseQuantityApi(productId);

      console.log("quantity response:", response);

      return {
        cart: response.data.cart,
        message: response.message,
      };

    } catch (error) {
      console.error("API decrease error:", error);

      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to decrease quantity"
      );
    }
  }
);





const getInitialGuestItems = () => {
  if (typeof window === "undefined") return [];
  try {
    const token = localStorage.getItem("token");
    if (token) return [];
    const guestData = localStorage.getItem("guestCart");
    if (guestData) {
      const parsed = JSON.parse(guestData);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => {
          const pid = String(item.productId || item._id);
          const qty = Math.max(1, Number(item.quantity) || 1);
          const pr = Number(item.price ?? item.product?.price ?? 0);
          const nm = item.name || item.product?.name || "Product";
          const img = item.image || item.product?.images?.[0] || item.product?.image || "";
          const sl = item.slug || item.product?.slug || "";
          return {
            productId: pid,
            quantity: qty,
            name: nm,
            price: pr,
            image: img,
            slug: sl,
            product: {
              _id: pid,
              name: nm,
              price: pr,
              images: img ? [img] : [],
              slug: sl,
            },
          };
        });
      }
    }
  } catch {
    // ignore
  }
  return [];
};

const initialItems = getInitialGuestItems();
const initialTotal = initialItems.reduce(
  (sum, it) => sum + (Number(it.price || it.product?.price || 0) * (Number(it.quantity) || 1)),
  0
);

const cartSlice = createSlice({
  name: "cart",

  initialState: {
    cart: {
      items: initialItems,
      totalPrice: initialTotal,
    },
    loading: false,
    error: null,
  },

  reducers: {
    addToGuestCart: (state, action) => {
      const {
        productId,
        quantity = 1,
        name = "Product",
        price = 0,
        image = "",
        slug = "",
      } = action.payload || {};
      if (!productId) return;

      const requestedQty = Math.max(1, Number(quantity) || 1);
      const parsedPrice = Number(price) || 0;
      const items = Array.isArray(state.cart?.items) ? [...state.cart.items] : [];
      const index = items.findIndex(
        (item) => String(item.productId || item._id || item.product?._id) === String(productId)
      );

      if (index > -1) {
        const existing = items[index];
        const newQty = (Number(existing.quantity) || 1) + requestedQty;
        const itemPrice = parsedPrice > 0 ? parsedPrice : Number(existing.price || existing.product?.price || 0);
        const itemName = (name && name !== "Product") ? name : (existing.name || existing.product?.name || "Product");
        const itemImage = image || existing.image || existing.product?.images?.[0] || "";
        const itemSlug = slug || existing.slug || existing.product?.slug || "";

        items[index] = {
          ...existing,
          productId: String(productId),
          quantity: newQty,
          name: itemName,
          price: itemPrice,
          image: itemImage,
          slug: itemSlug,
          product: {
            _id: String(productId),
            name: itemName,
            price: itemPrice,
            images: itemImage ? [itemImage] : (existing.product?.images || []),
            slug: itemSlug,
          },
        };
      } else {
        items.push({
          productId: String(productId),
          quantity: requestedQty,
          name: name || "Product",
          price: parsedPrice,
          image: image || "",
          slug: slug || "",
          product: {
            _id: String(productId),
            name: name || "Product",
            price: parsedPrice,
            images: image ? [image] : [],
            slug: slug || "",
          },
        });
      }

      const totalPrice = items.reduce(
        (sum, it) => sum + (Number(it.price || it.product?.price || 0) * (Number(it.quantity) || 1)),
        0
      );

      state.cart = {
        ...state.cart,
        items,
        totalPrice,
      };

      try {
        localStorage.setItem(
          "guestCart",
          JSON.stringify(
            items.map((it) => ({
              productId: String(it.productId || it._id || it.product?._id),
              quantity: Number(it.quantity) || 1,
              name: it.name || it.product?.name || "Product",
              price: Number(it.price ?? it.product?.price ?? 0),
              image: it.image || it.product?.images?.[0] || "",
              slug: it.slug || it.product?.slug || "",
            }))
          )
        );
      } catch (err) {
        console.error("Error saving guestCart to localStorage:", err);
      }
    },

    decreaseGuestCartQuantity: (state, action) => {
      const productId = action.payload;
      if (!productId) return;

      let items = Array.isArray(state.cart?.items) ? [...state.cart.items] : [];
      const index = items.findIndex(
        (item) => String(item.productId || item._id || item.product?._id) === String(productId)
      );

      if (index > -1) {
        const currentQty = Number(items[index].quantity) || 1;
        if (currentQty > 1) {
          items[index] = {
            ...items[index],
            quantity: currentQty - 1,
          };
        } else {
          items.splice(index, 1);
        }
      }

      const totalPrice = items.reduce(
        (sum, it) => sum + (Number(it.price || it.product?.price || 0) * (Number(it.quantity) || 1)),
        0
      );

      state.cart = {
        ...state.cart,
        items,
        totalPrice,
      };

      try {
        if (items.length === 0) {
          localStorage.removeItem("guestCart");
        } else {
          localStorage.setItem(
            "guestCart",
            JSON.stringify(
              items.map((it) => ({
                productId: String(it.productId || it._id || it.product?._id),
                quantity: Number(it.quantity) || 1,
                name: it.name || it.product?.name || "Product",
                price: Number(it.price ?? it.product?.price ?? 0),
                image: it.image || it.product?.images?.[0] || "",
                slug: it.slug || it.product?.slug || "",
              }))
            )
          );
        }
      } catch (err) {
        console.error("Error updating guestCart in localStorage:", err);
      }
    },

    syncGuestCart: (state, action) => {
      const newItems = action.payload || getInitialGuestItems();
      const totalPrice = newItems.reduce(
        (sum, it) => sum + (Number(it.price || it.product?.price || 0) * (Number(it.quantity) || 1)),
        0
      );
      state.cart = {
        ...state.cart,
        items: newItems,
        totalPrice,
      };
    },

    clearGuestCart: (state) => {
      state.cart = {
        items: [],
        totalPrice: 0,
      };
      try {
        localStorage.removeItem("guestCart");
      } catch (err) {
        console.error("Error clearing guestCart:", err);
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // Register
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
      })

      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
      })

      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getCart.pending, (state) => {
        state.loading = true;
      })

      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })

      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(decreaseQuantity.pending, (state) => {
        state.loading = true;
      })

      .addCase(decreaseQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
      })

      .addCase(decreaseQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addToGuestCart, decreaseGuestCartQuantity, syncGuestCart, clearGuestCart } = cartSlice.actions;

export default cartSlice.reducer;
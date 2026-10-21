import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addProductApi, getCartApi, decreaseQuantityApi } from "../../api/cartApi";

/* ======================= THUNKS ======================= */

export const addProduct = createAsyncThunk(
  "cart/addProduct",
  async (cartData, { rejectWithValue }) => {
    try {
      const response = await addProductApi(cartData);
      return {
        cart: response.data.cart,
        message: response.data?.message || response.message,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to add product"
      );
    }
  }
);

export const getCart = createAsyncThunk(
  "cart/getcart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCartApi();
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to load cart"
      );
    }
  }
);

export const decreaseQuantity = createAsyncThunk(
  "cart/decreaseQuantity",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await decreaseQuantityApi(productId);
      return {
        cart: response.data.cart,
        message: response.data?.message || response.message,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to decrease quantity"
      );
    }
  }
);

/* ======================= HELPERS ======================= */

const getItemId = (item) => {
  const id =
    item?.productId?._id ||
    item?.productId ||
    item?.product?._id ||
    item?._id;
  return id ? String(id) : "";
};

const calcTotal = (items) =>
  items.reduce(
    (sum, it) =>
      sum +
      Number(it.price ?? it.product?.price ?? 0) * (Number(it.quantity) || 1),
    0
  );

// Makes sure state.cart.items always exists so reducers never crash
const ensureCart = (state) => {
  if (!state.cart || typeof state.cart !== "object") {
    state.cart = { items: [], totalPrice: 0 };
  }
  if (!Array.isArray(state.cart.items)) {
    state.cart.items = [];
  }
};

const saveGuestCart = (items) => {
  try {
    if (items.length === 0) {
      localStorage.removeItem("guestCart");
      return;
    }
    localStorage.setItem(
      "guestCart",
      JSON.stringify(
        items.map((it) => ({
          productId: getItemId(it),
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
};

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
          const img =
            item.image || item.product?.images?.[0] || item.product?.image || "";
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

/* ======================= SLICE ======================= */

const cartSlice = createSlice({
  name: "cart",

  initialState: {
    cart: { items: initialItems, totalPrice: calcTotal(initialItems) },
    loading: false,
    error: null,
    // Number of optimistic add/decrease requests that are still in flight.
    // Server snapshots are ignored until this is back to 0.
    pendingMutations: 0,
  },

  reducers: {
    /* ---------- Guest cart ---------- */
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

      ensureCart(state);

      const requestedQty = Math.max(1, Number(quantity) || 1);
      const parsedPrice = Number(price) || 0;
      const items = [...state.cart.items];
      const id = String(productId);
      const index = items.findIndex((item) => getItemId(item) === id);

      if (index > -1) {
        const existing = items[index];
        const newQty = (Number(existing.quantity) || 1) + requestedQty;
        const itemPrice =
          parsedPrice > 0
            ? parsedPrice
            : Number(existing.price || existing.product?.price || 0);
        const itemName =
          name && name !== "Product"
            ? name
            : existing.name || existing.product?.name || "Product";
        const itemImage =
          image || existing.image || existing.product?.images?.[0] || "";
        const itemSlug = slug || existing.slug || existing.product?.slug || "";

        items[index] = {
          ...existing,
          productId: id,
          quantity: newQty,
          name: itemName,
          price: itemPrice,
          image: itemImage,
          slug: itemSlug,
          product: {
            _id: id,
            name: itemName,
            price: itemPrice,
            images: itemImage ? [itemImage] : existing.product?.images || [],
            slug: itemSlug,
          },
        };
      } else {
        items.push({
          productId: id,
          quantity: requestedQty,
          name: name || "Product",
          price: parsedPrice,
          image: image || "",
          slug: slug || "",
          product: {
            _id: id,
            name: name || "Product",
            price: parsedPrice,
            images: image ? [image] : [],
            slug: slug || "",
          },
        });
      }

      state.cart = { ...state.cart, items, totalPrice: calcTotal(items) };
      saveGuestCart(items);
    },

    decreaseGuestCartQuantity: (state, action) => {
      const productId = action.payload;
      if (!productId) return;

      ensureCart(state);

      const items = [...state.cart.items];
      const index = items.findIndex(
        (item) => getItemId(item) === String(productId)
      );

      if (index > -1) {
        const currentQty = Number(items[index].quantity) || 1;
        if (currentQty > 1) {
          items[index] = { ...items[index], quantity: currentQty - 1 };
        } else {
          items.splice(index, 1);
        }
      }

      state.cart = { ...state.cart, items, totalPrice: calcTotal(items) };
      saveGuestCart(items);
    },

    syncGuestCart: (state, action) => {
      const newItems = action.payload || getInitialGuestItems();
      state.cart = {
        ...state.cart,
        items: newItems,
        totalPrice: calcTotal(newItems),
      };
    },

    clearGuestCart: (state) => {
      state.cart = { items: [], totalPrice: 0 };
      try {
        localStorage.removeItem("guestCart");
      } catch (err) {
        console.error("Error clearing guestCart:", err);
      }
    },

    /* ---------- Optimistic updates (logged-in users) ---------- */
    optimisticAddProduct: (state, action) => {
      // Always count the mutation: the matching thunk is always dispatched.
      state.pendingMutations += 1;

      const {
        productId,
        quantity = 1,
        name = "Product",
        price = 0,
        image = "",
        slug = "",
      } = action.payload || {};
      if (!productId) return;

      ensureCart(state);

      const items = state.cart.items;
      const id = String(productId);
      const qty = Number(quantity) || 1;
      const index = items.findIndex((item) => getItemId(item) === id);

      if (index >= 0) {
        items[index].quantity = (Number(items[index].quantity) || 1) + qty;
      } else {
        items.push({
          productId: id,
          quantity: qty,
          name,
          price: Number(price) || 0,
          image,
          slug,
          product: {
            _id: id,
            name,
            price: Number(price) || 0,
            images: image ? [image] : [],
            slug,
          },
        });
      }

      state.cart.totalPrice = calcTotal(items);
    },

    optimisticDecreaseQuantity: (state, action) => {
      // Always count the mutation: the matching thunk is always dispatched.
      state.pendingMutations += 1;

      ensureCart(state);

      const productId = String(action.payload);
      const items = state.cart.items;
      const index = items.findIndex((item) => getItemId(item) === productId);

      if (index === -1) return;

      const currentQty = Number(items[index].quantity) || 1;
      if (currentQty > 1) {
        items[index].quantity = currentQty - 1;
      } else {
        items.splice(index, 1);
      }

      state.cart.totalPrice = calcTotal(items);
    },
  },

  extraReducers: (builder) => {
    builder
      /* ---------- addProduct ---------- */
      .addCase(addProduct.pending, (state) => {
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.pendingMutations = Math.max(0, state.pendingMutations - 1);
        // Only the LAST response replaces the cart, so older snapshots
        // can never bring removed products back.
        if (state.pendingMutations === 0 && action.payload?.cart) {
          state.cart = action.payload.cart;
        }
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.pendingMutations = Math.max(0, state.pendingMutations - 1);
        state.error = action.payload;
      })

      /* ---------- decreaseQuantity ---------- */
      .addCase(decreaseQuantity.pending, (state) => {
        state.error = null;
      })
      .addCase(decreaseQuantity.fulfilled, (state, action) => {
        state.pendingMutations = Math.max(0, state.pendingMutations - 1);
        if (state.pendingMutations === 0 && action.payload?.cart) {
          state.cart = action.payload.cart;
        }
      })
      .addCase(decreaseQuantity.rejected, (state, action) => {
        state.pendingMutations = Math.max(0, state.pendingMutations - 1);
        state.error = action.payload;
      })

      /* ---------- getCart ---------- */
      .addCase(getCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        // Don't overwrite the UI while clicks are still in flight
        if (state.pendingMutations === 0) {
          state.cart = action.payload || { items: [], totalPrice: 0 };
        }
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addToGuestCart,
  decreaseGuestCartQuantity,
  syncGuestCart,
  clearGuestCart,
  optimisticAddProduct,
  optimisticDecreaseQuantity,
} = cartSlice.actions;

export default cartSlice.reducer;
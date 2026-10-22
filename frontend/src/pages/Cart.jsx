import React, { useMemo, useEffect, useRef } from "react";
import {
  addProduct,
  decreaseQuantity,
  getCart,
  addToGuestCart,
  decreaseGuestCartQuantity,
  optimisticAddProduct,
  optimisticDecreaseQuantity,
} from "../redux/slices/cartSlice";
import { enrichGuestCart } from "../utils/guestCart";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { showError } from "../utils/toast";
import { getProductSlug } from "../utils/productSlug";
import CartRecommendedProducts from "../components/products/CartRecommendedproducts ";
export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const BASE_URL = "http://localhost:3000/uploads/";

  const getImageUrl = (image) => {
    if (!image) {
      return "/1786052049893.webp";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("blob:")
    ) {
      return image;
    }

    if (image.startsWith("/uploads/")) {
      return `http://localhost:3000${image}`;
    }

    if (image.startsWith("uploads/")) {
      return `http://localhost:3000/${image}`;
    }

    return `${BASE_URL}${image}`;
  };

  const { cart } = useSelector((state) => state.cart);
  const { user, token } = useSelector((state) => state.auth);
  const isLoggedIn = Boolean(token || user);

  /* ---------- Request queue ----------
     Server calls run strictly one after another, in click order.
     The UI itself updates instantly through the optimistic reducers. */
  const queueRef = useRef(Promise.resolve());

  const enqueue = (task) => {
    queueRef.current = queueRef.current.then(task).catch(() => {});
    return queueRef.current;
  };

  useEffect(() => {
    if (!isLoggedIn) {
      enrichGuestCart(dispatch);
    }
  }, [isLoggedIn, dispatch]);

  const getProductPrice = (item) => {
    const val = item?.price ?? item?.product?.price ?? 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  const getProductName = (item) => {
    return item?.product?.name || item?.name || "Product";
  };

  const getProductImage = (item) => {
    const img =
      item?.product?.images?.[0] || item?.image || item?.product?.image;
    return getImageUrl(img);
  };

  // Handles both a plain id and a populated productId object from the backend
  const getProductId = (item) => {
    const id =
      item?.productId?._id ||
      item?.productId ||
      item?.product?._id ||
      item?._id;
    return id ? String(id) : "";
  };

  const getProductSlugPath = (item) => {
    const slug =
      getProductSlug(item?.product) ||
      item?.slug ||
      item?.product?.slug ||
      getProductId(item) ||
      "";
    return `/product/${slug}`;
  };

  /* ---------- Increase quantity ---------- */
  const handleAddCart = (item) => {
    const pid = getProductId(item);
    const itemPrice = getProductPrice(item);

    if (!pid) return;

    const payload = {
      productId: pid,
      quantity: 1,
      name: getProductName(item),
      price: itemPrice,
      image: item?.image || item?.product?.images?.[0] || "",
      slug: item?.slug || item?.product?.slug || "",
    };

    if (!isLoggedIn) {
      dispatch(addToGuestCart(payload));
      return;
    }

    // 1) Instant UI update
    dispatch(optimisticAddProduct(payload));

    // 2) Server call, in order
    enqueue(async () => {
      try {
        await dispatch(
          addProduct({ productId: pid, price: itemPrice, quantity: 1 })
        ).unwrap();
      } catch (err) {
        showError(
          typeof err === "string"
            ? err
            : err?.message || "Failed to increase quantity"
        );
        dispatch(getCart()); // restore real data from the server
      }
    });
  };

  /* ---------- Decrease quantity / remove ---------- */
  const handleQuantity = (item) => {
    const pid = getProductId(item);

    if (!pid) return;

    if (!isLoggedIn) {
      dispatch(decreaseGuestCartQuantity(pid));
      return;
    }

    // 1) Instant UI update
    dispatch(optimisticDecreaseQuantity(pid));

    // 2) Server call, in order
    enqueue(async () => {
      try {
        await dispatch(decreaseQuantity(pid)).unwrap();
      } catch (err) {
        showError(
          typeof err === "string"
            ? err
            : err?.message || "Failed to decrease quantity"
        );
        dispatch(getCart()); // restore real data from the server
      }
    });
  };

  const handleBuyThis = (item) => {
    const pid = getProductId(item);
    navigate(`/checkout?productId=${pid}&quantity=${item?.quantity || 1}`);
  };

  const totalCartPrice = useMemo(() => {
    if (Array.isArray(cart?.items) && cart.items.length > 0) {
      return cart.items.reduce((sum, item) => {
        return sum + getProductPrice(item) * (Number(item?.quantity) || 1);
      }, 0);
    }
    return 0;
  }, [cart?.items]);

  // Cart is empty if cart doesn't exist OR items array is empty
  const isCartEmpty = !cart?.items?.length;
const cartProductIds = useMemo(
  () => (cart?.items || []).map((item) => getProductId(item)).filter(Boolean),
  [cart?.items]
);
  return (
    <div className="bg-gray-50 dark:bg-gray-950 dark:text-gray-100 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6 sm:mb-8">
          Shopping Cart
        </h1>

        {/* ================= EMPTY CART ================= */}
        {isCartEmpty ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-transparent dark:border-gray-800 p-10 sm:p-16 text-center">
            <div className="text-6xl mb-5">🛒 </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-3">
              Your cart is empty
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>

            <button
              onClick={() => navigate("/")}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-medium cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* ================= CART WITH PRODUCTS ================= */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* ================= CART ITEMS ================= */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item, index) => (
                <div
                  key={getProductId(item) || index}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-transparent dark:border-gray-800 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5"
                >
                  {/* Product Image */}
                  <Link
                    to={getProductSlugPath(item)}
                    state={{ productId: getProductId(item) }}
                    className="shrink-0 flex items-center justify-center rounded-xl bg-white p-1.5 border border-gray-100 dark:border-gray-800"
                  >
                    <img
                      src={getProductImage(item)}
                      alt={getProductName(item)}
                      className="w-full sm:w-28 md:w-32 h-52 sm:h-28 md:h-32 object-contain rounded-lg cursor-pointer hover:opacity-90 transition"
                    />
                  </Link>

                  {/* Product Information */}
                  <div className="flex-1">
                    <Link
                      to={getProductSlugPath(item)}
                      state={{ productId: getProductId(item) }}
                    >
                      <h2 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer">
                        {getProductName(item)}
                      </h2>
                    </Link>

                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base">
                      Price: ₹{getProductPrice(item)}
                    </p>

                    {/* Quantity */}
                    <div className="flex items-center gap-4 mt-4">
                      <button
                        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 dark:text-white cursor-pointer"
                        onClick={() => handleQuantity(item)}
                      >
                        -
                      </button>

                      <span className="font-semibold text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>

                      <button
                        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 dark:text-white cursor-pointer"
                        onClick={() => handleAddCart(item)}
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium cursor-pointer"
                        onClick={() => handleBuyThis(item)}
                      >
                        Buy This
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="font-bold text-lg sm:text-xl text-gray-800 dark:text-white sm:self-center">
                    ₹{getProductPrice(item) * (Number(item.quantity) || 1)}
                  </div>
                </div>
              ))}
            </div>

            {/* ================= ORDER SUMMARY ================= */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-transparent dark:border-gray-800 p-5 sm:p-6 h-fit lg:sticky lg:top-5">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-5">
                Order Summary
              </h2>

              <div className="flex justify-between mb-3 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                <span>Items</span>
                <span>{cart.items.length}</span>
              </div>

              <div className="flex justify-between text-lg sm:text-xl font-bold border-t border-gray-100 dark:border-gray-800 pt-5 text-gray-900 dark:text-white">
                <span>Total</span>
                <span>₹{totalCartPrice}</span>
              </div>

              <button
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition text-sm sm:text-base cursor-pointer"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
        <CartRecommendedProducts cartProductIds={cartProductIds} />
      </main>
    </div>
  );
}
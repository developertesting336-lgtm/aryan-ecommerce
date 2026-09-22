import React from "react";
import Navbar from "../components/Header";
import { addProduct, decreaseQuantity } from "../redux/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const BASE_URL = "http://localhost:3000/uploads/";

  const { loading, error, cart } = useSelector((state) => state.cart);

 const handleAddCart = async (item) => {
  try {
    console.log("carthand");

    const result = await dispatch(
      addProduct({
        productId: item.product._id,
        price: item.price,
      })
    ).unwrap();

    console.log("add cart:", result);

    showSuccess(
      result.message || "Product added to cart"
    );

  } catch (error) {
    console.error("Add cart error:", error);

    showError(
      typeof error === "string"
        ? error
        : error?.message || "Failed to add product"
    );
  }
};


const handleQuantity = async (productId) => {
  try {
    console.log("quamt", productId);

    const result = await dispatch(
      decreaseQuantity(productId)
    ).unwrap();

    console.log("decrease result:", result);

    showSuccess(
      result.message || "Quantity decreased successfully"
    );

  } catch (error) {
    console.error("Decrease error:", error);

    showError(
      typeof error === "string"
        ? error
        : error?.message || "Failed to decrease quantity"
    );
  }
};


const handleBuyThis = (item) => {
  navigate(
    `/checkout?productId=${item.product._id}&quantity=${item.quantity}`
  );
};

  // Cart is empty if cart doesn't exist OR items array is empty
  const isCartEmpty = !cart?.items?.length;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* <Navbar /> */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">
          Shopping Cart
        </h1>

        {/* ================= EMPTY CART ================= */}
        {isCartEmpty ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 sm:p-16 text-center">
            <div className="text-6xl mb-5">🛒 </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              Your cart is empty
            </h2>

            <p className="text-gray-500 mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>

            <button
              onClick={() => navigate("/")}
              className="
                inline-block
                bg-blue-600
                text-white
                px-6
                py-3
                rounded-xl
                hover:bg-blue-700
                transition
                font-medium
              "
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
                  key={index}
                  className="
                    bg-white
                    rounded-2xl
                    shadow-sm
                    p-4 sm:p-5
                    flex
                    flex-col
                    sm:flex-row
                    gap-4
                    sm:gap-5
                  "
                >
                  {/* Product Image */}
                  <img
                    src={
                      item?.product?.images?.length
                        ? `${BASE_URL}${item.product.images[0]}`
                        : "/1786052049893.webp"
                    }
                    alt={item?.product?.name || "Product"}
                    className="
                      w-full
                      sm:w-28
                      md:w-32
                      h-52
                      sm:h-28
                      md:h-32
                      object-cover
                      rounded-xl
                    "
                  />

                  {/* Product Information */}
                  <div className="flex-1">
                    <h2
                      className="
                        font-semibold
                        text-base
                        sm:text-lg
                        text-gray-800
                      "
                    >
                      {item?.product?.name}
                    </h2>

                    <p className="text-gray-500 mt-2 text-sm sm:text-base">
                      Price: ₹{item?.price}
                    </p>

                    {/* Quantity */}
                    <div className="flex items-center gap-4 mt-4">
                      <button
                        className="
                          w-8 h-8
                          rounded-full
                          bg-gray-200
                          hover:bg-gray-300
                        "
                        onClick={() =>
                          handleQuantity(item?.product?._id)
                        }
                      >
                        -
                      </button>

                      <span className="font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        className="
                          w-8 h-8
                          rounded-full
                          bg-gray-200
                          hover:bg-gray-300
                        "
                        onClick={() => handleAddCart(item)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div
                    className="
                      font-bold
                      text-lg
                      sm:text-xl
                      text-gray-800
                      sm:self-center
                    "
                  >
                    ₹{item.price * item.quantity}
                  </div>
                  <div className="flex items-center gap-3 mt-4">
  <button
    className="
      px-4 py-2
      bg-blue-600
      text-white
      rounded-xl
      hover:bg-blue-700
      transition
      text-sm
      font-medium
    "
    onClick={() => handleBuyThis(item)}
  >
    Buy This
  </button>
</div>
                </div>
              ))}
            </div>

            {/* ================= ORDER SUMMARY ================= */}
            <div
              className="
                bg-white
                rounded-2xl
                shadow-sm
                p-5 sm:p-6
                h-fit
                lg:sticky
                lg:top-5
              "
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-5">
                Order Summary
              </h2>

              <div
                className="
                  flex
                  justify-between
                  mb-3
                  text-gray-600
                  text-sm
                  sm:text-base
                "
              >
                <span>Items</span>

                <span>{cart.items.length}</span>
              </div>

              <div
                className="
                  flex
                  justify-between
                  text-lg
                  sm:text-xl
                  font-bold
                  border-t
                  pt-5
                "
              >
                <span>Total</span>

                <span>₹{cart.totalPrice}</span>
              </div>

              <button
                className="
                  w-full
                  mt-6
                  bg-blue-600
                  text-white
                  py-3
                  rounded-xl
                  hover:bg-blue-700
                  transition
                  text-sm
                  sm:text-base
                  cursor-pointer
                "
                onClick={()=>navigate("/checkout")}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
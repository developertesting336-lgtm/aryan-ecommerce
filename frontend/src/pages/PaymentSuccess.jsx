import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  ShoppingBag,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getCart } from "../redux/slices/cartSlice";
import { verifyPaymentApi } from "../api/paymentApi";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const confirmPaymentAndRefreshCart = async () => {
      if (sessionId) {
        try {
          setLoading(true);
          const res = await verifyPaymentApi(sessionId);
          if (isMounted) {
            if (res.data?.success && res.data?.order) {
              setOrder(res.data.order);
            }
          }
        } catch (err) {
          console.error("Payment verification error:", err);
          if (isMounted) {
            setError(
              err?.response?.data?.message ||
                err?.message ||
                "Failed to verify payment"
            );
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      }

      // Always refetch cart from API after successful payment
      try {
        await dispatch(getCart());
      } catch (cartErr) {
        console.error("Error refreshing cart:", cartErr);
      }
    };

    confirmPaymentAndRefreshCart();

    return () => {
      isMounted = false;
    };
  }, [sessionId, dispatch]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex items-center justify-center px-4 py-10 transition-colors duration-300">
        <div className="w-full max-w-lg">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-10 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Verifying your payment...
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Please wait while we confirm your transaction.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex items-center justify-center px-4 py-10 transition-colors duration-300">
        <div className="w-full max-w-lg">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 flex items-center justify-center mb-4">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Payment Verification Failed
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{error}</p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
              >
                Go to My Orders
              </button>
              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium transition"
              >
                Return to Cart
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex items-center justify-center px-4 py-10 transition-colors duration-300">

      <div className="w-full max-w-lg">

        {/* ================= SUCCESS CARD ================= */}

        <div
          className="
            bg-white
            dark:bg-gray-900
            rounded-2xl
            border
            border-gray-100
            dark:border-gray-800
            shadow-sm
            overflow-hidden
          "
        >

          {/* ================= TOP ================= */}

          <div className="px-6 sm:px-8 pt-10 pb-8 text-center">

            {/* Success Icon */}

            <div
              className="
                w-20
                h-20
                mx-auto
                rounded-full
                bg-green-50
                dark:bg-green-950/40
                text-green-600
                dark:text-green-400
                flex
                items-center
                justify-center
              "
            >
              <CheckCircle2 size={46} strokeWidth={1.8} />
            </div>


            {/* Title */}

            <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Payment Successful!
            </h1>


            {/* Description */}

            <p className="mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              Your payment has been successfully processed.
              Thank you for your purchase!
            </p>

          </div>


          {/* ================= ORDER INFO ================= */}

          <div className="px-6 sm:px-8">

            <div
              className="
                rounded-xl
                bg-gray-50
                dark:bg-gray-800/60
                border
                border-gray-100
                dark:border-gray-700/60
                p-4
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-blue-50
                    dark:bg-blue-950/40
                    text-blue-600
                    dark:text-blue-400
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <Package size={20} />
                </div>


                <div className="min-w-0">

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Order Number
                  </p>

                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 truncate">
                    {order?.orderNumber
                      ? `#${order.orderNumber}`
                      : "Your order has been placed"}
                  </p>

                </div>

              </div>


              {order?.total !== undefined && (

                <div
                  className="
                    mt-4
                    pt-4
                    border-t
                    border-gray-200
                    dark:border-gray-700
                    flex
                    items-center
                    justify-between
                  "
                >

                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total Paid
                  </span>

                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    ₹{order.total}
                  </span>

                </div>

              )}

            </div>

          </div>


          {/* ================= ACTIONS ================= */}

          <div className="px-6 sm:px-8 py-8">

            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="
                w-full
                h-12
                rounded-xl
                bg-blue-600
                hover:bg-blue-700
                text-white
                text-sm
                font-semibold
                flex
                items-center
                justify-center
                gap-2
                transition
              "
            >

              <ShoppingBag size={18} />

              Go to My Orders

              <ArrowRight size={18} />

            </button>


            <button
              type="button"
              onClick={() => navigate("/products")}
              className="
                w-full
                h-11
                mt-3
                rounded-xl
                border
                border-gray-200
                dark:border-gray-700
                bg-white
                dark:bg-gray-800
                hover:border-blue-300
                dark:hover:border-blue-500
                hover:text-blue-600
                dark:hover:text-blue-400
                text-gray-700
                dark:text-gray-200
                text-sm
                font-medium
                flex
                items-center
                justify-center
                gap-2
                transition
              "
            >
              <ShoppingBag size={17} />
              Continue Shopping
            </button>

          </div>


          {/* ================= FOOTER ================= */}

          <div
            className="
              px-6
              sm:px-8
              py-4
              bg-gray-50
              dark:bg-gray-800/40
              border-t
              border-gray-100
              dark:border-gray-800
              text-center
            "
          >

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your order is being processed and will be
              available in your orders shortly.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}
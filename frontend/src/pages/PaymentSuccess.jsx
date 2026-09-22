import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-lg">

        {/* ================= SUCCESS CARD ================= */}

        <div
          className="
            bg-white
            rounded-2xl
            border
            border-gray-100
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
                text-green-600
                flex
                items-center
                justify-center
              "
            >
              <CheckCircle2 size={46} strokeWidth={1.8} />
            </div>


            {/* Title */}

            <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
              Payment Successful!
            </h1>


            {/* Description */}

            <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed">
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
                border
                border-gray-100
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
                    text-blue-600
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <Package size={20} />
                </div>


                <div className="min-w-0">

                  <p className="text-xs text-gray-500">
                    Order Number
                  </p>

                  <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
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
                    flex
                    items-center
                    justify-between
                  "
                >

                  <span className="text-sm text-gray-500">
                    Total Paid
                  </span>

                  <span className="text-base font-bold text-gray-900">
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
                bg-white
                hover:border-blue-300
                hover:text-blue-600
                text-gray-700
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
              border-t
              border-gray-100
              text-center
            "
          >

            <p className="text-xs text-gray-500">
              Your order is being processed and will be
              available in your orders shortly.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  User,
  Truck,
  ShoppingBag,
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
  IndianRupee,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  getOrderItems,
  clearOrderDetails,
} from "../redux/slices/orderSlice";

export default function OrderDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams();

  const {
    orderDetails,
    loading,
    error,
  } = useSelector((state) => state.order);

  const {
    orderItem = [],
    orderAddress = null,
  } = orderDetails || {};

const API_URL = "http://localhost:3000";
console.log("tieme",orderItem)
const getImageUrl = (image) => {
  if (!image) {
    return "/1786052049893.webp";
  }

  if (
    typeof image === "string" &&
    (image.startsWith("http://") ||
      image.startsWith("https://"))
  ) {
    return image;
  }

  return `${API_URL}/uploads/${image}`;
};
  // ==========================================
  // GET ORDER DETAILS
  // ==========================================

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderItems(orderId));
    }

    return () => {
      dispatch(clearOrderDetails());
    };
  }, [dispatch, orderId]);


  // ==========================================
  // TOTALS
  // ==========================================

  const subtotal = orderItem.reduce(
    (total, item) =>
      total + Number(item.total || 0),
    0
  );

  const shippingCharge =
    orderItem?.[0]?.order?.shippingCharge ??
    orderDetails?.order?.shippingCharge ??
    0;

  const orderTotal =
    orderItem?.[0]?.order?.total ??
    orderDetails?.order?.total ??
    subtotal + shippingCharge;


  // ==========================================
  // STATUS
  // ==========================================

  const status =
    orderItem?.[0]?.order?.fulfillmentStatus ||
    orderDetails?.order?.fulfillmentStatus ||
    "CONFIRMED";


  const getStatusConfig = (value) => {
    const normalized = value?.toUpperCase();

    switch (normalized) {
      case "CONFIRMED":
        return {
          label: "Confirmed",
          icon: CheckCircle2,
          className:
            "bg-blue-50 text-blue-600 border-blue-100",
        };

      case "PROCESSING":
        return {
          label: "Processing",
          icon: Clock3,
          className:
            "bg-yellow-50 text-yellow-600 border-yellow-100",
        };

      case "SHIPPED":
        return {
          label: "Shipped",
          icon: Truck,
          className:
            "bg-purple-50 text-purple-600 border-purple-100",
        };

      case "DELIVERED":
        return {
          label: "Delivered",
          icon: CheckCircle2,
          className:
            "bg-green-50 text-green-600 border-green-100",
        };

      case "CANCELLED":
      case "CANCELED":
        return {
          label: "Cancelled",
          icon: XCircle,
          className:
            "bg-red-50 text-red-600 border-red-100",
        };

      default:
        return {
          label: value || "Pending",
          icon: Clock3,
          className:
            "bg-gray-100 text-gray-600 border-gray-200",
        };
    }
  };


  const statusConfig =
    getStatusConfig(status);

  const StatusIcon = statusConfig.icon;


  // ==========================================
  // DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">

        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />

            <div className="h-8 w-56 bg-gray-200 rounded mt-4 animate-pulse" />

          </div>
        </section>


        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 space-y-5">

              <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">

                <div className="h-5 w-40 bg-gray-200 rounded" />

                <div className="space-y-4 mt-6">

                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex gap-4"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-xl" />

                      <div className="flex-1">

                        <div className="h-4 w-40 bg-gray-200 rounded" />

                        <div className="h-3 w-24 bg-gray-100 rounded mt-3" />

                        <div className="h-4 w-20 bg-gray-200 rounded mt-3" />

                      </div>
                    </div>
                  ))}

                </div>

              </div>

            </div>


            <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">

              <div className="h-5 w-32 bg-gray-200 rounded" />

              <div className="space-y-4 mt-6">

                <div className="h-4 w-full bg-gray-100 rounded" />
                <div className="h-4 w-full bg-gray-100 rounded" />
                <div className="h-8 w-full bg-gray-200 rounded" />

              </div>

            </div>

          </div>

        </section>

      </main>
    );
  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">

        <section className="bg-white border-b">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="
                flex
                items-center
                gap-2
                text-sm
                text-gray-500
                hover:text-blue-600
                transition
              "
            >
              <ArrowLeft size={17} />
              Back to Orders
            </button>

          </div>

        </section>


        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

          <div className="max-w-md mx-auto text-center">

            <div
              className="
                w-16
                h-16
                mx-auto
                rounded-2xl
                bg-red-50
                text-red-500
                flex
                items-center
                justify-center
              "
            >
              <XCircle size={30} />
            </div>


            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              Unable to load order
            </h2>


            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>


            <button
              type="button"
              onClick={() =>
                dispatch(getOrderItems(orderId))
              }
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                h-10
                px-5
                rounded-xl
                bg-blue-600
                hover:bg-blue-700
                text-white
                text-sm
                font-medium
                transition
              "
            >
              <RefreshCw size={16} />
              Try Again
            </button>

          </div>

        </section>

      </main>
    );
  }


  return (
    <main className="min-h-screen bg-gray-50">

      {/* ==========================================
          HEADER
      ========================================== */}

      <section className="bg-white border-b">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="
              flex
              items-center
              gap-2
              text-sm
              text-gray-500
              hover:text-blue-600
              transition
              mb-4
            "
          >
            <ArrowLeft size={17} />
            Back to Orders
          </button>


          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <p className="text-sm text-gray-500">
                Order Details
              </p>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">

                #
                {orderItem?.[0]?.order?.orderNumber ||
                  orderDetails?.order?.orderNumber ||
                  orderId}

              </h1>

            </div>


            <div
              className={`
                inline-flex
                self-start
                sm:self-auto
                items-center
                gap-2
                px-4
                py-2
                rounded-full
                border
                text-sm
                font-medium
                ${statusConfig.className}
              `}
            >

              <StatusIcon size={17} />

              {statusConfig.label}

            </div>

          </div>

        </div>

      </section>


      {/* ==========================================
          MAIN
      ========================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


          {/* ======================================
              LEFT
          ====================================== */}

          <div className="lg:col-span-2 space-y-6">


            {/* ====================================
                ORDER INFO
            ==================================== */}

            <div
              className="
                bg-white
                rounded-2xl
                border
                border-gray-100
                shadow-sm
                p-5
                sm:p-6
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
                  "
                >
                  <Package size={20} />
                </div>

                <div>

                  <h2 className="text-lg font-semibold text-gray-900">
                    Order Information
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Details about your order
                  </p>

                </div>

              </div>


              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-5
                  mt-6
                  pt-5
                  border-t
                  border-gray-100
                "
              >

                <div className="flex items-center gap-3">

                  <CalendarDays
                    size={18}
                    className="text-gray-400"
                  />

                  <div>

                    <p className="text-xs text-gray-500">
                      Order Date
                    </p>

                    <p className="text-sm font-medium text-gray-900 mt-1">

                      {formatDate(
                        orderItem?.[0]?.order?.createdAt ||
                        orderDetails?.order?.createdAt 
                      )}

                    </p>

                  </div>

                </div>


                <div className="flex items-center gap-3">

                  <Truck
                    size={18}
                    className="text-gray-400"
                  />

                  <div>

                    <p className="text-xs text-gray-500">
                      Delivery
                    </p>

                    <p className="text-sm font-medium text-gray-900 mt-1">
                      Standard Delivery
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* ====================================
                PRODUCTS
            ==================================== */}

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

              <div className="p-5 sm:p-6 border-b border-gray-100">

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
                    "
                  >
                    <ShoppingBag size={20} />
                  </div>

                  <div>

                    <h2 className="text-lg font-semibold text-gray-900">
                      Ordered Items
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">

                      {orderItem.length}{" "}

                      {orderItem.length === 1
                        ? "item"
                        : "items"}

                    </p>

                  </div>

                </div>

              </div>


              <div className="divide-y divide-gray-100">

                {orderItem.length === 0 ? (

                  <div className="p-10 text-center">

                    <ShoppingBag
                      size={30}
                      className="mx-auto text-gray-300"
                    />

                    <p className="text-sm text-gray-500 mt-3">
                      No order items found.
                    </p>

                  </div>

                ) : (

                  orderItem.map((item) => (

                    <div
                      key={item._id}
                      className="
                        p-5
                        sm:p-6
                        flex
                        flex-col
                        sm:flex-row
                        gap-4
                      "
                    >

                      {/* Product Image */}

                      <div
                        className="
                          w-20
                          h-20
                          sm:w-24
                          sm:h-24
                          rounded-xl
                          bg-gray-50
                          border
                          border-gray-100
                          overflow-hidden
                          shrink-0
                          flex
                          items-center
                          justify-center
                        "
                      >

                        {item.product?.images?.[0] ? (

                          <img
                            src={getImageUrl(item.product.images[0])}
                            alt={
                              item.productName ||
                              "Product"
                            }
                            className="
                              w-full
                              h-full
                              object-cover
                            "
                          />

                        ) : (

                          <Package
                            size={25}
                            className="text-gray-300"
                          />

                        )}

                      </div>


                      {/* Product Details */}

                      <div className="flex-1 min-w-0">

                        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">

                          <div>

                            <h3 className="font-semibold text-gray-900">
                              {item.productName ||
                                item.product?.name ||
                                "Product"}
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">

                              Quantity:{" "}

                              <span className="font-medium text-gray-700">
                                {item.quantity}
                              </span>

                            </p>

                          </div>


                          <div className="sm:text-right">

                            <p className="text-sm text-gray-500">
                              Price
                            </p>

                            <p className="text-base font-semibold text-gray-900 mt-1">

                              ₹
                              {item.price ||
                                item.product?.price ||
                                0}

                            </p>

                          </div>

                        </div>


                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            mt-4
                            pt-3
                            border-t
                            border-gray-100
                          "
                        >

                          <span className="text-sm text-gray-500">
                            Item Total
                          </span>

                          <span className="font-semibold text-gray-900">

                            ₹
                            {item.total ||
                              (item.price || 0) *
                                (item.quantity || 1)}

                          </span>

                        </div>

                      </div>

                    </div>

                  ))

                )}

              </div>

            </div>


            {/* ====================================
                SHIPPING ADDRESS
            ==================================== */}

            {orderAddress && (

              <div
                className="
                  bg-white
                  rounded-2xl
                  border
                  border-gray-100
                  shadow-sm
                  p-5
                  sm:p-6
                "
              >

                <div className="flex items-center gap-3">

                  <div
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-green-50
                      text-green-600
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <MapPin size={20} />
                  </div>

                  <div>

                    <h2 className="text-lg font-semibold text-gray-900">
                      Shipping Address
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Delivery address for this order
                    </p>

                  </div>

                </div>


                <div className="mt-6 p-4 rounded-xl bg-gray-50">

                  <div className="flex items-start gap-3">

                    <User
                      size={18}
                      className="text-gray-400 mt-0.5"
                    />

                    <div>

                      <p className="text-sm font-semibold text-gray-900">
                        {orderAddress.name}
                      </p>

                      <p className="text-sm text-gray-600 mt-2">
                        {orderAddress.addressLine1}
                      </p>

                      <p className="text-sm text-gray-600">
                        {orderAddress.city},{" "}
                        {orderAddress.state}
                      </p>

                      <p className="text-sm text-gray-600">
                        {orderAddress.postalCode}
                      </p>

                      <p className="text-sm text-gray-600">
                        {orderAddress.country}
                      </p>

                    </div>

                  </div>


                  {orderAddress.phone && (

                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        mt-4
                        pt-4
                        border-t
                        border-gray-200
                      "
                    >

                      <Phone
                        size={17}
                        className="text-gray-400"
                      />

                      <span className="text-sm text-gray-700">
                        {orderAddress.phone}
                      </span>

                    </div>

                  )}

                </div>

              </div>

            )}

          </div>


          {/* ======================================
              RIGHT SUMMARY
          ====================================== */}

          <div>

            <div
              className="
                bg-white
                rounded-2xl
                border
                border-gray-100
                shadow-sm
                lg:sticky
                lg:top-6
              "
            >

              {/* Header */}

              <div className="p-5 sm:p-6 border-b border-gray-100">

                <h2 className="text-lg font-semibold text-gray-900">
                  Order Summary
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Payment summary
                </p>

              </div>


              {/* Summary */}

              <div className="p-5 sm:p-6 space-y-4">

                <div className="flex justify-between text-sm">

                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-gray-900">
                    ₹{orderDetails?.order?.subtotal ?? subtotal}
                  </span>

                </div>


                <div className="flex justify-between text-sm">

                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span
                    className={
                      Number(shippingCharge) === 0
                        ? "font-medium text-green-600"
                        : "font-medium text-gray-900"
                    }
                  >

                    {Number(shippingCharge) === 0
                      ? "Free"
                      : `₹${shippingCharge}`}

                  </span>

                </div>


                <div className="pt-4 border-t border-gray-100">

                  <div className="flex justify-between items-center">

                    <span className="font-semibold text-gray-900">
                      Total
                    </span>

                    <span className="text-xl font-bold text-gray-900">
                      ₹{orderTotal}
                    </span>

                  </div>

                </div>


                {/* Status */}

                <div
                  className="
                    mt-5
                    p-4
                    rounded-xl
                    bg-gray-50
                  "
                >

                  <div className="flex items-center gap-3">

                    <StatusIcon
                      size={19}
                      className={
                        statusConfig.className
                          .split(" ")
                          .find((item) =>
                            item.startsWith("text-")
                          ) || "text-blue-600"
                      }
                    />

                    <div>

                      <p className="text-sm font-medium text-gray-900">
                        {statusConfig.label}
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Current order status
                      </p>

                    </div>

                  </div>

                </div>


                {/* Back button */}

                <button
                  type="button"
                  onClick={() => navigate("/orders")}
                  className="
                    w-full
                    h-11
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    hover:border-blue-300
                    hover:text-blue-600
                    text-sm
                    font-medium
                    text-gray-700
                    transition
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >

                  <ArrowLeft size={17} />

                  Back to Orders

                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
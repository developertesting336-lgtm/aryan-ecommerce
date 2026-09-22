import { useEffect, useMemo, useState } from "react";
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
  RefreshCw,
  Save,
  CreditCard,
  CircleDollarSign,
  Loader2,
} from "lucide-react";

import {
  getOrderById,
  getOrderItems,
  clearOrderDetails,
  adminUpdateOrderStatus,
} from "../../redux/slices/orderSlice";

const API_URL = "http://localhost:3000";

const FULFILLMENT_STATUSES = [
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrderDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams();

  const {
    order,
    orderDetails,
    // orderItem = [],
    // orderAddress = null,
    loading,
    updatingStatus,
    error,
  } = useSelector((state) => state.order);
    const {
    orderItem = [],
    orderAddress = null,
  } = orderDetails || {};
console.log("admin details",orderItem)
  const [selectedStatus, setSelectedStatus] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  // ==========================================================
  // ORDER
  // ==========================================================

  const currentOrder =
    order ||
    orderDetails?.order ||
    null;

  // ==========================================================
  // FETCH
  // ==========================================================

  useEffect(() => {
    if (!orderId) return;

    dispatch(getOrderById(orderId));
    dispatch(getOrderItems(orderId));

    return () => {
      dispatch(clearOrderDetails());
    };
  }, [dispatch, orderId]);

  // ==========================================================
  // SYNC STATUS
  // ==========================================================

  useEffect(() => {
    if (currentOrder?.fulfillmentStatus) {
      setSelectedStatus(
        currentOrder.fulfillmentStatus
      );
    }
  }, [currentOrder?.fulfillmentStatus]);

  // ==========================================================
  // IMAGE
  // ==========================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "/1786052049893.webp";
    }

    if (
      typeof image === "string" &&
      (
        image.startsWith("http://") ||
        image.startsWith("https://")
      )
    ) {
      return image;
    }

    return `${API_URL}/uploads/${image}`;
  };

  // ==========================================================
  // TOTALS
  // ==========================================================

  const calculatedSubtotal = useMemo(() => {
    return orderItem.reduce(
      (total, item) =>
        total + Number(item.total || 0),
      0
    );
  }, [orderItem]);

  const subtotal =
    currentOrder?.subtotal ??
    calculatedSubtotal;

  const discount =
    currentOrder?.discount ?? 0;

  const shippingCharge =
    currentOrder?.shippingCharge ?? 0;

  const tax =
    currentOrder?.tax ?? 0;

  const total =
    currentOrder?.total ??
    subtotal -
      discount +
      shippingCharge +
      tax;

  // ==========================================================
  // STATUS CONFIG
  // ==========================================================

  const getStatusConfig = (value) => {
    switch (value?.toUpperCase()) {
      case "PROCESSING":
        return {
          label: "Processing",
          icon: Clock3,
          className:
            "bg-yellow-50 text-yellow-700 border-yellow-200",
        };

      case "SHIPPED":
        return {
          label: "Shipped",
          icon: Truck,
          className:
            "bg-purple-50 text-purple-700 border-purple-200",
        };

      case "DELIVERED":
        return {
          label: "Delivered",
          icon: CheckCircle2,
          className:
            "bg-green-50 text-green-700 border-green-200",
        };

      case "CANCELLED":
      case "CANCELED":
        return {
          label: "Cancelled",
          icon: XCircle,
          className:
            "bg-red-50 text-red-700 border-red-200",
        };

      default:
        return {
          label: value || "Pending",
          icon: Clock3,
          className:
            "bg-gray-50 text-gray-700 border-gray-200",
        };
    }
  };

  const fulfillmentConfig =
    getStatusConfig(
      currentOrder?.fulfillmentStatus
    );

  const FulfillmentIcon =
    fulfillmentConfig.icon;

  // ==========================================================
  // PAYMENT STATUS
  // ==========================================================

  const getPaymentClass = (value) => {
    switch (value?.toUpperCase()) {
      case "PAID":
        return "bg-green-50 text-green-700 border-green-200";

      case "FAILED":
        return "bg-red-50 text-red-700 border-red-200";

      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // ==========================================================
  // DATE
  // ==========================================================

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
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  // ==========================================================
  // UPDATE STATUS
  // ==========================================================

  const handleUpdateStatus = async () => {
    if (
      !orderId ||
      !selectedStatus ||
      selectedStatus ===
        currentOrder?.fulfillmentStatus
    ) {
      return;
    }

    setSuccessMessage("");

    const result =  dispatch(
      adminUpdateOrderStatus({
        orderId,
        fulfillmentStatus: selectedStatus,
      })
    );

    if (
      adminUpdateOrderStatus.fulfilled.match(
        result
      )
    ) {
      setSuccessMessage(
        "Fulfillment status updated successfully."
      );

      // Fetch fresh order data after update.
      dispatch(getOrderById(orderId));
      dispatch(getOrderItems(orderId));

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading && !currentOrder) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />

            <div className="h-8 w-64 bg-gray-200 rounded mt-4 animate-pulse" />
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse"
                />
              ))}
            </div>

            <div className="h-96 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          </div>
        </section>
      </main>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error && !currentOrder) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
            <button
              type="button"
              onClick={() => navigate("/admin/orders")}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Back to Orders
            </button>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
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
              onClick={() => {
                dispatch(getOrderById(orderId));
                dispatch(getOrderItems(orderId));
              }}
              className="mt-5 inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (!currentOrder) {
    return null;
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition mb-4"
          >
            <ArrowLeft size={17} />
            Back to Orders
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>
              <p className="text-sm text-gray-500">
                Admin · Order Details
              </p>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                #
                {currentOrder.orderNumber ||
                  orderId}
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                Order ID: {currentOrder._id || orderId}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">

              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${
                  getStatusConfig(
                    currentOrder.status
                  ).className
                }`}
              >
                Order:{" "}
                {currentOrder.status}
              </span>

              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${fulfillmentConfig.className}`}
              >
                <FulfillmentIcon size={16} />
                Fulfillment:{" "}
                {fulfillmentConfig.label}
              </span>

            </div>

          </div>
        </div>
      </section>

      {/* ====================================================
          MAIN
      ==================================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="lg:col-span-2 space-y-6">

            {/* ===============================================
                ADMIN FULFILLMENT CONTROL
            =============================================== */}

            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 sm:p-6">

              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Truck size={21} />
                </div>

                <div className="flex-1">

                  <h2 className="text-lg font-semibold text-gray-900">
                    Fulfillment Management
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Update the fulfillment status of this order.
                  </p>

                </div>

              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">

                <select
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(
                      event.target.value
                    )
                  }
                  disabled={updatingStatus}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                >
                  {FULFILLMENT_STATUSES.map(
                    (statusValue) => (
                      <option
                        key={statusValue}
                        value={statusValue}
                      >
                        {statusValue}
                      </option>
                    )
                  )}
                </select>

                <button
                  type="button"
                  disabled={
                    updatingStatus ||
                    !selectedStatus ||
                    selectedStatus ===
                      currentOrder.fulfillmentStatus
                  }
                  onClick={
                    handleUpdateStatus
                  }
                  className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
                >
                  {updatingStatus ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Update Status
                    </>
                  )}
                </button>

              </div>

              {successMessage && (
                <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle2 size={17} />
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
                  {error}
                </div>
              )}

            </div>

            {/* ===============================================
                ORDER INFORMATION
            =============================================== */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Package size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Order Information
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Order and payment details
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6 pt-5 border-t border-gray-100">

                <InfoItem
                  icon={<CalendarDays size={18} />}
                  label="Order Date"
                  value={formatDate(
                    currentOrder.createdAt
                  )}
                />

                <InfoItem
                  icon={<CreditCard size={18} />}
                  label="Payment Status"
                  value={
                    currentOrder.paymentStatus ||
                    "N/A"
                  }
                  valueClass={getPaymentClass(
                    currentOrder.paymentStatus
                  )}
                />

                <InfoItem
                  icon={<CircleDollarSign size={18} />}
                  label="Currency"
                  value={
                    currentOrder.currency ||
                    "INR"
                  }
                />

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">

                <InfoItem
                  icon={<CheckCircle2 size={18} />}
                  label="Order Status"
                  value={
                    currentOrder.status ||
                    "N/A"
                  }
                />

                <InfoItem
                  icon={<Truck size={18} />}
                  label="Fulfillment Status"
                  value={
                    currentOrder.fulfillmentStatus ||
                    "N/A"
                  }
                />

              </div>

            </div>

            {/* ===============================================
                ORDER ITEMS
            =============================================== */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              <div className="p-5 sm:p-6 border-b border-gray-100">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
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
                      className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4"
                    >

                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">

                        {item.product?.images?.[0] ? (
                          <img
                            src={getImageUrl(
                              item.product.images[0]
                            )}
                            alt={
                              item.productName ||
                              "Product"
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package
                            size={25}
                            className="text-gray-300"
                          />
                        )}

                      </div>

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
                              Unit Price
                            </p>

                            <p className="text-base font-semibold text-gray-900 mt-1">
                              ₹
                              {item.price ||
                                item.product?.price ||
                                0}
                            </p>
                          </div>

                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">

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

            {/* ===============================================
                SHIPPING ADDRESS
            =============================================== */}

            {orderAddress && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Shipping Address
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Customer delivery address
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
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
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

          {/* =================================================
              RIGHT
          ================================================= */}

          <div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm lg:sticky lg:top-6">

              <div className="p-5 sm:p-6 border-b border-gray-100">

                <h2 className="text-lg font-semibold text-gray-900">
                  Order Summary
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Financial details
                </p>

              </div>

              <div className="p-5 sm:p-6 space-y-4">

                <SummaryRow
                  label="Subtotal"
                  value={`₹${subtotal}`}
                />

                <SummaryRow
                  label="Discount"
                  value={`-₹${discount}`}
                  valueClass="text-green-600"
                />

                <SummaryRow
                  label="Shipping"
                  value={
                    Number(shippingCharge) === 0
                      ? "Free"
                      : `₹${shippingCharge}`
                  }
                  valueClass={
                    Number(shippingCharge) === 0
                      ? "text-green-600"
                      : ""
                  }
                />

                <SummaryRow
                  label="Tax"
                  value={`₹${tax}`}
                />

                <div className="pt-4 border-t border-gray-100">

                  <div className="flex justify-between items-center">

                    <span className="font-semibold text-gray-900">
                      Total
                    </span>

                    <span className="text-xl font-bold text-gray-900">
                      ₹{total}
                    </span>

                  </div>

                </div>

                {/* Current fulfillment */}

                <div className="mt-5 p-4 rounded-xl bg-gray-50">

                  <p className="text-xs text-gray-500">
                    Current Fulfillment Status
                  </p>

                  <div className="flex items-center gap-2 mt-2">

                    <FulfillmentIcon
                      size={18}
                      className="text-blue-600"
                    />

                    <span className="font-semibold text-gray-900">
                      {
                        fulfillmentConfig.label
                      }
                    </span>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => navigate("/admin/orders")}
                  className="w-full h-11 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:text-blue-600 text-sm font-medium text-gray-700 transition flex items-center justify-center gap-2"
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

// ============================================================
// SMALL COMPONENTS
// ============================================================

function InfoItem({
  icon,
  label,
  value,
  valueClass = "",
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="text-gray-400 mt-0.5">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs text-gray-500">
          {label}
        </p>

        <p
          className={`text-sm font-medium text-gray-900 mt-1 ${valueClass}`}
        >
          {value}
        </p>

      </div>

    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueClass = "",
}) {
  return (
    <div className="flex justify-between text-sm">

      <span className="text-gray-500">
        {label}
      </span>

      <span
        className={`font-medium text-gray-900 ${valueClass}`}
      >
        {value}
      </span>

    </div>
  );
}

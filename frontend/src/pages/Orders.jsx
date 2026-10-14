import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ChevronRight,
  Clock3,
  CheckCircle2,
  Truck,
  XCircle,
  ShoppingBag,
  RefreshCw,
  CalendarDays,
  IndianRupee,
} from "lucide-react";

import {
  getOrders,
  getOrderItems,
} from "../redux/slices/orderSlice";

export default function Orders() {
  const dispatch = useDispatch();
const navigate = useNavigate();
  const {
    orders = [],
    order,
    loading,
    error,
  } = useSelector((state) => state.order);

  const [filter, setFilter] = useState("ALL");

  // ==========================================
  // GET ORDERS
  // ==========================================

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);


  // ==========================================
  // NORMALIZE ORDERS
  // ==========================================

  const orderList = useMemo(() => {
    if (Array.isArray(orders) && orders.length > 0) {
      return orders;
    }

    if (Array.isArray(order)) {
      return order;
    }

    if (order) {
      return [order];
    }

    return [];
  }, [orders, order]);

  // ==========================================
  // FILTER ORDERS
  // ==========================================

  const filteredOrders = useMemo(() => {
    if (filter === "ALL") {
      return orderList;
    }

    return orderList.filter(
      (item) =>
        item.fulfillmentStatus?.toUpperCase() === filter
    );
  }, [orderList, filter]);

console.log("orderlist",orders)

  // ==========================================
  // STATUS CONFIG
  // ==========================================

  const getStatusConfig = (status) => {
    const normalizedStatus = status?.toUpperCase();

    switch (normalizedStatus) {
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

      case "PENDING":
        return {
          label: "UNFULFILLED",
          icon: Clock3,
          className:
            "bg-gray-100 text-gray-600 border-gray-200",
        };

      default:
        return {
          label: status || "Unknown",
          icon: Clock3,
          className:
            "bg-gray-100 text-gray-600 border-gray-200",
        };
    }
  };


  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };


  // ==========================================
  // VIEW ORDER
  // ==========================================

  const handleViewOrder = (orderId) => {
    dispatch(getOrderItems(orderId));

    // If you have an order details route,
    // navigate there:
    //
    navigate(`/orders/${orderId}`);
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading && orderList.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">

        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

            <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse" />

            <div className="h-4 w-64 bg-gray-100 rounded mt-3 animate-pulse" />

          </div>
        </section>


        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          <div className="space-y-4">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  bg-white
                  border
                  border-gray-100
                  rounded-2xl
                  p-5
                  animate-pulse
                "
              >

                <div className="flex justify-between">

                  <div>
                    <div className="h-5 w-36 bg-gray-200 rounded" />
                    <div className="h-4 w-24 bg-gray-100 rounded mt-3" />
                  </div>

                  <div className="h-8 w-24 bg-gray-100 rounded-full" />

                </div>

                <div className="border-t border-gray-100 mt-5 pt-5">

                  <div className="h-4 w-48 bg-gray-100 rounded" />

                  <div className="h-4 w-32 bg-gray-100 rounded mt-3" />

                </div>

              </div>
            ))}

          </div>

        </section>

      </main>
    );
  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error && orderList.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">

        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              My Orders
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              View and track your recent orders.
            </p>

          </div>
        </section>


        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

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
              Unable to load orders
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => dispatch(getOrders())}
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                px-5
                h-10
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
          PAGE HEADER
      ========================================== */}

      <section className="bg-white border-b">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                My Orders
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                View and track your recent orders.
              </p>

            </div>


            <button
              type="button"
              onClick={() => dispatch(getOrders())}
              disabled={loading}
              className="
                self-start
                sm:self-auto
                h-10
                px-4
                rounded-xl
                border
                border-gray-200
                bg-white
                hover:border-blue-300
                hover:text-blue-600
                text-sm
                font-medium
                flex
                items-center
                gap-2
                transition
              "
            >

              <RefreshCw
                size={16}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh

            </button>

          </div>

        </div>

      </section>


      {/* ==========================================
          CONTENT
      ========================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">


        {/* ==========================================
            FILTERS
        ========================================== */}

        <div className="flex flex-wrap items-center gap-2 mb-6">

          {[
            {
              value: "ALL",
              label: "All Orders",
            },
            // {
            //   value: "CONFIRMED",
            //   label: "Confirmed",
            // },
            {
              value: "PROCESSING",
              label: "Processing",
            },
            {
              value: "SHIPPED",
              label: "Shipped",
            },
            {
              value: "DELIVERED",
              label: "Delivered",
            },
            {
              value: "CANCELLED",
              label: "Cancelled",
            },
          ].map((item) => (

            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`
                h-9
                px-4
                rounded-xl
                text-sm
                font-medium
                border
                transition
                ${
                  filter === item.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }
              `}
            >
              {item.label}
            </button>

          ))}

        </div>


        {/* ==========================================
            ORDER COUNT
        ========================================== */}

        {orderList.length > 0 && (
          <div className="mb-4">

            <p className="text-sm text-gray-500">

              Showing{" "}

              <span className="font-semibold text-gray-900">
                {filteredOrders.length}
              </span>{" "}

              {filteredOrders.length === 1
                ? "order"
                : "orders"}

            </p>

          </div>
        )}


        {/* ==========================================
            EMPTY STATE
        ========================================== */}

        {filteredOrders.length === 0 ? (

          <div
            className="
              bg-white
              border
              border-gray-100
              rounded-2xl
              py-20
              px-6
              text-center
            "
          >

            <div
              className="
                w-16
                h-16
                mx-auto
                rounded-2xl
                bg-blue-50
                text-blue-600
                flex
                items-center
                justify-center
              "
            >
              <ShoppingBag size={30} />
            </div>


            <h2 className="mt-5 text-xl font-semibold text-gray-900">

              {filter === "ALL"
                ? "No orders yet"
                : `No ${filter.toLowerCase()} orders`}

            </h2>


            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">

              {filter === "ALL"
                ? "You haven't placed any orders yet. Your orders will appear here after checkout."
                : "There are no orders with this status."}

            </p>

          </div>

        ) : (

          /* ==========================================
             ORDER LIST
          ========================================== */

          <div className="space-y-4">

            {filteredOrders.map((item) => {

              const status = getStatusConfig(
                item.fulfillmentStatus
              );

              const StatusIcon = status.icon;

              return (
                <div
                  key={item._id}
                  className="
                    bg-white
                    border
                    border-gray-100
                    rounded-2xl
                    shadow-sm
                    overflow-hidden
                    hover:border-gray-200
                    transition
                  "
                >

                  {/* ==================================
                      ORDER HEADER
                  ================================== */}

                  <div className="p-5 sm:p-6">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                      <div className="flex items-start gap-3">

                        <div
                          className="
                            w-11
                            h-11
                            rounded-xl
                            bg-blue-50
                            text-blue-600
                            flex
                            items-center
                            justify-center
                            shrink-0
                          "
                        >
                          <Package size={21} />
                        </div>


                        <div>

                          <p className="text-xs text-gray-500">
                            Order
                          </p>

                          <h2 className="text-sm sm:text-base font-semibold text-gray-900 mt-1">
                            #{item.orderNumber || item._id}
                          </h2>

                        </div>

                      </div>


                      {/* STATUS */}

                      <div
                        className={`
                          inline-flex
                          self-start
                          sm:self-auto
                          items-center
                          gap-1.5
                          px-3
                          py-1.5
                          rounded-full
                          border
                          text-xs
                          font-medium
                          ${status.className}
                        `}
                      >

                        <StatusIcon size={14} />

                        {status.label}

                      </div>

                    </div>


                    {/* ==================================
                        ORDER INFO
                    ================================== */}

                    <div
                      className="
                        grid
                        grid-cols-1
                        sm:grid-cols-3
                        gap-4
                        mt-6
                        pt-5
                        border-t
                        border-gray-100
                      "
                    >

                      {/* Date */}

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            w-9
                            h-9
                            rounded-lg
                            bg-gray-50
                            text-gray-500
                            flex
                            items-center
                            justify-center
                          "
                        >
                          <CalendarDays size={17} />
                        </div>

                        <div>

                          <p className="text-xs text-gray-500">
                            Order Date
                          </p>

                          <p className="text-sm font-medium text-gray-900 mt-0.5">
                            {formatDate(
                              item.createdAt
                            )}
                          </p>

                        </div>

                      </div>


                      {/* Total */}

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            w-9
                            h-9
                            rounded-lg
                            bg-gray-50
                            text-gray-500
                            flex
                            items-center
                            justify-center
                          "
                        >
                          <IndianRupee size={17} />
                        </div>

                        <div>

                          <p className="text-xs text-gray-500">
                            Total Amount
                          </p>

                          <p className="text-sm font-semibold text-gray-900 mt-0.5">
                            ₹{item.total || 0}
                          </p>

                        </div>

                      </div>


                      {/* Shipping */}

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            w-9
                            h-9
                            rounded-lg
                            bg-gray-50
                            text-gray-500
                            flex
                            items-center
                            justify-center
                          "
                        >
                          <Truck size={17} />
                        </div>

                        <div>

                          <p className="text-xs text-gray-500">
                            Shipping
                          </p>

                          <p className="text-sm font-medium text-gray-900 mt-0.5">

                            {item.shippingCharge === 0
                              ? "Free"
                              : `₹${item.shippingCharge || 0}`}

                          </p>

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* ==================================
                      ORDER FOOTER
                  ================================== */}

                  <div
                    className="
                      px-5
                      sm:px-6
                      py-4
                      bg-gray-50/70
                      border-t
                      border-gray-100
                      flex
                      flex-col
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                      gap-3
                    "
                  >

                    <div className="text-sm text-gray-500">

                      Subtotal{" "}

                      <span className="font-medium text-gray-900">
                        ₹{item.subtotal || 0}
                      </span>

                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        handleViewOrder(item._id)
                      }
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        h-10
                        px-4
                        rounded-xl
                        bg-white
                        border
                        border-gray-200
                        hover:border-blue-300
                        hover:text-blue-600
                        text-sm
                        font-medium
                        text-gray-700
                        transition
                      "
                    >

                      View Details

                      <ChevronRight size={16} />

                    </button>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </section>

    </main>
  );
}
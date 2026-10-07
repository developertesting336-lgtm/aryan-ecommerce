import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";

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
  XCircle,
  RefreshCw,
  Navigation,
  Box,
  CircleDot,
  RotateCcw,
  ClipboardCheck,
} from "lucide-react";

import {
  getOrderItems,
  clearOrderDetails,
} from "../redux/slices/orderSlice";

/* =========================================================
   FULFILLMENT STATUS
========================================================= */

const FulfillmentStatus = {
  UNFULFILLED: "UNFULFILLED",
  PROCESSING: "PROCESSING",
  PACKED: "PACKED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  RETURNED: "RETURNED",
  CANCELLED: "CANCELLED",
};

/* =========================================================
   TRACKING STEPS
========================================================= */

const trackingSteps = [
  {
    key: FulfillmentStatus.UNFULFILLED,
    label: "Order Confirmed",
    description: "Your order has been received",
    icon: ClipboardCheck,
  },
  {
    key: FulfillmentStatus.PROCESSING,
    label: "Processing",
    description: "Your order is being prepared",
    icon: Box,
  },
  {
    key: FulfillmentStatus.PACKED,
    label: "Packed",
    description: "Your order has been packed",
    icon: Package,
  },
  {
    key: FulfillmentStatus.SHIPPED,
    label: "Shipped",
    description: "Your order is on the way",
    icon: Truck,
  },
  {
    key: FulfillmentStatus.DELIVERED,
    label: "Delivered",
    description: "Your order has been delivered",
    icon: CheckCircle2,
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function OrderTracking() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams();

  /* =======================================================
     ORDER STATE
  ======================================================= */

  const { orderDetails, loading, error } = useSelector(
    (state) => state.order,
  );

  /* =======================================================
     ORDER DATA
  ======================================================= */

  const {
    orderItem = [],
    orderAddress = null,
  } = orderDetails || {};

  /* =======================================================
     API URL
  ======================================================= */

  const API_URL = "http://localhost:3000";

  /* =======================================================
     IMAGE URL
  ======================================================= */

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

  /* =======================================================
     GET ORDER
  ======================================================= */

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderItems(orderId));
    }

    return () => {
      dispatch(clearOrderDetails());
    };
  }, [dispatch, orderId]);

  /* =======================================================
     ORDER
  ======================================================= */

  const order =
    orderItem?.[0]?.order ||
    orderDetails?.order ||
    {};

  /* =======================================================
     RAW STATUS
  ======================================================= */

  const rawStatus =
    order?.fulfillmentStatus ??
    order?.fulfilledStatus ??
    order?.fullfilledStatus ??
    order?.fullfilledstatus ??
    FulfillmentStatus.UNFULFILLED;

  /* =======================================================
     NORMALIZED STATUS
  ======================================================= */

  const normalizedStatus = String(rawStatus)
    .trim()
    .toUpperCase();

  /* =======================================================
     SPECIAL STATUS
  ======================================================= */

  const isCancelled =
    normalizedStatus === FulfillmentStatus.CANCELLED;

  const isReturned =
    normalizedStatus === FulfillmentStatus.RETURNED;

  /* =======================================================
     CURRENT TRACKING INDEX
     
     Backend status:
     
     UNFULFILLED
     PROCESSING
     PACKED
     SHIPPED
     DELIVERED
  ======================================================= */

  const currentStepIndex = useMemo(() => {
    const index = trackingSteps.findIndex(
      (step) => step.key === normalizedStatus,
    );

    /*
     * Unknown statuses are treated as UNFULFILLED
     */
    return index >= 0 ? index : 0;
  }, [normalizedStatus]);

  /* =======================================================
     CURRENT TRACKING STATUS
  ======================================================= */

  const currentTrackingStatus =
    trackingSteps[currentStepIndex]?.key ||
    FulfillmentStatus.UNFULFILLED;

  /* =======================================================
     STEP STATE
  ======================================================= */

  const getStepState = (index) => {
    if (isCancelled) {
      return "cancelled";
    }

    if (isReturned) {
      /*
       * Returned order:
       * completed until the last normal delivery state
       */
      return index <= currentStepIndex
        ? "completed"
        : "upcoming";
    }

    if (index < currentStepIndex) {
      return "completed";
    }

    if (index === currentStepIndex) {
      return "current";
    }

    return "upcoming";
  };

  /* =======================================================
     DATE FORMAT
  ======================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  /* =======================================================
     ORDER NUMBER
  ======================================================= */

  const orderNumber =
    order?.orderNumber ||
    order?.orderNo ||
    order?.number ||
    orderId;

  /* =======================================================
     TOTALS
  ======================================================= */

  const subtotal = Number(order?.subtotal ?? 0);

  const shippingCharge = Number(
    order?.shippingCharge ??
      order?.shippingCost ??
      0,
  );

  const discount = Number(
    order?.discount ?? 0,
  );

  const calculatedTotal =
    subtotal +
    shippingCharge -
    discount;

  const orderTotal = Number(
    order?.total ??
      order?.grandTotal ??
      calculatedTotal,
  );

  /* =======================================================
     STATUS CONTENT
  ======================================================= */

  const statusContent = useMemo(() => {
    if (isCancelled) {
      return {
        title: "Order Cancelled",
        description:
          "This order has been cancelled and will not be delivered.",
        icon: XCircle,
        color:
          "bg-red-50 text-red-500",
      };
    }

    if (isReturned) {
      return {
        title: "Order Returned",
        description:
          "This order has been returned successfully.",
        icon: RotateCcw,
        color:
          "bg-orange-50 text-orange-500",
      };
    }

    switch (currentTrackingStatus) {
      case FulfillmentStatus.UNFULFILLED:
        return {
          title: "Order Confirmed",
          description:
            "Your order has been received and is waiting to be processed.",
          icon: ClipboardCheck,
          color:
            "bg-blue-50 text-blue-600",
        };

      case FulfillmentStatus.PROCESSING:
        return {
          title: "Preparing Your Order",
          description:
            "Your order is currently being prepared.",
          icon: Box,
          color:
            "bg-blue-50 text-blue-600",
        };

      case FulfillmentStatus.PACKED:
        return {
          title: "Order Packed",
          description:
            "Your order has been packed and is ready for shipment.",
          icon: Package,
          color:
            "bg-purple-50 text-purple-600",
        };

      case FulfillmentStatus.SHIPPED:
        return {
          title: "Your Order Is On The Way",
          description:
            "Your order has been shipped and is on its way to you.",
          icon: Truck,
          color:
            "bg-indigo-50 text-indigo-600",
        };

      case FulfillmentStatus.DELIVERED:
        return {
          title: "Order Delivered",
          description:
            "Your order has been successfully delivered.",
          icon: CheckCircle2,
          color:
            "bg-green-50 text-green-600",
        };

      default:
        return {
          title: "Order Confirmed",
          description:
            "Your order has been received.",
          icon: ClipboardCheck,
          color:
            "bg-blue-50 text-blue-600",
        };
    }
  }, [
    currentTrackingStatus,
    isCancelled,
    isReturned,
  ]);

  /* =======================================================
     STATUS LABEL
  ======================================================= */

  const statusLabel = useMemo(() => {
    if (isCancelled) {
      return "Cancelled";
    }

    if (isReturned) {
      return "Returned";
    }

    return (
      trackingSteps[currentStepIndex]?.label ||
      "Order Confirmed"
    );
  }, [
    currentStepIndex,
    isCancelled,
    isReturned,
  ]);

  /* =======================================================
     CURRENT STATUS ICON
  ======================================================= */

  const StatusIcon = statusContent.icon;

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />

            <div className="h-8 w-64 bg-gray-200 rounded mt-4 animate-pulse" />
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 animate-pulse">
            <div className="mx-auto w-20 h-20 rounded-full bg-gray-200" />

            <div className="h-6 w-52 bg-gray-200 rounded mx-auto mt-5" />

            <div className="h-4 w-80 max-w-full bg-gray-100 rounded mx-auto mt-3" />

            <div className="mt-12 space-y-8">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />

                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded" />

                    <div className="h-3 w-56 bg-gray-100 rounded mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        <section className="max-w-md mx-auto px-4 py-20 text-center">
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

          <h2 className="mt-5 text-xl font-bold text-gray-900">
            Unable to load tracking
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {typeof error === "string"
              ? error
              : error?.message ||
                "Something went wrong while loading the order."}
          </p>

          <button
            type="button"
            onClick={() =>
              dispatch(getOrderItems(orderId))
            }
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              h-11
              px-5
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              text-white
              text-sm
              font-semibold
              transition
            "
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </section>
      </main>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          <button
            type="button"
            onClick={() =>
              navigate(`/orders/${orderId}`)
            }
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              text-gray-500
              hover:text-blue-600
              transition
            "
          >
            <ArrowLeft size={17} />
            Back to Order Details
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-5">

            <div>
              <p className="text-sm text-gray-500">
                Track Your Order
              </p>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                #{orderNumber}
              </h1>
            </div>

            <div
              className={`
                inline-flex
                items-center
                gap-2
                self-start
                sm:self-auto
                px-4
                py-2
                rounded-full
                text-sm
                font-semibold
                ${
                  isCancelled
                    ? "bg-red-50 border border-red-100 text-red-600"
                    : isReturned
                      ? "bg-orange-50 border border-orange-100 text-orange-600"
                      : "bg-blue-50 border border-blue-100 text-blue-600"
                }
              `}
            >
              <Navigation size={16} />

              {statusLabel}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* =================================================
            HERO TRACKING CARD
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
          }}
          className="
            bg-white
            rounded-3xl
            border
            border-gray-100
            shadow-sm
            overflow-hidden
          "
        >

          {/* ===============================================
              CURRENT STATUS
          =============================================== */}

          <div className="px-5 sm:px-10 pt-8 sm:pt-10 text-center">

            <motion.div
              initial={{
                scale: 0.7,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                delay: 0.15,
                type: "spring",
                stiffness: 180,
              }}
              className={`
                relative
                w-20
                h-20
                mx-auto
                rounded-full
                flex
                items-center
                justify-center
                ${statusContent.color}
              `}
            >

              {/* PULSE */}

              {!isCancelled &&
                !isReturned &&
                normalizedStatus !==
                  FulfillmentStatus.DELIVERED && (
                  <motion.div
                    animate={{
                      scale: [
                        1,
                        1.35,
                        1,
                      ],
                      opacity: [
                        0.45,
                        0,
                        0.45,
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                    className="
                      absolute
                      inset-0
                      rounded-full
                      bg-blue-400
                    "
                  />
                )}

              <div className="relative">
                <StatusIcon size={36} />
              </div>
            </motion.div>

            <motion.h2
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.25,
              }}
              className="
                text-xl
                sm:text-2xl
                font-bold
                text-gray-900
                mt-5
              "
            >
              {statusContent.title}
            </motion.h2>

            <motion.p
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.35,
              }}
              className="
                text-sm
                text-gray-500
                max-w-lg
                mx-auto
                mt-2
              "
            >
              {statusContent.description}
            </motion.p>
          </div>

          {/* ===============================================
              CANCELLED / RETURNED
          =============================================== */}

          {isCancelled || isReturned ? (
            <div className="px-5 sm:px-10 py-10">

              <div
                className={`
                  max-w-xl
                  mx-auto
                  p-5
                  rounded-2xl
                  text-center
                  border
                  ${
                    isCancelled
                      ? "bg-red-50 border-red-100"
                      : "bg-orange-50 border-orange-100"
                  }
                `}
              >

                {isCancelled ? (
                  <XCircle
                    size={26}
                    className="mx-auto text-red-500"
                  />
                ) : (
                  <RotateCcw
                    size={26}
                    className="mx-auto text-orange-500"
                  />
                )}

                <p
                  className={`
                    mt-3
                    text-sm
                    font-semibold
                    ${
                      isCancelled
                        ? "text-red-700"
                        : "text-orange-700"
                    }
                  `}
                >
                  {isCancelled
                    ? "This order has been cancelled."
                    : "This order has been returned."}
                </p>

                <p
                  className={`
                    mt-1
                    text-xs
                    ${
                      isCancelled
                        ? "text-red-600"
                        : "text-orange-600"
                    }
                  `}
                >
                  {isCancelled
                    ? "No further delivery updates are available for this order."
                    : "This order is no longer active for delivery."}
                </p>
              </div>
            </div>
          ) : (
            /* =============================================
               TRACKING TIMELINE
            ============================================= */

            <div className="px-5 sm:px-10 py-10">

              <div className="relative max-w-6xl mx-auto">

                {/* DESKTOP BACKGROUND LINE */}

                <div
                  className="
                    hidden
                    md:block
                    absolute
                    top-7
                    left-[10%]
                    right-[10%]
                    h-1
                    rounded-full
                    bg-gray-100
                  "
                />

                {/* DESKTOP ACTIVE LINE */}

                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width:
                      currentStepIndex <= 0
                        ? "0%"
                        : `${
                            (currentStepIndex /
                              (trackingSteps.length -
                                1)) *
                            80
                          }%`,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut",
                  }}
                  className="
                    hidden
                    md:block
                    absolute
                    top-7
                    left-[10%]
                    h-1
                    rounded-full
                    bg-blue-600
                  "
                />

                {/* STEPS */}

                <div
                  className="
                    grid
                    grid-cols-1
                    md:grid-cols-5
                    gap-7
                    md:gap-3
                  "
                >

                  {trackingSteps.map(
                    (step, index) => {

                      const state =
                        getStepState(index);

                      const Icon =
                        step.icon;

                      const isCompleted =
                        state === "completed";

                      const isCurrent =
                        state === "current";

                      return (
                        <motion.div
                          key={step.key}
                          initial={{
                            opacity: 0,
                            y: 20,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay:
                              0.3 +
                              index * 0.12,
                          }}
                          className="
                            relative
                            flex
                            md:flex-col
                            items-center
                            md:text-center
                            gap-4
                            md:gap-0
                          "
                        >

                          {/* MOBILE LINE */}

                          {index <
                            trackingSteps.length -
                              1 && (
                            <div
                              className="
                                md:hidden
                                absolute
                                left-[23px]
                                top-[52px]
                                w-0.5
                                h-[calc(100%+28px)]
                                bg-gray-100
                              "
                            >

                              {index <
                                currentStepIndex && (
                                <motion.div
                                  initial={{
                                    height: 0,
                                  }}
                                  animate={{
                                    height:
                                      "100%",
                                  }}
                                  transition={{
                                    duration:
                                      0.6,
                                    delay:
                                      0.4 +
                                      index *
                                        0.1,
                                  }}
                                  className="
                                    w-full
                                    bg-blue-600
                                  "
                                />
                              )}
                            </div>
                          )}

                          {/* ICON */}

                          <motion.div
                            animate={
                              isCurrent
                                ? {
                                    scale: [
                                      1,
                                      1.08,
                                      1,
                                    ],
                                  }
                                : {}
                            }
                            transition={{
                              duration: 1.8,
                              repeat:
                                isCurrent
                                  ? Infinity
                                  : 0,
                              ease: "easeInOut",
                            }}
                            className={`
                              relative
                              z-10
                              w-14
                              h-14
                              shrink-0
                              rounded-full
                              flex
                              items-center
                              justify-center
                              border-4
                              ${
                                isCompleted
                                  ? "bg-blue-600 border-blue-100 text-white"
                                  : isCurrent
                                    ? "bg-white border-blue-500 text-blue-600 shadow-lg shadow-blue-100"
                                    : "bg-white border-gray-200 text-gray-300"
                              }
                            `}
                          >

                            {isCompleted ? (
                              <CheckCircle2
                                size={23}
                              />
                            ) : (
                              <Icon
                                size={22}
                              />
                            )}

                            {/* CURRENT PULSE */}

                            {isCurrent && (
                              <motion.span
                                animate={{
                                  scale: [
                                    1,
                                    1.5,
                                  ],
                                  opacity: [
                                    0.4,
                                    0,
                                  ],
                                }}
                                transition={{
                                  duration: 1.6,
                                  repeat:
                                    Infinity,
                                }}
                                className="
                                  absolute
                                  inset-0
                                  rounded-full
                                  border-2
                                  border-blue-400
                                "
                              />
                            )}
                          </motion.div>

                          {/* TEXT */}

                          <div className="md:mt-4">

                            <p
                              className={`
                                text-sm
                                font-semibold
                                ${
                                  isCompleted ||
                                  isCurrent
                                    ? "text-gray-900"
                                    : "text-gray-400"
                                }
                              `}
                            >
                              {step.label}
                            </p>

                            <p
                              className={`
                                text-xs
                                mt-1
                                ${
                                  isCurrent
                                    ? "text-blue-600"
                                    : "text-gray-400"
                                }
                              `}
                            >
                              {step.description}
                            </p>

                            {isCurrent && (
                              <motion.div
                                initial={{
                                  opacity: 0,
                                }}
                                animate={{
                                  opacity: 1,
                                }}
                                className="
                                  inline-flex
                                  items-center
                                  gap-1
                                  mt-2
                                  text-[11px]
                                  font-semibold
                                  text-blue-600
                                  bg-blue-50
                                  px-2.5
                                  py-1
                                  rounded-full
                                "
                              >
                                <CircleDot
                                  size={11}
                                />

                                Current Status
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===============================================
              ORDER META
          =============================================== */}

          <div
            className="
              border-t
              border-gray-100
              grid
              grid-cols-1
              sm:grid-cols-3
            "
          >

            {/* DATE */}

            <div className="p-5 sm:p-6 flex items-center gap-3">

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-gray-50
                  flex
                  items-center
                  justify-center
                  text-gray-500
                "
              >
                <CalendarDays size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Order Date
                </p>

                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {formatDate(
                    order?.createdAt,
                  )}
                </p>
              </div>
            </div>

            {/* ITEMS */}

            <div
              className="
                p-5
                sm:p-6
                flex
                items-center
                gap-3
                border-t
                sm:border-t-0
                sm:border-l
                border-gray-100
              "
            >

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-gray-50
                  flex
                  items-center
                  justify-center
                  text-gray-500
                "
              >
                <Package size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Items
                </p>

                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {orderItem.length}{" "}
                  {orderItem.length === 1
                    ? "Item"
                    : "Items"}
                </p>
              </div>
            </div>

            {/* DELIVERY */}

            <div
              className="
                p-5
                sm:p-6
                flex
                items-center
                gap-3
                border-t
                sm:border-t-0
                sm:border-l
                border-gray-100
              "
            >

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-gray-50
                  flex
                  items-center
                  justify-center
                  text-gray-500
                "
              >
                <Truck size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Delivery
                </p>

                <p className="text-sm font-semibold text-gray-900 mt-1">
                  Standard Delivery
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =================================================
            LOWER CONTENT
        ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

          {/* =================================================
              PRODUCTS
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.35,
            }}
            className="
              lg:col-span-2
              bg-white
              rounded-2xl
              border
              border-gray-100
              shadow-sm
              overflow-hidden
            "
          >

            {/* HEADER */}

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
                      : "items"}{" "}
                    in this order
                  </p>
                </div>
              </div>
            </div>

            {/* PRODUCTS */}

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
                orderItem.map(
                  (item, index) => (
                    <motion.div
                      key={
                        item._id ||
                        item.id ||
                        index
                      }
                      initial={{
                        opacity: 0,
                        x: -15,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          0.4 +
                          index * 0.08,
                      }}
                      className="
                        p-5
                        sm:p-6
                        flex
                        gap-4
                      "
                    >

                      {/* IMAGE */}

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
                            src={getImageUrl(
                              item.product
                                .images[0],
                            )}
                            alt={
                              item.productName ||
                              item.product?.name ||
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

                      {/* DETAILS */}

                      <div className="flex-1 min-w-0">

                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">

                          <div>

                            <h3 className="font-semibold text-gray-900 line-clamp-2">
                              {item.productName ||
                                item.product?.name ||
                                "Product"}
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                              Quantity:{" "}
                              <span className="font-medium text-gray-700">
                                {item.quantity ||
                                  1}
                              </span>
                            </p>

                            {item.price != null && (
                              <p className="text-xs text-gray-400 mt-1">
                                Price: ₹
                                {Number(
                                  item.price,
                                ).toFixed(2)}
                              </p>
                            )}
                          </div>

                          <div className="sm:text-right">

                            <p className="text-xs text-gray-500">
                              Item Total
                            </p>

                            <p className="text-base font-bold text-gray-900 mt-1">
                              ₹
                              {Number(
                                item.total ??
                                  Number(
                                    item.price ||
                                      0,
                                  ) *
                                    Number(
                                      item.quantity ||
                                        1,
                                    ),
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ),
                )
              )}
            </div>
          </motion.div>

          {/* =================================================
              ADDRESS + SUMMARY
          ================================================= */}

          <div className="space-y-6">

            {/* ===============================================
                ADDRESS
            =============================================== */}

            {orderAddress && (
              <motion.div
                initial={{
                  opacity: 0,
                  x: 20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.4,
                }}
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
                      Delivery Address
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Shipping address
                    </p>
                  </div>
                </div>

                <div className="mt-5 p-4 rounded-xl bg-gray-50">

                  <div className="flex items-start gap-3">

                    <User
                      size={17}
                      className="
                        text-gray-400
                        mt-0.5
                        shrink-0
                      "
                    />

                    <div>

                      <p className="text-sm font-semibold text-gray-900">
                        {orderAddress.name ||
                          "Customer"}
                      </p>

                      {orderAddress.addressLine1 && (
                        <p className="text-sm text-gray-600 mt-2">
                          {orderAddress.addressLine1}
                        </p>
                      )}

                      {(orderAddress.city ||
                        orderAddress.state) && (
                        <p className="text-sm text-gray-600">
                          {orderAddress.city}
                          {orderAddress.city &&
                          orderAddress.state
                            ? ", "
                            : ""}
                          {orderAddress.state}
                        </p>
                      )}

                      {orderAddress.postalCode && (
                        <p className="text-sm text-gray-600">
                          {orderAddress.postalCode}
                        </p>
                      )}

                      {orderAddress.country && (
                        <p className="text-sm text-gray-600">
                          {orderAddress.country}
                        </p>
                      )}
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
                        size={16}
                        className="text-gray-400"
                      />

                      <span className="text-sm text-gray-700">
                        {orderAddress.phone}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ===============================================
                SUMMARY
            =============================================== */}

            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.5,
              }}
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

                <h2 className="text-lg font-semibold text-gray-900">
                  Order Summary
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Payment details
                </p>
              </div>

              <div className="p-5 sm:p-6 space-y-4">

                {/* SUBTOTAL */}

                <div className="flex justify-between text-sm">

                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-gray-900">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                {/* SHIPPING */}

                <div className="flex justify-between text-sm">

                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span
                    className={
                      shippingCharge === 0
                        ? "font-medium text-green-600"
                        : "font-medium text-gray-900"
                    }
                  >
                    {shippingCharge === 0
                      ? "Free"
                      : `₹${shippingCharge.toFixed(
                          2,
                        )}`}
                  </span>
                </div>

                {/* DISCOUNT */}

                <div className="flex justify-between text-sm">

                  <span className="text-gray-500">
                    Discount
                  </span>

                  <span className="font-medium text-green-600">
                    {discount > 0
                      ? `-₹${discount.toFixed(
                          2,
                        )}`
                      : "₹0.00"}
                  </span>
                </div>

                {/* TOTAL */}

                <div className="pt-4 border-t border-gray-100">

                  <div className="flex items-center justify-between">

                    <span className="font-semibold text-gray-900">
                      Total
                    </span>

                    <span className="text-xl font-bold text-gray-900">
                      ₹{orderTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* =================================================
            BOTTOM BUTTONS
        ================================================= */}

        <div className="flex flex-col sm:flex-row gap-3 mt-6">

          {/* REFRESH */}

          <button
            type="button"
            onClick={() =>
              dispatch(
                getOrderItems(orderId),
              )
            }
            disabled={loading}
          className="
      w-full sm:flex-1
      min-h-12
      px-4
      rounded-xl
      border border-gray-200
      bg-white
      hover:border-blue-300
      hover:text-blue-600
      text-gray-700
      text-sm
      font-semibold
      transition
      flex items-center justify-center
      gap-2
      whitespace-nowrap
      disabled:opacity-50
      disabled:cursor-not-allowed
    "
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            {loading
              ? "Refreshing..."
              : "Refresh Tracking"}
          </button>

          {/* ORDER DETAILS */}

          <button
            type="button"
            onClick={() =>
              navigate(`/orders/${orderId}`)
            }
             className="
      w-full sm:flex-1
      min-h-12
      px-4
      rounded-xl
      bg-blue-600
      hover:bg-blue-700
      text-white
      text-sm
      font-semibold
      transition
      flex items-center justify-center
      gap-2
      whitespace-nowrap
    "
          >
            <Package size={17} />
            View Order Details
          </button>
        </div>
      </section>
    </main>
  );
}

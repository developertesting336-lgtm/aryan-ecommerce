import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";

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
  Loader2,
  RefreshCw,
  Star,
  Ban,
  X,
  Send,
  ImagePlus,
  Trash2,
} from "lucide-react";

import {
  getOrderItems,
  clearOrderDetails,
  cancelOrder,
} from "../redux/slices/orderSlice";

import {
  createReview,updateReview,getReviewById
} from "../redux/slices/reviewsSlice";

export default function OrderDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams();

  // =====================================================
  // ORDER STATE
  // =====================================================

  const {
    orderDetails,
    loading,
    error,
  } = useSelector((state) => state.order);

  // =====================================================
  // REVIEW STATE
  // =====================================================

const {
  createLoading: reviewLoading,
  updateLoading: updateReviewLoading,
  error: reviewError,
} = useSelector((state) => state.review);
  // =====================================================
  // LOCAL STATE
  // =====================================================
  const [getReviewLoading, setGetReviewLoading] =
  useState(false);
const [updateRatingModal, setUpdateRatingModal] =
  useState(false);

const [selectedReview, setSelectedReview] =
  useState(null);

const [updateRating, setUpdateRating] =
  useState(0);

const [updateHoverRating, setUpdateHoverRating] =
  useState(0);

  const [cancelLoading, setCancelLoading] =
    useState(false);

  const [reviewModal, setReviewModal] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [rating, setRating] =
    useState(0);

  const [reviewText, setReviewText] =
    useState("");

  const [hoverRating, setHoverRating] =
    useState(0);

  // Review image files
  const [reviewImages, setReviewImages] =
    useState([]);

  // Review image previews
  const [reviewImagePreviews, setReviewImagePreviews] =
    useState([]);

  // =====================================================
  // ORDER DATA
  // =====================================================

  const {
    orderItem = [],
    orderAddress = null,
  } = orderDetails || {};

console.log("orderitmmm",orderItem)
  // =====================================================
  // API URL
  // =====================================================

  const API_URL = "http://localhost:3000";

  // =====================================================
  // IMAGE URL
  // =====================================================

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

  // =====================================================
  // GET ORDER DETAILS
  // =====================================================

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderItems(orderId));
    }

    return () => {
      dispatch(clearOrderDetails());
    };
  }, [dispatch, orderId]);

  // =====================================================
  // TOTALS
  // =====================================================

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
    subtotal + Number(shippingCharge);

  // =====================================================
  // ORDER STATUS
  // =====================================================

  const rawStatus =
    orderItem?.[0]?.order?.fulfillmentStatus ??
    orderItem?.[0]?.order?.fulfilledStatus ??
    orderItem?.[0]?.order?.fullfilledStatus ??
    orderItem?.[0]?.order?.fullfilledstatus ??
    orderDetails?.order?.fulfillmentStatus ??
    orderDetails?.order?.fulfilledStatus ??
    orderDetails?.order?.fullfilledStatus ??
    orderDetails?.order?.fullfilledstatus ??
    "CONFIRMED";

  const normalizedStatus = String(rawStatus)
    .trim()
    .toUpperCase();

  // =====================================================
  // CANCEL CONDITION
  // =====================================================

  const canCancel =
    normalizedStatus === "PENDING" ||
    normalizedStatus === "CONFIRMED" ||
    normalizedStatus === "PROCESSING" ||
    normalizedStatus === "SHIPPED" ||
    normalizedStatus === "UNFULFILLED";

  // =====================================================
  // REVIEW CONDITION
  // =====================================================

  const canReview =
    normalizedStatus === "DELIVERED";

  // =====================================================
  // STATUS CONFIG
  // =====================================================

  const getStatusConfig = (value) => {
    const normalized = String(value || "")
      .trim()
      .toUpperCase();

    switch (normalized) {
      case "CONFIRMED":
        return {
          label: "Confirmed",
          icon: CheckCircle2,
          className:
            "bg-blue-50 text-blue-600 border-blue-100",
        };

      case "PENDING":
        return {
          label: "Pending",
          icon: Clock3,
          className:
            "bg-gray-100 text-gray-600 border-gray-200",
        };

      case "PROCESSING":
        return {
          label: "Processing",
          icon: Clock3,
          className:
            "bg-yellow-50 text-yellow-600 border-yellow-100",
        };

      case "UNFULFILLED":
        return {
          label: "Unfulfilled",
          icon: Clock3,
          className:
            "bg-orange-50 text-orange-600 border-orange-100",
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
    getStatusConfig(rawStatus);

  const StatusIcon =
    statusConfig.icon;

  // =====================================================
  // DATE
  // =====================================================

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

  // =====================================================
  // CANCEL ORDER
  // =====================================================

  const handleCancelOrder = async () => {
    if (!orderId || cancelLoading) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelLoading(true);

      await dispatch(
        cancelOrder(orderId)
      ).unwrap();

      await dispatch(
        getOrderItems(orderId)
      ).unwrap();

    } catch (err) {
      console.error(
        "Cancel order error:",
        err
      );

      const message =
        typeof err === "string"
          ? err
          : err?.message ||
            err?.error ||
            "Unable to cancel the order.";

     showError(message);
    } finally {
      setCancelLoading(false);
    }
  };

  // =====================================================
  // OPEN REVIEW MODAL
  // =====================================================

  const handleOpenReview = (item) => {
    const productId =
      item?.product?._id ||
      item?.product?.id ||
      item?.productId;

    if (!productId) {
      console.error(
        "Product ID not found:",
        item
      );

      showError("Unable to find product information.");;

      return;
    }

    setSelectedProduct({
      ...item,
      productId,
    });

    setRating(0);
    setReviewText("");
    setHoverRating(0);
    setReviewImages([]);
    setReviewImagePreviews([]);

    setReviewModal(true);
  };

 const handleOpenUpdateRating = async (item) => {
  const reviewId =
    item?.reviewId ||
    item?.review?._id ||
    item?.review?.id;

  if (!reviewId) {
    showError("Review information not found.");
    return;
  }

  try {
    setGetReviewLoading(true);

    const response = await dispatch(
      getReviewById(reviewId)
    ).unwrap();

    console.log("GET REVIEW BY ID RESPONSE:", response);

    const review =
      response?.data?.review ||
      response?.review ||
      response?.data ||
      response;

    if (!review?._id) {
      showError("Review not found.");
      return;
    }

    setSelectedReview(review);

    setUpdateRating(Number(review.rating) || 0);

    setUpdateHoverRating(0);

    setUpdateRatingModal(true);
  } catch (err) {
    console.error("Get review by ID error:", err);

    const message =
      typeof err === "string"
        ? err
        : err?.message ||
          err?.error ||
          "Failed to load review.";

    showError(message);
  } finally {
    setGetReviewLoading(false);
  }
};
  // =====================================================
  // CLOSE REVIEW MODAL
  // =====================================================
const handleCloseUpdateRating = () => {
  if (updateReviewLoading) {
    return;
  }

  setUpdateRatingModal(false);
  setSelectedReview(null);
  setUpdateRating(0);
  setUpdateHoverRating(0);
};
const handleUpdateRating = async (e) => {
  e.preventDefault();

  if (!selectedReview?._id) {
    showError("Review information not found.");
    return;
  }

  if (!updateRating) {
    showError("Please select a rating.");
    return;
  }

  try {
    await dispatch(
      updateReview({
        id: selectedReview._id,
        reviewData: {
          rating: updateRating,
        },
      })
    ).unwrap();

    // Refresh order data
    await dispatch(
      getOrderItems(orderId)
    ).unwrap();

    handleCloseUpdateRating();

    showSuccess(
      "Rating updated successfully!"
    );
  } catch (err) {
    console.error(
      "Update rating error:",
      err
    );

    const message =
      typeof err === "string"
        ? err
        : err?.message ||
          err?.error ||
          "Failed to update rating.";

    showError(message);
  }
};
  const handleCloseReview = () => {
    if (reviewLoading) {
      return;
    }

    // Release preview URLs
    reviewImagePreviews.forEach((image) => {
      if (image?.url) {
        URL.revokeObjectURL(image.url);
      }
    });

    setReviewModal(false);
    setSelectedProduct(null);

    setRating(0);
    setReviewText("");
    setHoverRating(0);

    setReviewImages([]);
    setReviewImagePreviews([]);
  };

  // =====================================================
  // HANDLE REVIEW IMAGES
  // =====================================================

  const handleReviewImages = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) {
      return;
    }

    // Maximum 5 images total
    if (
      reviewImages.length + files.length >
      5
    ) {
      showError("You can upload a maximum of 5 images.");

      e.target.value = "";
      return;
    }

    const validFiles = [];

    for (const file of files) {
      // Image validation
      if (!file.type.startsWith("image/")) {
        showError(`${file.name} is not a valid image.`);

        continue;
      }

      // 5 MB maximum
      if (
        file.size >
        5 * 1024 * 1024
      ) {
       showError(`${file.name} is larger than 5 MB.`);

        continue;
      }

      validFiles.push(file);
    }

    if (!validFiles.length) {
      e.target.value = "";
      return;
    }

    // Create preview URLs
    const newPreviews =
      validFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));

    setReviewImages((previous) => [
      ...previous,
      ...validFiles,
    ]);

    setReviewImagePreviews((previous) => [
      ...previous,
      ...newPreviews,
    ]);

    // Allow selecting same file again
    e.target.value = "";
  };

  // =====================================================
  // REMOVE REVIEW IMAGE
  // =====================================================

  const removeReviewImage = (index) => {
    setReviewImages((previous) =>
      previous.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );

    setReviewImagePreviews((previous) => {
      const image = previous[index];

      if (image?.url) {
        URL.revokeObjectURL(
          image.url
        );
      }

      return previous.filter(
        (_, imageIndex) =>
          imageIndex !== index
      );
    });
  };

  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!selectedProduct?.productId) {
      return;
    }

    if (!rating) {
      showError("Please select a rating.");

      return;
    }

    if (!reviewText.trim()) {
       showError("Please write your review.");
      return;
    }

    if (reviewText.trim().length < 5) {
     showError("Review must contain at least 5 characters.");

      return;
    }

    if (reviewText.trim().length > 1000) {
      showError("Review cannot exceed 1000 characters.");

      return;
    }

    try {
      // =================================================
      // FORM DATA
      // =================================================

      const formData = new FormData();

      // Backend expects rating
      formData.append(
        "rating",
        String(rating)
      );

      // Backend expects description
      formData.append(
        "description",
        reviewText.trim()
      );

      // Add images
      reviewImages.forEach((file) => {
        formData.append(
          "images",
          file
        );
      });

      console.log(
        "Submitting review:",
        {
          productId:
            selectedProduct.productId,
          rating,
          description:
            reviewText.trim(),
          imageCount:
            reviewImages.length,
        }
      );

      await dispatch(
        createReview({
          productId:
            selectedProduct.productId,

          reviewData:
            formData,
        })
      ).unwrap();

      // Release preview URLs
      reviewImagePreviews.forEach(
        (image) => {
          if (image?.url) {
            URL.revokeObjectURL(
              image.url
            );
          }
        }
      );

      // Reset
      setReviewModal(false);
      setSelectedProduct(null);

      setRating(0);
      setReviewText("");
      setHoverRating(0);

      setReviewImages([]);
      setReviewImagePreviews([]);

      showSuccess(
        "Review submitted successfully!"
      );

    } catch (err) {
      console.error(
        "Create review error:",
        err
      );

      const message =
        typeof err === "string"
          ? err
          : err?.message ||
            err?.error ||
            "Failed to submit review.";

      showError(message);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">

        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

            <div className="h-5 w-32 bg-gray-200 rounded" />

            <div className="h-8 w-56 bg-gray-200 rounded mt-4" />

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

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">

        <section className="bg-white border-b">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

            <button
              type="button"
              onClick={() =>
                navigate("/orders")
              }
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
              {typeof error === "string"
                ? error
                : error?.message ||
                  "Something went wrong."}
            </p>

            <button
              type="button"
              onClick={() =>
                dispatch(
                  getOrderItems(orderId)
                )
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

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <>
      <main className="min-h-screen bg-gray-50">

        {/* ==================================================
            HEADER
        ================================================== */}

        <section className="bg-white border-b">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

            <button
              type="button"
              onClick={() =>
                navigate("/orders")
              }
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

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ==================================================
                LEFT
            ================================================== */}

            <div className="lg:col-span-2 space-y-6">

              {/* ==================================================
                  ORDER INFORMATION
              ================================================== */}

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

              {/* ==================================================
                  PRODUCTS
              ================================================== */}

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

                        {/* PRODUCT IMAGE */}

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
                                item.product.images[0]
                              )}
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

                        {/* PRODUCT DETAILS */}

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
                              flex-col
                              sm:flex-row
                              sm:items-center
                              sm:justify-between
                              gap-3
                              mt-4
                              pt-3
                              border-t
                              border-gray-100
                            "
                          >

                            <div className="flex justify-between sm:justify-start gap-2">

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

                            {/* REVIEW BUTTON */}

  {canReview && (
  item?.reviewId ||
  item?.review?._id ||
  item?.review?.id ? (
    <button
      type="button"
      onClick={() => handleOpenUpdateRating(item)}
      className="
        inline-flex
        items-center
        justify-center
        gap-2
        h-10
        px-4
        rounded-xl
        bg-yellow-500
        hover:bg-yellow-600
        text-white
        text-sm
        font-semibold
        transition
        shadow-sm
      "
    >
      <Star
        size={16}
        fill="currentColor"
      />

      Update Rating
    </button>
  ) : (
    <button
      type="button"
      onClick={() => handleOpenReview(item)}
      className="
        inline-flex
        items-center
        justify-center
        gap-2
        h-10
        px-4
        rounded-xl
        bg-blue-600
        hover:bg-sky-500
        text-white
        text-sm
        font-semibold
        transition
        shadow-sm
      "
    >
      <Star
        size={16}
        fill="currentColor"
      />

      Review Product
    </button>
  )
)}

                          </div>

                        </div>

                      </div>

                    ))

                  )}

                </div>

              </div>

              {/* ==================================================
                  SHIPPING ADDRESS
              ================================================== */}

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

            {/* ==================================================
                RIGHT SUMMARY
            ================================================== */}

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

                <div className="p-5 sm:p-6 border-b border-gray-100">

                  <h2 className="text-lg font-semibold text-gray-900">
                    Order Summary
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Payment summary
                  </p>

                </div>

                <div className="p-5 sm:p-6 space-y-4">

                  <div className="flex justify-between text-sm">

                    <span className="text-gray-500">
                      Subtotal
                    </span>

                    <span className="font-medium text-gray-900">

                      ₹
                      {orderDetails?.order?.subtotal ??
                        subtotal}

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

                  {/* STATUS */}

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
                            ) ||
                          "text-blue-600"
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

                  {/* CANCEL ORDER */}

                  {canCancel && (

                    <button
                      type="button"
                      onClick={handleCancelOrder}
                      disabled={cancelLoading}
                      className="
                        w-full
                        h-11
                        rounded-xl
                        border
                        border-red-200
                        bg-red-50
                        hover:bg-red-100
                        hover:border-red-300
                        text-red-600
                        text-sm
                        font-semibold
                        transition
                        flex
                        items-center
                        justify-center
                        gap-2
                        disabled:opacity-60
                        disabled:cursor-not-allowed
                      "
                    >

                      {cancelLoading ? (

                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />

                          Cancelling...
                        </>

                      ) : (

                        <>
                          <Ban size={17} />

                          Cancel Order
                        </>

                      )}

                    </button>

                  )}

                  {/* BACK */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/orders")
                    }
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

      {/* ======================================================
          REVIEW MODAL
      ====================================================== */}

      {reviewModal && selectedProduct && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            p-4
          "
        >

          {/* BACKDROP */}

          <div
            className="
              absolute
              inset-0
              bg-black/50
              backdrop-blur-sm
            "
            onClick={handleCloseReview}
          />

          {/* MODAL */}

          <div
            className="
              relative
              w-full
              max-w-lg
              max-h-[95vh]
              bg-white
              rounded-3xl
              shadow-2xl
              overflow-hidden
              flex
              flex-col
            "
          >

            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <div
              className="
                shrink-0
                flex
                items-center
                justify-between
                px-6
                py-5
                border-b
                border-gray-100
              "
            >

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Review Product
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Share your experience with this product
                </p>

              </div>

              <button
                type="button"
                onClick={handleCloseReview}
                disabled={reviewLoading}
                className="
                  w-9
                  h-9
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-gray-500
                  hover:bg-gray-100
                  hover:text-gray-800
                  transition
                  disabled:opacity-50
                "
              >

                <X size={20} />

              </button>

            </div>

            {/* ==================================================
                SCROLLABLE CONTENT
            ================================================== */}

            <div className="overflow-y-auto">

              {/* PRODUCT */}

              <div className="px-6 pt-6">

                <div
                  className="
                    flex
                    items-center
                    gap-4
                    p-4
                    rounded-2xl
                    bg-gray-50
                    border
                    border-gray-100
                  "
                >

                  <div
                    className="
                      w-16
                      h-16
                      rounded-xl
                      overflow-hidden
                      bg-white
                      border
                      border-gray-100
                      shrink-0
                    "
                  >

                    {selectedProduct?.product?.images?.[0] ? (

                      <img
                        src={getImageUrl(
                          selectedProduct
                            ?.product
                            ?.images?.[0]
                        )}
                        alt={
                          selectedProduct?.productName ||
                          selectedProduct?.product?.name ||
                          "Product"
                        }
                        className="
                          w-full
                          h-full
                          object-cover
                        "
                      />

                    ) : (

                      <div
                        className="
                          w-full
                          h-full
                          flex
                          items-center
                          justify-center
                          bg-gray-50
                        "
                      >

                        <Package
                          size={22}
                          className="text-gray-300"
                        />

                      </div>

                    )}

                  </div>

                  <div className="min-w-0">

                    <h3 className="font-semibold text-gray-900 truncate">

                      {selectedProduct?.productName ||
                        selectedProduct?.product?.name ||
                        "Product"}

                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Delivered product
                    </p>

                  </div>

                </div>

              </div>

              {/* ==================================================
                  FORM
              ================================================== */}

              <form
                onSubmit={handleSubmitReview}
                className="p-6"
              >

                {/* ==================================================
                    RATING
                ================================================== */}

                <div>

                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Your Rating
                  </label>

                  <div className="flex items-center gap-2">

                    {[1, 2, 3, 4, 5].map(
                      (star) => {

                        const active =
                          star <=
                          (
                            hoverRating ||
                            rating
                          );

                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              setRating(star)
                            }
                            onMouseEnter={() =>
                              setHoverRating(
                                star
                              )
                            }
                            onMouseLeave={() =>
                              setHoverRating(0)
                            }
                            className="
                              transition
                              hover:scale-110
                            "
                          >

                            <Star
                              size={32}
                              className={
                                `${active
                                  ? "text-yellow-400"
                                  : "text-gray-300"}
                                  `  
                              }
                              fill={
                                active
                                  ? "currentColor"
                                  : "none"
                              }
                            />

                          </button>
                        );
                      }
                    )}

                    {rating > 0 && (

                      <span className="ml-2 text-sm font-medium text-gray-600">
                        {rating}/5
                      </span>

                    )}

                  </div>

                </div>

                {/* ==================================================
                    REVIEW DESCRIPTION
                ================================================== */}

                <div className="mt-6">

                  <label
                    htmlFor="reviewText"
                    className="
                      block
                      text-sm
                      font-semibold
                      text-gray-900
                      mb-3
                    "
                  >
                    Your Review
                  </label>

                  <textarea
                    id="reviewText"
                    value={reviewText}
                    onChange={(e) =>
                      setReviewText(
                        e.target.value
                      )
                    }
                    placeholder="Tell us what you think about this product..."
                    rows={5}
                    maxLength={1000}
                    className="
                      w-full
                      resize-none
                      rounded-2xl
                      border
                      border-gray-200
                      bg-gray-50
                      px-4
                      py-3
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      focus:bg-white
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  />

                  <div className="flex justify-end mt-1">

                    <span className="text-xs text-gray-400">
                      {reviewText.length}/1000
                    </span>

                  </div>

                </div>

                {/* ==================================================
                    REVIEW IMAGES
                ================================================== */}

                <div className="mt-6">

                  <div className="flex items-center justify-between mb-3">

                    <div>

                      <label className="block text-sm font-semibold text-gray-900">
                        Add Photos
                      </label>

                      <p className="text-xs text-gray-500 mt-1">
                        Upload up to 5 images
                      </p>

                    </div>

                    <span className="text-xs font-medium text-gray-400">
                      {reviewImages.length}/5
                    </span>

                  </div>

                  {/* UPLOAD */}

                  {reviewImages.length < 5 && (

                    <label
                      htmlFor="reviewImages"
                      className="
                        cursor-pointer
                        flex
                        items-center
                        justify-center
                        gap-2
                        w-full
                        h-12
                        rounded-xl
                        border-2
                        border-dashed
                        border-gray-200
                        bg-gray-50
                        text-gray-600
                        hover:border-blue-400
                        hover:bg-blue-50
                        hover:text-blue-600
                        transition
                      "
                    >

                      <ImagePlus size={19} />

                      <span className="text-sm font-medium">
                        Add Photos
                      </span>

                      <input
                        id="reviewImages"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        multiple
                        className="hidden"
                        onChange={handleReviewImages}
                      />

                    </label>

                  )}

                  {/* PREVIEWS */}

                  {reviewImagePreviews.length > 0 && (

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">

                      {reviewImagePreviews.map(
                        (image, index) => (

                          <div
                            key={`${image.file.name}-${index}`}
                            className="
                              relative
                              aspect-square
                              rounded-xl
                              overflow-hidden
                              border
                              border-gray-200
                              bg-gray-100
                            "
                          >

                            <img
                              src={image.url}
                              alt={`Review ${index + 1}`}
                              className="
                                w-full
                                h-full
                                object-cover
                              "
                            />

                            {/* REMOVE */}

                            <button
                              type="button"
                              onClick={() =>
                                removeReviewImage(
                                  index
                                )
                              }
                              className="
                                absolute
                                top-1
                                right-1
                                w-7
                                h-7
                                rounded-full
                                bg-black/60
                                hover:bg-red-600
                                text-white
                                flex
                                items-center
                                justify-center
                                transition
                              "
                              title="Remove image"
                            >

                              <Trash2 size={14} />

                            </button>

                          </div>

                        )
                      )}

                    </div>

                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    JPG, PNG or WEBP • Maximum 5 MB per image
                  </p>

                </div>

                {/* ==================================================
                    ERROR
                ================================================== */}

                {reviewError && (

                  <div
                    className="
                      mt-4
                      p-3
                      rounded-xl
                      bg-red-50
                      border
                      border-red-100
                      text-sm
                      text-red-600
                    "
                  >

                    {typeof reviewError === "string"
                      ? reviewError
                      : reviewError?.message ||
                        "Failed to submit review."}

                  </div>

                )}

                {/* ==================================================
                    BUTTONS
                ================================================== */}

                <div className="flex gap-3 mt-6">

                  <button
                    type="button"
                    onClick={handleCloseReview}
                    disabled={reviewLoading}
                    className="
                      flex-1
                      h-11
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      text-gray-700
                      text-sm
                      font-semibold
                      hover:bg-gray-50
                      transition
                      disabled:opacity-50
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      reviewLoading ||
                      !rating ||
                      !reviewText.trim()
                    }
                    className="
                      flex-1
                      h-11
                      rounded-xl
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      text-sm
                      font-semibold
                      transition
                      flex
                      items-center
                      justify-center
                      gap-2
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >

                    {reviewLoading ? (

                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />

                        Submitting...
                      </>

                    ) : (

                      <>
                        <Send size={17} />

                        Submit Review
                      </>

                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}
{updateRatingModal && selectedReview && (
  <div
    className="
      fixed
      inset-0
      z-[110]
      flex
      items-center
      justify-center
      p-4
    "
  >
    {/* BACKDROP */}

    <div
      className="
        absolute
        inset-0
        bg-black/50
        backdrop-blur-sm
      "
      onClick={handleCloseUpdateRating}
    />

    {/* MODAL */}

    <div
      className="
        relative
        w-full
        max-w-md
        bg-white
        rounded-3xl
        shadow-2xl
        overflow-hidden
      "
    >
      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
          px-6
          py-5
          border-b
          border-gray-100
        "
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Update Rating
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Update your rating for this product
          </p>
        </div>

        <button
          type="button"
          onClick={handleCloseUpdateRating}
          disabled={updateReviewLoading}
          className="
            w-9
            h-9
            rounded-full
            flex
            items-center
            justify-center
            text-gray-500
            hover:bg-gray-100
            hover:text-gray-800
            transition
            disabled:opacity-50
          "
        >
          <X size={20} />
        </button>
      </div>

      {/* CONTENT */}

      <form
        onSubmit={handleUpdateRating}
        className="p-6"
      >
        <div className="text-center">

          <p className="text-sm font-semibold text-gray-900">
            How would you rate this product?
          </p>

          {/* STARS */}

          <div className="flex justify-center items-center gap-2 mt-5">
            {[1, 2, 3, 4, 5].map(
              (star) => {
                const active =
                  star <=
                  (
                    updateHoverRating ||
                    updateRating
                  );

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setUpdateRating(star)
                    }
                    onMouseEnter={() =>
                      setUpdateHoverRating(
                        star
                      )
                    }
                    onMouseLeave={() =>
                      setUpdateHoverRating(0)
                    }
                    className="
                      transition
                      hover:scale-110
                    "
                  >
                    <Star
                      size={38}
                      className={
                        active
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                      fill={
                        active
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                );
              }
            )}
          </div>

          {/* RATING VALUE */}

          <div className="mt-4">

            {updateRating > 0 ? (
              <p className="text-sm font-medium text-gray-600">
                You selected{" "}
                <span className="font-bold text-gray-900">
                  {updateRating}/5
                </span>
              </p>
            ) : (
              <p className="text-sm text-gray-400">
                Select your rating
              </p>
            )}

          </div>

        </div>

        {/* ERROR */}

        {reviewError && (
          <div
            className="
              mt-5
              p-3
              rounded-xl
              bg-red-50
              border
              border-red-100
              text-sm
              text-red-600
            "
          >
            {typeof reviewError === "string"
              ? reviewError
              : reviewError?.message ||
                "Failed to update rating."}
          </div>
        )}

        {/* BUTTONS */}

        <div className="flex gap-3 mt-7">

          <button
            type="button"
            onClick={handleCloseUpdateRating}
            disabled={updateReviewLoading}
            className="
              flex-1
              h-11
              rounded-xl
              border
              border-gray-200
              bg-white
              text-gray-700
              text-sm
              font-semibold
              hover:bg-gray-50
              transition
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              updateReviewLoading ||
              !updateRating
            }
            className="
              flex-1
              h-11
              rounded-xl
              bg-yellow-500
              hover:bg-yellow-600
              text-white
              text-sm
              font-semibold
              transition
              flex
              items-center
              justify-center
              gap-2
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {updateReviewLoading ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                Updating...
              </>
            ) : (
              <>
                <Star
                  size={17}
                  fill="currentColor"
                />

                Update Rating
              </>
            )}
          </button>

        </div>
      </form>
    </div>
  </div>
)}
    </>
  );
}

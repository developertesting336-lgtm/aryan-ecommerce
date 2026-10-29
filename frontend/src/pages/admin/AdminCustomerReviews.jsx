import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ArrowLeft, Star, MessageSquare, Trash2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { getAdminUserReviewsApi } from "../../api/adminApi";
import { toggleReviewApproval, deleteReview } from "../../redux/slices/adminReviewSlice";
import { toast } from "react-toastify";
import PageButtons from "../../components/PageButtons";

const API_URL = "http://localhost:3000";

const getImageUrl = (image) => {
  if (!image) return "/wmpj6_512.avif";
  if (typeof image === "string" && (image.startsWith("http://") || image.startsWith("https://"))) {
    return image;
  }
  return `${API_URL}/uploads/${image}`;
};

export default function AdminCustomerReviews() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchUserReviews = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminUserReviewsApi(userId, page, 8);
      const data = res?.data?.data || res?.data || {};

      setUser(data.user || null);
      setReviews(data.reviews || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalReviews(data.pagination?.totalReviews || (data.reviews || []).length);
    } catch (err) {
      console.error("Failed to fetch customer reviews:", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to load customer reviews"
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserReviews(currentPage);
    }
  }, [userId, currentPage, fetchUserReviews]);

  const handleToggleApproval = async (review) => {
    try {
      setActionLoadingId(review._id);
      const nextStatus = !review.isApproved;
      await dispatch(
        toggleReviewApproval({
          id: review._id,
          isApproved: nextStatus,
        })
      ).unwrap();

      setReviews((prev) =>
        prev.map((r) => (r._id === review._id ? { ...r, isApproved: nextStatus } : r))
      );
      toast.success(nextStatus ? "Review approved" : "Review hidden");
    } catch (err) {
      console.error("Toggle approval error:", err);
      toast.error(err?.message || "Failed to update review status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      setActionLoadingId(reviewId);
      await dispatch(deleteReview(reviewId)).unwrap();
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      setTotalReviews((prev) => Math.max(0, prev - 1));
      toast.success("Review deleted successfully");
    } catch (err) {
      console.error("Delete review error:", err);
      toast.error(err?.message || "Failed to delete review");
    } finally {
      setActionLoadingId(null);
    }
  };

  const customerName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Customer";

  return (
    <div className="min-h-screen bg-(--admin-bg) text-(--admin-text)">
      <main className="mx-auto w-full max-w-375 p-4 sm:p-5 lg:p-6 xl:p-7">
        {/* =====================================================
            BREADCRUMB & HEADER
        ===================================================== */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              aria-label="Back to customers"
              className="
                flex h-9 w-9 items-center justify-center
                rounded-xl border border-(--admin-border)
                bg-(--admin-surface) text-(--admin-text-secondary)
                transition-all duration-200
                hover:border-(--admin-primary) hover:text-(--admin-text)
              "
            >
              <ArrowLeft size={16} />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs text-(--admin-text-muted)">
                <Link
                  to="/admin/users"
                  className="hover:text-(--admin-text) transition"
                >
                  Customers
                </Link>
                <span>/</span>
                <span className="text-(--admin-text-secondary) font-medium truncate max-w-48 sm:max-w-none">
                  {customerName}
                </span>
                <span>/</span>
                <span className="text-(--admin-primary) font-semibold">Reviews</span>
              </div>
              <h1 className="mt-0.5 text-xl font-bold tracking-tight text-(--admin-text) sm:text-2xl">
                {customerName}'s Reviews
              </h1>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2 rounded-xl border border-(--admin-border) bg-(--admin-surface) px-3 py-2 text-xs text-(--admin-text-secondary)">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--admin-stat-purple-icon) text-xs font-bold text-(--admin-stat-purple-text)">
                {user.firstName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-(--admin-text) truncate">{user.email || "No email"}</p>
                <p className="text-[10px] text-(--admin-text-muted)">ID: {userId}</p>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            MAIN CARD
        ===================================================== */}
        <section
          className="
            overflow-hidden
            rounded-xl
            border border-(--admin-border)
            bg-(--admin-surface)
            shadow-(--admin-card-shadow)
            transition-colors duration-200
          "
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-(--admin-border) p-5">
            <div>
              <h2 className="text-sm font-bold text-(--admin-text)">
                Customer Reviews
              </h2>
              <p className="mt-1 text-[11px] text-(--admin-text-muted)">
                {totalReviews} total {totalReviews === 1 ? "review" : "reviews"} written
              </p>
            </div>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="flex items-center gap-3 border-b border-(--admin-border) bg-[color-mix(in_srgb,var(--admin-primary)_5%,transparent)] px-5 py-4 text-[11px] font-medium text-(--admin-primary)">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[color-mix(in_srgb,var(--admin-primary)_25%,transparent)] border-t-(--admin-primary)" />
              Loading customer reviews...
            </div>
          )}

          {/* ERROR STATE */}
          {error && (
            <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-[11px] font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              <p className="mb-2 font-semibold">Error loading reviews</p>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => fetchUserReviews(currentPage)}
                className="mt-3 inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && reviews.length === 0 && (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--admin-surface-soft) text-3xl text-(--admin-text-muted)">
                <MessageSquare size={28} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-(--admin-text)">
                No reviews found
              </h3>
              <p className="mt-1 text-xs text-(--admin-text-muted)">
                This customer has not submitted any reviews yet.
              </p>
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="mt-5 rounded-xl border border-(--admin-border) bg-(--admin-surface-soft) px-4 py-2 text-xs font-semibold text-(--admin-text) hover:border-(--admin-primary) transition"
              >
                Back to Customers
              </button>
            </div>
          )}

          {/* REVIEWS LIST */}
          {!loading && !error && reviews.length > 0 && (
            <div className="divide-y divide-(--admin-border)">
              {reviews.map((review) => {
                const reviewRating = Number(review.rating || 0);
                const reviewDate = review.createdAt
                  ? new Date(review.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";

                const isActionBusy = actionLoadingId === review._id;
                const product = review.product || {};
                const productImage = Array.isArray(product.images)
                  ? product.images[0]
                  : product.images;

                return (
                  <div
                    key={review._id}
                    className="p-5 transition-colors duration-150 hover:bg-(--admin-surface-soft)"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      {/* Product & Review Content */}
                      <div className="flex items-start gap-4 min-w-0">
                        <img
                          src={getImageUrl(productImage)}
                          alt={product.name || "Product"}
                          className="h-16 w-16 shrink-0 rounded-xl object-cover border border-(--admin-border)"
                        />

                        <div className="min-w-0">
                          {/* Product Name & Link */}
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs sm:text-sm text-(--admin-text) truncate">
                              {product.name || "Product"}
                            </span>
                            {product._id && (
                              <Link
                                to={`/product/${product.slug || product._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View product in shop"
                                className="text-(--admin-text-muted) hover:text-(--admin-primary) transition shrink-0"
                              >
                                <ExternalLink size={13} />
                              </Link>
                            )}
                          </div>

                          {/* Star Rating & Date */}
                          <div className="mt-1.5 flex items-center gap-2.5">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={13}
                                  className={
                                    star <= reviewRating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-gray-300 dark:text-gray-600"
                                  }
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-(--admin-text)">
                              {reviewRating.toFixed(1)}
                            </span>
                            <span className="text-xs text-(--admin-text-muted)">•</span>
                            <span className="text-[11px] text-(--admin-text-muted)">
                              {reviewDate}
                            </span>
                          </div>

                          {/* Comment Description */}
                          <p className="mt-2.5 text-xs text-(--admin-text-secondary) leading-relaxed">
                            {review.description || "No comment provided."}
                          </p>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center sm:flex-col sm:items-end justify-between gap-3 shrink-0">
                        {/* Approval Status Badge */}
                        <span
                          className={`
                            inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold
                            ${
                              review.isApproved
                                ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900"
                                : "bg-amber-50 text-amber-600 ring-1 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900"
                            }
                          `}
                        >
                          {review.isApproved ? (
                            <>
                              <CheckCircle2 size={11} />
                              <span>Approved</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={11} />
                              <span>Pending</span>
                            </>
                          )}
                        </span>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isActionBusy}
                            onClick={() => handleToggleApproval(review)}
                            className={`
                              rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition
                              ${
                                review.isApproved
                                  ? "border-(--admin-control-border) bg-(--admin-control-bg) text-(--admin-text-secondary) hover:text-(--admin-text)"
                                  : "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                              }
                              disabled:opacity-50 cursor-pointer
                            `}
                          >
                            {review.isApproved ? "Unapprove" : "Approve"}
                          </button>

                          <button
                            type="button"
                            disabled={isActionBusy}
                            onClick={() => handleDelete(review._id)}
                            title="Delete review"
                            className="
                              rounded-lg border border-(--admin-control-border)
                              bg-(--admin-control-bg) p-1.5 text-rose-500
                              transition hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600
                              dark:hover:bg-rose-950/30 disabled:opacity-50 cursor-pointer
                            "
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PAGINATION */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-(--admin-border) p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] text-(--admin-text-muted)">
                Page {currentPage} of {totalPages} ({totalReviews} reviews)
              </p>
              <PageButtons
                page={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                colorTheme="admin"
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

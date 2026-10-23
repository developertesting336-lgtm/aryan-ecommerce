import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getAdminReviews,
  toggleReviewApproval,
  bulkUpdateReviews,
  deleteReview,
  setReviewFilters,
  resetReviewFilters,
  setReviewPage,
  toggleReviewSelect,
  selectAllReviews,
  clearReviewSelection,
  clearReviewError,
} from "../../redux/slices/adminReviewSlice";

// Change the path to wherever PageButtons lives in your project
import PageButtons from "../../components/PageButtons";

// Change these to match your routes
const DASHBOARD_PATH = "/admin/reviews";

// If your API returns relative image paths, put your server URL here
const IMAGE_BASE = "";
const imgUrl = (src = "") =>
  /^(https?:|data:|blob:)/.test(src) ? src : `${IMAGE_BASE}${src}`;

// =====================================================
// STYLE TOKENS (your --admin-* variables, Tailwind v4 syntax)
// =====================================================

const card =
  "bg-(--admin-surface) border border-(--admin-border) rounded-2xl shadow-(--admin-card-shadow)";

// "!" makes these win over the global `.dark input/select` rules in your CSS
const control =
  "h-10 rounded-xl px-3 text-sm bg-(--admin-control-bg)! border border-(--admin-control-border)! text-(--admin-text)! outline-none focus:border-(--admin-primary)!";

const primaryBtn =
  "bg-(--admin-primary) hover:bg-(--admin-primary-hover) text-[#04130a] cursor-pointer";

const ghostBtn =
  "border border-(--admin-control-border) bg-(--admin-control-bg) text-(--admin-text-secondary) hover:text-(--admin-text) cursor-pointer";

const iconBtn =
  "h-8 w-8 grid place-items-center rounded-lg cursor-pointer text-(--admin-text-secondary) hover:text-(--admin-text) hover:bg-(--admin-surface-soft)";

// =====================================================
// SMALL HELPERS
// =====================================================

const ICONS = {
  star: <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />,
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  eye: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeoff: (
    <path d="M17.9 17.9A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9.7 9.7 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M1 1l22 22" />
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  trash: (
    <>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  x: <path d="M18 6 6 18M6 6l12 12" />,
  back: <path d="M19 12H5M11 18l-6-6 6-6" />,
  img: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </>
  ),
};

const Icon = ({ name, size = 16, fill = "none" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {ICONS[name]}
  </svg>
);

const Stars = ({ value = 0 }) => (
  <span className="inline-flex" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <span
        key={n}
        className={n <= value ? "text-(--admin-warning)" : "text-(--admin-control-border)"}
      >
        <Icon name="star" size={13} fill="currentColor" />
      </span>
    ))}
  </span>
);

const StatusBadge = ({ approved }) => (
  <span
    className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${
      approved
        ? "bg-(--admin-stat-green-bg) text-(--admin-stat-green-text)"
        : "bg-(--admin-stat-orange-bg) text-(--admin-stat-orange-text)"
    }`}
  >
    {approved ? "Approved" : "Hidden"}
  </span>
);

const VerifiedBadge = () => (
  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-(--admin-primary)">
    <Icon name="shield" size={12} />
    Verified purchase
  </span>
);

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-lg bg-(--admin-chart-track) ${className}`} />
);

const fullName = (u) =>
  [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.name || "";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const fmtDateTime = (d) =>
  new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const ratingValue = (f) => {
  if (f.ratingMin == null && f.ratingMax == null) return "all";
  if (f.ratingMin === 1 && f.ratingMax === 2) return "low";
  if (f.ratingMin != null && f.ratingMin === f.ratingMax) return String(f.ratingMin);
  return "all";
};

const Modal = ({ onClose, z = "z-50", wide = false, children }) => (
  <div
    className={`fixed inset-0 ${z} grid place-items-center p-4 bg-black/60`}
    role="dialog"
    aria-modal="true"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
    <div
      className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90dvh] flex flex-col overflow-hidden ${card} text-(--admin-text)`}
    >
      {children}
    </div>
  </div>
);

// =====================================================
// PAGE
// =====================================================

export default function ReviewsListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list, loading, error } = useSelector((state) => state.adminReview);
  const { reviews, page, limit, total, totalPages, selectedIds, filters } = list;

  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [detailId, setDetailId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type: "single", id } | { type: "bulk" }

  const detail = reviews.find((r) => r._id === detailId) || null;
  const firstLoad = loading.list && reviews.length === 0;
  const selectedCount = selectedIds.length;
  const allSelected = reviews.length > 0 && reviews.every((r) => selectedIds.includes(r._id));

  const hasActiveFilters =
    !!filters.search ||
    filters.status !== "all" ||
    filters.ratingMin != null ||
    filters.ratingMax != null ||
    filters.verified !== "all" ||
    filters.hasImages ||
    !!filters.dateFrom ||
    !!filters.dateTo ||
    filters.sort !== "newest";

  // ---------- data loading ----------

  useEffect(() => {
    dispatch(getAdminReviews());
  }, [dispatch, filters, page]);

  useEffect(() => {
    return () => {
      dispatch(clearReviewSelection());
      dispatch(clearReviewError());
    };
  }, [dispatch]);

  // Search box: wait until the person stops typing
  useEffect(() => {
    if (searchInput.trim() === (filters.search || "")) return;
    const t = setTimeout(
      () => dispatch(setReviewFilters({ search: searchInput.trim() })),
      400
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Close modals with Esc, lock page scroll while one is open
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (preview) setPreview(null);
      else if (confirm) setConfirm(null);
      else if (detailId) setDetailId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview, confirm, detailId]);

  useEffect(() => {
    const open = !!(detailId || confirm || preview);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [detailId, confirm, preview]);

  // ---------- actions ----------

  const refresh = () => dispatch(getAdminReviews());

  const setFilter = (patch) => dispatch(setReviewFilters(patch));

  const clearFilters = () => {
    setSearchInput("");
    dispatch(resetReviewFilters());
  };

  const setRating = (v) => {
    if (v === "all") setFilter({ ratingMin: null, ratingMax: null });
    else if (v === "low") setFilter({ ratingMin: 1, ratingMax: 2 });
    else setFilter({ ratingMin: Number(v), ratingMax: Number(v) });
  };

  const afterRemoval = (removedCount) => {
    // If the last row on a later page was removed, go back one page
    if (page > 1 && reviews.length - removedCount <= 0) dispatch(setReviewPage(page - 1));
    else refresh();
  };

  const handleToggle = async (r) => {
    try {
      await dispatch(
        toggleReviewApproval({ id: r._id, isApproved: !r.isApproved })
      ).unwrap();
      toast.success(r.isApproved ? "Review hidden" : "Review approved");
      refresh();
    } catch (err) {
      toast.error(err || "Could not update review");
    }
  };

  const handleBulk = async (action) => {
    const ids = [...selectedIds];
    try {
      await dispatch(bulkUpdateReviews({ ids, action })).unwrap();
      const word = action === "approve" ? "approved" : action === "hide" ? "hidden" : "deleted";
      toast.success(`${ids.length} review${ids.length === 1 ? "" : "s"} ${word}`);
      if (action === "delete") afterRemoval(ids.length);
      else refresh();
    } catch (err) {
      toast.error(err || "Bulk action failed");
    }
  };

  const handleConfirmDelete = async () => {
    const current = confirm;
    setConfirm(null);
    if (!current) return;

    if (current.type === "bulk") {
      await handleBulk("delete");
      return;
    }

    try {
      await dispatch(deleteReview(current.id)).unwrap();
      toast.success("Review deleted");
      if (detailId === current.id) setDetailId(null);
      afterRemoval(1);
    } catch (err) {
      toast.error(err || "Could not delete review");
    }
  };

  // ---------- render ----------

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="min-h-screen bg-(--admin-bg) text-(--admin-text)">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <header className="mb-6">
          <button
            onClick={() => navigate(DASHBOARD_PATH)}
            className="inline-flex items-center gap-1.5 text-sm text-(--admin-text-secondary) hover:text-(--admin-text) cursor-pointer mb-3"
          >
            <Icon name="back" />
            Back to reviews
          </button>
          <h1 className="text-2xl font-semibold tracking-tight">All reviews</h1>
          <p className="text-sm text-(--admin-text-secondary) mt-1">
            {loading.list && reviews.length === 0
              ? "Loading reviews..."
              : `${total.toLocaleString("en-IN")} review${total === 1 ? "" : "s"} ${
                  hasActiveFilters ? "match your filters" : "in total"
                }`}
          </p>
        </header>

        {/* Filters */}
        <section className={`${card} p-4 mb-4`}>
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--admin-text-muted)">
                <Icon name="search" />
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search review text, customer name or email"
                className={`${control} w-full pl-9`}
                aria-label="Search reviews"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:flex">
              <select
                value={filters.status}
                onChange={(e) => setFilter({ status: e.target.value })}
                className={control}
                aria-label="Status"
              >
                <option value="all">All statuses</option>
                <option value="approved">Approved</option>
                <option value="hidden">Hidden</option>
              </select>
              <select
                value={ratingValue(filters)}
                onChange={(e) => setRating(e.target.value)}
                className={control}
                aria-label="Rating"
              >
                <option value="all">All ratings</option>
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
                <option value="low">1–2 stars</option>
              </select>
              <select
                value={filters.verified}
                onChange={(e) => setFilter({ verified: e.target.value })}
                className={control}
                aria-label="Purchase"
              >
                <option value="all">All purchases</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
              <select
                value={filters.sort}
                onChange={(e) => setFilter({ sort: e.target.value })}
                className={control}
                aria-label="Sort"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highest">Highest rating</option>
                <option value="lowest">Lowest rating</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <button
              onClick={() => setFilter({ hasImages: !filters.hasImages })}
              aria-pressed={!!filters.hasImages}
              className={`h-10 px-3 inline-flex items-center gap-2 rounded-xl text-sm font-medium cursor-pointer border ${
                filters.hasImages
                  ? "bg-(--admin-stat-green-bg) text-(--admin-stat-green-text) border-(--admin-primary)"
                  : "bg-(--admin-control-bg) text-(--admin-text-secondary) border-(--admin-control-border)"
              }`}
            >
              <Icon name="img" />
              With photos
            </button>

            <label className="flex items-center gap-2 text-sm text-(--admin-text-secondary)">
              From
              <input
                type="date"
                value={filters.dateFrom || ""}
                max={filters.dateTo || undefined}
                onChange={(e) => setFilter({ dateFrom: e.target.value || null })}
                className={control}
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-(--admin-text-secondary)">
              To
              <input
                type="date"
                value={filters.dateTo || ""}
                min={filters.dateFrom || undefined}
                onChange={(e) => setFilter({ dateTo: e.target.value || null })}
                className={control}
              />
            </label>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="h-10 px-3 inline-flex items-center gap-1.5 text-sm font-medium text-(--admin-primary) hover:text-(--admin-primary-hover) cursor-pointer"
              >
                <Icon name="x" size={14} />
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-(--admin-danger) bg-(--admin-surface) px-4 py-3 text-sm">
            <span className="text-(--admin-danger)">{error}</span>
            <button
              onClick={() => {
                dispatch(clearReviewError());
                refresh();
              }}
              className="font-medium text-(--admin-primary) hover:text-(--admin-primary-hover) cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {/* Bulk bar */}
        {selectedCount > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-(--admin-stat-green-bg) border border-(--admin-border) px-4 py-3">
            <span className="text-sm font-medium mr-auto">
              {selectedCount} selected
            </span>
            <button
              onClick={() => handleBulk("approve")}
              disabled={loading.action}
              className={`h-9 px-3 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium disabled:opacity-50 ${primaryBtn}`}
            >
              <Icon name="check" size={15} />
              Approve
            </button>
            <button
              onClick={() => handleBulk("hide")}
              disabled={loading.action}
              className={`h-9 px-3 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium disabled:opacity-50 ${ghostBtn}`}
            >
              <Icon name="eyeoff" size={15} />
              Hide
            </button>
            <button
              onClick={() => setConfirm({ type: "bulk" })}
              disabled={loading.action}
              className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium border border-(--admin-danger) text-(--admin-danger) bg-(--admin-control-bg) cursor-pointer disabled:opacity-50"
            >
              <Icon name="trash" size={15} />
              Delete
            </button>
            <button
              onClick={() => dispatch(clearReviewSelection())}
              className="h-9 px-3 text-sm text-(--admin-text-secondary) hover:text-(--admin-text) cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        {/* Table */}
        <section className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="text-left text-xs text-(--admin-text-muted) border-b border-(--admin-border)">
                  <th className="w-12 pl-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() =>
                        dispatch(allSelected ? clearReviewSelection() : selectAllReviews())
                      }
                      disabled={reviews.length === 0}
                      className="h-4 w-4 accent-(--admin-primary) cursor-pointer"
                      aria-label="Select all reviews on this page"
                    />
                  </th>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Review</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 pr-4 font-medium text-right">Actions</th>
                </tr>
              </thead>

              <tbody
                className={`divide-y divide-(--admin-border) ${
                  loading.list && !firstLoad ? "opacity-60" : ""
                }`}
              >
                {firstLoad &&
                  [0, 1, 2, 3, 4].map((i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-4 py-4">
                        <Skeleton className="h-12" />
                      </td>
                    </tr>
                  ))}

                {!firstLoad && reviews.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <p className="text-sm font-medium">
                        {hasActiveFilters ? "No reviews match these filters" : "No reviews yet"}
                      </p>
                      <p className="text-xs text-(--admin-text-muted) mt-1">
                        {hasActiveFilters
                          ? "Try removing a filter or searching for something else."
                          : "Reviews from customers will show up here."}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className={`mt-4 h-9 px-4 rounded-lg text-sm font-medium ${primaryBtn}`}
                        >
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                )}

                {reviews.map((r) => {
                  const selected = selectedIds.includes(r._id);
                  const images = r.images || [];
                  return (
                    <tr
                      key={r._id}
                      className={`align-top ${
                        selected ? "bg-(--admin-surface-soft)" : ""
                      }`}
                    >
                      <td className="pl-4 py-4">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => dispatch(toggleReviewSelect(r._id))}
                          className="h-4 w-4 accent-(--admin-primary) cursor-pointer"
                          aria-label={`Select review by ${fullName(r.user) || "customer"}`}
                        />
                      </td>

                      <td className="px-3 py-4 max-w-[180px]">
                        <p className="font-medium truncate">{fullName(r.user) || "Deleted user"}</p>
                        {r.user?.email && (
                          <p className="text-xs text-(--admin-text-muted) truncate">
                            {r.user.email}
                          </p>
                        )}
                        {r.isVerifiedPurchase && (
                          <div className="mt-1">
                            <VerifiedBadge />
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-4 max-w-[170px]">
                        <p className="text-(--admin-text-secondary) line-clamp-2">
                          {r.product?.name || "Deleted product"}
                        </p>
                      </td>

                      <td className="px-3 py-4 max-w-[320px]">
                        <Stars value={r.rating} />
                        <p className="text-(--admin-text-secondary) mt-1 line-clamp-2">
                          {r.description}
                        </p>
                        {images.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2">
                            {images.slice(0, 3).map((src, i) => (
                              <button
                                key={i}
                                onClick={() => setPreview(imgUrl(src))}
                                className="h-8 w-8 rounded-md overflow-hidden border border-(--admin-border) cursor-pointer"
                                aria-label="View photo"
                              >
                                <img
                                  src={imgUrl(src)}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              </button>
                            ))}
                            {images.length > 3 && (
                              <span className="text-xs text-(--admin-text-muted)">
                                +{images.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-4">
                        <StatusBadge approved={r.isApproved} />
                      </td>

                      <td className="px-3 py-4 whitespace-nowrap text-(--admin-text-secondary)">
                        {fmtDate(r.createdAt)}
                      </td>

                      <td className="px-3 py-4 pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailId(r._id)}
                            className={iconBtn}
                            aria-label="View review"
                            title="View"
                          >
                            <Icon name="eye" />
                          </button>
                          <button
                            onClick={() => handleToggle(r)}
                            disabled={loading.action}
                            className={`${iconBtn} disabled:opacity-50`}
                            aria-label={r.isApproved ? "Hide review" : "Approve review"}
                            title={r.isApproved ? "Hide" : "Approve"}
                          >
                            <Icon name={r.isApproved ? "eyeoff" : "check"} />
                          </button>
                          <button
                            onClick={() => setConfirm({ type: "single", id: r._id })}
                            className={`${iconBtn} hover:text-(--admin-danger)!`}
                            aria-label="Delete review"
                            title="Delete"
                          >
                            <Icon name="trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex flex-col items-center gap-3 px-4 py-4 border-t border-(--admin-border) sm:flex-row sm:justify-between">
              <p className="text-xs text-(--admin-text-muted)">
                Showing {from}–{to} of {total.toLocaleString("en-IN")}
              </p>
              {/* [&>div]:mt-0 removes PageButtons' top margin inside this footer */}
              <div className="[&>div]:mt-0 [&>div]:w-auto">
                <PageButtons
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(n) => dispatch(setReviewPage(n))}
                  colorTheme="admin"
                />
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Review detail */}
      {detail && (
        <Modal onClose={() => setDetailId(null)} wide>
          <div className="shrink-0 flex items-start justify-between gap-4 p-5 border-b border-(--admin-border)">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">Review details</h2>
              <p className="text-xs text-(--admin-text-muted) mt-0.5">
                {fmtDateTime(detail.createdAt)}
              </p>
            </div>
            <button onClick={() => setDetailId(null)} className={iconBtn} aria-label="Close">
              <Icon name="x" size={18} />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-5 [scrollbar-width:thin] [scrollbar-color:var(--admin-control-border)_transparent]">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-(--admin-text-muted) mb-1">Customer</p>
                <p className="font-medium">{fullName(detail.user) || "Deleted user"}</p>
                {detail.user?.email && (
                  <p className="text-sm text-(--admin-text-secondary) break-all">
                    {detail.user.email}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-(--admin-text-muted) mb-1">Product</p>
                <p className="font-medium">{detail.product?.name || "Deleted product"}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Stars value={detail.rating} />
              <span className="text-sm text-(--admin-text-secondary)">{detail.rating} / 5</span>
              <StatusBadge approved={detail.isApproved} />
              {detail.isVerifiedPurchase && <VerifiedBadge />}
            </div>

            <div>
              <p className="text-xs text-(--admin-text-muted) mb-1">Review</p>
              <p className="text-sm text-(--admin-text-secondary) whitespace-pre-wrap break-words">
                {detail.description}
              </p>
            </div>

            {(detail.images || []).length > 0 && (
              <div>
                <p className="text-xs text-(--admin-text-muted) mb-2">
                  Photos ({detail.images.length})
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {detail.images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setPreview(imgUrl(src))}
                      className="aspect-square rounded-xl overflow-hidden border border-(--admin-border) cursor-pointer"
                      aria-label={`View photo ${i + 1}`}
                    >
                      <img
                        src={imgUrl(src)}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 flex flex-wrap justify-end gap-2 p-5 border-t border-(--admin-border)">
            <button
              onClick={() => setConfirm({ type: "single", id: detail._id })}
              className="h-10 px-4 rounded-xl text-sm font-medium border border-(--admin-danger) text-(--admin-danger) cursor-pointer"
            >
              Delete
            </button>
            <button
              onClick={() => handleToggle(detail)}
              disabled={loading.action}
              className={`h-10 px-4 rounded-xl text-sm font-medium disabled:opacity-50 ${
                detail.isApproved ? ghostBtn : primaryBtn
              }`}
            >
              {detail.isApproved ? "Hide review" : "Approve review"}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete confirmation */}
      {confirm && (
        <Modal onClose={() => setConfirm(null)} z="z-[60]">
          <div className="p-5">
            <h2 className="text-lg font-semibold">
              {confirm.type === "bulk"
                ? `Delete ${selectedCount} review${selectedCount === 1 ? "" : "s"}?`
                : "Delete this review?"}
            </h2>
            <p className="text-sm text-(--admin-text-secondary) mt-2">
              This permanently removes{" "}
              {confirm.type === "bulk" ? "the selected reviews" : "the review"}. You can’t undo
              it. To keep a review but remove it from your store, hide it instead.
            </p>
          </div>
          <div className="flex justify-end gap-2 p-5 pt-0">
            <button
              onClick={() => setConfirm(null)}
              className={`h-10 px-4 rounded-xl text-sm font-medium ${ghostBtn}`}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={loading.action}
              className="h-10 px-4 rounded-xl text-sm font-medium bg-(--admin-danger) text-white cursor-pointer disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Photo preview */}
      {preview && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center p-4 bg-black/80"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPreview(null);
          }}
        >
          <button
            onClick={() => setPreview(null)}
            className="absolute top-4 right-4 h-10 w-10 grid place-items-center rounded-full bg-black/50 text-white cursor-pointer"
            aria-label="Close photo"
          >
            <Icon name="x" size={20} />
          </button>
          <img
            src={preview}
            alt="Review photo"
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </div>
  );
}
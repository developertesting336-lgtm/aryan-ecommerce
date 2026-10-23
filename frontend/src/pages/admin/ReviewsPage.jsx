import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getReviewDashboard,
  getReviewTimeline,
  toggleReviewApproval,
  setReviewFilters,
  resetReviewFilters,
  clearReviewError,
} from "../../redux/slices/adminReviewSlice";

// Change this if your list page lives at a different route
const LIST_PATH = "/admin/reviews/list";

// =====================================================
// STYLE TOKENS
// Uses your existing --admin-* variables directly (Tailwind v4 syntax),
// so nothing needs to be added to index.css.
// =====================================================

const card =
  "bg-(--admin-surface) border border-(--admin-border) rounded-2xl shadow-(--admin-card-shadow)";

const primaryBtn =
  "bg-(--admin-primary) hover:bg-(--admin-primary-hover) text-[#04130a] cursor-pointer";

const ghostBtn =
  "border border-(--admin-control-border) bg-(--admin-control-bg) text-(--admin-text-secondary) hover:text-(--admin-text) cursor-pointer";

// Full class names so Tailwind can find them
const TONES = {
  purple: {
    card: "bg-(--admin-stat-purple-bg)",
    icon: "bg-(--admin-stat-purple-icon) text-(--admin-stat-purple-text)",
  },
  green: {
    card: "bg-(--admin-stat-green-bg)",
    icon: "bg-(--admin-stat-green-icon) text-(--admin-stat-green-text)",
  },
  orange: {
    card: "bg-(--admin-stat-orange-bg)",
    icon: "bg-(--admin-stat-orange-icon) text-(--admin-stat-orange-text)",
  },
  blue: {
    card: "bg-(--admin-stat-blue-bg)",
    icon: "bg-(--admin-stat-blue-icon) text-(--admin-stat-blue-text)",
  },
};

const barColor = (rating) =>
  rating >= 4
    ? "bg-(--admin-primary)"
    : rating === 3
    ? "bg-(--admin-warning)"
    : "bg-(--admin-danger)";

// =====================================================
// SMALL HELPERS
// =====================================================

const ICONS = {
  chat: <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  check: <path d="M20 6 9 17l-5-5" />,
  eyeoff: (
    <path d="M17.9 17.9A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9.7 9.7 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M1 1l22 22" />
  ),
  star: <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />,
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  down: (
    <>
      <path d="m23 18-9.5-9.5-5 5L1 6" />
      <path d="M17 18h6v-6" />
    </>
  ),
  img: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
};

const Icon = ({ name, size = 18, fill = "none" }) => (
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
  <span className="inline-flex shrink-0" aria-label={`${value} out of 5 stars`}>
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

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-(--admin-chart-track) ${className}`} />
);

const fullName = (u) =>
  [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.name || "";

const timeAgo = (date) => {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  if (s < 172800) return "Yesterday";
  if (s < 2592000) return `${Math.floor(s / 86400)} days ago`;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const pct = (part, total) => (total ? Math.round((part / total) * 100) : 0);

// =====================================================
// PAGE
// =====================================================

export default function ReviewsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { stats, distribution, quickCounts, recent, timeline, loading, error } =
    useSelector((state) => state.adminReview);

  useEffect(() => {
    dispatch(getReviewDashboard());
    dispatch(getReviewTimeline(timeline.range || 7));
    return () => {
      dispatch(clearReviewError());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const firstLoad = loading.dashboard && stats.total === 0 && recent.length === 0;

  // ---------- actions ----------

  const handleToggle = async (review) => {
    try {
      await dispatch(
        toggleReviewApproval({ id: review._id, isApproved: !review.isApproved })
      ).unwrap();
      toast.success(review.isApproved ? "Review hidden" : "Review approved");
      dispatch(getReviewDashboard()); // refresh the counts
    } catch (err) {
      toast.error(err || "Could not update review");
    }
  };

  const openList = (filters = {}) => {
    dispatch(resetReviewFilters());
    if (Object.keys(filters).length) dispatch(setReviewFilters(filters));
    navigate(LIST_PATH);
  };

  // ---------- derived data ----------

  const cards = [
    {
      label: "Total reviews",
      value: Number(stats.total || 0).toLocaleString("en-IN"),
      note: `+${stats.thisMonth || 0} this month`,
      tone: "purple",
      icon: "chat",
    },
    {
      label: "Approved",
      value: Number(stats.approved || 0).toLocaleString("en-IN"),
      note: `${pct(stats.approved, stats.total)}% of all reviews`,
      tone: "green",
      icon: "check",
    },
    {
      label: "Hidden",
      value: Number(stats.hidden || 0).toLocaleString("en-IN"),
      note: "Not shown in your store",
      tone: "orange",
      icon: "eyeoff",
    },
    {
      label: "Average rating",
      value: Number(stats.avgRating || 0).toFixed(1),
      note: "out of 5 stars",
      tone: "blue",
      icon: "star",
    },
  ];

  const dist = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: distribution.find((d) => d.rating === r)?.count || 0,
  }));
  const distTotal = dist.reduce((sum, d) => sum + d.count, 0);

  const chartData = timeline.data || [];
  const chartMax = Math.max(1, ...chartData.map((d) => d.count));
  const shortDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  const quick = [
    {
      title: "Hidden reviews",
      desc: "Reviews not visible to shoppers",
      count: quickCounts.hidden,
      tone: "orange",
      icon: "eyeoff",
      filters: { status: "hidden" },
    },
    {
      title: "Low ratings (1–2 stars)",
      desc: "Check for product problems",
      count: quickCounts.lowRated,
      tone: "purple",
      icon: "down",
      filters: { ratingMin: 1, ratingMax: 2 },
    },
    {
      title: "Unverified purchases",
      desc: "Reviewer did not buy from your store",
      count: quickCounts.unverified,
      tone: "blue",
      icon: "shield",
      filters: { verified: "unverified" },
    },
    {
      title: "Reviews with photos",
      desc: "Check images before they go live",
      count: quickCounts.withImages,
      tone: "green",
      icon: "img",
      filters: { hasImages: true },
    },
  ];

  // ---------- render ----------

  return (
    <div className="min-h-screen overflow-x-hidden bg-(--admin-bg) text-(--admin-text)">
      <div className="max-w-6xl mx-auto w-full px-3 sm:px-6 py-5 sm:py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Reviews</h1>
            <p className="text-sm text-(--admin-text-secondary) mt-1">
              See how customers rate your products and what needs your attention.
            </p>
          </div>
          <button
            onClick={() => openList()}
            className={`h-10 px-4 w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-xl text-sm font-medium ${primaryBtn}`}
          >
            Manage all reviews
            <Icon name="arrow" size={16} />
          </button>
        </header>

        {/* Error banner */}
        {error && !firstLoad && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-(--admin-danger) bg-(--admin-surface) px-4 py-3 text-sm">
            <span className="text-(--admin-danger)">{error}</span>
            <button
              onClick={() => {
                dispatch(clearReviewError());
                dispatch(getReviewDashboard());
                dispatch(getReviewTimeline(timeline.range || 7));
              }}
              className="font-medium text-(--admin-primary) hover:text-(--admin-primary-hover) cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {/* Stat cards */}
        <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
          {firstLoad
            ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)
            : cards.map((c) => (
                <div
                  key={c.label}
                  className={`${TONES[c.tone].card} min-w-0 rounded-2xl p-3.5 sm:p-5 shadow-(--admin-card-shadow)`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm text-(--admin-text-secondary) truncate">{c.label}</p>
                    <span
                      className={`h-8 w-8 sm:h-9 sm:w-9 shrink-0 grid place-items-center rounded-xl ${TONES[c.tone].icon}`}
                    >
                      <Icon name={c.icon} />
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-semibold mt-2 sm:mt-3 tracking-tight truncate">{c.value}</p>
                  <p className="text-xs text-(--admin-text-secondary) mt-1">{c.note}</p>
                </div>
              ))}
        </section>

        {/* Charts */}
        <section className="grid xl:grid-cols-5 gap-4 mb-5 sm:mb-6">
          {/* Reviews over time */}
          <div className={`min-w-0 xl:col-span-3 ${card} p-4 sm:p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-semibold">Reviews over time</h2>
                <p className="text-xs text-(--admin-text-muted) mt-0.5">New reviews per day</p>
              </div>
              <div
                className="flex rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) p-0.5 text-xs font-medium"
                role="group"
                aria-label="Date range"
              >
                {[7, 30].map((r) => (
                  <button
                    key={r}
                    onClick={() => dispatch(getReviewTimeline(r))}
                    disabled={loading.timeline}
                    className={`px-3 py-1.5 rounded-md cursor-pointer ${
                      timeline.range === r
                        ? "bg-(--admin-primary) font-semibold text-[#04130a]"
                        : "text-(--admin-text-secondary) hover:text-(--admin-text)"
                    }`}
                  >
                    {r} days
                  </button>
                ))}
              </div>
            </div>

            {loading.timeline && chartData.length === 0 ? (
              <Skeleton className="h-48" />
            ) : chartData.length === 0 ? (
              <div className="h-48 grid place-items-center text-sm text-(--admin-text-muted)">
                No reviews in this period yet.
              </div>
            ) : (
              <>
                <div
                  className={`flex items-end ${timeline.range === 30 ? "gap-0.5 sm:gap-1.5" : "gap-1.5"} h-40 sm:h-48 ${loading.timeline ? "opacity-60" : ""}`}
                >
                  {chartData.map((d) => (
                    <div
                      key={d.date}
                      className="flex-1 h-full flex items-end rounded-md bg-(--admin-chart-track)"
                      title={`${d.count} review${d.count === 1 ? "" : "s"} on ${shortDate(d.date)}`}
                    >
                      <div
                        className="w-full rounded-md bg-(--admin-primary) transition-all duration-300"
                        style={{ height: `${Math.round((d.count / chartMax) * 100)}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[11px] text-(--admin-text-muted) mt-2">
                  {timeline.range === 7 ? (
                    chartData.map((d) => (
                      <span key={d.date}>
                        {new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" })}
                      </span>
                    ))
                  ) : (
                    <>
                      <span>{shortDate(chartData[0].date)}</span>
                      <span>{shortDate(chartData[Math.floor(chartData.length / 2)].date)}</span>
                      <span>{shortDate(chartData[chartData.length - 1].date)}</span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Rating breakdown */}
          <div className={`min-w-0 xl:col-span-2 ${card} p-4 sm:p-5`}>
            <h2 className="text-base font-semibold mb-1">Rating breakdown</h2>
            <p className="text-xs text-(--admin-text-muted) mb-5">
              Share of reviews by star rating
            </p>

            {firstLoad ? (
              <Skeleton className="h-48" />
            ) : distTotal === 0 ? (
              <div className="h-40 grid place-items-center text-sm text-(--admin-text-muted)">
                Ratings will show here after the first review.
              </div>
            ) : (
              <div className="space-y-3">
                {dist.map((d) => {
                  const p = pct(d.count, distTotal);
                  return (
                    <div key={d.rating} className="flex items-center gap-2 sm:gap-3 text-sm">
                      <span className="w-8 flex items-center gap-1 text-(--admin-text-secondary)">
                        <span className="text-(--admin-warning)">
                          <Icon name="star" size={13} fill="currentColor" />
                        </span>
                        {d.rating}
                      </span>
                      <div className="flex-1 h-2.5 rounded-full bg-(--admin-chart-track) overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor(d.rating)}`}
                          style={{ width: `${p}%` }}
                        />
                      </div>
                      <span className="w-[4.5rem] sm:w-20 shrink-0 text-right text-(--admin-text-secondary) tabular-nums">
                        {d.count}{" "}
                        <span className="text-(--admin-text-muted) text-xs">({p}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Needs attention + latest */}
        <section className="grid xl:grid-cols-5 gap-4">
          {/* Needs attention */}
          <div className={`min-w-0 xl:col-span-2 ${card} p-4 sm:p-5`}>
            <h2 className="text-base font-semibold mb-1">Needs attention</h2>
            <p className="text-xs text-(--admin-text-muted) mb-4">
              Open the list with a filter applied
            </p>
            <div className="space-y-2">
              {quick.map((q) => (
                <button
                  key={q.title}
                  onClick={() => openList(q.filters)}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-(--admin-border) bg-(--admin-surface-soft) hover:border-(--admin-control-border) cursor-pointer"
                >
                  <span
                    className={`h-10 w-10 shrink-0 grid place-items-center rounded-xl ${TONES[q.tone].icon}`}
                  >
                    <Icon name={q.icon} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium">{q.title}</span>
                    <span className="block text-xs text-(--admin-text-muted) truncate">
                      {q.desc}
                    </span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{q.count || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Latest reviews */}
          <div className={`min-w-0 xl:col-span-3 ${card} p-4 sm:p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Latest reviews</h2>
              <button
                onClick={() => openList()}
                className="text-sm font-medium text-(--admin-primary) hover:text-(--admin-primary-hover) cursor-pointer"
              >
                View all
              </button>
            </div>

            {firstLoad ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="py-10 text-center text-sm text-(--admin-text-muted)">
                No reviews yet. New reviews will appear here.
              </div>
            ) : (
              <ul className="divide-y divide-(--admin-border)">
                {recent.map((r) => {
                  const name = fullName(r.user) || "Customer";
                  const initials = name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <li key={r._id} className="py-4 first:pt-0 last:pb-0 flex gap-3">
                      <span className="h-10 w-10 shrink-0 grid place-items-center rounded-full bg-(--admin-stat-green-icon) text-(--admin-stat-green-text) text-sm font-semibold">
                        {initials}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-sm font-medium break-words">{name}</span>
                          {r.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-(--admin-primary)">
                              <Icon name="shield" size={12} />
                              Verified purchase
                            </span>
                          )}
                          <span className="text-xs text-(--admin-text-muted)">
                            {timeAgo(r.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          <Stars value={r.rating} />
                          {r.product?.name && (
                            <span className="min-w-0 text-xs text-(--admin-text-secondary) truncate">
                              on {r.product.name}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-(--admin-text-secondary) mt-1.5 line-clamp-2 break-words">
                          {r.description}
                        </p>

                        <div className="flex items-center gap-2 mt-2.5">
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                              r.isApproved
                                ? "bg-(--admin-stat-green-bg) text-(--admin-stat-green-text)"
                                : "bg-(--admin-stat-orange-bg) text-(--admin-stat-orange-text)"
                            }`}
                          >
                            {r.isApproved ? "Approved" : "Hidden"}
                          </span>
                          <button
                            onClick={() => handleToggle(r)}
                            disabled={loading.action}
                            className={`text-xs font-medium px-2.5 py-1 rounded-lg disabled:opacity-50 ${ghostBtn}`}
                          >
                            {r.isApproved ? "Hide" : "Approve"}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
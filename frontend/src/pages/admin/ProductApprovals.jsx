import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getProductsByStatus,
  updateProductStatus,
} from "../../redux/slices/adminSlice";
import PageButtons from "../../components/PageButtons";
import ProductViewDrawer from "../../components/admin/Productviewdrawer";
const LIMIT = 5;

const TABS = [
  { key: "pending", label: "Pending", countKey: "pendingProducts" },
  { key: "active", label: "Active", countKey: "activeProducts" },
  { key: "rejected", label: "Rejected", countKey: "rejectedProducts" },
  { key: "inactive", label: "Inactive", countKey: "inactiveProducts" },
];

const EMPTY_TEXT = {
  pending: ["No products waiting for approval", "New vendor submissions will show up here."],
  active: ["No active products", "Approved products will show up here."],
  rejected: ["No rejected products", "Products you reject will be listed here."],
  inactive: ["No inactive products", "Products you deactivate will be listed here."],
};

const thClass =
  "px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-(--admin-text-muted)";

const btnGhost =
  "cursor-pointer rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) px-3 py-2 text-xs font-semibold text-(--admin-text-secondary) transition hover:bg-(--admin-surface-soft) disabled:cursor-not-allowed disabled:opacity-50";

const btnApprove =
  "cursor-pointer rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

const btnReject =
  "cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400";

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString()}`;

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const vendorName = (v) =>
  [v?.firstName, v?.lastName].filter(Boolean).join(" ") ||
  v?.email ||
  "Unknown vendor";

export default function ProductApprovals() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    approvalProducts: products,
    approvalStats: stats,
    approvalPagination: pagination,
    approvalLoading: loading,
    approvalError: loadError,
  } = useSelector((state) => state.admin);

  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [reviewTarget, setReviewTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const error = actionError || loadError;
  const totalPages = pagination?.totalPages || 1;
  const totalFiltered = pagination?.totalProducts || 0;

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const reload = () =>
    dispatch(
      getProductsByStatus({ status: tab, page, limit: LIMIT, search: debouncedSearch })
    );

  useEffect(() => {
    dispatch(
      getProductsByStatus({ status: tab, page, limit: LIMIT, search: debouncedSearch })
    );
  }, [dispatch, tab, page, debouncedSearch]);

  const afterAction = () => {
    setReviewTarget(null);
    setRejectTarget(null);
    // if we just emptied this page, go back one page (effect refetches)
    if (products.length === 1 && page > 1) setPage((p) => p - 1);
    else reload();
  };

  const changeStatus = async (product, status, reason) => {
    setBusyId(product._id);
    setActionError("");
    try {
      await dispatch(
        updateProductStatus({ id: product._id, status, reason })
      ).unwrap();
      afterAction();
    } catch (e) {
      setActionError(typeof e === "string" ? e : "Could not update product");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-(--admin-bg) text-(--admin-text)">
      <main className="mx-auto w-full max-w-375 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(--admin-text)">
              Product approvals
            </h1>
            <p className="mt-1 text-sm text-(--admin-text-muted)">
              Review products submitted by vendors before they go live
            </p>
          </div>

          <button onClick={() => navigate("/admin/products")} className=" cursor-pointer
              rounded-lg
              bg-(--admin-primary)
              px-4 py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:bg-(--admin-primary-hover)
              hover:shadow-md
              active:scale-[0.98]
            ">
            ← All products
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Pending Approval"
            value={stats?.pendingProducts || 0}
            icon="⏳"
            hint="Requires review"
            color="orange"
          />
          <StatCard
            title="Active Products"
            value={stats?.activeProducts || 0}
            icon="🟢"
            hint="Live on the store"
            color="green"
          />
          <StatCard
            title="Rejected"
            value={stats?.rejectedProducts || 0}
            icon="🚫"
            hint="Vendor needs to fix"
            color="red"
          />
          <StatCard
            title="Inactive"
            value={stats?.inactiveProducts || 0}
            icon="⏸️"
            hint="Hidden from the store"
            color="blue"
          />
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-(--admin-border) bg-(--admin-surface) shadow-(--admin-card-shadow)">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-(--admin-border) p-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-1 rounded-lg bg-(--admin-surface-soft) p-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setTab(t.key);
                    setPage(1);
                    setActionError("");
                  }}
                  className={`cursor-pointer rounded-md px-4 py-2 text-sm font-semibold transition ${
                    tab === t.key
                      ? "bg-(--admin-surface) text-(--admin-primary) shadow-sm"
                      : "text-(--admin-text-muted) hover:text-(--admin-text)"
                  }`}
                >
                  {t.label}
                  <span className="ml-2 rounded-full bg-[color-mix(in_srgb,var(--admin-primary)_12%,transparent)] px-2 py-0.5 text-[10px] text-(--admin-primary)">
                    {stats?.[t.countKey] || 0}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) px-3 transition focus-within:border-(--admin-primary) sm:w-72">
              <span className="text-sm text-(--admin-text-muted)">🔍</span>
              <input
                type="text"
                placeholder="Search by product or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-(--admin-text) outline-none placeholder:text-(--admin-text-muted)"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-3 px-5 py-8 text-sm font-medium text-(--admin-primary)">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[color-mix(in_srgb,var(--admin-primary)_20%,transparent)] border-t-(--admin-primary)" />
              Loading products...
            </div>
          )}

          {/* Table */}
          {!loading && products.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-250">
                <thead>
                  <tr className="border-b border-(--admin-border) bg-(--admin-surface-soft)">
                    <th className={thClass}>Product</th>
                    <th className={thClass}>Vendor</th>
                    <th className={thClass}>Category</th>
                    <th className={thClass}>Price</th>
                    <th className={thClass}>{tab === "rejected" ? "Rejection reason" : "Created"}</th>
                    <th className={`${thClass} text-right!`}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b border-(--admin-border) transition-colors duration-150 last:border-0 hover:bg-(--admin-surface-soft)"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-(--admin-border) bg-white!">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xl">📦</span>
                            )}
                          </div>
                          <div className="max-w-55">
                            <p
                              title={product.name}
                              className="truncate text-sm font-semibold text-(--admin-text)"
                            >
                              {product.name}
                            </p>
                            <p className="mt-0.5 text-xs text-(--admin-text-muted)">
                              {product.sku ? `SKU: ${product.sku}` : `ID: ${product._id}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-(--admin-text-secondary)">
                        {vendorName(product.vendor)}
                      </td>

                      <td className="px-5 py-4 text-sm text-(--admin-text-secondary)">
                        {product.category?.name || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-(--admin-text)">
                        {formatPrice(product.price)}
                      </td>

                      <td className="px-5 py-4 text-sm text-(--admin-text-secondary)">
                        {tab === "rejected" ? (
                          <span
                            className="line-clamp-2 max-w-60 text-xs"
                            title={product.rejectionReason}
                          >
                            {product.rejectionReason || "—"}
                          </span>
                        ) : (
                          formatDate(product.createdAt)
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setReviewTarget(product)} className={btnGhost}>
                            View
                          </button>
                          <StatusActions
                            status={product.status}
                            busy={busyId === product._id}
                            onChange={(s) => changeStatus(product, s)}
                            onReject={() => setRejectTarget(product)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && products.length === 0 && (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--admin-surface-soft) text-3xl">
                {tab === "pending" ? "✅" : "📦"}
              </div>
              <h3 className="mt-4 font-semibold text-(--admin-text)">
                {debouncedSearch ? "No products found" : EMPTY_TEXT[tab][0]}
              </h3>
              <p className="mt-1 text-sm text-(--admin-text-muted)">
                {debouncedSearch ? "Try a different search term." : EMPTY_TEXT[tab][1]}
              </p>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-(--admin-border) p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-(--admin-text-muted)">
                Showing{" "}
                <span className="font-semibold text-(--admin-text-secondary)">
                  {products.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-(--admin-text-secondary)">
                  {totalFiltered}
                </span>{" "}
                products
              </p>
              <PageButtons
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                colorTheme="admin"
              />
            </div>
          )}
        </div>
      </main>

      {reviewTarget && (
  <ProductViewDrawer
    product={reviewTarget}
    onClose={() => setReviewTarget(null)}
    footer={
      <StatusActions
        status={reviewTarget.status}
        busy={busyId === reviewTarget._id}
        onChange={(s) => changeStatus(reviewTarget, s)}
        onReject={() => setRejectTarget(reviewTarget)}
      />
    }
  />
)}

      {rejectTarget && (
        <RejectModal
          product={rejectTarget}
          busy={busyId === rejectTarget._id}
          onClose={() => setRejectTarget(null)}
          onConfirm={(reason) => changeStatus(rejectTarget, "rejected", reason)}
        />
      )}
    </div>
  );
}

/* =========================
   STATUS ACTIONS
   pending  -> Approve / Reject
   rejected -> Approve
   active   -> Deactivate
   inactive -> Activate
========================= */

function StatusActions({ status, busy, onChange, onReject }) {
  if (status === "pending") {
    return (
      <>
        <button onClick={() => onChange("active")} disabled={busy} className={btnApprove}>
          {busy ? "Saving..." : "Approve"}
        </button>
        <button onClick={onReject} disabled={busy} className={btnReject}>
          Reject
        </button>
      </>
    );
  }

  if (status === "rejected") {
    return (
      <button onClick={() => onChange("active")} disabled={busy} className={btnApprove}>
        {busy ? "Saving..." : "Approve"}
      </button>
    );
  }

  if (status === "active") {
    return (
      <button onClick={() => onChange("inactive")} disabled={busy} className={btnReject}>
        {busy ? "Saving..." : "Deactivate"}
      </button>
    );
  }

  if (status === "inactive") {
    return (
      <button onClick={() => onChange("active")} disabled={busy} className={btnApprove}>
        {busy ? "Saving..." : "Activate"}
      </button>
    );
  }

  return null;
}

/* =========================
   STAT CARD
========================= */

function StatCard({ title, value, icon, hint, color = "orange" }) {
  // same theme variables as the refunds page; red has no theme variable so it is mixed inline
  const themes = {
    orange: {
      bg: "var(--admin-stat-orange-bg)",
      iconBg: "var(--admin-stat-orange-icon)",
      text: "var(--admin-stat-orange-text)",
    },
    green: {
      bg: "var(--admin-stat-green-bg)",
      iconBg: "var(--admin-stat-green-icon)",
      text: "var(--admin-stat-green-text)",
    },
    blue: {
      bg: "var(--admin-stat-blue-bg)",
      iconBg: "var(--admin-stat-blue-icon)",
      text: "var(--admin-stat-blue-text)",
    },
    red: {
      bg: "color-mix(in srgb, #ef4444 8%, var(--admin-stat-purple-bg))",
      iconBg: "color-mix(in srgb, #ef4444 12%, transparent)",
      text: "#ef4444",
    },
  };

  const theme = themes[color];

  return (
    <div
      className="rounded-xl border border-(--admin-border) p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5"
      style={{ backgroundColor: theme.bg }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-(--admin-text-secondary)">
          {title}
        </span>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold"
          style={{ backgroundColor: theme.iconBg, color: theme.text }}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-(--admin-text)">{value}</p>
      <p className="mt-1 text-xs font-medium" style={{ color: theme.text }}>
        {hint}
      </p>
    </div>
  );
}

/* =========================
   REVIEW DRAWER
========================= */

// function ReviewDrawer({ product, busy, onClose, onChange, onReject }) {
//   const [activeImg, setActiveImg] = useState(0);
//   const images = product.images || [];
//   const discount =
//     product.mrp && product.mrp > product.price
//       ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
//       : 0;

//   useEffect(() => {
//     const onKey = (e) => e.key === "Escape" && onClose();
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [onClose]);

//   return (
//     <div className="fixed inset-0 z-50 flex justify-end">
//       <div className="absolute inset-0 bg-black/50" onClick={onClose} />

//       <aside className="relative flex h-full w-full max-w-xl flex-col border-l border-(--admin-border) bg-(--admin-surface) shadow-2xl">
//         <div className="flex items-start justify-between gap-4 border-b border-(--admin-border) p-5">
//           <div className="min-w-0">
//             <h2 className="truncate text-lg font-bold text-(--admin-text)">{product.name}</h2>
//             <p className="mt-1 text-xs text-(--admin-text-muted)">
//               by {vendorName(product.vendor)} · created {formatDate(product.createdAt)}
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             title="Close"
//             className="cursor-pointer rounded-lg p-2 text-(--admin-text-muted) transition hover:bg-(--admin-surface-soft) hover:text-(--admin-text)"
//           >
//             ✕
//           </button>
//         </div>

//         <div className="flex-1 space-y-6 overflow-y-auto p-5">
//           {product.status === "rejected" && product.rejectionReason && (
//             <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
//               <p className="font-semibold">Rejected</p>
//               <p className="mt-1">{product.rejectionReason}</p>
//             </div>
//           )}

//           {/* Images */}
//           <div>
//             <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-(--admin-border) bg-(--admin-surface-soft)">
//               {images[activeImg] ? (
//                 <img
//                   src={images[activeImg]}
//                   alt={product.name}
//                   className="h-full w-full object-contain"
//                 />
//               ) : (
//                 <span className="text-4xl">📦</span>
//               )}
//             </div>
//             {images.length > 1 && (
//               <div className="mt-3 flex gap-2 overflow-x-auto">
//                 {images.map((src, i) => (
//                   <button
//                     key={src + i}
//                     onClick={() => setActiveImg(i)}
//                     className={`h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition ${
//                       i === activeImg ? "border-(--admin-primary)" : "border-(--admin-border)"
//                     }`}
//                   >
//                     <img src={src} alt="" className="h-full w-full object-cover" />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Key details */}
//           <div className="grid grid-cols-2 gap-3">
//             <Detail label="Price">
//               {formatPrice(product.price)}
//               {discount > 0 && (
//                 <span className="ml-2 text-xs font-medium text-emerald-600">{discount}% off</span>
//               )}
//             </Detail>
//             <Detail label="MRP">{product.mrp ? formatPrice(product.mrp) : "—"}</Detail>
//             <Detail label="Category">{product.category?.name || "—"}</Detail>
//             <Detail label="Brand">{product.brand || "—"}</Detail>
//             <Detail label="SKU">{product.sku || "—"}</Detail>
//             <Detail label="Stock">{product.stock ?? 0}</Detail>
//           </div>

//           {/* Description */}
//           <div>
//             <h3 className="text-sm font-semibold text-(--admin-text)">Description</h3>
//             <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-(--admin-text-secondary)">
//               {product.description || "No description provided."}
//             </p>
//           </div>

//           {/* Variants */}
//           {product.hasVariants && product.variants?.length > 0 && (
//             <div>
//               <h3 className="text-sm font-semibold text-(--admin-text)">
//                 Variants ({product.variants.length})
//               </h3>
//               <div className="mt-2 overflow-x-auto rounded-lg border border-(--admin-border)">
//                 <table className="w-full text-left text-xs">
//                   <thead className="bg-(--admin-surface-soft) text-(--admin-text-muted)">
//                     <tr>
//                       <th className="px-3 py-2 font-semibold">SKU</th>
//                       <th className="px-3 py-2 font-semibold">Attributes</th>
//                       <th className="px-3 py-2 font-semibold">Price</th>
//                       <th className="px-3 py-2 font-semibold">Stock</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {product.variants.map((v) => (
//                       <tr key={v._id || v.sku} className="border-t border-(--admin-border)">
//                         <td className="px-3 py-2 text-(--admin-text)">{v.sku}</td>
//                         <td className="px-3 py-2 text-(--admin-text-secondary)">
//                           {(v.attributes || []).map((a) => `${a.name}: ${a.value}`).join(", ") || "—"}
//                         </td>
//                         <td className="px-3 py-2 text-(--admin-text)">{formatPrice(v.price)}</td>
//                         <td className="px-3 py-2 text-(--admin-text-secondary)">{v.stock}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {/* Vendor */}
//           <div>
//             <h3 className="text-sm font-semibold text-(--admin-text)">Vendor</h3>
//             <p className="mt-2 text-sm text-(--admin-text-secondary)">
//               {vendorName(product.vendor)}
//               {product.vendor?.email && product.vendor?.firstName
//                 ? ` · ${product.vendor.email}`
//                 : ""}
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center justify-end gap-2 border-t border-(--admin-border) p-5">
//           <button onClick={onClose} className={btnGhost}>
//             Close
//           </button>
//           <StatusActions
//             status={product.status}
//             busy={busy}
//             onChange={onChange}
//             onReject={onReject}
//           />
//         </div>
//       </aside>
//     </div>
//   );
// }

function Detail({ label, children }) {
  return (
    <div className="rounded-lg border border-(--admin-border) bg-(--admin-surface-soft) px-3 py-2.5">
      <p className="text-[11px] text-(--admin-text-muted)">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-(--admin-text)">{children}</p>
    </div>
  );
}

/* =========================
   REJECT MODAL
========================= */

function RejectModal({ product, busy, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const trimmed = reason.trim();
  const valid = trimmed.length >= 10;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={busy ? undefined : onClose} />

      <div className="relative w-full max-w-md rounded-2xl border border-(--admin-border) bg-(--admin-surface) p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-(--admin-text)">Reject product</h2>
        <p className="mt-1 text-sm text-(--admin-text-muted)">
          Tell the vendor what to fix in “{product.name}”. They will see this message.
        </p>

        <textarea
          autoFocus
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Images are blurry and the description is missing sizing details."
          className="mt-4 w-full resize-none rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) p-3 text-sm text-(--admin-text) outline-none transition placeholder:text-(--admin-text-muted) focus:border-(--admin-primary) focus:ring-2 focus:ring-[color-mix(in_srgb,var(--admin-primary)_15%,transparent)]"
        />
        <p className="mt-1 text-xs text-(--admin-text-muted)">
          {valid ? `${trimmed.length} characters` : "Write at least 10 characters."}
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} disabled={busy} className={btnGhost}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(trimmed)}
            disabled={!valid || busy}
            className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Rejecting..." : "Reject product"}
          </button>
        </div>
      </div>
    </div>
  );
}
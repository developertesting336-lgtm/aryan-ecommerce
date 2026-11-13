import React, { useState, useEffect } from "react";

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString()}`;

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

// vendor is only shown when the API populated it as an object
const vendorLabel = (v) =>
  v && typeof v === "object"
    ? [v.firstName, v.lastName].filter(Boolean).join(" ") || v.email || ""
    : "";

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  pending: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  rejected: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
  inactive: "bg-(--admin-surface-soft) text-(--admin-text-muted)",
};

/**
 * Read-only product details drawer.
 * props:
 *  - product: product object
 *  - onClose: () => void
 *  - footer:  optional node rendered next to the Close button (e.g. approve / reject buttons)
 */
export default function ProductViewDrawer({ product, onClose, footer }) {
  const [activeImg, setActiveImg] = useState(0);

  const images = product.images?.length
    ? product.images
    : product.image
    ? [product.image]
    : [];

  const categoryName =
    typeof product.category === "object" ? product.category?.name : product.category;

  const vendor = vendorLabel(product.vendor);

  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <aside className="relative flex h-full w-full max-w-xl flex-col border-l border-(--admin-border) bg-(--admin-surface) shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-(--admin-border) p-5">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-(--admin-text)">{product.name}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-(--admin-text-muted)">
              {product.status && (
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    STATUS_STYLES[product.status] || STATUS_STYLES.inactive
                  }`}
                >
                  {product.status[0].toUpperCase() + product.status.slice(1)}
                </span>
              )}
              <span>
                {vendor ? `by ${vendor} · ` : ""}
                created {formatDate(product.createdAt)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Close"
            className="cursor-pointer rounded-lg p-2 text-(--admin-text-muted) transition hover:bg-(--admin-surface-soft) hover:text-(--admin-text)"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {product.status === "rejected" && product.rejectionReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              <p className="font-semibold">Rejected</p>
              <p className="mt-1">{product.rejectionReason}</p>
            </div>
          )}

          {/* Images */}
          <div>
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-(--admin-border) bg-(--admin-surface-soft)">
              {images[activeImg] ? (
                <img
                  src={images[activeImg]}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-4xl">📦</span>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => setActiveImg(i)}
                    className={`h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition ${
                      i === activeImg ? "border-(--admin-primary)" : "border-(--admin-border)"
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Key details */}
          <div className="grid grid-cols-2 gap-3">
            <Detail label="Price">
              {formatPrice(product.price)}
              {discount > 0 && (
                <span className="ml-2 text-xs font-medium text-emerald-600">{discount}% off</span>
              )}
            </Detail>
            <Detail label="MRP">{product.mrp ? formatPrice(product.mrp) : "—"}</Detail>
            <Detail label="Category">{categoryName || "—"}</Detail>
            <Detail label="Brand">{product.brand || "—"}</Detail>
            <Detail label="SKU">{product.sku || "—"}</Detail>
            <Detail label="Stock">{product.stock ?? 0}</Detail>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-(--admin-text)">Description</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-(--admin-text-secondary)">
              {product.description || "No description provided."}
            </p>
          </div>

          {/* Variants */}
          {product.hasVariants && product.variants?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-(--admin-text)">
                Variants ({product.variants.length})
              </h3>
              <div className="mt-2 overflow-x-auto rounded-lg border border-(--admin-border)">
                <table className="w-full text-left text-xs">
                  <thead className="bg-(--admin-surface-soft) text-(--admin-text-muted)">
                    <tr>
                      <th className="px-3 py-2 font-semibold">SKU</th>
                      <th className="px-3 py-2 font-semibold">Attributes</th>
                      <th className="px-3 py-2 font-semibold">Price</th>
                      <th className="px-3 py-2 font-semibold">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v) => (
                      <tr key={v._id || v.sku} className="border-t border-(--admin-border)">
                        <td className="px-3 py-2 text-(--admin-text)">{v.sku}</td>
                        <td className="px-3 py-2 text-(--admin-text-secondary)">
                          {(v.attributes || []).map((a) => `${a.name}: ${a.value}`).join(", ") || "—"}
                        </td>
                        <td className="px-3 py-2 text-(--admin-text)">{formatPrice(v.price)}</td>
                        <td className="px-3 py-2 text-(--admin-text-secondary)">{v.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vendor */}
          {vendor && (
            <div>
              <h3 className="text-sm font-semibold text-(--admin-text)">Vendor</h3>
              <p className="mt-2 text-sm text-(--admin-text-secondary)">
                {vendor}
                {product.vendor?.email && product.vendor?.firstName
                  ? ` · ${product.vendor.email}`
                  : ""}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-(--admin-border) p-5">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) px-3 py-2 text-xs font-semibold text-(--admin-text-secondary) transition hover:bg-(--admin-surface-soft)"
          >
            Close
          </button>
          {footer}
        </div>
      </aside>
    </div>
  );
}

function Detail({ label, children }) {
  return (
    <div className="rounded-lg border border-(--admin-border) bg-(--admin-surface-soft) px-3 py-2.5">
      <p className="text-[11px] text-(--admin-text-muted)">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-(--admin-text)">{children}</p>
    </div>
  );
}
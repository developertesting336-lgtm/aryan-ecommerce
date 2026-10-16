import React from "react";
import {
  Eye,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import CouponStatusBadge from "./CouponStatusBadge";

const formatCurrency = (value, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function CouponTable({
  coupons = [],
  onView,
  onEdit,
  onDelete,
  onToggle,
}) {
  if (!coupons.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white py-16 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          No coupons found
        </p>

        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Create a coupon to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1000px]">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/60">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Coupon
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Discount
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Minimum Order
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Validity
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Usage
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Status
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {coupons.map((coupon) => (
              <tr
                key={coupon._id}
                className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {coupon.code}
                    </p>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {coupon.name}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}%`
                      : formatCurrency(
                          coupon.discountValue,
                          coupon.currency
                        )}
                  </p>

                  {coupon.discountType === "percentage" &&
                    coupon.maxDiscountAmount && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Max{" "}
                        {formatCurrency(
                          coupon.maxDiscountAmount,
                          coupon.currency
                        )}
                      </p>
                    )}
                </td>

                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {formatCurrency(
                    coupon.minOrderAmount,
                    coupon.currency
                  )}
                </td>

                <td className="px-6 py-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(coupon.startsAt)}
                  </p>

                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    to {formatDate(coupon.expiresAt)}
                  </p>
                </td>

                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {coupon.usedCount || 0} /{" "}
                    {coupon.totalUsageLimit || "∞"}
                  </p>
                </td>

                <td className="px-6 py-4">
                  <CouponStatusBadge
                    isActive={coupon.isActive}
                    startsAt={coupon.startsAt}
                    expiresAt={coupon.expiresAt}
                  />
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onView(coupon)}
                      title="View"
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onEdit(coupon)}
                      title="Edit"
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onToggle(coupon)}
                      title="Toggle Status"
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                      {coupon.isActive ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      onClick={() => onDelete(coupon)}
                      title="Delete"
                      className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet Cards */}
      <div className="divide-y divide-gray-100 lg:hidden dark:divide-gray-800">
        {coupons.map((coupon) => (
          <div key={coupon._id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">
                  {coupon.code}
                </p>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {coupon.name}
                </p>
              </div>

              <CouponStatusBadge
                isActive={coupon.isActive}
                startsAt={coupon.startsAt}
                expiresAt={coupon.expiresAt}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Discount
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}%`
                    : formatCurrency(
                        coupon.discountValue,
                        coupon.currency
                      )}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Minimum Order
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(
                    coupon.minOrderAmount,
                    coupon.currency
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Start
                </p>

                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {formatDate(coupon.startsAt)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Expires
                </p>

                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {formatDate(coupon.expiresAt)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-1 border-t border-gray-100 pt-3 dark:border-gray-800">
              <button
                onClick={() => onView(coupon)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <Eye className="h-4 w-4" />
              </button>

              <button
                onClick={() => onEdit(coupon)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                onClick={() => onToggle(coupon)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                {coupon.isActive ? (
                  <ToggleRight className="h-4 w-4" />
                ) : (
                  <ToggleLeft className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={() => onDelete(coupon)}
                className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
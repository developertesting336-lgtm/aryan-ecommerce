import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function CouponFilters({
  search,
  setSearch,
  status,
  setStatus,
  discountType,
  setDiscountType,
}) {
  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setDiscountType("all");
  };

  const hasFilters =
    search ||
    status !== "all" ||
    discountType !== "all";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-5 w-5 text-gray-600" />

        <h3 className="font-semibold text-gray-900">
          Filters
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupon code or name..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="upcoming">Upcoming</option>
          <option value="expired">Expired</option>
        </select>

        {/* Discount */}
        <select
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
        >
          <option value="all">All Discount Types</option>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
        >
          <X className="h-4 w-4" />
          Clear Filters
        </button>
      )}
    </div>
  );
}
import React from "react";
import {
  RefreshCw,
} from "lucide-react";

export default function VendorPageHeader({
  title,
  description,
  loading,
  onRefresh,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />

          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Vendor Panel
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>

        <p className="mt-1.5 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="
          inline-flex items-center justify-center gap-2
          rounded-xl border border-slate-200
          bg-white px-4 py-2.5
          text-sm font-semibold text-slate-600
          shadow-sm
          transition
          hover:border-indigo-200
          hover:bg-indigo-50
          hover:text-indigo-600
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        <RefreshCw
          size={16}
          className={
            loading ? "animate-spin" : ""
          }
        />

        Refresh
      </button>
    </div>
  );
}

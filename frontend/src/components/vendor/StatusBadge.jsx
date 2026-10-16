import React from "react";

export default function StatusBadge({
  status,
}) {
  const normalized = String(
    status || ""
  ).toLowerCase();


  let classes =
    "bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-300";


  if (
    normalized === "delivered" ||
    normalized === "completed"
  ) {
    classes =
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border dark:border-emerald-800/40";
  }


  if (
    normalized === "pending" ||
    normalized === "processing"
  ) {
    classes =
      "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 dark:border dark:border-amber-800/40";
  }


  if (normalized === "shipped") {
    classes =
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border dark:border-indigo-800/40";
  }


  if (
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    classes =
      "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 dark:border dark:border-red-800/40";
  }


  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2.5
        py-1
        text-[10px]
        font-bold
        capitalize
        ${classes}
      `}
    >
      {status || "Unknown"}
    </span>
  );
}

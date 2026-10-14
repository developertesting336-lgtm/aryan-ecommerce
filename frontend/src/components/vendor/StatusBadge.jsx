import React from "react";

export default function StatusBadge({
  status,
}) {
  const normalized = String(
    status || ""
  ).toLowerCase();


  let classes =
    "bg-slate-100 text-slate-600";


  if (
    normalized === "delivered" ||
    normalized === "completed"
  ) {
    classes =
      "bg-emerald-50 text-emerald-600";
  }


  if (
    normalized === "pending" ||
    normalized === "processing"
  ) {
    classes =
      "bg-amber-50 text-amber-600";
  }


  if (normalized === "shipped") {
    classes =
      "bg-indigo-50 text-indigo-600";
  }


  if (
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    classes =
      "bg-red-50 text-red-600";
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

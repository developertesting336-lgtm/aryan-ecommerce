import React from "react";

export default function CouponStatusBadge({
  isActive,
  startsAt,
  expiresAt,
}) {
  const now = new Date();
  const start = startsAt ? new Date(startsAt) : null;
  const expiry = expiresAt ? new Date(expiresAt) : null;

  let status = "Inactive";
  let classes = "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";

  if (isActive === false) {
    status = "Inactive";
    classes = "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  } else if (expiry && expiry < now) {
    status = "Expired";
    classes = "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 dark:border dark:border-red-800/40";
  } else if (start && start > now) {
    status = "Upcoming";
    classes = "bg-yellow-100 text-yellow-700 dark:bg-amber-950/40 dark:text-amber-400 dark:border dark:border-amber-800/40";
  } else {
    status = "Active";
    classes = "bg-green-100 text-green-700 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border dark:border-emerald-800/40";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
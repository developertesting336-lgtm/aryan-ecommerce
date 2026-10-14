import React from "react";

export default function EmptyState({
  icon,
  title,
  description,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-800">
        {title}
      </h3>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

import React from "react";

export default function QuickAction({
  icon,
  title,
  onClick,
  color = "indigo",
}) {
  const colors = {
    indigo:
      "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600",

    blue:
      "bg-blue-50 text-blue-600 group-hover:bg-blue-600",

    violet:
      "bg-violet-50 text-violet-600 group-hover:bg-violet-600",

    emerald:
      "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600",
  };

  return (
    <button
      onClick={onClick}
      className="
        group
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-3
        text-left
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-transparent
        hover:shadow-md
      "
    >

      <span
        className={`
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          transition
          group-hover:text-white
          ${colors[color]}
        `}
      >
        {icon}
      </span>

      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-slate-700 group-hover:text-indigo-600">
          {title}
        </p>

        <p className="mt-0.5 hidden text-[10px] text-slate-400 sm:block">
          Quick action
        </p>
      </div>

    </button>
  );
}

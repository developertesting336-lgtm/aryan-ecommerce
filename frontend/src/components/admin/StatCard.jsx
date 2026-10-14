import React from "react";

export default function StatCard({
  title,
  value,
  change,
  icon,
}) {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-xl
        border
        border-(--admin-border)
        bg-(--admin-surface)
        p-5
        shadow-(--admin-card-shadow)
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-(--admin-card-shadow-hover)
      "
    >

      <div className="flex items-start justify-between">

        <div>

          <p
            className="
              text-[11px]
              font-medium
              text-(--admin-text-muted)
            "
          >
            {title}
          </p>

          <h2
            className="
              mt-2
              text-2xl
              font-bold
              tracking-tight
              text-(--admin-text)
            "
          >
            {value}
          </h2>

          <div className="mt-2 flex items-center gap-1.5">

            <span
              className="
                text-[11px]
                font-semibold
                text-(--admin-success)
              "
            >
              ↗ {change}
            </span>

            <span
              className="
                text-[10px]
                text-(--admin-text-muted)
              "
            >
              vs last month
            </span>

          </div>
        </div>

        <div
          className="
            flex h-11 w-11
            items-center justify-center
            rounded-xl
            bg-(--admin-stat-green-icon)
            text-(--admin-stat-green-text)
            transition
            group-hover:bg-(--admin-primary)
            group-hover:text-white
          "
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

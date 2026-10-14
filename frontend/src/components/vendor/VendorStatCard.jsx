import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function VendorStatCard({
  title,
  value,
  change,
  trend = "up",
  icon,
  gradient,
}) {
  return (
    <div
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        bg-gradient-to-br
        ${gradient}
        p-5
        text-white
        shadow-lg
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      `}
    >

      {/* Decorative circles */}

      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 transition duration-500 group-hover:scale-125" />

      <div className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-white/5" />


      <div className="relative">

        <div className="flex items-start justify-between">

          <div>

            <p className="text-sm font-medium text-white/80">
              {title}
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {value}
            </h2>

          </div>


          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm">
            {icon}
          </div>

        </div>


        <div className="mt-5 flex items-center gap-2">

          <span
            className={`
              inline-flex
              items-center
              gap-1
              rounded-full
              bg-white/15
              px-2
              py-1
              text-xs
              font-bold
              backdrop-blur-sm
            `}
          >
            {trend === "up" ? (
              <ArrowUpRight size={13} />
            ) : (
              <ArrowDownRight size={13} />
            )}

            {change}
          </span>

          <span className="text-[11px] text-white/65">
            vs last period
          </span>

        </div>

      </div>
    </div>
  );
}

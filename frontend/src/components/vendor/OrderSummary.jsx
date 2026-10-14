import React from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function OrderSummary({
  summary,
}) {
  const items = [
    {
      label: "Delivered",
      value: Number(
        summary?.delivered || 0
      ),
      color: "#10b981",
    },
    {
      label: "Processing",
      value: Number(
        summary?.processing || 0
      ),
      color: "#6366f1",
    },
    {
      label: "Shipped",
      value: Number(
        summary?.shipped || 0
      ),
      color: "#24B9E8",
    },
    {
      label: "Pending",
      value: Number(
        summary?.pending || 0
      ),
      color: "#f59e0b",
    },
    {
      label: "Cancelled",
      value: Number(
        summary?.cancelled || 0
      ),
      color: "#ef4444",
    },
  ];


  const total = items.reduce(
    (sum, item) =>
      sum + item.value,
    0
  );
console.log("tosal",total)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

      <div>

        <div className="flex items-center gap-2">

          <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />

          <h2 className="text-base font-bold text-slate-900">
            Order Summary
          </h2>

        </div>

        <p className="mt-1 text-xs text-slate-400">
          Current order status
        </p>

      </div>


      {/* =================================
          DONUT
      ================================= */}

      <div className="relative mx-auto mt-2 h-[210px] w-full">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <PieChart>

            <Pie
              data={items}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={84}
              paddingAngle={4}
              stroke="none"
            >

              {items.map((item) => (
                <Cell
                  key={item.label}
                  fill={item.color}
                />
              ))}

            </Pie>

            <Tooltip />

          </PieChart>

        </ResponsiveContainer>


        {/* Center */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">

          <p className="text-2xl font-bold text-slate-900">
            {total}
          </p>

          <p className="text-[10px] text-slate-400">
            Total Orders
          </p>

        </div>

      </div>


      {/* =================================
          STATUS
      ================================= */}

      <div className="space-y-3">

        {items.map((item) => {

          const percentage =
            total > 0
              ? Math.round(
                  (item.value /
                    total) *
                    100
                )
              : 0;

          return (
            <div
              key={item.label}
              className="flex items-center justify-between"
            >

              <div className="flex items-center gap-2">

                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      item.color,
                  }}
                />

                <span className="text-xs font-medium text-slate-600">
                  {item.label}
                </span>

              </div>

              <div className="flex items-center gap-3">

                <span className="text-[10px] text-slate-400">
                  {percentage}%
                </span>

                <span className="min-w-[24px] text-right text-xs font-bold text-slate-800">
                  {item.value}
                </span>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

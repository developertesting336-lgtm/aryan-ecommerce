import React, { useMemo, useState } from "react";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

export default function SalesOverview({ data = [],period,setPeriod }) {
  /* =====================================================
     FILTER
  ===================================================== */

  // const [period, setPeriod] = useState("7days");

  /* =====================================================
     FALLBACK DATA
  ===================================================== */

  const fallbackData = [
    {
      label: "Mon",
      value: 4200,
    },
    {
      label: "Tue",
      value: 6800,
    },
    {
      label: "Wed",
      value: 5200,
    },
    {
      label: "Thu",
      value: 8400,
    },
    {
      label: "Fri",
      value: 7200,
    },
    {
      label: "Sat",
      value: 9800,
    },
    {
      label: "Sun",
      value: 8600,
    },
  ];

  /* =====================================================
     NORMALIZE + GROUP API DATA
     
     Your API:
     
     [
       {
         _id: "...",
         createdAt: "2026-08-26T22:10:36.375Z",
         total: 5000
       }
     ]
     
     We convert it into:
     
     [
       {
         label: "Aug 26",
         value: 5000
       }
     ]
  ===================================================== */

  const normalizedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return fallbackData;
    }

    /*
     * Group sales by date.
     *
     * If you have:
     *
     * Aug 26 -> 5000
     * Aug 26 -> 2500
     * Aug 27 -> 8000
     *
     * The chart becomes:
     *
     * Aug 26 -> 7500
     * Aug 27 -> 8000
     */

    const grouped = {};

    data.forEach((item, index) => {
      if (!item) return;

      const rawDate =
        item.createdAt ||
        item.date ||
        item.updatedAt;

      let dateKey = `day-${index}`;

      if (rawDate) {
        const date = new Date(rawDate);

        if (!Number.isNaN(date.getTime())) {
          dateKey = date.toISOString().split("T")[0];
        }
      }

      const value = Number(
        item.total ??
          item.value ??
          item.revenue ??
          item.sales ??
          item.amount ??
          0
      );

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          dateKey,
          value: 0,
        };
      }

      grouped[dateKey].value += value;
    });

    return Object.values(grouped)
      .sort(
        (a, b) =>
          new Date(a.dateKey) -
          new Date(b.dateKey)
      )
      .map((item) => {
        const date = new Date(item.dateKey);

        return {
          label: formatDate(date),
          value: Number(item.value || 0),
          date: item.dateKey,
        };
      });
  }, [data]);

  /* =====================================================
     FILTER DATA
  ===================================================== */

  const salesData = useMemo(() => {
    /*
     * TODAY
     */

    if (period === "today") {
      const today = new Date();

      const todayKey =
        today.toISOString().split("T")[0];

      const todayData = normalizedData.filter(
        (item) => item.date === todayKey
      );

      /*
       * If there is no today's data,
       * return zero instead of a single
       * unrelated record.
       */

      if (todayData.length > 0) {
        return todayData;
      }

      return [
        {
          label: "Today",
          value: 0,
          date: todayKey,
        },
      ];
    }

    /*
     * LAST 7 DAYS
     */

    if (period === "7days") {
      return normalizedData.slice(-7);
    }

    /*
     * LAST 30 DAYS
     */

    if (period === "30days") {
      return normalizedData.slice(-30);
    }

    /*
     * LAST 3 MONTHS
     */

    if (period === "3months") {
      return normalizedData.slice(-90);
    }

    /*
     * LAST 6 MONTHS
     */

    if (period === "6months") {
      return normalizedData.slice(-180);
    }

    /*
     * LAST YEAR
     */

    if (period === "year") {
      return normalizedData.slice(-365);
    }

    return normalizedData;
  }, [normalizedData, period]);

  /* =====================================================
     CHART DATA
     
     IMPORTANT:
     
     If the API contains only one record, the chart
     will still have one record.
     
     We add empty days so the chart doesn't look like
     a single isolated point/bar.
  ===================================================== */

  const displayData = useMemo(() => {
    /*
     * For real API data, don't replace it with fake
     * sales values.
     *
     * But if there is only one record, create a small
     * date range around it with zero values.
     */

    if (
      Array.isArray(data) &&
      data.length > 0 &&
      salesData.length === 1
    ) {
      const single = salesData[0];

      if (!single.date) {
        return salesData;
      }

      const baseDate = new Date(single.date);

      const result = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(baseDate);

        date.setDate(
          baseDate.getDate() - i
        );

        const key =
          date.toISOString().split("T")[0];

        const existing =
          key === single.date
            ? single.value
            : 0;

        result.push({
          date: key,
          label: formatDate(date),
          value: existing,
        });
      }

      return result;
    }

    return salesData;
  }, [salesData, data]);

  /* =====================================================
     CALCULATIONS
  ===================================================== */

  const totalSales = useMemo(() => {
    return displayData.reduce(
      (total, item) =>
        total + Number(item.value || 0),
      0
    );
  }, [displayData]);

  /* =====================================================
     AVERAGE
  ===================================================== */

  const averageSales = useMemo(() => {
    if (!displayData.length) {
      return 0;
    }

    return Math.round(
      totalSales / displayData.length
    );
  }, [displayData, totalSales]);

  /* =====================================================
     HIGHEST SALES
  ===================================================== */

  const highestSales = useMemo(() => {
    return Math.max(
      ...displayData.map((item) =>
        Number(item.value || 0)
      ),
      0
    );
  }, [displayData]);

  /* =====================================================
     HIGHEST DAY
  ===================================================== */

  const highestDay = useMemo(() => {
    return (
      displayData.find(
        (item) =>
          Number(item.value) ===
          highestSales
      )?.label || "-"
    );
  }, [displayData, highestSales]);

  /* =====================================================
     COLORS
  ===================================================== */

  const barColors = [
    "#4779F5",
    "#24B9E8",
    "#7C5CFC",
    "#A855F7",
    "#EC4899",
    "#F97316",
    "#22C55E",
  ];

  /* =====================================================
     PERIOD LABEL
  ===================================================== */

  const getPeriodLabel = () => {
    switch (period) {
      case "today":
        return "Today";

      case "7days":
        return "Last 7 Days";

      case "30days":
        return "Last 30 Days";

      case "3months":
        return "Last 3 Months";

      case "6months":
        return "Last 6 Months";

      case "year":
        return "Last Year";

      default:
        return "Last 7 Days";
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="border-b border-slate-100 p-5 sm:p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          {/* TITLE */}

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#4779F5] to-[#24B9E8] shadow-lg shadow-blue-100">

                <span className="text-lg font-bold text-white">
                  ₹
                </span>

              </div>

              <div>

                <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                  Sales Overview
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Track your store revenue performance
                </p>

              </div>

            </div>
          </div>

          {/* RIGHT */}

          <div className="flex flex-wrap items-center gap-3">

            {/* GROWTH */}

            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                ↗
              </div>

              <div>

                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Growth
                </p>

                <p className="text-xs font-bold text-emerald-600">
                  +12.5%
                </p>

              </div>

            </div>

            {/* FILTER */}

            <select
              value={period}
              onChange={(e) =>
                setPeriod(e.target.value)
              }
              className="
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                py-2.5
                text-xs
                font-semibold
                text-slate-600
                outline-none
                transition
                hover:bg-white
                focus:border-[#4779F5]
                focus:ring-4
                focus:ring-blue-50
              "
            >

              <option value="today">
                Today
              </option>

              <option value="7days">
                Last 7 Days
              </option>

              <option value="30days">
                Last 30 Days
              </option>


              {/* <option value="6months">
                Last 6 Months
              </option> */}

              <option value="year">
                Last Year
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* =================================================
          PERIOD INFO
      ================================================= */}

      <div className="flex items-center justify-between px-5 pt-5">

        <div>

          <p className="text-xs font-medium text-slate-400">
            {getPeriodLabel()}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            Sales performance
          </p>

        </div>

        <div className="flex items-center gap-2">

          <span className="h-2 w-2 rounded-full bg-[#4779F5]" />

          <span className="text-[10px] font-medium text-slate-400">
            Revenue
          </span>

        </div>

      </div>

      {/* =================================================
          CHART
      ================================================= */}

      <div className="px-2 pb-3 pt-4 sm:px-5">

        <div className="h-77.5 w-full">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <ComposedChart
              data={displayData}
              margin={{
                top: 15,
                right: 10,
                left: -15,
                bottom: 10,
              }}
              barCategoryGap="22%"
            >

              {/* =================================================
                  GRADIENTS
              ================================================= */}

              <defs>

                <linearGradient
                  id="vendorSalesBarGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >

                  <stop
                    offset="0%"
                    stopColor="#4779F5"
                  />

                  <stop
                    offset="100%"
                    stopColor="#24B9E8"
                  />

                </linearGradient>

                <linearGradient
                  id="vendorSalesLineGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >

                  <stop
                    offset="0%"
                    stopColor="#4779F5"
                  />

                  <stop
                    offset="45%"
                    stopColor="#7C5CFC"
                  />

                  <stop
                    offset="100%"
                    stopColor="#EC4899"
                  />

                </linearGradient>

              </defs>

              {/* =================================================
                  GRID
              ================================================= */}

              <CartesianGrid
                stroke="#EEF2F7"
                strokeDasharray="5 5"
                vertical={false}
              />

              {/* =================================================
                  X AXIS
              ================================================= */}

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#94A3B8",
                  fontSize: 11,
                  fontWeight: 500,
                }}
                dy={12}
              />

              {/* =================================================
                  Y AXIS
              ================================================= */}

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#94A3B8",
                  fontSize: 10,
                }}
                tickFormatter={formatYAxis}
                domain={[
                  0,
                  "auto",
                ]}
              />

              {/* =================================================
                  TOOLTIP
              ================================================= */}

              <Tooltip
                cursor={{
                  fill: "#F8FAFC",
                }}
                content={<SalesTooltip />}
              />

              {/* =================================================
                  BARS
              ================================================= */}

              <Bar
                dataKey="value"
                name="Sales"
                radius={[
                  8,
                  8,
                  3,
                  3,
                ]}
                maxBarSize={42}
                animationDuration={900}
              >

                {displayData.map(
                  (entry, index) => (
                    <Cell
                      key={`sales-bar-${index}`}
                      fill={
                        entry.value === 0
                          ? "#EEF2F7"
                          : barColors[
                              index %
                                barColors.length
                            ]
                      }
                    />
                  )
                )}

              </Bar>

              {/* =================================================
                  TREND LINE
              ================================================= */}

              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#vendorSalesLineGradient)"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#ffffff",
                  stroke: "#4779F5",
                  strokeWidth: 3,
                }}
                activeDot={{
                  r: 7,
                  fill: "#7C5CFC",
                  stroke: "#ffffff",
                  strokeWidth: 3,
                }}
                animationDuration={1200}
              />

            </ComposedChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* =================================================
          QUICK INSIGHTS
      ================================================= */}

      <div className="grid grid-cols-1 border-t border-slate-100 sm:grid-cols-3">

        {/* TOTAL */}

        <div className="p-5 sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#4779F5]">
              ₹
            </div>

            <div>

              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Sales
              </p>

              <p className="mt-0.5 text-lg font-bold text-slate-900">
                ₹
                {totalSales.toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

          </div>

          <div className="mt-3 flex items-center gap-2">

            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
              +12.5%
            </span>

            <span className="text-[10px] text-slate-400">
              vs last period
            </span>

          </div>

        </div>

        {/* AVERAGE */}

        <div className="border-t border-slate-100 p-5 sm:border-l sm:border-t-0 sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-[#7C5CFC]">
              ↗
            </div>

            <div>

              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Daily Average
              </p>

              <p className="mt-0.5 text-lg font-bold text-slate-900">
                ₹
                {averageSales.toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

          </div>

          <p className="mt-3 text-[10px] text-slate-400">
            Average daily revenue
          </p>

        </div>

        {/* BEST DAY */}

        <div className="border-t border-slate-100 p-5 sm:border-l sm:border-t-0 sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-pink-500">
              ★
            </div>

            <div>

              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Best Day
              </p>

              <p className="mt-0.5 text-lg font-bold text-slate-900">
                {highestDay}
              </p>

            </div>

          </div>

          <p className="mt-3 text-[10px] text-slate-400">
            ₹
            {highestSales.toLocaleString(
              "en-IN"
            )}{" "}
            highest sales
          </p>

        </div>

      </div>

    </div>
  );
}

/* =====================================================
   CUSTOM TOOLTIP
===================================================== */

function SalesTooltip({
  active,
  payload,
  label,
}) {
  if (
    !active ||
    !payload ||
    payload.length === 0
  ) {
    return null;
  }

  const value = Number(
    payload[0]?.value || 0
  );

  return (
    <div className="min-w-40 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl">

      <div className="flex items-center justify-between gap-5">

        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <span className="h-2.5 w-2.5 rounded-full bg-linear-to-r from-[#4779F5] to-[#EC4899]" />

      </div>

      <p className="mt-2 text-xl font-bold text-slate-900">
        ₹
        {value.toLocaleString("en-IN")}
      </p>

      <div className="mt-2 flex items-center gap-2">

        <span className="h-1.5 w-5 rounded-full bg-linear-to-r from-[#4779F5] to-[#24B9E8]" />

        <span className="text-[10px] font-medium text-slate-500">
          Sales revenue
        </span>

      </div>

    </div>
  );
}

/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(date) {
  if (
    !date ||
    Number.isNaN(date.getTime())
  ) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
}

/* =====================================================
   Y AXIS FORMAT
===================================================== */

function formatYAxis(value) {
  if (value >= 100000) {
    return `₹${(
      value / 100000
    ).toFixed(1)}L`;
  }

  if (value >= 1000) {
    return `₹${(
      value / 1000
    ).toFixed(0)}k`;
  }

  return `₹${value}`;
}

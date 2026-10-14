import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SalesChart({ data = [],onFilterChange,
  selectedFilter = "7days", }) {
  const chartData =
    data?.length > 0
      ? data
      : [
          {
            date: "Aug 18",
            sales: 1200,
          },
          {
            date: "Aug 19",
            sales: 2400,
          },
          {
            date: "Aug 20",
            sales: 1800,
          },
          {
            date: "Aug 21",
            sales: 4000,
          },
          {
            date: "Aug 22",
            sales: 2500,
          },
        ];

  return (
    <div className="h-full w-full">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-5 flex items-center justify-between gap-3">

        <div className="min-w-0">
          <h3
            className="
              text-base
              font-bold
              tracking-tight
              text-(--admin-text)
            "
          >
            Sales Statistic
          </h3>

          <p
            className="
              mt-1
              text-[11px]
              text-(--admin-text-muted)
            "
          >
            Recent sales performance
          </p>
        </div>

        {/* Period Selector */}
        <select
        value={selectedFilter}
          onChange={(e) => onFilterChange?.(e.target.value)}
          className="
            shrink-0
            rounded-lg
            border
            border-(--admin-control-border)
            bg-(--admin-control-bg)
            px-3 py-2
            text-[11px]
            font-medium
            text-(--admin-text-secondary)
            outline-none
            transition-all
            duration-200

            hover:border-(--admin-primary)

            focus:border-(--admin-primary)
            focus:ring-2
            focus:ring-[color-mix(in_srgb,var(--admin-primary)_15%,transparent)]

            [&>option]:bg-(--admin-surface)
            [&>option]:text-(--admin-text)
          "
        >
          <option value="today">Today</option>
          <option value="7days">Recent</option>
          <option value="30days">Monthly</option>
          <option value="year">Yearly</option>
        </select>

      </div>

      {/* =====================================================
          CHART
      ===================================================== */}

      <div className="h-65 w-full">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 5,
              left: -15,
              bottom: 0,
            }}
          >

            {/* Gradient */}
            <defs>
              <linearGradient
                id="salesGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--admin-primary)"
                  stopOpacity={0.28}
                />

                <stop
                  offset="60%"
                  stopColor="var(--admin-primary)"
                  stopOpacity={0.10}
                />

                <stop
                  offset="100%"
                  stopColor="var(--admin-primary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            {/* Grid */}
            <CartesianGrid
              strokeDasharray="2 3"
              vertical={false}
              stroke="var(--admin-border)"
              opacity={0.9}
            />

            {/* X Axis */}
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fill: "var(--admin-text-muted)",
              }}
              dy={8}
            />

            {/* Y Axis */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fill: "var(--admin-text-muted)",
              }}
              tickFormatter={(value) =>
                value >= 1000
                  ? `${Math.round(value / 1000)}k`
                  : value
              }
            />

            {/* Tooltip */}
            <Tooltip
              cursor={{
                stroke: "var(--admin-primary)",
                strokeOpacity: 0.35,
                strokeDasharray: "4 4",
              }}
              content={<CustomTooltip />}
            />

            {/* Area */}
            <Area
              type="monotone"
              dataKey="sales"
              stroke="var(--admin-primary)"
              strokeWidth={2.5}
              fill="url(#salesGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "var(--admin-primary)",
                stroke: "var(--admin-surface)",
                strokeWidth: 3,
              }}
            />

          </AreaChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
}

/* =========================================================
   CUSTOM TOOLTIP
========================================================= */

function CustomTooltip({
  active,
  payload,
  label,
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className="
        min-w-30
        rounded-xl
        border
        border-(--admin-border)
        bg-(--admin-surface)
        px-3 py-2.5
        shadow-(--admin-card-shadow)
      "
    >
      <p
        className="
          text-[10px]
          font-medium
          text-(--admin-text-muted)
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-xs
          font-bold
          text-(--admin-text)
        "
      >
        ₹
        {Number(
          payload[0].value || 0
        ).toLocaleString("en-IN")}
      </p>

      <div className="mt-1.5 flex items-center gap-1.5">
        <span
          className="
            h-1.5
            w-1.5
            rounded-full
            bg-(--admin-primary)
          "
        />

        <span
          className="
            text-[9px]
            font-medium
            text-(--admin-text-secondary)
          "
        >
          Sales
        </span>
      </div>
    </div>
  );
}

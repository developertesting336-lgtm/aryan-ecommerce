import React, { useState,useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAdminDashboard } from "../../redux/slices/adminSlice";

import SalesChart from "../../components/admin/SalesChart";
import RecentOrders from "../../components/admin/RecentOrders";
import TopProducts from "../../components/admin/TopProducts";

import { Wallet } from "lucide-react";

export default function AdminDashboard() {
  const dispatch = useDispatch();
const [filter, setFilter] = useState("7days");

  const { user } = useSelector((state) => state.auth);
// console.log("filter",filter)
  const {
    stats = {},
    recentOrders = [],
    topProducts = [],
    orderSummery = [],
    salesOverview = [],
    loading,
    error,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getAdminDashboard(filter));
  }, [dispatch,filter]);

  /* =========================================================
     CHART DATA
  ========================================================= */

  const chartData = useMemo(() => {
    if (!salesOverview?.length) {
      return [];
    }

    return salesOverview.map((item) => ({
      date: formatChartDate(item.createdAt),
      sales: Number(item.total || 0),
      createdAt: item.createdAt,
    }));
  }, [salesOverview]);

  /* =========================================================
     TOTAL SALES
  ========================================================= */

  const totalSales = useMemo(() => {
    if (salesOverview?.length) {
      return salesOverview.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0
      );
    }

    return Number(stats?.revenue || 0);
  }, [salesOverview, stats]);

  return (
    <div
      className="
        min-h-full
        bg-(--admin-bg)
        text-(--admin-text)
        transition-colors
        duration-200
      "
    >
      <main
        className="
          mx-auto
          w-full
          max-w-375
          p-4
          sm:p-5
          lg:p-6
          xl:p-7
        "
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="
                  text-xl
                  font-bold
                  tracking-tight
                  text-(--admin-text)
                  sm:text-2xl
                "
              >
                Hello, {user?.firstName || "Admin"}
              </h1>

              <span className="text-xl">👋</span>
            </div>

            <p
              className="
                mt-1
                text-xs
                text-(--admin-text-muted)
                sm:text-sm
              "
            >
              Here's what's happening with your store today.
            </p>
          </div>

          {/* Export */}
          <button
            className="
              hidden
              rounded-lg
              border
              border-(--admin-control-border)
              bg-(--admin-control-bg)
              px-4
              py-2
              text-xs
              font-semibold
              text-(--admin-text-secondary)
              shadow-sm
              transition-all
              duration-200

              hover:border-(--admin-primary)
              hover:bg-(--admin-surface-soft)
              hover:text-(--admin-primary)

              sm:block
            "
          >
            Export Report
          </button>
        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div
            className="
              mb-5
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-[color-mix(in_srgb,var(--admin-success)_20%,transparent)]
              bg-[color-mix(in_srgb,var(--admin-success)_10%,transparent)]
              px-4
              py-3
              text-xs
              font-medium
              text-(--admin-success)
              transition-colors
              duration-200
            "
          >
            <span
              className="
                h-4
                w-4
                animate-spin
                rounded-full
                border-2
                border-[color-mix(in_srgb,var(--admin-success)_25%,transparent)]
                border-t-(--admin-success)
              "
            />

            Loading dashboard...
          </div>
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div
            className="
              mb-5
              rounded-xl
              border
              border-[color-mix(in_srgb,var(--admin-danger)_20%,transparent)]
              bg-[color-mix(in_srgb,var(--admin-danger)_10%,transparent)]
              px-4
              py-3
              text-xs
              font-medium
              text-(--admin-danger)
            "
          >
            {error}
          </div>
        )}

        {/* =====================================================
            STATS
        ===================================================== */}

        <div
          className="
            mb-5
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          <DashboardStat
            title="Total Sales"
            value={`₹${formatNumber(
              Number(stats?.revenue || totalSales)
            )}`}
            change="4.9%"
            color="purple"
            icon={<SalesIcon />}
          />

          <DashboardStat
            title="Total Orders"
            value={formatNumber(stats?.orders)}
            change="8.2%"
            color="blue"
            icon={<OrdersIcon />}
          />

          <DashboardStat
            title="Total Products"
            value={formatNumber(stats?.products)}
            change="5.4%"
            color="orange"
            icon={<ProductsIcon />}
          />

          <DashboardStat
            title="Net Earnings"
            value={formatNumber(stats?.adminEarining)}
            change="14.6%"
            color="green"
            icon={<Wallet size={20} />}
          />
        </div>

        {/* =====================================================
            SALES + ORDER SUMMARY
        ===================================================== */}

        <div
          className="
            mb-5
            grid
            grid-cols-1
            gap-5
            xl:grid-cols-[minmax(0,2fr)_minmax(300px,0.85fr)]
          "
        >
          {/* Sales */}
          <section
            className="
              min-w-0
              rounded-xl
              border
              border-(--admin-border)
              bg-(--admin-surface)
              p-5
              shadow-(--admin-card-shadow)
              transition-colors
              duration-200
            "
          >
            <SalesChart data={chartData} selectedFilter={filter} onFilterChange={setFilter} />
          </section>

          {/* Order Summary */}
          <OrderSummary data={orderSummery} />
        </div>

        {/* =====================================================
            RECENT ORDERS + TOP PRODUCTS
        ===================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-5
            xl:grid-cols-[minmax(0,2fr)_minmax(300px,0.85fr)]
          "
        >
          {/* Recent Orders */}
          <section
            className="
              min-w-0
              overflow-hidden
              rounded-xl
              border
              border-(--admin-border)
              bg-(--admin-surface)
              shadow-(--admin-card-shadow)
              transition-colors
              duration-200
            "
          >
            <RecentOrders orders={recentOrders} />
          </section>

          {/* Top Products */}
          <TopProducts products={topProducts} />
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function DashboardStat({
  title,
  value,
  change,
  icon,
  color = "green",
}) {
  const colors = {
    purple: {
      background: "bg-[var(--admin-stat-purple-bg)]",
      icon: `
        bg-[var(--admin-stat-purple-icon)]
        text-[var(--admin-stat-purple-text)]
      `,
      change: "text-[var(--admin-stat-purple-text)]",
    },

    blue: {
      background: "bg-[var(--admin-stat-blue-bg)]",
      icon: `
        bg-[var(--admin-stat-blue-icon)]
        text-[var(--admin-stat-blue-text)]
      `,
      change: "text-[var(--admin-stat-blue-text)]",
    },

    orange: {
      background: "bg-[var(--admin-stat-orange-bg)]",
      icon: `
        bg-[var(--admin-stat-orange-icon)]
        text-[var(--admin-stat-orange-text)]
      `,
      change: "text-[var(--admin-stat-orange-text)]",
    },

    green: {
      background: "bg-[var(--admin-stat-green-bg)]",
      icon: `
        bg-[var(--admin-stat-green-icon)]
        text-[var(--admin-stat-green-text)]
      `,
      change: "text-[var(--admin-stat-green-text)]",
    },
  };

  const theme = colors[color];

  return (
    <div
      className={`
        group
        relative
        overflow-hidden
        rounded-xl
        border
        border-(--admin-border)
        ${theme.background}
        p-5
        transition-all
        duration-200

        hover:-translate-y-0.5
        hover:shadow-(--admin-card-shadow)
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className="
              text-[11px]
              font-medium
              text-(--admin-text-secondary)
            "
          >
            {title}
          </p>

          <h2
            className="
              mt-2
              text-[22px]
              font-bold
              tracking-tight
              text-(--admin-text)
            "
          >
            {value}
          </h2>

          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`
                text-[10px]
                font-bold
                ${theme.change}
              `}
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
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${theme.icon}
            transition-transform
            duration-200
            group-hover:scale-105
          `}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ORDER SUMMARY
========================================================= */

function OrderSummary({ data = [] }) {
  const statuses = [
    {
      label: "Pending",
      value: Number(data?.[0] || 0),
      color: "var(--admin-warning)",
    },
    {
      label: "Confirmed",
      value: Number(data?.[1] || 0),
      color: "var(--admin-success)",
    },
    {
      label: "Shipped",
      value: Number(data?.[2] || 0),
      color: "var(--admin-info)",
    },
    {
      label: "Cancelled",
      value: Number(data?.[3] || 0),
      color: "var(--admin-danger)",
    },
  ];

  return (
    <section
      className="
        rounded-xl
        border
        border-(--admin-border)
        bg-(--admin-surface)
        p-5
        shadow-(--admin-card-shadow)
        transition-colors
        duration-200
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2
            className="
              text-base
              font-bold
              text-(--admin-text)
            "
          >
            Order Summary
          </h2>

          <p
            className="
              mt-1
              text-[11px]
              text-(--admin-text-muted)
            "
          >
            Current order distribution
          </p>
        </div>

        <span
          className="
            rounded-full
            bg-(--admin-surface-soft)
            px-3
            py-1
            text-[10px]
            font-semibold
            text-(--admin-text-secondary)
          "
        >
          Today
        </span>
      </div>

      {/* Donut */}
      <div className="flex items-center justify-center py-5">
        <DonutChart data={statuses} />
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {statuses.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2"
          >
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{
                backgroundColor: item.color,
              }}
            />

            <span
              className="
                text-[10px]
                font-medium
                text-(--admin-text-secondary)
              "
            >
              {item.label}
            </span>

            <span
              className="
                ml-auto
                text-[10px]
                font-bold
                text-(--admin-text)
              "
            >
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   DONUT CHART
========================================================= */

function DonutChart({ data }) {
  const radius = 47;
  const circumference = 2 * Math.PI * radius;

  const total = data.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  let accumulated = 0;

  return (
    <div className="relative h-44 w-44">
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full -rotate-90"
      >
        {/* Track */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--admin-chart-track)"
          strokeWidth="12"
        />

        {/* Segments */}
        {total > 0 &&
          data.map((item) => {
            const percentage =
              Number(item.value || 0) / total;

            const dash =
              percentage * circumference;

            const offset =
              -(accumulated / total) * circumference;

            accumulated += Number(item.value || 0);

            return (
              <circle
                key={item.label}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="12"
                strokeDasharray={`${dash} ${
                  circumference - dash
                }`}
                strokeDashoffset={offset}
              />
            );
          })}
      </svg>

      {/* Center */}
      <div
        className="
          absolute
          inset-0
          flex
          flex-col
          items-center
          justify-center
        "
      >
        <span
          className="
            text-2xl
            font-bold
            text-(--admin-text)
          "
        >
          {total}%
        </span>

        <span
          className="
            mt-0.5
            text-[9px]
            text-(--admin-text-muted)
          "
        >
          Orders
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   ICONS
========================================================= */

function SalesIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 4-5 3 3 6-7" />
      <path d="M16 6h4v4" />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 14c2.8 0 5 2.2 5 5" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
      />

      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <rect
        x="3"
        y="6"
        width="18"
        height="13"
        rx="2"
      />

      <path d="M7 6V4h10v2" />
      <path d="M8 12h8" />
      <path d="M8 15h5" />
    </svg>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);
}

function formatChartDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
}

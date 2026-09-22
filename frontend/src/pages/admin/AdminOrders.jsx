import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAdminOrders } from "../../redux/slices/adminSlice";
import { useNavigate } from "react-router-dom";

export default function AdminOrders() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [payment, setPayment] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    orders = [],
    stats = {},
    loading,
    error,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(
      getAdminOrders({
        page: currentPage,
        limit: 4,
      })
    );
  }, [dispatch, currentPage]);

  const orderList = orders || [];

  const filteredOrders = orderList.filter((order) => {
    const searchTerm = search.toLowerCase();

    const orderNumber =
      order.orderNumber?.toLowerCase() || "";

    const customer =
      order.name?.toLowerCase() || "";

    const email =
      order.email?.toLowerCase() || "";

    const matchesSearch =
      orderNumber.includes(searchTerm) ||
      customer.includes(searchTerm) ||
      email.includes(searchTerm);

    const matchesStatus =
      status === "All" ||
      order.status === status;

    const matchesPayment =
      payment === "All" ||
      order.paymentStatus === payment;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPayment
    );
  });

  const totalRevenue = stats.Revenue || 0;
  const deliveredOrders = stats.deliveredOrders || 0;
  const pendingOrders = stats.pendingOrders || 0;

  return (
    <div className="min-h-screen bg-(--admin-bg) text-(--admin-text)">
      <main className="mx-auto w-full max-w-375 p-4 sm:p-5 lg:p-6 xl:p-7">

        {/* ================= HEADER ================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-(--admin-text) sm:text-2xl">
              Orders
            </h1>

            <p className="mt-1 text-xs text-(--admin-text-muted) sm:text-sm">
              Manage and track customer orders
            </p>
          </div>

          <button
            className="
              rounded-lg
              border border-(--admin-control-border)
              bg-(--admin-control-bg)
              px-4 py-2.5
              text-xs font-semibold
              text-(--admin-text-secondary)
              shadow-sm
              transition-all duration-200
              hover:border-(--admin-success)
              hover:bg-(--admin-surface-soft)
              hover:text-(--admin-success)
              active:scale-[0.98]
            "
          >
            Export Orders
          </button>
        </div>

        {/* ================= STATS ================= */}

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <OrderStat
            title="Total Orders"
            value={stats.totalOrders}
            icon="🛒"
            color="blue"
          />

          <OrderStat
            title="Total Revenue"
            value={`₹${Number(totalRevenue).toLocaleString("en-IN")}`}
            icon="💰"
            color="green"
          />

          <OrderStat
            title="Delivered"
            value={deliveredOrders}
            icon="✓"
            color="purple"
          />

          <OrderStat
            title="Pending"
            value={pendingOrders}
            icon="◷"
            color="orange"
          />

        </div>

        {/* ================= ORDERS CARD ================= */}

        <div
          className="
            overflow-hidden
            rounded-xl
            border border-(--admin-border)
            bg-(--admin-surface)
            shadow-(--admin-card-shadow)
          "
        >

          {/* ================= TOOLBAR ================= */}

          <div
            className="
              flex flex-col gap-4
              border-b border-(--admin-border)
              p-5
              xl:flex-row xl:items-center xl:justify-between
            "
          >
            <div>
              <h2 className="text-sm font-bold text-(--admin-text) sm:text-base">
                All Orders
              </h2>

              <p className="mt-1 text-[11px] text-(--admin-text-muted)">
                {filteredOrders.length} orders found
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              {/* Search */}

              <div
                className="
                  flex h-10 w-full items-center gap-2
                  rounded-lg
                  border border-(--admin-control-border)
                  bg-(--admin-control-bg)
                  px-3
                  transition-colors
                  focus-within:border-(--admin-success)
                  focus-within:ring-2
                  focus-within:ring-[color-mix(in_srgb,var(--admin-success)_12%,transparent)]
                  sm:w-64
                "
              >
                <span className="text-sm text-(--admin-text-muted)">
                  🔍
                </span>

                <input
                  type="text"
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="
                    w-full
                    bg-transparent
                    text-xs
                    text-(--admin-text)
                    outline-none
                    placeholder:text-(--admin-text-muted)
                  "
                />
              </div>

              {/* Status */}

              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="
                  h-10
                  rounded-lg
                  border border-(--admin-control-border)
                  bg-(--admin-control-bg)
                  px-3
                  text-xs
                  font-medium
                  text-(--admin-text-secondary)
                  outline-none
                  transition
                  hover:border-(--admin-success)
                  focus:border-(--admin-success)
                  focus:ring-2
                  focus:ring-[color-mix(in_srgb,var(--admin-success)_12%,transparent)]
                "
              >
                <option value="All">All Status</option>
                <option value="UNFULFILLED">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              {/* Payment */}

              <select
                value={payment}
                onChange={(e) => {
                  setPayment(e.target.value);
                  setCurrentPage(1);
                }}
                className="
                  h-10
                  rounded-lg
                  border border-(--admin-control-border)
                  bg-(--admin-control-bg)
                  px-3
                  text-xs
                  font-medium
                  text-(--admin-text-secondary)
                  outline-none
                  transition
                  hover:border-(--admin-success)
                  focus:border-(--admin-success)
                  focus:ring-2
                  focus:ring-[color-mix(in_srgb,var(--admin-success)_12%,transparent)]
                "
              >
                <option value="All">All Payments</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>

            </div>
          </div>

          {/* ================= LOADING ================= */}

          {loading && (
            <div
              className="
                flex items-center gap-3
                border-b border-(--admin-border)
                bg-[color-mix(in_srgb,var(--admin-success)_5%,transparent)]
                px-5 py-4
                text-xs font-medium
                text-(--admin-success)
              "
            >
              <span
                className="
                  h-4 w-4 animate-spin rounded-full
                  border-2
                  border-[color-mix(in_srgb,var(--admin-success)_20%,transparent)]
                  border-t-(--admin-success)
                "
              />

              Loading orders...
            </div>
          )}

          {/* ================= ERROR ================= */}

          {error && (
            <div
              className="
                m-5
                rounded-lg
                border border-red-100
                bg-red-50
                px-4 py-3
                text-xs font-medium
                text-red-600
              "
            >
              {error}
            </div>
          )}

          {/* ================= TABLE ================= */}

          {!loading && (
            <div className="overflow-x-auto">

              <table className="w-full min-w-250">

                <thead>
                  <tr
                    className="
                      border-b
                      border-(--admin-border)
                      bg-(--admin-surface-soft)
                    "
                  >
                    <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-(--admin-text-muted)">
                      Order
                    </th>

                    <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-(--admin-text-muted)">
                      Customer
                    </th>

                    <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-(--admin-text-muted)">
                      Products
                    </th>

                    <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-(--admin-text-muted)">
                      Amount
                    </th>

                    <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-(--admin-text-muted)">
                      Payment
                    </th>

                    <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-(--admin-text-muted)">
                      Status
                    </th>

                    <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-(--admin-text-muted)">
                      Date
                    </th>

                    <th className="px-5 py-3.5 text-right text-[10px] font-semibold uppercase tracking-wider text-(--admin-text-muted)">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="
                        border-b border-(--admin-border)
                        transition-colors duration-150
                        hover:bg-(--admin-surface-soft)
                      "
                    >

                      {/* Order */}

                      <td className="px-5 py-4">
                        <button
                          onClick={() =>
                            navigate(`/admin/orders/${order._id}`)
                          }
                          className="
                            text-xs font-bold
                            text-(--admin-success)
                            transition
                            hover:underline
                          "
                        >
                          {order.orderNumber}
                        </button>
                      </td>

                      {/* Customer */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div
                            className="
                              flex h-9 w-9 shrink-0
                              items-center justify-center
                              rounded-full
                              bg-(--admin-stat-blue-bg)
                              text-xs font-bold
                              text-(--admin-stat-blue-text)
                            "
                          >
                            {order.name
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-45 truncate text-xs font-semibold text-(--admin-text)">
                              {order.name}
                            </p>

                            <p className="mt-0.5 max-w-45 truncate text-[10px] text-(--admin-text-muted)">
                              {order.email}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* Products */}

                      <td className="px-5 py-4">
                        <span className="text-xs font-medium text-(--admin-text-secondary)">
                          {order.items}
                        </span>
                      </td>

                      {/* Amount */}

                      <td className="px-5 py-4">
                        <span className="text-xs font-bold text-(--admin-text)">
                          ₹{Number(order.amount || 0).toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Payment */}

                      <td className="px-5 py-4">
                        <PaymentStatus
                          status={order.paymentStatus}
                        />
                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">
                        <OrderStatus
                          status={order.status}
                        />
                      </td>

                      {/* Date */}

                      <td className="px-5 py-4 text-xs text-(--admin-text-secondary)">
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleDateString("en-IN")
                          : "-"}
                      </td>

                      {/* Action */}

                      <td className="px-5 py-4 text-right">

                        <div className="flex justify-end gap-1">

                          <button
                            title="View order"
                            onClick={() =>
                              navigate(
                                `/admin/orders/${order._id}`
                              )
                            }
                            className="
                              rounded-lg p-2
                              text-(--admin-text-muted)
                              transition-all duration-150
                              hover:bg-(--admin-stat-green-bg)
                              hover:text-(--admin-success)
                            "
                          >
                            👁️
                          </button>

                          <button
                            title="More"
                            className="
                              rounded-lg p-2
                              text-(--admin-text-muted)
                              transition-all duration-150
                              hover:bg-(--admin-surface-soft)
                              hover:text-(--admin-text)
                            "
                          >
                            ⋮
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}

          {/* ================= EMPTY ================= */}

          {!loading &&
            filteredOrders.length === 0 && (
              <div className="px-5 py-16 text-center">

                <div
                  className="
                    mx-auto flex h-14 w-14
                    items-center justify-center
                    rounded-full
                    bg-(--admin-surface-soft)
                    text-2xl
                  "
                >
                  🛒
                </div>

                <h3 className="mt-4 text-sm font-bold text-(--admin-text)">
                  No orders found
                </h3>

                <p className="mt-1 text-xs text-(--admin-text-muted)">
                  Try changing your search or filters.
                </p>

              </div>
            )}

          {/* ================= PAGINATION ================= */}

          {filteredOrders.length > 0 && (
            <div
              className="
                flex flex-col gap-3
                border-t border-(--admin-border)
                p-5
                sm:flex-row sm:items-center sm:justify-between
              "
            >

              <p className="text-[11px] text-(--admin-text-muted)">
                Showing{" "}
                <span className="font-semibold text-(--admin-text-secondary)">
                  {filteredOrders.length}
                </span>{" "}
                orders
              </p>

              <div className="flex items-center gap-2">

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(1, page - 1)
                    )
                  }
                  className="
                    rounded-lg
                    border border-(--admin-control-border)
                    bg-(--admin-control-bg)
                    px-3 py-2
                    text-[11px] font-medium
                    text-(--admin-text-secondary)
                    transition
                    hover:bg-(--admin-surface-soft)
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Previous
                </button>

                <button
                  className="
                    rounded-lg
                    bg-(--admin-success)
                    px-3 py-2
                    text-[11px] font-bold
                    text-white
                    shadow-sm
                  "
                >
                  {currentPage}
                </button>

                <button
                  onClick={() =>
                    setCurrentPage((page) =>
                      page + 1
                    )
                  }
                  className="
                    rounded-lg
                    border border-(--admin-control-border)
                    bg-(--admin-control-bg)
                    px-3 py-2
                    text-[11px] font-medium
                    text-(--admin-text-secondary)
                    transition
                    hover:bg-(--admin-surface-soft)
                  "
                >
                  Next
                </button>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

/* =========================================================
   ORDER STAT
========================================================= */

function OrderStat({
  title,
  value,
  icon,
  color = "green",
}) {
  const colors = {
    green: {
      bg: "bg-[var(--admin-stat-green-bg)]",
      icon: "bg-[var(--admin-stat-green-icon)] text-[var(--admin-stat-green-text)]",
    },

    blue: {
      bg: "bg-[var(--admin-stat-blue-bg)]",
      icon: "bg-[var(--admin-stat-blue-icon)] text-[var(--admin-stat-blue-text)]",
    },

    purple: {
      bg: "bg-[var(--admin-stat-purple-bg)]",
      icon: "bg-[var(--admin-stat-purple-icon)] text-[var(--admin-stat-purple-text)]",
    },

    orange: {
      bg: "bg-[var(--admin-stat-orange-bg)]",
      icon: "bg-[var(--admin-stat-orange-icon)] text-[var(--admin-stat-orange-text)]",
    },
  };

  const theme = colors[color] || colors.green;

  return (
    <div
      className={`
        group relative overflow-hidden
        rounded-xl
        border border-(--admin-border)
        ${theme.bg}
        p-5
        transition-all duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]
      `}
    >
      <div className="flex items-center justify-between">

        <div
          className={`
            flex h-11 w-11
            items-center justify-center
            rounded-xl
            text-lg
            ${theme.icon}
            transition-transform duration-200
            group-hover:scale-105
          `}
        >
          {icon}
        </div>

        <span className="text-[10px] font-medium text-(--admin-text-muted)">
          This month
        </span>

      </div>

      <p className="mt-4 text-[11px] font-medium text-(--admin-text-secondary)">
        {title}
      </p>

      <h2 className="mt-1 text-xl font-bold tracking-tight text-(--admin-text) sm:text-2xl">
        {value}
      </h2>
    </div>
  );
}

/* =========================================================
   ORDER STATUS
========================================================= */

function OrderStatus({ status }) {
  const normalizedStatus = {
    UNFULFILLED: "Pending",
    PENDING: "Pending",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    Pending: "Pending",
    Processing: "Processing",
    Shipped: "Shipped",
    Delivered: "Delivered",
    Cancelled: "Cancelled",
  }[status] || status;

  const styles = {
    Pending:
      "bg-[var(--admin-stat-orange-bg)] text-[var(--admin-stat-orange-text)]",

    Processing:
      "bg-[var(--admin-stat-purple-bg)] text-[var(--admin-stat-purple-text)]",

    Shipped:
      "bg-[var(--admin-stat-blue-bg)] text-[var(--admin-stat-blue-text)]",

    Delivered:
      "bg-[var(--admin-stat-green-bg)] text-[var(--admin-stat-green-text)]",

    Cancelled:
      "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2.5 py-1
        text-[10px]
        font-semibold
        ${styles[normalizedStatus] || "bg-slate-100 text-slate-500"}
      `}
    >
      {normalizedStatus}
    </span>
  );
}

/* =========================================================
   PAYMENT STATUS
========================================================= */

function PaymentStatus({ status }) {
  const normalizedStatus = {
    PAID: "Paid",
    PENDING: "Pending",
    FAILED: "Failed",
    Paid: "Paid",
    Pending: "Pending",
    Failed: "Failed",
  }[status] || status;

  const styles = {
    Paid:
      "bg-[var(--admin-stat-green-bg)] text-[var(--admin-stat-green-text)]",

    Pending:
      "bg-[var(--admin-stat-orange-bg)] text-[var(--admin-stat-orange-text)]",

    Failed:
      "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2.5 py-1
        text-[10px]
        font-semibold
        ${styles[normalizedStatus] || "bg-slate-100 text-slate-500"}
      `}
    >
      {normalizedStatus}
    </span>
  );
}

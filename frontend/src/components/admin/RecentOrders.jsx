import React from "react";

export default function RecentOrders({
  orders = [],
}) {
  const defaultOrders = [
    {
      orderNumber: "ORD-1001",
      productName: "Nike Air Max",
      price: 129,
      status: "CONFIRMED",
      userName: "John Smith",
      createdAt: new Date().toISOString(),
    },
  ];

  const orderList =
    orders?.length > 0
      ? orders
      : defaultOrders;

  return (
    <div
      className="
        w-full
        bg-(--admin-surface)
        text-(--admin-text)
        transition-colors duration-200
      "
    >
      {/* Header */}
      <div
        className="
          flex items-center justify-between
          border-b border-(--admin-border)
          px-5 py-4
          bg-(--admin-surface)
        "
      >
        <div>
          <h3
            className="
              text-base font-bold
              text-(--admin-text)
            "
          >
            Recent Orders
          </h3>

          <p
            className="
              mt-1 text-[11px]
              text-(--admin-text-muted)
            "
          >
            Latest orders from your customers
          </p>
        </div>

        <button
          className="
            rounded-lg
            border border-(--admin-control-border)
            bg-(--admin-control-bg)
            px-3 py-2
            text-[11px] font-semibold
            text-(--admin-text-secondary)
            transition-all duration-200

            hover:border-(--admin-primary)
            hover:bg-(--admin-surface-soft)
            hover:text-(--admin-primary)

            focus:outline-none
            focus:ring-2
            focus:ring-(--admin-primary)
            focus:ring-opacity-20
          "
        >
          ⇅ Sort by
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-(--admin-surface)">
        <table className="w-full min-w-190">
          <thead>
            <tr
              className="
                border-b border-(--admin-border)
                bg-(--admin-surface-soft)
                text-left
              "
            >
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Price</TableHead>
              <TableHead> Status</TableHead>
            </tr>
          </thead>

          <tbody>
            {orderList.map((order) => (
              <tr
                key={order.orderNumber}
                className="
                  group
                  border-b border-(--admin-border)
                  last:border-0
                  transition-colors duration-200

                  hover:bg-(--admin-surface-soft)
                "
              >
                {/* Order */}
                <td className="px-5 py-3.5">
                  <span
                    className="
                      text-[10px]
                      font-bold
                      text-(--admin-text-secondary)
                    "
                  >
                    #{getShortOrderNumber(order.orderNumber)}
                  </span>
                </td>

                {/* Customer */}
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="
                        flex h-7 w-7 shrink-0
                        items-center justify-center
                        rounded-full
                        bg-(--admin-stat-green-icon)
                        text-[9px]
                        font-bold
                        text-(--admin-stat-green-text)
                      "
                    >
                      {getInitials(order.userName)}
                    </div>

                    <span
                      className="
                        text-[11px]
                        font-medium
                        text-(--admin-text-secondary)
                      "
                    >
                      {order.userName || "Unknown"}
                    </span>
                  </div>
                </td>

                {/* Product */}
                <td className="max-w-62.5 px-3 py-3.5">
                  <p
                    title={order.productName}
                    className="
                      truncate
                      text-[11px]
                      font-medium
                      text-(--admin-text-secondary)
                    "
                  >
                    {order.productName}
                  </p>
                </td>

                {/* Date */}
                <td className="px-3 py-3.5">
                  <span
                    className="
                      whitespace-nowrap
                      text-[10px]
                      text-(--admin-text-muted)
                    "
                  >
                    {formatDate(order.createdAt)}
                  </span>
                </td>

                {/* Price */}
                <td className="px-3 py-3.5">
                  <span
                    className="
                      text-[11px]
                      font-bold
                      text-(--admin-text)
                    "
                  >
                    ₹{Number(order.price || 0).toLocaleString()}
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableHead({ children }) {
  return (
    <th
      className="
        px-3 py-3
        text-[10px]
        font-bold
        uppercase
        tracking-wide
        text-(--admin-text-muted)
      "
    >
      {children}
    </th>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({ status }) {
  const styles = {
    CONFIRMED: {
      bg: "var(--admin-stat-green-icon)",
      text: "var(--admin-stat-green-text)",
    },

    DELIVERED: {
      bg: "var(--admin-stat-green-icon)",
      text: "var(--admin-stat-green-text)",
    },

    PENDING: {
      bg: "var(--admin-stat-orange-icon)",
      text: "var(--admin-warning)",
    },

    PROCESSING: {
      bg: "var(--admin-stat-purple-icon)",
      text: "var(--admin-stat-purple-text)",
    },

    SHIPPED: {
      bg: "var(--admin-stat-blue-icon)",
      text: "var(--admin-stat-blue-text)",
    },

    CANCELLED: {
      bg: "rgba(239, 68, 68, 0.12)",
      text: "var(--admin-danger)",
    },

    RETURNED: {
      bg: "var(--admin-stat-orange-icon)",
      text: "var(--admin-stat-orange-text)",
    },
  };

  const style = styles[status];

  return (
    <span
      className="
        inline-flex
        rounded-full
        px-2.5 py-1
        text-[9px]
        font-bold
      "
      style={{
        backgroundColor:
          style?.bg || "var(--admin-surface-soft)",

        color:
          style?.text ||
          "var(--admin-text-secondary)",
      }}
    >
      {formatStatus(status)}
    </span>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getShortOrderNumber(orderNumber = "") {
  if (!orderNumber) return "N/A";

  return orderNumber.length > 16
    ? orderNumber.slice(-9)
    : orderNumber;
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString(
    "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatStatus(status = "") {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

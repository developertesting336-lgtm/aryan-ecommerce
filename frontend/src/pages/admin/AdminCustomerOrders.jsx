import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Package, Calendar, IndianRupee, ExternalLink } from "lucide-react";
import { getAdminUserOrdersApi } from "../../api/adminApi";
import PageButtons from "../../components/PageButtons";

export default function AdminCustomerOrders() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchUserOrders = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminUserOrdersApi(userId, page, 8);
      const data = res?.data?.data || res?.data || {};

      setUser(data.user || null);
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalOrders(data.pagination?.totalOrders || (data.orders || []).length);
    } catch (err) {
      console.error("Failed to fetch customer orders:", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to load customer orders"
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserOrders(currentPage);
    }
  }, [userId, currentPage, fetchUserOrders]);

  const customerName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Customer";

  return (
    <div className="min-h-screen bg-(--admin-bg) text-(--admin-text)">
      <main className="mx-auto w-full max-w-375 p-4 sm:p-5 lg:p-6 xl:p-7">
        {/* =====================================================
            BREADCRUMB & BACK BUTTON
        ===================================================== */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              aria-label="Back to customers"
              className="
                flex h-9 w-9 items-center justify-center
                rounded-xl border border-(--admin-border)
                bg-(--admin-surface) text-(--admin-text-secondary)
                transition-all duration-200
                hover:border-(--admin-primary) hover:text-(--admin-text)
              "
            >
              <ArrowLeft size={16} />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs text-(--admin-text-muted)">
                <Link
                  to="/admin/users"
                  className="hover:text-(--admin-text) transition"
                >
                  Customers
                </Link>
                <span>/</span>
                <span className="text-(--admin-text-secondary) font-medium truncate max-w-48 sm:max-w-none">
                  {customerName}
                </span>
                <span>/</span>
                <span className="text-(--admin-primary) font-semibold">Orders</span>
              </div>
              <h1 className="mt-0.5 text-xl font-bold tracking-tight text-(--admin-text) sm:text-2xl">
                {customerName}'s Orders
              </h1>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2 rounded-xl border border-(--admin-border) bg-(--admin-surface) px-3 py-2 text-xs text-(--admin-text-secondary)">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--admin-stat-purple-icon) text-xs font-bold text-(--admin-stat-purple-text)">
                {user.firstName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-(--admin-text) truncate">{user.email || "No email"}</p>
                <p className="text-[10px] text-(--admin-text-muted)">ID: {userId}</p>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            MAIN CARD
        ===================================================== */}
        <section
          className="
            overflow-hidden
            rounded-xl
            border border-(--admin-border)
            bg-(--admin-surface)
            shadow-(--admin-card-shadow)
            transition-colors duration-200
          "
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-(--admin-border) p-5">
            <div>
              <h2 className="text-sm font-bold text-(--admin-text)">
                Order History
              </h2>
              <p className="mt-1 text-[11px] text-(--admin-text-muted)">
                {totalOrders} total {totalOrders === 1 ? "order" : "orders"} placed
              </p>
            </div>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="flex items-center gap-3 border-b border-(--admin-border) bg-[color-mix(in_srgb,var(--admin-primary)_5%,transparent)] px-5 py-4 text-[11px] font-medium text-(--admin-primary)">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[color-mix(in_srgb,var(--admin-primary)_25%,transparent)] border-t-(--admin-primary)" />
              Loading customer orders...
            </div>
          )}

          {/* ERROR STATE */}
          {error && (
            <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-[11px] font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              <p className="mb-2 font-semibold">Error loading orders</p>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => fetchUserOrders(currentPage)}
                className="mt-3 inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && orders.length === 0 && (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--admin-surface-soft) text-3xl text-(--admin-text-muted)">
                <ShoppingBag size={28} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-(--admin-text)">
                No orders found
              </h3>
              <p className="mt-1 text-xs text-(--admin-text-muted)">
                This customer has not placed any orders yet.
              </p>
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="mt-5 rounded-xl border border-(--admin-border) bg-(--admin-surface-soft) px-4 py-2 text-xs font-semibold text-(--admin-text) hover:border-(--admin-primary) transition"
              >
                Back to Customers
              </button>
            </div>
          )}

          {/* ORDERS TABLE */}
          {!loading && !error && orders.length > 0 && (
            <div className="w-full overflow-x-auto overscroll-x-contain scrollbar-thin">
              <table className="w-full min-w-212.5 text-left text-xs">
                <thead>
                  <tr className="border-b border-(--admin-border) bg-(--admin-surface-soft)">
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wide text-(--admin-text-muted)">
                      Order #
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wide text-(--admin-text-muted)">
                      Date
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wide text-(--admin-text-muted)">
                      Items
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wide text-(--admin-text-muted)">
                      Total
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wide text-(--admin-text-muted)">
                      Payment
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wide text-(--admin-text-muted)">
                      Fulfillment
                    </th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-wide text-(--admin-text-muted)">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const orderDate = order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—";

                    const itemsCount =
                      order.items?.reduce(
                        (sum, item) => sum + (Number(item.quantity) || 1),
                        0
                      ) ||
                      order.items?.length ||
                      1;

                    const totalAmount = Number(order.total ?? order.subtotal ?? 0);

                    return (
                      <tr
                        key={order._id}
                        className="group border-b border-(--admin-border) last:border-0 transition-colors duration-150 hover:bg-(--admin-surface-soft)"
                      >
                        {/* Order Number */}
                        <td className="px-5 py-3.5 font-semibold text-(--admin-text)">
                          <span className="font-mono text-xs">
                            {order.orderNumber || order._id?.slice(-8) || "—"}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5 text-(--admin-text-secondary) whitespace-nowrap">
                          {orderDate}
                        </td>

                        {/* Items */}
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-(--admin-text)">
                              {itemsCount} {itemsCount === 1 ? "item" : "items"}
                            </span>
                            {order.items && order.items.length > 0 && (
                              <span className="text-[10px] text-(--admin-text-muted) truncate max-w-48">
                                {order.items[0]?.product?.name ||
                                  order.items[0]?.name ||
                                  "Item"}
                                {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Total */}
                        <td className="px-5 py-3.5 font-semibold text-(--admin-text) whitespace-nowrap">
                          ₹{totalAmount.toLocaleString("en-IN")}
                        </td>

                        {/* Payment Status */}
                        <td className="px-5 py-3.5">
                          <StatusBadge status={order.paymentStatus} type="payment" />
                        </td>

                        {/* Fulfillment Status */}
                        <td className="px-5 py-3.5">
                          <StatusBadge status={order.fulfillmentStatus || order.status} type="fulfillment" />
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="
                              inline-flex items-center gap-1.5
                              rounded-lg border border-(--admin-control-border)
                              bg-(--admin-control-bg) px-2.5 py-1.5
                              text-[11px] font-semibold text-(--admin-text-secondary)
                              transition hover:border-(--admin-primary) hover:text-(--admin-primary)
                            "
                          >
                            <span>Details</span>
                            <ExternalLink size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-(--admin-border) p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] text-(--admin-text-muted)">
                Page {currentPage} of {totalPages} ({totalOrders} orders)
              </p>
              <PageButtons
                page={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                colorTheme="admin"
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatusBadge({ status, type }) {
  const norm = String(status || "").toUpperCase();

  const getStyle = () => {
    if (["PAID", "DELIVERED", "COMPLETED"].includes(norm)) {
      return "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900";
    }
    if (["PENDING", "UNFULFILLED", "AUTHORIZED"].includes(norm)) {
      return "bg-amber-50 text-amber-600 ring-1 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900";
    }
    if (["PROCESSING", "PACKED", "SHIPPED"].includes(norm)) {
      return "bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900";
    }
    if (["FAILED", "CANCELLED", "RETURNED", "REFUNDED"].includes(norm)) {
      return "bg-rose-50 text-rose-600 ring-1 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-900";
    }
    return "bg-(--admin-surface-soft) text-(--admin-text-muted) ring-1 ring-(--admin-border)";
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getStyle()}`}>
      {norm || "UNKNOWN"}
    </span>
  );
}

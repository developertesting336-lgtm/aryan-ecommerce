import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Package,
  IndianRupee,
  XCircle,
  Eye,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { getAdminRefunds } from "../../redux/slices/refundSlice";
import PageButtons from "../../components/PageButtons";

export default function AdminRefunds() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    adminRefunds = [],
    adminStats = {},
    adminPagination = {},
    loading,
  } = useSelector((state) => state.refund);

  useEffect(() => {
    dispatch(
      getAdminRefunds({
        page: currentPage,
        limit: 8,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: search.trim() || undefined,
      })
    );
  }, [dispatch, currentPage, statusFilter, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    dispatch(
      getAdminRefunds({
        page: 1,
        limit: 8,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: search.trim() || undefined,
      })
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "REQUESTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
            <Clock className="h-3 w-3" />
            Requested
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </span>
        );
      case "RETURN_RECEIVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/40">
            <Package className="h-3 w-3" />
            Item Received
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200/60 dark:border-green-900/40">
            <CheckCircle2 className="h-3 w-3" />
            Refunded
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/60 dark:border-red-900/40">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-(--admin-bg) text-(--admin-text)">
      <main className="mx-auto w-full max-w-375 p-4 sm:p-5 lg:p-6 xl:p-7">
        {/* ================= HEADER ================= */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-(--admin-text) sm:text-2xl flex items-center gap-2.5">
              <RotateCcw className="h-6 w-6 text-(--admin-primary)" />
              Refund & Return Requests
            </h1>
            <p className="mt-1 text-xs text-(--admin-text-muted) sm:text-sm">
              Review, approve, inspect returned items, and process gateway refunds
            </p>
          </div>

          <button
            onClick={() => {
              dispatch(
                getAdminRefunds({
                  page: currentPage,
                  limit: 8,
                  status: statusFilter === "ALL" ? undefined : statusFilter,
                })
              );
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) px-4 py-2.5 text-xs font-semibold text-(--admin-text-secondary) shadow-sm hover:border-(--admin-primary) hover:text-(--admin-primary) transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        {/* ================= STATS WIDGETS ================= */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-(--admin-border) bg-[var(--admin-stat-orange-bg)] p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-(--admin-text-secondary)">
                Pending Approval
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--admin-stat-orange-icon)] text-[var(--admin-stat-orange-text)] font-bold text-sm">
                ⏳
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-(--admin-text)">
              {adminStats.pendingRequests || 0}
            </p>
            <p className="mt-1 text-xs text-[var(--admin-stat-orange-text)] font-medium">Requires review</p>
          </div>

          <div className="rounded-xl border border-(--admin-border) bg-[var(--admin-stat-blue-bg)] p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-(--admin-text-secondary)">
                Awaiting Item Receipt
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--admin-stat-blue-icon)] text-[var(--admin-stat-blue-text)] font-bold text-sm">
                📦
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-(--admin-text)">
              {(adminStats.approvedRequests || 0) + (adminStats.receivedRequests || 0)}
            </p>
            <p className="mt-1 text-xs text-[var(--admin-stat-blue-text)] font-medium">
              {adminStats.receivedRequests || 0} received & ready for refund
            </p>
          </div>

          <div className="rounded-xl border border-(--admin-border) bg-[var(--admin-stat-green-bg)] p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-(--admin-text-secondary)">
                Total Refunded
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--admin-stat-green-icon)] text-[var(--admin-stat-green-text)] font-bold text-sm">
                ₹
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-(--admin-text)">
              ₹{Number(adminStats.totalRefundedAmount || 0).toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-[var(--admin-stat-green-text)] font-medium">
              {adminStats.refundedRequests || 0} completed refunds
            </p>
          </div>

          <div className="rounded-xl border border-(--admin-border) bg-[var(--admin-stat-purple-bg)] p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-(--admin-text-secondary)">
                Total Requests
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--admin-stat-purple-icon)] text-[var(--admin-stat-purple-text)] font-bold text-sm">
                📋
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-(--admin-text)">
              {adminStats.totalRequests || 0}
            </p>
            <p className="mt-1 text-xs text-[var(--admin-stat-purple-text)] font-medium">All time requests</p>
          </div>
        </div>

        {/* ================= FILTERS & SEARCH ================= */}
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-(--admin-border) bg-(--admin-surface) p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 max-w-md"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--admin-text-muted)" />
            <input
              type="text"
              placeholder="Search by Request #, Order #, or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) pl-9 pr-4 py-2 text-xs text-(--admin-text) placeholder-(--admin-text-muted) focus:border-(--admin-primary) focus:outline-none transition"
            />
          </form>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-(--admin-text-muted)" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) px-3 py-2 text-xs font-medium text-(--admin-text) focus:border-(--admin-primary) focus:outline-none transition cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="REQUESTED">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="RETURN_RECEIVED">Item Received</option>
              <option value="REFUNDED">Refunded</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-hidden rounded-xl border border-(--admin-border) bg-(--admin-surface) shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-(--admin-border) bg-(--admin-surface-soft) text-(--admin-text-muted) font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Request #</th>
                  <th className="px-5 py-3.5">Order #</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Items</th>
                  <th className="px-5 py-3.5">Refund Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--admin-border)">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-(--admin-text-muted)">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-(--admin-primary)" />
                        Loading return requests...
                      </div>
                    </td>
                  </tr>
                ) : adminRefunds.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-(--admin-text-muted)">
                      <Package className="h-8 w-8 mx-auto mb-2 text-(--admin-text-muted)" />
                      No refund requests found.
                    </td>
                  </tr>
                ) : (
                  adminRefunds.map((refund) => (
                    <tr
                      key={refund._id}
                      className="hover:bg-(--admin-surface-soft) transition-colors"
                    >
                      {/* Request Number */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => navigate(`/admin/refunds/${refund._id}`)}
                          className="font-mono font-bold text-xs text-(--admin-primary) hover:underline cursor-pointer"
                        >
                          {refund.requestNumber}
                        </button>
                      </td>

                      {/* Order Number */}
                      <td className="px-5 py-4 font-medium text-(--admin-text)">
                        {refund.orderData?.orderNumber || "—"}
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-(--admin-text)">
                          {`${refund.userData?.firstName || ""} ${refund.userData?.lastName || ""}`.trim() ||
                            refund.userData?.fullName ||
                            "Customer"}
                        </p>
                        <p className="text-[11px] text-(--admin-text-muted)">
                          {refund.userData?.email}
                        </p>
                      </td>

                      {/* Items */}
                      <td className="px-5 py-4 text-(--admin-text-muted)">
                        {refund.items?.length || 0} item(s)
                      </td>

                      {/* Refund Amount */}
                      <td className="px-5 py-4 font-bold text-(--admin-text)">
                        ₹{Number(refund.totalRefundAmount || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {getStatusBadge(refund.status)}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-(--admin-text-muted)">
                        {new Date(refund.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => navigate(`/admin/refunds/${refund._id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) text-xs font-semibold text-(--admin-text) hover:border-(--admin-primary) hover:text-(--admin-primary) transition cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {adminPagination.totalPages > 1 && (
            <div className="border-t border-(--admin-border) p-4 flex justify-end">
              <PageButtons
                currentPage={currentPage}
                totalPages={adminPagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

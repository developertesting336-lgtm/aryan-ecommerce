import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Search,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Filter,
  Package,
} from "lucide-react";
import { getAdminComplaints } from "../../redux/slices/complaintSlice";
import PageButtons from "../../components/PageButtons";

export default function AdminComplaints() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { complaints, adminStats, pagination, loading, error } = useSelector(
    (state) => state.complaint
  );

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchComplaints = useCallback(
    (page = 1) => {
      dispatch(
        getAdminComplaints({
          page,
          limit: 10,
          status: status === "All" ? undefined : status,
          category: category === "All" ? undefined : category,
          priority: priority === "All" ? undefined : priority,
          search: search.trim() || undefined,
        })
      );
    },
    [dispatch, status, category, priority, search]
  );

  useEffect(() => {
    fetchComplaints(currentPage);
  }, [fetchComplaints, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchComplaints(1);
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case "OPEN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
            <Clock size={11} /> Open
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
            <AlertCircle size={11} /> In Progress
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
            <CheckCircle2 size={11} /> Resolved
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Closed
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
            <XCircle size={11} /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
            {s}
          </span>
        );
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case "HIGH":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
            High
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
            Medium
          </span>
        );
      case "LOW":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
            Low
          </span>
        );
      default:
        return <span>{p}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-(--admin-bg) text-(--admin-text)">
      <main className="mx-auto w-full max-w-375 p-4 sm:p-5 lg:p-6 xl:p-7">
        {/* ================= HEADER ================= */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-(--admin-text) sm:text-2xl">
              Customer Complaints
            </h1>
            <p className="mt-1 text-xs text-(--admin-text-muted) sm:text-sm">
              Manage, investigate, and resolve customer grievances and support tickets
            </p>
          </div>
        </div>

        {/* ================= STATS CARDS ================= */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Complaints"
            value={adminStats.totalComplaints || 0}
            icon="📋"
            color="purple"
          />
          <StatCard
            title="Open Tickets"
            value={adminStats.openCount || 0}
            icon="⏳"
            color="orange"
          />
          <StatCard
            title="In Progress"
            value={adminStats.inProgressCount || 0}
            icon="🔄"
            color="blue"
          />
          <StatCard
            title="Resolved"
            value={adminStats.resolvedCount || 0}
            icon="✅"
            color="green"
          />
        </div>

        {/* ================= MAIN TABLE CARD ================= */}
        <section className="overflow-hidden rounded-xl border border-(--admin-border) bg-(--admin-surface) shadow-(--admin-card-shadow)">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-(--admin-border) p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-bold text-(--admin-text)">
                All Tickets
              </h2>
              <p className="mt-1 text-[11px] text-(--admin-text-muted)">
                {pagination.totalComplaints || complaints.length} complaints found
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="flex h-10 items-center gap-2 rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) px-3 sm:w-64">
                <Search size={14} className="text-(--admin-text-muted)" />
                <input
                  type="text"
                  placeholder="Ticket #, subject, or order..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-[11px] text-(--admin-text) outline-none placeholder:text-(--admin-text-muted)"
                />
              </form>

              {/* Status Filter */}
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) px-3 text-[11px] font-medium text-(--admin-text-secondary) outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REJECTED">Rejected</option>
              </select>

              {/* Category Filter */}
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) px-3 text-[11px] font-medium text-(--admin-text-secondary) outline-none"
              >
                <option value="All">All Categories</option>
                <option value="PRODUCT_QUALITY">Product Quality</option>
                <option value="WRONG_ITEM">Wrong Item</option>
                <option value="DELIVERY_DELAY">Delivery Delay</option>
                <option value="PAYMENT_ISSUE">Payment Issue</option>
                <option value="SELLER_SERVICE">Seller / Service</option>
                <option value="OTHER">Other</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) px-3 text-[11px] font-medium text-(--admin-text-secondary) outline-none"
              >
                <option value="All">All Priorities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-3 border-b border-(--admin-border) bg-[color-mix(in_srgb,var(--admin-primary)_5%,transparent)] px-5 py-4 text-[11px] font-medium text-(--admin-primary)">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[color-mix(in_srgb,var(--admin-primary)_25%,transparent)] border-t-(--admin-primary)" />
              Loading complaints...
            </div>
          )}

          {/* Table */}
          {!loading && complaints.length > 0 && (
            <div className="w-full overflow-x-auto overscroll-x-contain scrollbar-thin">
              <table className="w-full min-w-212.5 text-left text-xs">
                <thead>
                  <tr className="border-b border-(--admin-border) bg-(--admin-surface-soft)">
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wide text-(--admin-text-muted)">
                      Ticket ID
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wide text-(--admin-text-muted)">
                      Customer
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wide text-(--admin-text-muted)">
                      Subject & Category
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wide text-(--admin-text-muted)">
                      Priority
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wide text-(--admin-text-muted)">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wide text-(--admin-text-muted)">
                      Date
                    </th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-wide text-(--admin-text-muted)">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((item) => (
                    <tr
                      key={item._id}
                      className="group border-b border-(--admin-border) last:border-0 transition-colors duration-150 hover:bg-(--admin-surface-soft)"
                    >
                      {/* Ticket ID */}
                      <td className="px-5 py-3.5 font-semibold text-(--admin-text)">
                        <span className="font-mono text-xs">#{item.ticketId}</span>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-(--admin-stat-purple-icon) text-xs font-bold text-(--admin-stat-purple-text)">
                            {item.user?.firstName?.charAt(0) || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-semibold text-(--admin-text)">
                              {item.user?.firstName} {item.user?.lastName}
                            </p>
                            <p className="truncate text-[10px] text-(--admin-text-muted)">
                              {item.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Subject & Category */}
                      <td className="px-5 py-3.5 max-w-64">
                        <p className="truncate font-semibold text-[11px] text-(--admin-text)">
                          {item.subject}
                        </p>
                        <p className="text-[10px] text-(--admin-text-muted) truncate">
                          {item.category?.replace(/_/g, " ")}
                          {item.orderNumber ? ` • Order #${item.orderNumber}` : ""}
                        </p>
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-3.5">{getPriorityBadge(item.priority)}</td>

                      {/* Status */}
                      <td className="px-5 py-3.5">{getStatusBadge(item.status)}</td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-[11px] text-(--admin-text-secondary) whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/complaints/${item._id}`)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) px-2.5 py-1.5 text-[11px] font-semibold text-(--admin-text-secondary) transition hover:border-(--admin-primary) hover:text-(--admin-primary) cursor-pointer"
                        >
                          <span>Manage</span>
                          <ExternalLink size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty */}
          {!loading && complaints.length === 0 && (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-(--admin-surface-soft) text-2xl text-(--admin-text-muted) mb-3">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-sm font-semibold text-(--admin-text)">
                No complaints found
              </h3>
              <p className="mt-1 text-xs text-(--admin-text-muted)">
                Try adjusting your search query or filter options.
              </p>
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-(--admin-border) p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] text-(--admin-text-muted)">
                Page {currentPage} of {pagination.totalPages} ({pagination.totalComplaints} tickets)
              </p>
              <PageButtons
                page={currentPage}
                totalPages={pagination.totalPages}
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

function StatCard({ title, value, icon, color = "purple" }) {
  const colors = {
    purple: {
      bg: "bg-[var(--admin-stat-purple-bg)]",
      icon: "bg-[var(--admin-stat-purple-icon)] text-[var(--admin-stat-purple-text)]",
    },
    blue: {
      bg: "bg-[var(--admin-stat-blue-bg)]",
      icon: "bg-[var(--admin-stat-blue-icon)] text-[var(--admin-stat-blue-text)]",
    },
    green: {
      bg: "bg-[var(--admin-stat-green-bg)]",
      icon: "bg-[var(--admin-stat-green-icon)] text-[var(--admin-stat-green-text)]",
    },
    orange: {
      bg: "bg-[var(--admin-stat-orange-bg)]",
      icon: "bg-[var(--admin-stat-orange-icon)] text-[var(--admin-stat-orange-text)]",
    },
  };

  const theme = colors[color] || colors.purple;

  return (
    <div className={`rounded-xl border border-(--admin-border) ${theme.bg} p-5 transition hover:shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${theme.icon}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-[11px] font-medium text-(--admin-text-secondary)">{title}</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-(--admin-text)">{value}</h2>
    </div>
  );
}

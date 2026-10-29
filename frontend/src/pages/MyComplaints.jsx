import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Search,
  Plus,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Filter,
} from "lucide-react";
import { getMyComplaints } from "../redux/slices/complaintSlice";
import RaiseComplaintModal from "../components/RaiseComplaintModal";
import PageButtons from "../components/PageButtons";

const STATUS_FILTERS = [
  { label: "All Complaints", value: "" },
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function MyComplaints() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { complaints, pagination, loading, error } = useSelector(
    (state) => state.complaint
  );

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchComplaints = useCallback(
    (page = 1) => {
      dispatch(
        getMyComplaints({
          page,
          limit: 8,
          status: selectedStatus || undefined,
          search: search.trim() || undefined,
        })
      );
    },
    [dispatch, selectedStatus, search]
  );

  useEffect(() => {
    fetchComplaints(currentPage);
  }, [fetchComplaints, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchComplaints(1);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <Clock size={11} /> Open
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <AlertCircle size={11} /> In Progress
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 size={11} /> Resolved
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            Closed
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <XCircle size={11} /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-gray-100 text-gray-600">
            {status}
          </span>
        );
    }
  };

  const formatCategory = (cat) => {
    return String(cat || "")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <Link to="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <span>/</span>
          <Link to="/profile" className="hover:text-blue-600 transition">
            My Account
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">Complaints</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              My Complaints & Support Tickets
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Track resolution progress, reply to support, or file a new ticket
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus size={16} />
            <span>Raise a Complaint</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          {/* Status Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setSelectedStatus(item.value);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedStatus === item.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative min-w-64">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by ticket ID or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 pl-9 pr-4 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-600 transition"
            />
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6"
              >
                <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
                <div className="h-3 w-3/4 bg-gray-100 dark:bg-gray-800/60 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800/60 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900/40 p-6 text-center">
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-2">
              Failed to load complaints
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => fetchComplaints(currentPage)}
              className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && complaints.length === 0 && (
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 mb-4">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              No complaints found
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              {search || selectedStatus
                ? "No complaints match your current filter criteria."
                : "You don't have any complaints or support tickets at the moment."}
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              <Plus size={14} />
              <span>Raise a Complaint</span>
            </button>
          </div>
        )}

        {/* Complaints Cards List */}
        {!loading && !error && complaints.length > 0 && (
          <div className="space-y-4">
            {complaints.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/my-complaints/${item._id}`)}
                className="group relative rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/60 cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                      #{item.ticketId}
                    </span>
                    {getStatusBadge(item.status)}
                    <span className="rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-300">
                      {formatCategory(item.category)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={13} />
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition mb-1">
                  {item.subject}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800/60 text-xs">
                  <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-[11px]">
                    {item.orderNumber && (
                      <span className="flex items-center gap-1">
                        <Package size={12} className="text-gray-400" />
                        Order: #{item.orderNumber}
                      </span>
                    )}
                    {item.productName && (
                      <span className="truncate max-w-44 hidden sm:inline">
                        Product: {item.productName}
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                    <span>View Conversation</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination?.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <PageButtons
              page={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      <RaiseComplaintModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          fetchComplaints(1);
        }}
      />
    </div>
  );
}

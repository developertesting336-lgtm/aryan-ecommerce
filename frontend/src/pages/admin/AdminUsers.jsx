import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAdminUsers } from "../../redux/slices/adminSlice";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    stats = {},
    users = [],
    loading,
    error,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(
      getAdminUsers({
        page: currentPage,
        limit: 4,
      })
    );
  }, [dispatch, currentPage]);

  const userList = users || [];

  const filteredUsers = userList.filter((user) => {
    const searchTerm = search.toLowerCase();

    const firstName = user.firstName?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";

    const matchesSearch =
      firstName.includes(searchTerm) ||
      email.includes(searchTerm);

    const matchesStatus =
      status === "All" ||
      user.status?.toLowerCase() === status.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-(--admin-bg) text-(--admin-text)">
      <main className="mx-auto w-full max-w-375 p-4 sm:p-5 lg:p-6 xl:p-7">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-(--admin-text) sm:text-2xl">
              Customers
            </h1>

            <p className="mt-1 text-xs text-(--admin-text-muted) sm:text-sm">
              Manage your ecommerce customers
            </p>
          </div>

          <button
            onClick={() => navigate("/create-customer")}
            className="
              rounded-lg
              border border-(--admin-primary)
              bg-(--admin-primary)
              px-4 py-2.5
              text-xs font-semibold
              text-white
              shadow-sm
              transition-all duration-200
              hover:bg-(--admin-primary-hover)
              hover:shadow-md
              focus:outline-none
              focus:ring-2
              focus:ring-(--admin-primary)
              focus:ring-offset-2
            "
          >
            + Add Customer
          </button>
        </div>

        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <UserStat
            title="Total Customers"
            value={stats.totalUsers}
            icon="👥"
            color="purple"
          />

          <UserStat
            title="Active Customers"
            value={stats.activeUsers}
            icon="🟢"
            color="green"
          />

          <UserStat
            title="Blocked Customers"
            value={stats.blockedUsers}
            icon="🚫"
            color="red"
          />

          <UserStat
            title="Total Revenue"
            value={`₹${Number(stats.Revenue || 0).toLocaleString("en-IN")}`}
            icon="💰"
            color="blue"
          />
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

          {/* =====================================================
              TOOLBAR
          ===================================================== */}

          <div
            className="
              flex flex-col gap-4
              border-b border-(--admin-border)
              p-5
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div>
              <h2 className="text-sm font-bold text-(--admin-text)">
                All Customers
              </h2>

              <p className="mt-1 text-[11px] text-(--admin-text-muted)">
                {filteredUsers.length} customers found
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              {/* Search */}
              <div
                className="
                  flex h-10 w-full
                  items-center gap-2
                  rounded-lg
                  border border-(--admin-control-border)
                  bg-(--admin-control-bg)
                  px-3
                  transition
                  focus-within:border-(--admin-primary)
                  focus-within:ring-2
                  focus-within:ring-[color-mix(in_srgb,var(--admin-primary)_12%,transparent)]
                  sm:w-64
                "
              >
                <span className="text-sm text-(--admin-text-muted)">
                  🔍
                </span>

                <input
                  type="text"
                  placeholder="Search customers..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="
                    w-full
                    bg-transparent
                    text-[11px]
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
                  text-[11px]
                  font-medium
                  text-(--admin-text-secondary)
                  outline-none
                  transition
                  focus:border-(--admin-primary)
                  focus:ring-2
                  focus:ring-[color-mix(in_srgb,var(--admin-primary)_12%,transparent)]
                "
              >
                <option value="All">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* =====================================================
              LOADING
          ===================================================== */}

          {loading && (
            <div
              className="
                flex items-center gap-3
                border-b border-(--admin-border)
                bg-[color-mix(in_srgb,var(--admin-primary)_5%,transparent)]
                px-5 py-4
                text-[11px]
                font-medium
                text-(--admin-primary)
              "
            >
              <span
                className="
                  h-4 w-4
                  animate-spin
                  rounded-full
                  border-2
                  border-[color-mix(in_srgb,var(--admin-primary)_25%,transparent)]
                  border-t-(--admin-primary)
                "
              />

              Loading customers...
            </div>
          )}

          {/* =====================================================
              ERROR
          ===================================================== */}

          {error && (
            <div
              className="
                m-5
                rounded-lg
                border
                border-red-200
                bg-red-50
                px-4 py-3
                text-[11px]
                font-medium
                text-red-600
                dark:border-red-900/50
                dark:bg-red-950/30
                dark:text-red-400
              "
            >
              {error}
            </div>
          )}

          {/* =====================================================
              TABLE
          ===================================================== */}

          {!loading && (
            <div
              className="
                w-full
                overflow-x-auto
                overscroll-x-contain
                scrollbar-thin
              "
            >
              <table className="w-full min-w-212.5">

                <thead>
                  <tr
                    className="
                      border-b border-(--admin-border)
                      bg-(--admin-surface-soft)
                    "
                  >
                    <th
                      className="
                        px-5 py-3.5
                        text-left
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-(--admin-text-muted)
                      "
                    >
                      Customer
                    </th>

                    <th
                      className="
                        px-5 py-3.5
                        text-left
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-(--admin-text-muted)
                      "
                    >
                      Phone
                    </th>

                    <th
                      className="
                        px-5 py-3.5
                        text-left
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-(--admin-text-muted)
                      "
                    >
                      Status
                    </th>

                    <th
                      className="
                        px-5 py-3.5
                        text-left
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-(--admin-text-muted)
                      "
                    >
                      Joined
                    </th>

                    <th
                      className="
                        px-5 py-3.5
                        text-right
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-(--admin-text-muted)
                      "
                    >
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="
                        group
                        border-b border-(--admin-border)
                        last:border-0
                        transition-colors duration-200
                        hover:bg-(--admin-surface-soft)
                      "
                    >

                      {/* Customer */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">

                          <div
                            className="
                              flex h-9 w-9
                              shrink-0
                              items-center justify-center
                              rounded-xl
                              bg-(--admin-stat-purple-icon)
                              text-[10px]
                              font-bold
                              text-(--admin-stat-purple-text)
                            "
                          >
                            {user.firstName
                              ?.charAt(0)
                              .toUpperCase() || "?"}
                          </div>

                          <div className="min-w-0">
                            <p
                              className="
                                truncate
                                text-[11px]
                                font-semibold
                                text-(--admin-text)
                              "
                            >
                              {user.firstName || "Unknown"}
                            </p>

                            <p
                              className="
                                mt-0.5
                                max-w-55
                                truncate
                                text-[10px]
                                text-(--admin-text-muted)
                              "
                            >
                              {user.email || "No email"}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-3.5">
                        <span
                          className="
                            whitespace-nowrap
                            text-[11px]
                            text-(--admin-text-secondary)
                          "
                        >
                          {user.phone || "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <UserStatus status={user.status} />
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-3.5">
                        <span
                          className="
                            whitespace-nowrap
                            text-[10px]
                            text-(--admin-text-muted)
                          "
                        >
                          {user.createdAt
                            ? new Date(
                                user.createdAt
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          title="More"
                          className="
                            rounded-lg
                            p-2
                            text-(--admin-text-muted)
                            transition-all duration-200
                            hover:bg-(--admin-surface-soft)
                            hover:text-(--admin-text)
                          "
                        >
                          ⋮
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* =====================================================
              EMPTY STATE
          ===================================================== */}

          {!loading && filteredUsers.length === 0 && (
            <div className="px-5 py-16 text-center">

              <div
                className="
                  mx-auto
                  flex h-12 w-12
                  items-center justify-center
                  rounded-xl
                  bg-(--admin-stat-purple-icon)
                  text-2xl
                "
              >
                👥
              </div>

              <h3 className="mt-3 text-sm font-semibold text-(--admin-text)">
                No customers found
              </h3>

              <p className="mt-1 text-[11px] text-(--admin-text-muted)">
                Try changing your search or filter.
              </p>

            </div>
          )}

          {/* =====================================================
              PAGINATION
          ===================================================== */}

          {!loading && filteredUsers.length > 0 && (
            <div
              className="
                flex flex-col gap-3
                border-t border-(--admin-border)
                p-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <p className="text-[10px] text-(--admin-text-muted)">
                Showing{" "}
                <span className="font-semibold text-(--admin-text-secondary)">
                  {filteredUsers.length}
                </span>{" "}
                customers
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
                    text-[10px]
                    font-medium
                    text-(--admin-text-secondary)
                    transition
                    hover:border-(--admin-primary)
                    hover:text-(--admin-primary)
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Previous
                </button>

                <button
                  className="
                    rounded-lg
                    bg-(--admin-primary)
                    px-3 py-2
                    text-[10px]
                    font-semibold
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
                    text-[10px]
                    font-medium
                    text-(--admin-text-secondary)
                    transition
                    hover:border-(--admin-primary)
                    hover:text-(--admin-primary)
                  "
                >
                  Next
                </button>

              </div>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}

/* =========================================================
   USER STAT
========================================================= */

function UserStat({
  title,
  value,
  icon,
  color = "purple",
}) {
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

    red: {
      bg: "bg-red-50 dark:bg-red-950/20",
      icon: "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400",
    },
  };

  const theme = colors[color] || colors.purple;

  return (
    <div
      className={`
        group
        relative
        overflow-hidden
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
            text-xl
            ${theme.icon}
            transition-transform duration-200
            group-hover:scale-105
          `}
        >
          {icon}
        </div>

        <span className="text-[10px] text-(--admin-text-muted)">
          This month
        </span>

      </div>

      <p className="mt-4 text-[11px] font-medium text-(--admin-text-secondary)">
        {title}
      </p>

      <h2 className="mt-1 text-[22px] font-bold tracking-tight text-(--admin-text)">
        {value ?? 0}
      </h2>
    </div>
  );
}

/* =========================================================
   USER STATUS
========================================================= */

function UserStatus({ status }) {
  const normalizedStatus =
    status?.toLowerCase();

  const styles = {
    active: `
      bg-emerald-50
      text-emerald-600
      ring-1 ring-emerald-100
      dark:bg-emerald-950/40
      dark:text-emerald-400
      dark:ring-emerald-900
    `,

    inactive: `
      bg-slate-100
      text-slate-500
      ring-1 ring-slate-200
      dark:bg-slate-800
      dark:text-slate-400
      dark:ring-slate-700
    `,

    blocked: `
      bg-red-50
      text-red-600
      ring-1 ring-red-100
      dark:bg-red-950/40
      dark:text-red-400
      dark:ring-red-900
    `,
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2.5 py-1
        text-[9px]
        font-bold
        ${styles[normalizedStatus] || `
          bg-(--admin-surface-soft)
          text-(--admin-text-muted)
          ring-1 ring-(--admin-border)
        `}
      `}
    >
      {status || "Unknown"}
    </span>
  );
}

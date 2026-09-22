import React from "react";
import { NavLink } from "react-router-dom";

export default function AdminSidebar({
  isOpen,
  setIsOpen,
}) {
  const menuItems = [
    {
      name: "Dashboard",
      icon: <DashboardIcon />,
      path: "/admin/dashboard",
    },
    {
      name: "Products",
      icon: <ProductsIcon />,
      path: "/admin/products",
    },
    {
      name: "Orders",
      icon: <OrdersIcon />,
      path: "/admin/orders",
    },
    {
      name: "Customers",
      icon: <CustomersIcon />,
      path: "/admin/users",
    },
    {
      name: "Categories",
      icon: <CategoryIcon />,
      path: "/admin/categories",
    },
    {
      name: "Coupon",
      icon: <CouponIcon />,
      path: "/admin/coupons",
    },
   
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="
            fixed inset-0 z-40
            bg-slate-900/20
            backdrop-blur-[1px]
            lg:hidden

            dark:bg-black/50
          "
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-64
          flex-col

          border-r border-slate-100
          bg-white
          text-slate-700

          shadow-[4px_0_20px_rgba(15,23,42,0.03)]

          transition-all duration-300

          dark:border-slate-800
          dark:bg-[#101716]
          dark:text-slate-300
          dark:shadow-[4px_0_25px_rgba(0,0,0,0.2)]

          lg:translate-x-0

          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* Logo */}
        <div
          className="
            flex h-19
            items-center
            border-b border-slate-100
            px-5

            dark:border-slate-800
          "
        >
          <div className="flex items-center gap-2.5">

            <div
              className="
                flex h-9 w-9
                items-center justify-center
                rounded-xl
                bg-[#08a653]
                text-sm font-bold
                text-white
                shadow-sm
              "
            >
              Go
            </div>

            <span
              className="
                text-[18px] font-bold
                tracking-tight
                text-slate-900

                dark:text-white
              "
            >
              Style
            </span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="
              ml-auto
              flex h-8 w-8
              items-center justify-center
              rounded-lg
              text-xl
              text-slate-400
              transition

              hover:bg-slate-50
              hover:text-slate-700

              dark:hover:bg-slate-800
              dark:hover:text-white

              lg:hidden
            "
          >
            ×
          </button>
        </div>

        {/* Main menu */}
        <div className="px-3 pt-6 overflow-y-auto">

          <p
            className="
              mb-3 px-3
              text-[10px] font-bold
              uppercase
              tracking-[0.12em]
              text-slate-400

              dark:text-slate-500
            "
          >
            Main Menu
          </p>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `
                    group flex items-center gap-3
                    rounded-lg
                    px-3 py-2.5
                    text-[13px] font-medium
                    transition-all duration-200

                    ${
                      isActive
                        ? "bg-[#079c4d] text-white shadow-sm"
                        : `
                          text-slate-500
                          hover:bg-[#f1faf5]
                          hover:text-[#079c4d]

                          dark:text-slate-400
                          dark:hover:bg-emerald-950/30
                          dark:hover:text-emerald-400
                        `
                    }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`
                        flex h-7 w-7
                        items-center justify-center
                        rounded-md

                        ${
                          isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-[#079c4d] dark:text-slate-500 dark:group-hover:text-emerald-400"
                        }
                      `}
                    >
                      {item.icon}
                    </span>

                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Settings */}
        <div className="px-3 pt-7">

          <p
            className="
              mb-3 px-3
              text-[10px] font-bold
              uppercase
              tracking-[0.12em]
              text-slate-400

              dark:text-slate-500
            "
          >
            Settings
          </p>

          <NavLink
            to="/admin/settings"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `
                group flex items-center gap-3
                rounded-lg
                px-3 py-2.5
                text-[13px] font-medium
                transition

                ${
                  isActive
                    ? "bg-[#079c4d] text-white"
                    : `
                      text-slate-500
                      hover:bg-[#f1faf5]
                      hover:text-[#079c4d]

                      dark:text-slate-400
                      dark:hover:bg-emerald-950/30
                      dark:hover:text-emerald-400
                    `
                }
              `
            }
          >
            <span
              className="
                flex h-7 w-7
                items-center justify-center
              "
            >
              <SettingsIcon />
            </span>

            <span>Settings</span>
          </NavLink>
        </div>

        {/* Bottom admin */}
        <div
          className="
            mt-auto
            border-t border-slate-100
            p-4

            dark:border-slate-800
          "
        >
          <div
            className="
              flex items-center gap-3
              rounded-xl
              bg-[#f7faf8]
              p-3

              dark:bg-slate-800/60
            "
          >
            <div
              className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-full
                bg-[#dff5e7]
                text-xs font-bold
                text-[#079c4d]

                dark:bg-emerald-950/60
                dark:text-emerald-400
              "
            >
              A
            </div>

            <div className="min-w-0">
              <p
                className="
                  truncate text-xs font-semibold
                  text-slate-800

                  dark:text-slate-200
                "
              >
                Admin User
              </p>

              <p
                className="
                  mt-0.5 text-[10px]
                  text-slate-400

                  dark:text-slate-500
                "
              >
                Administrator
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}


/* =========================================================
   ICONS
========================================================= */

function DashboardIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 7h16" />
      <path d="M6 7v13h12V7" />
      <path d="M8 4h8l2 3H6l2-3Z" />
      <path d="M9 11h6M9 15h4" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 7h16v13H4z" />
      <path d="M8 7V5h8v2" />
      <path d="M8 12h8M8 16h5" />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 14c2.5 0 5 2 5 6" />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 6h16v12H4z" />
      <path d="M8 10h8M8 14h5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.4v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L6 17l.1-.1A1.7 1.7 0 0 0 6.4 15a1.7 1.7 0 0 0-1.5-1H4.7v-2.4h.2a1.7 1.7 0 0 0 1.5-1A1.7 1.7 0 0 0 6.1 8.7L6 8.6l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h2.4v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}

function CouponIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v3a2 2 0 0 0 0 4v3a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 15.5v-3a2 2 0 0 0 0-4v-3Z" />
      <path d="M12 6v2" />
      <path d="M12 10v2" />
      <path d="M12 14v2" />
    </svg>
  );
}
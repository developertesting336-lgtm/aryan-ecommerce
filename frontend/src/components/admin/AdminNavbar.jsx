import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AdminNavbar({ setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  // =========================================================
  // THEME
  // =========================================================

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("admin-theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("admin-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("admin-theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  // =========================================================
  // PAGE TITLE
  // =========================================================

  const getPageTitle = () => {
    const path = location.pathname;

    if (path.includes("/dashboard")) {
      return "Dashboard";
    }

    if (path.includes("/users")) {
      return "Users";
    }

    if (path.includes("/orders")) {
      return "Orders";
    }

    if (path.includes("/products")) {
      return "Products";
    }

    if (path.includes("/categories")) {
      return "Categories";
    }

    if (path.includes("/coupons")) {
      return "Coupons";
    }

    return "Admin Panel";
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) return;

    console.log("Searching:", search);

    // Later:
    // products search
    // users search
    // orders search
  };

  const userInitial =
    user?.firstName?.charAt(0)?.toUpperCase() || "A";

  return (
    <header
      className="
        sticky top-0 z-30
        border-b border-(--admin-border)
        bg-[color-mix(in_srgb,var(--admin-surface)_94%,transparent)]
        backdrop-blur-xl
      "
    >
      {/* =====================================================
          MAIN NAVBAR
      ===================================================== */}

      <div className="flex h-18 items-center justify-between gap-4 px-4 sm:px-6 lg:px-7">

        {/* ===================================================
            LEFT
        =================================================== */}

        <div className="flex min-w-0 items-center gap-3">

          {/* Mobile Menu */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
            className="
              flex h-10 w-10 shrink-0 items-center justify-center
              rounded-xl
              border border-(--admin-control-border)
              bg-(--admin-control-bg)
              text-(--admin-text-secondary)
              transition
              hover:border-[color-mix(in_srgb,var(--admin-primary)_30%,transparent)]
              hover:bg-[color-mix(in_srgb,var(--admin-primary)_10%,transparent)]
              hover:text-(--admin-primary)
              lg:hidden
            "
          >
            <MenuIcon />
          </button>

          {/* Page Title */}
          <div className="min-w-0">

            <p
              className="
                hidden
                text-[10px]
                font-medium
                uppercase
                tracking-[0.16em]
                text-(--admin-text-muted)
                sm:block
              "
            >
              Admin Panel
            </p>

            <h1
              className="
                truncate
                text-lg
                font-bold
                tracking-tight
                text-(--admin-text)
                sm:text-xl
              "
            >
              {getPageTitle()}
            </h1>

          </div>
        </div>

        {/* ===================================================
            SEARCH
        =================================================== */}

        <form
          onSubmit={handleSearch}
          className="hidden flex-1 md:block md:max-w-md lg:max-w-xl"
        >
          <div className="group relative">

            {/* Search Icon */}
            <div
              className="
                pointer-events-none
                absolute left-3.5 top-1/2
                flex -translate-y-1/2
                items-center justify-center
                text-(--admin-text-muted)
                transition
                group-focus-within:text-(--admin-primary)
              "
            >
              <SearchIcon />
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, orders, users..."
              className="
                h-11 w-full
                rounded-xl
                border border-(--admin-control-border)
                bg-(--admin-control-bg)
                pl-11 pr-16
                text-sm
                text-(--admin-text)
                outline-none
                transition-all
                placeholder:text-(--admin-text-muted)
                hover:border-[color-mix(in_srgb,var(--admin-primary)_25%,var(--admin-control-border))]
                focus:border-[color-mix(in_srgb,var(--admin-primary)_50%,transparent)]
                focus:bg-(--admin-surface)
                focus:ring-4
                focus:ring-[color-mix(in_srgb,var(--admin-primary)_10%,transparent)]
              "
            />

            {/* Shortcut */}
            <div
              className="
                absolute right-3 top-1/2
                hidden -translate-y-1/2
                items-center gap-1
                lg:flex
              "
            >
              <kbd
                className="
                  rounded-md
                  border border-(--admin-control-border)
                  bg-(--admin-surface)
                  px-1.5 py-0.5
                  text-[9px]
                  font-medium
                  text-(--admin-text-muted)
                  shadow-sm
                "
              >
                Ctrl
              </kbd>

              <kbd
                className="
                  rounded-md
                  border border-(--admin-control-border)
                  bg-(--admin-surface)
                  px-1.5 py-0.5
                  text-[9px]
                  font-medium
                  text-(--admin-text-muted)
                  shadow-sm
                "
              >
                K
              </kbd>
            </div>

          </div>
        </form>

        {/* ===================================================
            RIGHT
        =================================================== */}

        <div className="flex shrink-0 items-center gap-2">

          {/* Mobile Search */}
          <button
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              border border-(--admin-control-border)
              bg-(--admin-control-bg)
              text-(--admin-text-secondary)
              transition
              hover:border-[color-mix(in_srgb,var(--admin-primary)_30%,transparent)]
              hover:bg-[color-mix(in_srgb,var(--admin-primary)_10%,transparent)]
              hover:text-(--admin-primary)
              md:hidden
            "
            title="Search"
          >
            <SearchIcon />
          </button>

          {/* =================================================
              THEME TOGGLE
          ================================================= */}

          <button
            onClick={toggleTheme}
            type="button"
            aria-label={
              darkMode
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            title={
              darkMode
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              border border-(--admin-control-border)
              bg-(--admin-control-bg)
              text-(--admin-text-secondary)
              transition-all duration-200
              hover:border-[color-mix(in_srgb,var(--admin-primary)_30%,transparent)]
              hover:bg-[color-mix(in_srgb,var(--admin-primary)_10%,transparent)]
              hover:text-(--admin-primary)
              active:scale-95
            "
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Divider */}
          <div
            className="
              mx-1 hidden h-8 w-px
              bg-(--admin-border)
              sm:block
            "
          />

          {/* =================================================
              PROFILE
          ================================================= */}

          <div className="relative">

            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="
                flex items-center gap-2
                rounded-xl
                border border-transparent
                p-1.5
                transition
                hover:border-(--admin-border)
                hover:bg-(--admin-surface-soft)
              "
            >

              {/* Avatar */}
              <div
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-xl
                  bg-(--admin-primary)
                  text-xs
                  font-bold
                  text-white
                  shadow-sm
                "
              >
                {userInitial}
              </div>

              {/* User Info */}
              <div className="hidden min-w-0 text-left lg:block">

                <p
                  className="
                    max-w-30
                    truncate
                    text-xs
                    font-semibold
                    text-(--admin-text)
                  "
                >
                  {user?.firstName || "Admin"}
                </p>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    text-(--admin-text-muted)
                  "
                >
                  Administrator
                </p>

              </div>

              {/* Arrow */}
              <span
                className="
                  hidden
                  text-(--admin-text-muted)
                  transition
                  lg:block
                "
              >
                <ChevronIcon open={profileOpen} />
              </span>

            </button>

            {/* =================================================
                PROFILE DROPDOWN
            ================================================= */}

            {profileOpen && (
              <div
                className="
                  absolute right-0 top-13
                  z-50
                  w-60
                  overflow-hidden
                  rounded-2xl
                  border border-(--admin-border)
                  bg-(--admin-surface)
                  shadow-[0_15px_45px_rgba(0,0,0,0.18)]
                "
              >

                {/* User Header */}
                <div
                  className="
                    border-b border-(--admin-border)
                    bg-(--admin-surface-soft)
                    px-4 py-4
                  "
                >

                  <div className="flex items-center gap-3">

                    <div
                      className="
                        flex h-10 w-10
                        shrink-0
                        items-center justify-center
                        rounded-xl
                        bg-(--admin-primary)
                        text-sm font-bold
                        text-white
                      "
                    >
                      {userInitial}
                    </div>

                    <div className="min-w-0">

                      <p
                        className="
                          truncate
                          text-sm
                          font-semibold
                          text-(--admin-text)
                        "
                      >
                        {user?.firstName || "Admin"}
                      </p>

                      <p
                        className="
                          mt-0.5
                          truncate
                          text-[11px]
                          text-(--admin-text-muted)
                        "
                      >
                        {user?.email || "admin@example.com"}
                      </p>

                    </div>

                  </div>

                </div>

                {/* Menu */}
                <div className="p-2">

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="
                      flex w-full
                      items-center gap-3
                      rounded-xl
                      px-3 py-2.5
                      text-left
                      text-xs font-medium
                      text-(--admin-text-secondary)
                      transition
                      hover:bg-[color-mix(in_srgb,var(--admin-primary)_10%,transparent)]
                      hover:text-(--admin-primary)
                    "
                  >
                    <span
                      className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-lg
                        bg-(--admin-surface-soft)
                        text-(--admin-text-secondary)
                      "
                    >
                      <UserIcon />
                    </span>

                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/admin/settings");
                    }}
                    className="
                      flex w-full
                      items-center gap-3
                      rounded-xl
                      px-3 py-2.5
                      text-left
                      text-xs font-medium
                      text-(--admin-text-secondary)
                      transition
                      hover:bg-[color-mix(in_srgb,var(--admin-primary)_10%,transparent)]
                      hover:text-(--admin-primary)
                    "
                  >
                    <span
                      className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-lg
                        bg-(--admin-surface-soft)
                        text-(--admin-text-secondary)
                      "
                    >
                      <SettingsIcon />
                    </span>

                    <span>Settings</span>
                  </button>

                  <div className="my-2 border-t border-(--admin-border)" />

                  <button
                    className="
                      flex w-full
                      items-center gap-3
                      rounded-xl
                      px-3 py-2.5
                      text-left
                      text-xs font-medium
                      text-(--admin-danger)
                      transition
                      hover:bg-[color-mix(in_srgb,var(--admin-danger)_10%,transparent)]
                    "
                  >
                    <span
                      className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-lg
                        bg-[color-mix(in_srgb,var(--admin-danger)_10%,transparent)]
                      "
                    >
                      <LogoutIcon />
                    </span>

                    <span>Logout</span>
                  </button>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          MOBILE SEARCH
      ===================================================== */}

      <div
        className="
          border-t border-(--admin-border)
          bg-(--admin-surface)
          px-4 py-3
          md:hidden
        "
      >

        <form onSubmit={handleSearch}>

          <div className="group relative">

            <div
              className="
                pointer-events-none
                absolute left-3.5 top-1/2
                -translate-y-1/2
                text-(--admin-text-muted)
                group-focus-within:text-(--admin-primary)
              "
            >
              <SearchIcon />
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, orders, users..."
              className="
                h-10 w-full
                rounded-xl
                border border-(--admin-control-border)
                bg-(--admin-control-bg)
                pl-11 pr-4
                text-sm
                text-(--admin-text)
                outline-none
                transition
                placeholder:text-(--admin-text-muted)
                focus:border-[color-mix(in_srgb,var(--admin-primary)_50%,transparent)]
                focus:bg-(--admin-surface)
                focus:ring-4
                focus:ring-[color-mix(in_srgb,var(--admin-primary)_10%,transparent)]
              "
            />

          </div>

        </form>

      </div>

    </header>
  );
}

/* =========================================================
   ICONS
========================================================= */

function MenuIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

/* =========================================================
   THEME ICONS
========================================================= */

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.7 6.7 0 0 0 21 12.8Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.5-4 3-6 7-6s6.5 2 7 6" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L8 17l.1-.1A1.7 1.7 0 0 0 8.4 15a1.7 1.7 0 0 0-1.6-1H6.7v-2.4h.1a1.7 1.7 0 0 0 1.6-1A1.7 1.7 0 0 0 8.1 8.7L8 8.6l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.1h2.4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1V14h-.1a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H9" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

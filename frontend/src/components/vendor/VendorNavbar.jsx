import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Store,
  Package,
  ShoppingCart,
  BarChart3,
} from "lucide-react";

export default function VendorNavbar({ setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] =
    useState(false);

  /* =====================================================
     PAGE TITLE
  ===================================================== */

  const getPageInfo = () => {
    const path = location.pathname;

    if (
      path === "/vendor" ||
      path === "/vendor/"
    ) {
      return {
        title: "Dashboard",
        subtitle: "Store overview",
      };
    }

    if (path.includes("/vendor/products")) {
      return {
        title: "Products",
        subtitle: "Manage your products",
      };
    }

    if (path.includes("/vendor/orders")) {
      return {
        title: "Orders",
        subtitle: "Manage customer orders",
      };
    }

    if (path.includes("/vendor/inventory")) {
      return {
        title: "Inventory",
        subtitle: "Monitor your stock",
      };
    }

    if (path.includes("/vendor/customers")) {
      return {
        title: "Customers",
        subtitle: "View your customers",
      };
    }

    if (path.includes("/vendor/analytics")) {
      return {
        title: "Analytics",
        subtitle: "Store performance",
      };
    }

    if (path.includes("/vendor/reviews")) {
      return {
        title: "Reviews",
        subtitle: "Customer feedback",
      };
    }

    if (path.includes("/vendor/payouts")) {
      return {
        title: "Payouts",
        subtitle: "Manage your earnings",
      };
    }

    if (path.includes("/vendor/settings")) {
      return {
        title: "Settings",
        subtitle: "Manage your store",
      };
    }

    if (path.includes("/vendor/help")) {
      return {
        title: "Help Center",
        subtitle: "Get help and support",
      };
    }

    if (path.includes("/create-product")) {
      return {
        title: "Add Product",
        subtitle: "Create a new product",
      };
    }

    return {
      title: "Vendor Panel",
      subtitle: "Manage your store",
    };
  };

  const pageInfo = getPageInfo();

  /* =====================================================
     USER INFO
  ===================================================== */

  const userName =
    user?.firstName ||
    user?.name ||
    "Vendor";

  const userEmail =
    user?.email ||
    "vendor@example.com";

  const userInitial =
    userName?.charAt(0)?.toUpperCase() || "V";

  /* =====================================================
     SEARCH
  ===================================================== */

  const handleSearch = (e) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) return;

    console.log("Vendor searching:", value);

    /*
      You can later connect this to your backend.

      Example:

      navigate(
        `/vendor/products?search=${encodeURIComponent(value)}`
      );
    */

    navigate(
      `/vendor/products?search=${encodeURIComponent(
        value
      )}`
    );
  };

  /* =====================================================
     CTRL + K SEARCH
  ===================================================== */

  useEffect(() => {
    const handleKeyboard = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();

        const input =
          document.getElementById(
            "vendor-search"
          );

        if (input) {
          input.focus();
        }
      }

      if (e.key === "Escape") {
        setProfileOpen(false);
        setMobileSearchOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyboard
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };
  }, []);

  /* =====================================================
     CLOSE PROFILE WHEN ROUTE CHANGES
  ===================================================== */

  useEffect(() => {
    setProfileOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    setProfileOpen(false);

    /*
      Replace this with your Redux logout action if
      you already have one.

      Example:

      dispatch(logout());
    */

    localStorage.removeItem("token");

    navigate("/login");
  };

  return (
    <header
      className="
        sticky
        top-0
        z-30
        border-b
        border-slate-100
        bg-white/95
        backdrop-blur-xl
      "
    >
      {/* =====================================================
          MAIN NAVBAR
      ===================================================== */}

      <div
        className="
          flex
          h-[72px]
          items-center
          justify-between
          gap-4
          px-4
          sm:px-6
          lg:px-7
        "
      >
        {/* ===================================================
            LEFT SECTION
        =================================================== */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          {/* Mobile Sidebar Button */}

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open vendor menu"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-slate-100
              bg-slate-50
              text-slate-600
              transition-all
              hover:border-blue-100
              hover:bg-blue-50
              hover:text-blue-600
              lg:hidden
            "
          >
            <Menu size={19} />
          </button>

          {/* Page Title */}

          <div className="min-w-0">
            <p
              className="
                hidden
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-slate-400
                sm:block
              "
            >
              Vendor Panel
            </p>

            <div className="flex items-center gap-2">
              <h1
                className="
                  truncate
                  text-lg
                  font-bold
                  tracking-tight
                  text-slate-900
                  sm:text-xl
                "
              >
                {pageInfo.title}
              </h1>

              {/* Small colorful indicator */}

              <span
                className="
                  hidden
                  h-2
                  w-2
                  rounded-full
                  bg-gradient-to-r
                  from-[#4779F5]
                  to-[#24B9E8]
                  sm:block
                "
              />
            </div>

            <p className="hidden text-[10px] text-slate-400 sm:block">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>

        {/* ===================================================
            DESKTOP SEARCH
        =================================================== */}

        <form
          onSubmit={handleSearch}
          className="
            hidden
            flex-1
            md:block
            md:max-w-md
            lg:max-w-xl
          "
        >
          <div className="group relative">
            {/* Search Icon */}

            <div
              className="
                pointer-events-none
                absolute
                left-3.5
                top-1/2
                flex
                -translate-y-1/2
                items-center
                justify-center
                text-slate-400
                transition
                group-focus-within:text-[#4779F5]
              "
            >
              <Search size={18} />
            </div>

            {/* Input */}

            <input
              id="vendor-search"
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search products, orders..."
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                pl-11
                pr-20
                text-sm
                text-slate-700
                outline-none
                transition-all
                placeholder:text-slate-400
                hover:border-slate-300
                focus:border-[#4779F5]
                focus:bg-white
                focus:ring-4
                focus:ring-blue-50
              "
            />

            {/* Shortcut */}

            <div
              className="
                absolute
                right-3
                top-1/2
                hidden
                -translate-y-1/2
                items-center
                gap-1
                lg:flex
              "
            >
              <kbd
                className="
                  rounded-md
                  border
                  border-slate-200
                  bg-white
                  px-1.5
                  py-0.5
                  text-[9px]
                  font-medium
                  text-slate-400
                  shadow-sm
                "
              >
                Ctrl
              </kbd>

              <kbd
                className="
                  rounded-md
                  border
                  border-slate-200
                  bg-white
                  px-1.5
                  py-0.5
                  text-[9px]
                  font-medium
                  text-slate-400
                  shadow-sm
                "
              >
                K
              </kbd>
            </div>
          </div>
        </form>

        {/* ===================================================
            RIGHT SECTION
        =================================================== */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
          "
        >
          {/* Mobile Search */}

          <button
            onClick={() =>
              setMobileSearchOpen(
                !mobileSearchOpen
              )
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-slate-100
              bg-slate-50
              text-slate-500
              transition
              hover:border-blue-100
              hover:bg-blue-50
              hover:text-[#4779F5]
              md:hidden
            "
            title="Search"
          >
            <Search size={18} />
          </button>

          {/* Notifications */}

          <button
            className="
              relative
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-slate-100
              bg-white
              text-slate-500
              transition
              hover:border-blue-100
              hover:bg-blue-50
              hover:text-[#4779F5]
            "
            title="Notifications"
          >
            <Bell size={18} />

            {/* Notification Dot */}

            <span
              className="
                absolute
                right-2
                top-2
                h-2
                w-2
                rounded-full
                bg-red-500
                ring-2
                ring-white
              "
            />
          </button>

          {/* Divider */}

          <div
            className="
              mx-1
              hidden
              h-8
              w-px
              bg-slate-100
              sm:block
            "
          />

          {/* =================================================
              PROFILE
          ================================================= */}

          <div className="relative">
            <button
              onClick={() =>
                setProfileOpen(!profileOpen)
              }
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-transparent
                p-1.5
                transition
                hover:border-slate-100
                hover:bg-slate-50
              "
            >
              {/* Avatar */}

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-gradient-to-br
                  from-[#4779F5]
                  to-[#24B9E8]
                  text-xs
                  font-bold
                  text-white
                  shadow-md
                  shadow-blue-100
                "
              >
                {userInitial}
              </div>

              {/* User Info */}

              <div
                className="
                  hidden
                  min-w-0
                  text-left
                  lg:block
                "
              >
                <p
                  className="
                    max-w-[130px]
                    truncate
                    text-xs
                    font-semibold
                    text-slate-800
                  "
                >
                  {userName}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Vendor
                </p>
              </div>

              {/* Chevron */}

              <ChevronDown
                size={15}
                className={`
                  hidden
                  text-slate-400
                  transition-transform
                  lg:block
                  ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>

            {/* =================================================
                PROFILE DROPDOWN
            ================================================= */}

            {profileOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-[54px]
                  z-50
                  w-64
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-100
                  bg-white
                  shadow-[0_15px_45px_rgba(15,23,42,0.12)]
                "
              >
                {/* Profile Header */}

                <div
                  className="
                    relative
                    overflow-hidden
                    border-b
                    border-slate-100
                    bg-gradient-to-br
                    from-blue-50
                    via-white
                    to-cyan-50
                    px-4
                    py-4
                  "
                >
                  {/* Decorative circle */}

                  <div
                    className="
                      absolute
                      -right-5
                      -top-8
                      h-20
                      w-20
                      rounded-full
                      bg-blue-100/60
                    "
                  />

                  <div className="relative flex items-center gap-3">
                    {/* Avatar */}

                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-gradient-to-br
                        from-[#4779F5]
                        to-[#24B9E8]
                        text-sm
                        font-bold
                        text-white
                        shadow-md
                        shadow-blue-100
                      "
                    >
                      {userInitial}
                    </div>

                    {/* User */}

                    <div className="min-w-0">
                      <p
                        className="
                          truncate
                          text-sm
                          font-bold
                          text-slate-800
                        "
                      >
                        {userName}
                      </p>

                      <p
                        className="
                          mt-0.5
                          truncate
                          text-[11px]
                          text-slate-400
                        "
                      >
                        {userEmail}
                      </p>

                      <span
                        className="
                          mt-1.5
                          inline-flex
                          items-center
                          rounded-full
                          bg-blue-100
                          px-2
                          py-0.5
                          text-[9px]
                          font-bold
                          text-[#4779F5]
                        "
                      >
                        Vendor Account
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dropdown Items */}

                <div className="p-2">
                  {/* Profile */}

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-xs
                      font-medium
                      text-slate-600
                      transition
                      hover:bg-blue-50
                      hover:text-[#4779F5]
                    "
                  >
                    <span
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-blue-50
                        text-[#4779F5]
                      "
                    >
                      <User size={16} />
                    </span>

                    <span>My Profile</span>
                  </button>

                  {/* Store */}

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate(
                        "/vendor/settings"
                      );
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-xs
                      font-medium
                      text-slate-600
                      transition
                      hover:bg-cyan-50
                      hover:text-[#24B9E8]
                    "
                  >
                    <span
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-cyan-50
                        text-[#24B9E8]
                      "
                    >
                      <Store size={16} />
                    </span>

                    <span>Store Settings</span>
                  </button>

                  {/* Products */}

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate(
                        "/vendor/products"
                      );
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-xs
                      font-medium
                      text-slate-600
                      transition
                      hover:bg-purple-50
                      hover:text-purple-600
                    "
                  >
                    <span
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-purple-50
                        text-purple-600
                      "
                    >
                      <Package size={16} />
                    </span>

                    <span>My Products</span>
                  </button>

                  {/* Orders */}

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate(
                        "/vendor/orders"
                      );
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-xs
                      font-medium
                      text-slate-600
                      transition
                      hover:bg-pink-50
                      hover:text-pink-600
                    "
                  >
                    <span
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-pink-50
                        text-pink-500
                      "
                    >
                      <ShoppingCart size={16} />
                    </span>

                    <span>My Orders</span>
                  </button>

                  {/* Analytics */}

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate(
                        "/vendor/analytics"
                      );
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-xs
                      font-medium
                      text-slate-600
                      transition
                      hover:bg-emerald-50
                      hover:text-emerald-600
                    "
                  >
                    <span
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-emerald-50
                        text-emerald-600
                      "
                    >
                      <BarChart3 size={16} />
                    </span>

                    <span>Analytics</span>
                  </button>

                  {/* Divider */}

                  <div className="my-2 border-t border-slate-100" />

                  {/* Settings */}

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate(
                        "/vendor/settings"
                      );
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-xs
                      font-medium
                      text-slate-600
                      transition
                      hover:bg-slate-50
                      hover:text-slate-800
                    "
                  >
                    <span
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-slate-50
                        text-slate-500
                      "
                    >
                      <Settings size={16} />
                    </span>

                    <span>Settings</span>
                  </button>

                  {/* Logout */}

                  <button
                    onClick={handleLogout}
                    className="
                      mt-1
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-xs
                      font-medium
                      text-red-500
                      transition
                      hover:bg-red-50
                    "
                  >
                    <span
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-red-50
                      "
                    >
                      <LogOut size={16} />
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

      {mobileSearchOpen && (
        <div
          className="
            border-t
            border-slate-100
            bg-white
            px-4
            py-3
            md:hidden
          "
        >
          <form onSubmit={handleSearch}>
            <div className="group relative">
              <div
                className="
                  pointer-events-none
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  group-focus-within:text-[#4779F5]
                "
              >
                <Search size={17} />
              </div>

              <input
                autoFocus
                id="vendor-mobile-search"
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search products, orders..."
                className="
                  h-10
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-11
                  pr-4
                  text-sm
                  text-slate-700
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-[#4779F5]
                  focus:bg-white
                  focus:ring-4
                  focus:ring-blue-50
                "
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}

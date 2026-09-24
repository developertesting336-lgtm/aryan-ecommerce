import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  ArrowRight,
  ChevronDown,
  Heart,
  LogIn,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

import { getProducts } from "../redux/slices/productSlice";
import {
  getCategoryChildren,
  getRootCategories,
} from "../redux/slices/categorySlice";

import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";

const navigation = [
  { label: "Home", to: "/", end: true },
  { label: "Shop", to: "/products", menu: true },
  { label: "Categories", to: "/categories", menu: true, badge: "NEW" },
  { label: "Products", to: "/products", menu: true },
  // { label: "Top Deals", to: "/products", menu: true }, 
];

const getCategoryId = (category) =>
  category?._id || category?.id;

const getCategoryName = (category) =>
  category?.name ||
  category?.title ||
  category?.categoryName ||
  "Category";

const getHeaderImage = (image) => {
  const path =
    typeof image === "string"
      ? image
      : image?.url ||
        image?.secure_url ||
        image?.preview;

  if (!path) return "/1786052049893.webp";

  if (/^(https?:|blob:)/i.test(path)) {
    return path;
  }

  const backendOrigin = new URL(
    import.meta.env.VITE_BACKEND_URL || window.location.origin
  ).origin;

  const cleanPath = path.replace(/^\/?uploads\/?/, "");

  return `${backendOrigin}/uploads/${cleanPath}`;
};

function CountBadge({ children }) {
  return (
    <span className="absolute -right-0.5 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-app-primary px-1 text-[9px] font-bold text-white ring-2 ring-white">
      {children}
    </span>
  );
}

function IconLink({ to, label, count, children }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="relative flex h-11 w-11 items-center justify-center text-gray-800 transition-colors hover:text-app-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary"
    >
      {children}

      {count > 0 && (
        <CountBadge>
          {count > 99 ? "99+" : count}
        </CountBadge>
      )}
    </Link>
  );
}

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menuRef = useRef(null);

  // Used to delay dropdown closing and cancel it
  // when the mouse enters the dropdown.
  const dropdownCloseTimer = useRef(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileSubmenu, setMobileSubmenu] = useState(null);
  const [search, setSearch] = useState("");

  const { user } = useSelector((state) => state.auth);

const couponBasePath =
  user?.role === "admin"
    ? "/admin/"
    : "/vendor/";

  const cartItems = useSelector(
    (state) => state.cart.cart?.items ?? []
  );

  const wishlistItems = useSelector(
    (state) =>
      state.wishlist.wishlist?.products ??
      state.wishlist.wishlist ??
      []
  );
console.log("lemghg",wishlistItems)
  const isLoggedIn = Boolean(user);

  const dashboardPath =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "vendor"
      ? "/vendor/dashboard"
      : "/profile";

  const displayName =
    user?.firstName ||
    user?.name ||
    user?.email?.split("@")[0];

  const products = useSelector((state) =>
    Array.isArray(state.product?.product)
      ? state.product.product
      : []
  );

  const productLoading = useSelector(
    (state) => state.product?.loading ?? false
  );

  const rootCategories = useSelector(
    (state) => state.category?.rootCategories ?? []
  );

  const categoryChildren = useSelector(
    (state) => state.category?.children ?? {}
  );

  const categoryLoading = useSelector(
    (state) => state.category?.loading ?? false
  );

  const featuredProducts = products.slice(0, 4);

  // --------------------------------------------------
  // Dropdown data loading
  // --------------------------------------------------

  useEffect(() => {
    if (!activeDropdown) return;

    if (!products.length && !productLoading) {
      dispatch(
        getProducts({
          page: 1,
          limit: 8,
        })
      );
    }

    if (!rootCategories.length && !categoryLoading) {
      dispatch(getRootCategories());
    }
  }, [
    activeDropdown,
    categoryLoading,
    dispatch,
    productLoading,
    products.length,
    rootCategories.length,
  ]);

  useEffect(() => {
    if (!activeDropdown || !rootCategories.length) {
      return;
    }

    rootCategories.forEach((category) => {
      const categoryId = getCategoryId(category);

      if (
        categoryId &&
        !Object.prototype.hasOwnProperty.call(
          categoryChildren,
          categoryId
        )
      ) {
        dispatch(getCategoryChildren(categoryId));
      }
    });
  }, [
    activeDropdown,
    categoryChildren,
    dispatch,
    rootCategories,
  ]);

  // --------------------------------------------------
  // Mobile menu outside click
  // --------------------------------------------------

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      closeOnOutsideClick
    );

    document.addEventListener(
      "keydown",
      closeOnEscape
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "mousedown",
        closeOnOutsideClick
      );

      document.removeEventListener(
        "keydown",
        closeOnEscape
      );

      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // --------------------------------------------------
  // Dropdown hover handling
  // --------------------------------------------------

  const clearDropdownTimer = () => {
    if (dropdownCloseTimer.current) {
      clearTimeout(dropdownCloseTimer.current);
      dropdownCloseTimer.current = null;
    }
  };

  const openDropdown = (label) => {
    clearDropdownTimer();
    setActiveDropdown(label);
  };

  const scheduleDropdownClose = () => {
    clearDropdownTimer();

    dropdownCloseTimer.current = setTimeout(() => {
      setActiveDropdown(null);
      dropdownCloseTimer.current = null;
    }, 250);
  };

  // Cleanup timer when component unmounts
  useEffect(() => {
    return () => {
      clearDropdownTimer();
    };
  }, []);

  // --------------------------------------------------
  // General actions
  // --------------------------------------------------

  const closeMenu = () => {
    clearDropdownTimer();

    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setMobileSubmenu(null);
  };

  const openSearch = (query) => {
    closeMenu();

    navigate(
      `/search?q=${encodeURIComponent(query)}`
    );
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const query = search.trim();

    if (!query) return;

    setSearch("");
    closeMenu();

    navigate(
      `/search?q=${encodeURIComponent(query)}`
    );
  };

  const handleLogout = () => {
    dispatch(logout());

    closeMenu();

    navigate("/");
  };

  return (
    <header
      ref={menuRef}
      className="sticky top-0 z-50 w-full bg-white text-gray-950 shadow-sm"
    >
      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <div className="bg-app-primary text-white">
        <div className="mx-auto flex min-h-[42px] max-w-[1440px] items-center justify-center px-4 text-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-xs font-medium sm:text-sm">
            Curated tech for everyday life{" "}
            <span className="mx-2 text-white/50">
              ·
            </span>{" "}
            Free delivery over ₹2,000{" "}
            <Link
              to="/products"
              className="ml-1 underline underline-offset-4 hover:text-blue-200"
            >
              Shop now
            </Link>
          </p>

          <div className="hidden items-center divide-x divide-white/20 text-sm md:flex">
            <Link
              to="/orders"
              className="px-5 transition hover:text-blue-200"
            >
              Order Tracking
            </Link>

            <Link
              to="/profile"
              className="px-5 transition hover:text-blue-200"
            >
              Help Center
            </Link>

       {  user?.role!=="user" &&  <button
              type="button"
              className="flex items-center gap-1 px-5 hover:text-blue-200"
              onClick={()=>navigate(`${couponBasePath}/`)}
            >
              Dashboard
              {/* <ChevronDown size={14} /> */}
            </button>}

            <button
              type="button"
              className="flex items-center gap-1 pl-5 hover:text-blue-200"
            >
              ₹ INR
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN HEADER
      ====================================================== */}

      <div className="mx-auto flex min-h-[84px] max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">

        {/* Mobile menu button */}

        <button
          type="button"
          aria-label={
            mobileMenuOpen
              ? "Close menu"
              : "Open menu"
          }
          aria-expanded={mobileMenuOpen}
          onClick={() =>
            setMobileMenuOpen(
              (open) => !open
            )
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center text-gray-800 hover:text-app-primary lg:hidden"
        >
          {mobileMenuOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>

        {/* Logo */}

        <Link
          to="/"
          onClick={closeMenu}
          aria-label="NovaCart home"
          className="flex shrink-0 items-center gap-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-app-primary text-lg font-black text-white">
            N
          </span>

          <span className="text-[21px] font-black tracking-[-0.05em] text-gray-950 sm:text-2xl">
            Nova
            <span className="text-app-primary">
              Cart
            </span>
          </span>
        </Link>

        {/* =================================================
            DESKTOP NAVIGATION + DROPDOWN
        ================================================== */}

        <div
          className="relative ml-auto hidden lg:flex xl:ml-16"
          onMouseEnter={clearDropdownTimer}
          onMouseLeave={scheduleDropdownClose}
        >
          <nav
            aria-label="Primary navigation"
            className="flex items-center justify-between gap-5 xl:gap-8"
          >
            {navigation.map((item) =>
              item.menu ? (
                <button
                  key={item.label}
                  type="button"
                  aria-expanded={
                    activeDropdown === item.label
                  }
                  onMouseEnter={() =>
                    openDropdown(item.label)
                  }
                  onFocus={() =>
                    openDropdown(item.label)
                  }
                  onClick={() =>
                    openDropdown(item.label)
                  }
                  className={`flex items-center gap-1 whitespace-nowrap py-3 text-[15px] font-medium xl:text-base ${
                    activeDropdown === item.label
                      ? "text-app-primary"
                      : "text-gray-900 hover:text-app-primary"
                  }`}
                >
                  {item.label}

                  {item.badge && (
                    <span className="rounded-sm bg-app-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                      {item.badge}
                    </span>
                  )}

                  <ChevronDown size={14} />
                </button>
              ) : (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-1 whitespace-nowrap py-3 text-[15px] font-medium xl:text-base ${
                      isActive
                        ? "text-app-primary"
                        : "text-gray-900 hover:text-app-primary"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}

            {/* =================================================
                DROPDOWN
            ================================================== */}

            {activeDropdown && (
              <div
                className="fixed left-4 right-4 top-[126px] z-50 w-auto overflow-hidden rounded-sm border border-gray-100 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.16)]"
                onMouseEnter={clearDropdownTimer}
                onMouseLeave={scheduleDropdownClose}
              >
                {/* PRODUCTS DROPDOWN */}

                {activeDropdown === "Products" ? (
                  <div className="grid grid-cols-5 bg-gray-50">

                    <div className="flex flex-col justify-center bg-white px-7 py-8">
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-app-primary">
                        New collection
                      </span>

                      <h3 className="mt-3 text-2xl font-semibold text-gray-950">
                        Find your next favorite
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        Explore useful tech and everyday
                        essentials picked for you.
                      </p>

                      <Link
                        to="/products"
                        onClick={closeMenu}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-app-primary"
                      >
                        Shop all products
                        <ArrowRight size={16} />
                      </Link>
                    </div>

                    <div className="col-span-4 grid grid-cols-4 gap-4 bg-gray-50 p-6">
                      {featuredProducts.map(
                        (product) => (
                          <Link
                            key={
                              product._id ||
                              product.id ||
                              product.name
                            }
                            to={`/product/${
                              product._id ||
                              product.id
                            }`}
                            onClick={closeMenu}
                            className="group rounded-md border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md"
                          >
                            <div className="flex h-36 items-center justify-center bg-white">
                              <img
                                src={getHeaderImage(
                                  product.images?.[0]
                                )}
                                alt={
                                  product.name ||
                                  "Product"
                                }
                                className="h-full w-full object-contain"
                              />
                            </div>

                            <p className="mt-3 line-clamp-2 min-h-10 text-sm font-medium leading-5 text-gray-900 group-hover:text-app-primary">
                              {product.name}
                            </p>

                            <p className="mt-2 font-semibold text-app-primary">
                              ₹
                              {Number(
                                product.price || 0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  /* CATEGORY / SHOP / DEALS DROPDOWN */

                  <div className="grid grid-cols-1 lg:grid-cols-2">

                    {/* Categories */}

                    <div className="px-7 py-7">
                      <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-950">
                          Shop by category
                        </h3>

                        <Link
                          to="/categories"
                          onClick={closeMenu}
                          className="text-sm font-medium text-app-primary hover:underline"
                        >
                          View all
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-5 xl:grid-cols-3">
                        {rootCategories
                          .slice(0, 9)
                          .map((category) => {
                            const id =
                              getCategoryId(
                                category
                              );

                            const children =
                              categoryChildren[
                                id
                              ] ||
                              category.children ||
                              category.subcategories ||
                              [];

                            return (
                              <div
                                key={
                                  id ||
                                  getCategoryName(
                                    category
                                  )
                                }
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    openSearch(
                                      getCategoryName(
                                        category
                                      )
                                    )
                                  }
                                  className="text-left text-sm font-semibold text-gray-900 hover:text-app-primary"
                                >
                                  {getCategoryName(
                                    category
                                  )}
                                </button>

                                <ul className="mt-2 space-y-1.5">
                                  {(
                                    Array.isArray(
                                      children
                                    )
                                      ? children
                                      : []
                                  )
                                    .slice(0, 4)
                                    .map(
                                      (child) => (
                                        <li
                                          key={
                                            getCategoryId(
                                              child
                                            ) ||
                                            getCategoryName(
                                              child
                                            )
                                          }
                                        >
                                          <button
                                            type="button"
                                            onClick={() =>
                                              openSearch(
                                                getCategoryName(
                                                  child
                                                )
                                              )
                                            }
                                            className="text-left text-sm text-gray-600 hover:text-app-primary"
                                          >
                                            {getCategoryName(
                                              child
                                            )}
                                          </button>
                                        </li>
                                      )
                                    )}
                                </ul>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Featured products */}

                    <div className="bg-gray-50 px-6 py-7">
                      <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-950">
                          {activeDropdown ===
                          "Top Deals"
                            ? "Featured deals"
                            : "Best selling"}
                        </h3>

                        <Link
                          to="/products"
                          onClick={closeMenu}
                          className="text-sm font-medium text-app-primary hover:underline"
                        >
                          Shop all
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                        {featuredProducts.map(
                          (product) => (
                            <Link
                              key={
                                product._id ||
                                product.id ||
                                product.name
                              }
                              to={`/product/${
                                product._id ||
                                product.id
                              }`}
                              onClick={closeMenu}
                              className="group flex min-h-[112px] items-center gap-4 rounded-md border border-gray-100 bg-white p-3 hover:border-blue-100"
                            >
                              <img
                                src={getHeaderImage(
                                  product.images?.[0]
                                )}
                                alt={
                                  product.name ||
                                  "Product"
                                }
                                className="h-20 w-24 shrink-0 object-contain"
                              />

                              <span className="min-w-0">
                                <span className="line-clamp-2 block text-sm leading-5 text-gray-900 group-hover:text-app-primary">
                                  {product.name}
                                </span>

                                <span className="mt-2 block font-semibold text-app-primary">
                                  ₹
                                  {Number(
                                    product.price ||
                                      0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </span>
                              </span>
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>

        {/* =================================================
            RIGHT SIDE ACTIONS
        ================================================== */}

        <div className="ml-auto flex shrink-0 items-center gap-0.5 lg:ml-auto lg:gap-1">

          {/* Desktop Search */}

          <form
            onSubmit={handleSearch}
            role="search"
            className="hidden xl:block"
          >
            <label className="relative block">
              <Search
                size={16}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search"
                aria-label="Search products"
                className="h-10 w-72 rounded-full border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none focus:border-app-primary focus:ring-2 focus:ring-app-primary/15"
              />
            </label>
          </form>

          {/* Account */}

          {isLoggedIn ? (
            <div className="group relative hidden sm:block">
              <Link
                to={"/profile"}
                aria-label={`Account: ${
                  displayName || "profile"
                }`}
                className="flex h-11 w-11 items-center justify-center text-gray-800 hover:text-app-primary"
              >
                <UserRound
                  size={23}
                  strokeWidth={1.7}
                />
              </Link>

              <div className="invisible absolute right-0 top-full z-10 w-44 rounded-lg border border-gray-100 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                <Link
                  to="/profile"
                  className="block rounded px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Profile
                </Link>

                <Link
                  to="/orders"
                  className="block rounded px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Orders
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              aria-label="Sign in"
              className="hidden h-11 w-11 items-center justify-center text-gray-800 hover:text-app-primary sm:flex"
            >
              <UserRound
                size={23}
                strokeWidth={1.7}
              />
            </Link>
          )}

          {/* Wishlist */}

          <IconLink
            to="/wishlist"
            label="Wishlist"
            count={wishlistItems.length}
          >
            <Heart
              size={23}
              strokeWidth={1.7}
            />
          </IconLink>

          {/* Cart */}

          <IconLink
            to="/cart"
            label="Shopping cart"
            count={cartItems.length}
          >
            <ShoppingBag
              size={23}
              strokeWidth={1.7}
            />
          </IconLink>

          <Link
            to="/cart"
            className="hidden min-w-[64px] flex-col text-xs leading-tight sm:flex"
          >
            <span className="font-medium">
              My Cart
            </span>

            <span className="mt-1 text-gray-500">
              {cartItems.length} item
              {cartItems.length === 1
                ? ""
                : "s"}
            </span>
          </Link>
        </div>
      </div>

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      <div
        className={`lg:hidden ${
          mobileMenuOpen
            ? "block"
            : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 top-[126px] -z-10 bg-gray-950/25"
          aria-hidden="true"
        />

        <div className="border-t border-gray-100 bg-white px-4 pb-6 pt-5 shadow-xl sm:px-6">

          {/* Mobile search */}

          <form
            onSubmit={handleSearch}
            role="search"
            className="mb-4"
          >
            <label className="relative block">
              <Search
                size={16}
                aria-hidden="true"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search products"
                aria-label="Search products"
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-app-primary"
              />
            </label>
          </form>

          <nav
            aria-label="Mobile navigation"
            className="grid gap-1"
          >
            {navigation.map((item) =>
              item.menu ? (
                <div key={item.label}>

                  <button
                    type="button"
                    aria-expanded={
                      mobileSubmenu ===
                      item.label
                    }
                    onClick={() =>
                      setMobileSubmenu(
                        (open) =>
                          open === item.label
                            ? null
                            : item.label
                      )
                    }
                    className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-base font-medium text-gray-800 hover:bg-gray-50"
                  >
                    {item.label}

                    <ChevronDown
                      size={16}
                      className={
                        mobileSubmenu ===
                        item.label
                          ? "rotate-180"
                          : ""
                      }
                    />
                  </button>

                  {mobileSubmenu ===
                    item.label && (
                    <div className="grid gap-1 pb-2 pl-3">
                      {rootCategories.map(
                        (category) => (
                          <button
                            key={
                              getCategoryId(
                                category
                              ) ||
                              getCategoryName(
                                category
                              )
                            }
                            type="button"
                            onClick={() =>
                              openSearch(
                                getCategoryName(
                                  category
                                )
                              )
                            }
                            className="rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-app-primary"
                          >
                            {getCategoryName(
                              category
                            )}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium ${
                      isActive
                        ? "bg-blue-50 text-app-primary"
                        : "text-gray-800 hover:bg-gray-50"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}

            {/* Mobile auth */}

            {isLoggedIn ? (
              <>
                <NavLink
                  to="/profile"
                  onClick={closeMenu}
                  className="flex items-center gap-2 rounded-lg px-3 py-3 font-medium text-gray-800"
                >
                  <UserRound size={17} />
                  Profile
                </NavLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-left font-medium text-red-600"
                >
                  <LogOut size={17} />
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-lg px-3 py-3 font-medium text-gray-800"
              >
                <LogIn size={17} />
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

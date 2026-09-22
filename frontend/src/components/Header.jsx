import {
  Menu,
  Search,
  Heart,
  ShoppingCart,
  User,
  Home,
  Package,
  Grid2X2,
  LayoutDashboard,
  X,
  ChevronRight,
  Smartphone,
  Shirt,
  Sofa,
  Sparkles,
  Laptop,
  Baby,
  Watch,
  Monitor,
  Headphones,
  Footprints,
  BookOpen,
} from "lucide-react";

import { useState } from "react";
import { useSelector } from "react-redux";

import {
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";

export default function Navbar() {
  // =========================================================
  // REDUX STATE
  // =========================================================

  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.auth);

  // =========================================================
  // ROUTER
  // =========================================================

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // =========================================================
  // LOCAL STATE
  // =========================================================

  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");

  // =========================================================
  // AUTH
  // =========================================================

  const isLoggedIn = !!user;

  // =========================================================
  // DASHBOARD ROUTE
  // =========================================================

  const dashboardPath =
    user?.role === "admin"
      ? "/admin/dashboard"
      : "/vendor/dashboard";

  // =========================================================
  // MAIN NAVIGATION
  // =========================================================

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: Home,
    },
    {
      name: "Products",
      path: "/products",
      icon: Package,
    },
  ];

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = [
    {
      name: "Electronics",
      slug: "electronics",
      icon: Monitor,
    },
    {
      name: "Mobiles",
      slug: "mobile-phones",
      icon: Smartphone,
    },
    {
      name: "Laptops",
      slug: "laptops",
      icon: Laptop,
    },
    {
      name: "Fashion",
      slug: "fashion",
      icon: Shirt,
    },
    {
      name: "Footwear",
      slug: "shoes",
      icon: Footprints,
    },
    {
      name: "Home",
      slug: "home",
      icon: Sofa,
    },
    {
      name: "Beauty",
      slug: "beauty",
      icon: Sparkles,
    },
    {
      name: "Kids",
      slug: "kids",
      icon: Baby,
    },
    {
      name: "Watches",
      slug: "watches",
      icon: Watch,
    },
    {
      name: "Audio",
      slug: "audio",
      icon: Headphones,
    },
    {
      name: "Books",
      slug: "books",
      icon: BookOpen,
    },
  ];

  // =========================================================
  // ACTIVE NAVIGATION
  // =========================================================

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  // =========================================================
  // ACTIVE CATEGORY
  // =========================================================

  const activeCategory = searchParams.get("category");

  const isCategoryActive = (slug) => {
    return (
      location.pathname === "/products" &&
      activeCategory === slug
    );
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const goTo = (path) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    navigate(path);

    setMobileMenu(false);
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (e) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) return;

    setSearch("");

    goTo(
      `/search?q=${encodeURIComponent(value)}`
    );
  };

  // =========================================================
  // CATEGORY NAVIGATION
  // =========================================================

  const goToCategory = (slug) => {
    goTo(`/search?q=${slug}`);
  };

  // =========================================================
  // MAIN APP NAV ITEM
  // =========================================================

  const AppNavItem = ({
    name,
    icon: Icon,
    active,
    onClick,
  }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`
          relative

          flex
          flex-col
          items-center
          justify-center

          h-[58px]
          min-w-[68px]

          px-2

          shrink-0

          cursor-pointer

          transition-colors
          duration-200

          ${
            active
              ? "text-blue-600"
              : "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          }
        `}
      >
        <Icon
          size={20}
          strokeWidth={active ? 2.4 : 1.9}
        />

        <span
          className={`
            mt-1

            text-[11px]
            leading-none

            whitespace-nowrap

            ${
              active
                ? "font-semibold"
                : "font-medium"
            }
          `}
        >
          {name}
        </span>

        {active && (
          <span
            className="
              absolute

              bottom-0
              left-1/2
              -translate-x-1/2

              h-[3px]
              w-6

              rounded-full

              bg-blue-600
            "
          />
        )}
      </button>
    );
  };

  // =========================================================
  // CATEGORY NAV ITEM
  // =========================================================

  const CategoryNavItem = ({
    category,
  }) => {
    const Icon = category.icon;

    const active = isCategoryActive(
      category.slug
    );

    return (
      <button
        type="button"
        onClick={() =>
          goToCategory(category.slug)
        }
        className={`
          relative

          flex
          flex-col
          items-center
          justify-center

          h-[58px]

          min-w-[78px]

          px-2

          shrink-0

          cursor-pointer

          transition-colors
          duration-200

          ${
            active
              ? "text-blue-600"
              : "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          }
        `}
      >
        <Icon
          size={19}
          strokeWidth={
            active ? 2.3 : 1.8
          }
        />

        <span
          className={`
            mt-1

            text-[10px]
            sm:text-[11px]

            leading-none

            whitespace-nowrap

            ${
              active
                ? "font-semibold"
                : "font-medium"
            }
          `}
        >
          {category.name}
        </span>

        {active && (
          <span
            className="
              absolute

              bottom-0
              left-1/2
              -translate-x-1/2

              h-[3px]
              w-5

              rounded-full

              bg-blue-600
            "
          />
        )}
      </button>
    );
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <>
      {/* =====================================================
          MAIN HEADER
      ===================================================== */}

      <header
        className="
          sticky
          top-0
          z-50

          w-full
          max-w-full

          bg-white/95
          backdrop-blur-xl

          border-b
          border-gray-100

          dark:bg-gray-900/95
          dark:border-gray-800
          dark:text-white
        "
      >
        {/* ===================================================
            TOP HEADER
        =================================================== */}

        <div
          className="
            w-full
            max-w-7xl
            mx-auto

            px-3
            sm:px-4
            lg:px-6
          "
        >
          <div
            className="
              min-h-[64px]
              sm:min-h-[68px]

              flex
              items-center

              gap-2
              sm:gap-3

              min-w-0
              max-w-full
            "
          >
            {/* =================================================
                MOBILE MENU
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                setMobileMenu(true)
              }
              aria-label="Open menu"
              className="
                lg:hidden

                h-10
                w-10

                shrink-0

                rounded-lg

                bg-gray-100
                text-gray-700

                flex
                items-center
                justify-center

                hover:bg-blue-50
                hover:text-blue-600

                dark:bg-gray-800
                dark:text-gray-200

                transition
                cursor-pointer
              "
            >
              <Menu size={21} />
            </button>

            {/* =================================================
                LOGO
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                goTo("/")
              }
              className="
                shrink-0
                cursor-pointer
              "
            >
              <div
                className="
                  text-xl
                  sm:text-2xl
                  lg:text-3xl

                  font-black
                  tracking-tight

                  whitespace-nowrap
                "
              >
                <span className="text-gray-900 dark:text-white">
                  E
                </span>

                <span className="text-blue-600">
                  comStore
                </span>
              </div>
            </button>

            {/* =================================================
                DESKTOP SEARCH
            ================================================= */}

            <div
              className="
                hidden
                md:block

                flex-1
                min-w-0

                max-w-2xl

                mx-2
                lg:mx-4
              "
            >
              <form
                onSubmit={handleSearch}
                className="relative group"
              >
                <Search
                  size={18}
                  className="
                    absolute

                    left-3.5
                    top-1/2
                    -translate-y-1/2

                    text-gray-400

                    group-focus-within:text-blue-600

                    transition
                  "
                />

                <input
                  type="text"
                  value={search}
                  placeholder="Search products, brands and more..."
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  className="
                    w-full

                    h-11

                    pl-10
                    pr-24

                    rounded-lg

                    border
                    border-gray-200

                    bg-gray-50

                    outline-none

                    focus:bg-white
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-50

                    transition-all

                    dark:border-gray-700
                    dark:bg-gray-800
                    dark:text-white
                    dark:placeholder:text-gray-500
                    dark:focus:bg-gray-900
    dark:focus:border-blue-400
                  "
                />

                <button
                  type="submit"
                  className="
                    absolute

                    right-1.5
                    top-1/2
                    -translate-y-1/2

                    h-8

                    px-4

                    rounded-md

                    bg-blue-600
                    text-white

                    text-xs
                    sm:text-sm

                    font-semibold

                    hover:bg-blue-700

                    transition

                    cursor-pointer
                  "
                >
                  Search
                </button>
              </form>
            </div>

            {/* =================================================
                RIGHT ACTIONS
            ================================================= */}

            <div
              className="
                flex
                items-center

                gap-1.5
                sm:gap-2

                ml-auto

                shrink-0
              "
            >
              {/* WISHLIST */}

              <button
                type="button"
                onClick={() =>
                  goTo("/wishlist")
                }
                aria-label="Wishlist"
                className="
                  relative

                  h-10
                  w-10
                  sm:h-11
                  sm:w-11

                  shrink-0

                  rounded-lg

                  border
                  border-gray-200

                  bg-white

                  flex
                  items-center
                  justify-center

                  hover:border-red-200
                  hover:bg-red-50
                  hover:text-red-500

                  dark:bg-gray-800
                  dark:border-gray-700

                  transition

                  cursor-pointer
                "
              >
                <Heart size={19} />

                {wishlist?.products
                  ?.length > 0 && (
                  <span
                    className="
                      absolute

                      -top-1
                      -right-1

                      min-w-5
                      h-5

                      px-1

                      rounded-full

                      bg-red-500
                      text-white

                      text-[10px]
                      font-bold

                      flex
                      items-center
                      justify-center

                      border-2
                      border-white

                      dark:border-gray-900
                    "
                  >
                    {
                      wishlist.products
                        .length
                    }
                  </span>
                )}
              </button>

              {/* CART */}

              <button
                type="button"
                onClick={() =>
                  goTo("/cart")
                }
                aria-label="Shopping cart"
                className="
                  relative

                  h-10
                  w-10
                  sm:h-11
                  sm:w-11

                  shrink-0

                  rounded-lg

                  border
                  border-gray-200

                  bg-white

                  flex
                  items-center
                  justify-center

                  hover:border-blue-200
                  hover:bg-blue-50
                  hover:text-blue-600

                  dark:bg-gray-800
                  dark:border-gray-700

                  transition

                  cursor-pointer
                "
              >
                <ShoppingCart
                  size={19}
                />

                {cart?.items
                  ?.length > 0 && (
                  <span
                    className="
                      absolute

                      -top-1
                      -right-1

                      min-w-5
                      h-5

                      px-1

                      rounded-full

                      bg-blue-600
                      text-white

                      text-[10px]
                      font-bold

                      flex
                      items-center
                      justify-center

                      border-2
                      border-white

                      dark:border-gray-900
                    "
                  >
                    {cart.items.length}
                  </span>
                )}
              </button>

              {/* DESKTOP ACCOUNT */}

              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() =>
                    goTo("/profile")
                  }
                  className="
                    hidden
                    sm:flex

                    items-center
                    gap-2

                    max-w-[180px]

                    px-2.5
                    py-2

                    rounded-lg

                    border
                    border-gray-200

                    bg-white

                    hover:border-blue-300
                    hover:bg-blue-50

                    dark:bg-gray-800
                    dark:border-gray-700

                    transition

                    cursor-pointer
                  "
                >
                  <div
                    className="
                      h-9
                      w-9

                      rounded-lg

                      bg-linear-to-br
                      from-blue-500
                      to-indigo-600

                      text-white

                      flex
                      items-center
                      justify-center

                      shrink-0
                    "
                  >
                    <User size={18} />
                  </div>

                  <div
                    className="
                      text-left
                      min-w-0
                    "
                  >
                    <p
                      className="
                        text-[10px]
                        text-gray-500
                        leading-none
                        mb-1
                      "
                    >
                      Welcome
                    </p>

                    <p
                      className="
                        text-sm
                        font-semibold

                        truncate

                        text-gray-900

                        dark:text-white
                      "
                    >
                      {user?.firstName ||
                        user?.name ||
                        "My Account"}
                    </p>
                  </div>

                  <ChevronRight
                    size={15}
                    className="
                      text-gray-400
                      shrink-0
                    "
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    goTo("/login")
                  }
                  className="
                    hidden
                    sm:flex

                    items-center
                    gap-2

                    px-3
                    lg:px-4
                    py-2.5

                    rounded-lg

                    bg-gray-900
                    text-white

                    text-sm
                    font-semibold

                    hover:bg-blue-600

                    transition

                    cursor-pointer

                    shrink-0
                  "
                >
                  <User size={18} />

                  <span>
                    Login
                  </span>
                </button>
              )}

              {/* MOBILE ACCOUNT */}

              <button
                type="button"
                onClick={() =>
                  goTo(
                    isLoggedIn
                      ? "/profile"
                      : "/login"
                  )
                }
                aria-label="Account"
                className="
                  sm:hidden

                  h-10
                  w-10

                  shrink-0

                  rounded-lg

                  bg-blue-50
                  text-blue-600

                  flex
                  items-center
                  justify-center

                  dark:bg-blue-950/40
                  dark:text-blue-400

                  cursor-pointer
                "
              >
                {isLoggedIn &&
                user?.firstName ? (
                  <span className="font-bold text-sm">
                    {user.firstName
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                ) : (
                  <User size={19} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================
            MOBILE SEARCH
        =================================================== */}

        <div
          className="
            md:hidden

            px-3
            sm:px-4

            pb-3
          "
        >
          <form
            onSubmit={handleSearch}
            className="relative"
          >
            <Search
              size={18}
              className="
                absolute

                left-3.5
                top-1/2
                -translate-y-1/2

                text-gray-400
              "
            />

                 <input
                  type="text"
                  value={search}
                  placeholder="Search products, brands and more..."
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  className="
                    w-full

                    h-11

                    pl-10
                    pr-24

                    rounded-lg

                    border
                    border-gray-200

                    bg-gray-50

                    outline-none

                    focus:bg-white
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-50

                    transition-all

                    dark:border-gray-700
                    dark:bg-gray-800
                    dark:text-white
                    dark:placeholder:text-gray-500
                    dark:focus:bg-gray-900
    dark:focus:border-blue-400
                  "
                />

            <button
              type="submit"
              aria-label="Search"
              className="
                absolute

                right-1.5
                top-1/2
                -translate-y-1/2

                h-8
                w-10

                rounded-md

                bg-blue-600
                text-white

                flex
                items-center
                justify-center

                cursor-pointer
              "
            >
              <Search size={17} />
            </button>
          </form>
        </div>

        {/* ===================================================
            DESKTOP / TABLET NAVBAR
            CATEGORIES ARE DIRECTLY VISIBLE
        =================================================== */}

        <div
          className="
            hidden
            md:block

            border-t
            border-gray-100
            dark:border-gray-800

            w-full
            max-w-full
            overflow-hidden
          "
        >
          <div
            className="
              w-full
              max-w-7xl
              mx-auto

              px-3
              sm:px-4
              lg:px-6
            "
          >
            <div
              className="
                flex
                items-center

                h-[60px]

                min-w-0
                max-w-full
              "
            >
              {/* =================================================
                  HOME + PRODUCTS
              ================================================= */}

              <div
                className="
                  flex
                  items-center

                  shrink-0
                "
              >
                {navItems.map(
                  (item) => (
                    <AppNavItem
                      key={item.name}
                      name={item.name}
                      icon={item.icon}
                      active={isActive(
                        item.path
                      )}
                      onClick={() =>
                        goTo(
                          item.path
                        )
                      }
                    />
                  )
                )}
              </div>

              {/* =================================================
                  DIVIDER
              ================================================= */}

              <div
                className="
                  h-8
                  w-px

                  mx-1

                  bg-gray-200
                  dark:bg-gray-700

                  shrink-0
                "
              />

              {/* =================================================
                  SCROLLABLE CATEGORIES
                  
                  IMPORTANT:
                  min-w-0 = prevents page width expansion
                  flex-1 = uses only remaining width
                  overflow-x-auto = categories scroll
              ================================================= */}

              <div
                className="
                  flex-1
                  min-w-0

                  overflow-x-auto
                  overflow-y-hidden

                  h-full

                  scroll-smooth

                  scrollbar-hide
                "
                style={{
                  scrollbarWidth:
                    "none",
                  msOverflowStyle:
                    "none",
                  WebkitOverflowScrolling:
                    "touch",
                }}
                onWheel={(e) => {
                  /*
                   * Desktop mouse-wheel support.
                   * Vertical wheel movement is converted
                   * into horizontal category scrolling.
                   */
                  if (
                    Math.abs(
                      e.deltaY
                    ) >
                    Math.abs(
                      e.deltaX
                    )
                  ) {
                    e.currentTarget.scrollLeft +=
                      e.deltaY;
                  }
                }}
              >
                <div
                  className="
                    flex
                    items-center

                    h-full

                    w-max

                    gap-0
                  "
                >
                  {categories.map(
                    (category) => (
                      <CategoryNavItem
                        key={
                          category.slug
                        }
                        category={
                          category
                        }
                      />
                    )
                  )}
                </div>
              </div>

              {/* =================================================
                  DASHBOARD
              ================================================= */}

              {(user?.role ===
                "admin" ||
                user?.role ===
                  "vendor") && (
                <>
                  <div
                    className="
                      h-8
                      w-px

                      mx-1

                      bg-gray-200
                      dark:bg-gray-700

                      shrink-0
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      goTo(
                        dashboardPath
                      )
                    }
                    className={`
                      relative

                      flex
                      flex-col
                      items-center
                      justify-center

                      h-[58px]

                      min-w-[76px]

                      px-2

                      shrink-0

                      cursor-pointer

                      transition-colors

                      ${
                        location.pathname.startsWith(
                          dashboardPath
                        )
                          ? "text-blue-600"
                          : "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                      }
                    `}
                  >
                    <LayoutDashboard 
                      size={20}
                      strokeWidth={
                        location.pathname.startsWith(
                          dashboardPath
                        )
                          ? 2.4
                          : 1.9
                      }
                    />

                    <span
                      className="
                        mt-1

                        text-[11px]

                        leading-none

                        font-medium

                        whitespace-nowrap
                      "
                    >
                      Dashboard
                    </span>

                    {location.pathname.startsWith(
                      dashboardPath
                    ) && (
                      <span
                        className="
                          absolute

                          bottom-0
                          left-1/2
                          -translate-x-1/2

                          h-[3px]
                          w-5

                          rounded-full

                          bg-blue-600
                        "
                      />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MOBILE SIDE MENU
      ===================================================== */}

      {mobileMenu && (
        <div
          className="
            fixed
            inset-0

            z-[100]

            lg:hidden
          "
        >
          {/* OVERLAY */}

          <div
            onClick={() =>
              setMobileMenu(false)
            }
            className="
              absolute
              inset-0

              bg-black/40
              backdrop-blur-sm
            "
          />

          {/* DRAWER */}

          <aside
            className="
              absolute

              left-0
              top-0
              bottom-0

              w-[min(320px,85vw)]

              bg-white

              shadow-2xl

              overflow-y-auto
              overscroll-contain

              dark:bg-gray-900
            "
          >
            {/* =================================================
                DRAWER HEADER
            ================================================= */}

            <div
              className="
                h-18

                px-4
                sm:px-5

                flex
                items-center
                justify-between

                border-b
                border-gray-100

                dark:border-gray-800
              "
            >
              <button
                type="button"
                onClick={() =>
                  goTo("/")
                }
                className="cursor-pointer"
              >
                <div className="text-2xl font-black">
                  <span className="text-gray-900 dark:text-white">
                    E
                  </span>

                  <span className="text-blue-600">
                    comStore
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setMobileMenu(
                    false
                  )
                }
                aria-label="Close menu"
                className="
                  h-9
                  w-9

                  rounded-lg

                  bg-gray-100
                  text-gray-600

                  flex
                  items-center
                  justify-center

                  hover:bg-gray-200

                  dark:bg-gray-800
                  dark:text-gray-300

                  transition

                  cursor-pointer
                "
              >
                <X size={19} />
              </button>
            </div>

            {/* =================================================
                DRAWER CONTENT
            ================================================= */}

            <div className="p-3 sm:p-4">
              {/* NAVIGATION */}

              <p
                className="
                  px-3
                  mb-2

                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider

                  text-gray-400
                "
              >
                Navigation
              </p>

              <div className="space-y-1">
                {navItems.map(
                  (item) => {
                    const Icon =
                      item.icon;

                    return (
                      <button
                        key={
                          item.name
                        }
                        type="button"
                        onClick={() =>
                          goTo(
                            item.path
                          )
                        }
                        className={`
                          w-full

                          flex
                          items-center
                          gap-3

                          px-4
                          py-3

                          rounded-xl

                          text-sm
                          font-semibold

                          transition

                          cursor-pointer

                          ${
                            isActive(
                              item.path
                            )
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                              : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                          }
                        `}
                      >
                        <Icon
                          size={19}
                        />

                        <span>
                          {
                            item.name
                          }
                        </span>

                        <ChevronRight
                          size={
                            16
                          }
                          className="ml-auto opacity-50"
                        />
                      </button>
                    );
                  }
                )}

                {/* Categories */}

                <button
                  type="button"
                  onClick={() =>
                    goTo(
                      "/categories"
                    )
                  }
                  className={`
                    w-full

                    flex
                    items-center
                    gap-3

                    px-4
                    py-3

                    rounded-xl

                    text-sm
                    font-semibold

                    transition

                    cursor-pointer

                    ${
                      location.pathname ===
                      "/categories"
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    }
                  `}
                >
                  <Grid2X2
                    size={19}
                  />

                  <span>
                    Categories
                  </span>

                  <ChevronRight
                    size={16}
                    className="ml-auto opacity-50"
                  />
                </button>
              </div>

              {/* =================================================
                  CATEGORY LIST
              ================================================= */}

              <div
                className="
                  my-5

                  border-t
                  border-gray-100

                  dark:border-gray-800
                "
              />

              <p
                className="
                  px-3
                  mb-2

                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider

                  text-gray-400
                "
              >
                Shop by Category
              </p>

              <div className="space-y-1">
                {categories.map(
                  (category) => {
                    const Icon =
                      category.icon;

                    const active =
                      isCategoryActive(
                        category.slug
                      );

                    return (
                      <button
                        key={
                          category.slug
                        }
                        type="button"
                        onClick={() =>
                          goToCategory(
                            category.slug
                          )
                        }
                        className={`
                          w-full

                          flex
                          items-center
                          gap-3

                          px-4
                          py-3

                          rounded-xl

                          text-sm
                          font-medium

                          transition

                          cursor-pointer

                          ${
                            active
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                              : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                          }
                        `}
                      >
                        <span
                          className="
                            h-9
                            w-9

                            rounded-lg

                            bg-gray-100

                            flex
                            items-center
                            justify-center

                            shrink-0

                            dark:bg-gray-800
                          "
                        >
                          <Icon
                            size={17}
                          />
                        </span>

                        <span>
                          {
                            category.name
                          }
                        </span>

                        <ChevronRight
                          size={
                            15
                          }
                          className="ml-auto opacity-40"
                        />
                      </button>
                    );
                  }
                )}
              </div>

              {/* =================================================
                  MANAGEMENT
              ================================================= */}

              {(user?.role ===
                "admin" ||
                user?.role ===
                  "vendor") && (
                <>
                  <div
                    className="
                      my-5

                      border-t
                      border-gray-100

                      dark:border-gray-800
                    "
                  />

                  <p
                    className="
                      px-3
                      mb-2

                      text-[11px]
                      font-bold
                      uppercase
                      tracking-wider

                      text-gray-400
                    "
                  >
                    Management
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      goTo(
                        dashboardPath
                      )
                    }
                    className="
                      w-full

                      flex
                      items-center
                      gap-3

                      px-4
                      py-3

                      rounded-xl

                      text-sm
                      font-semibold

                      text-gray-600

                      hover:bg-blue-50
                      hover:text-blue-600

                      dark:text-gray-300
                      dark:hover:bg-gray-800

                      transition

                      cursor-pointer
                    "
                  >
                    <span
                      className="
                        h-9
                        w-9

                        rounded-lg

                        bg-gray-100

                        flex
                        items-center
                        justify-center

                        dark:bg-gray-800
                      "
                    >
                      <LayoutDashboard
                        size={18}
                      />
                    </span>

                    <span>
                      Dashboard
                    </span>

                    <ChevronRight
                      size={16}
                      className="ml-auto opacity-50"
                    />
                  </button>
                </>
              )}

              {/* =================================================
                  SHOPPING
              ================================================= */}

              <div
                className="
                  my-5

                  border-t
                  border-gray-100

                  dark:border-gray-800
                "
              />

              <p
                className="
                  px-3
                  mb-2

                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider

                  text-gray-400
                "
              >
                Shopping
              </p>

              <div className="space-y-1">
                {/* WISHLIST */}

                <button
                  type="button"
                  onClick={() =>
                    goTo(
                      "/wishlist"
                    )
                  }
                  className="
                    w-full

                    flex
                    items-center
                    gap-3

                    px-4
                    py-3

                    rounded-xl

                    text-sm
                    font-semibold

                    text-gray-600

                    hover:bg-red-50
                    hover:text-red-500

                    dark:text-gray-300
                    dark:hover:bg-gray-800

                    transition

                    cursor-pointer
                  "
                >
                  <Heart size={19} />

                  <span>
                    Wishlist
                  </span>

                  {wishlist?.products
                    ?.length > 0 && (
                    <span
                      className="
                        ml-auto

                        min-w-6
                        h-6

                        px-1

                        rounded-full

                        bg-red-100
                        text-red-600

                        text-xs
                        font-bold

                        flex
                        items-center
                        justify-center
                      "
                    >
                      {
                        wishlist
                          .products
                          .length
                      }
                    </span>
                  )}
                </button>

                {/* CART */}

                <button
                  type="button"
                  onClick={() =>
                    goTo("/cart")
                  }
                  className="
                    w-full

                    flex
                    items-center
                    gap-3

                    px-4
                    py-3

                    rounded-xl

                    text-sm
                    font-semibold

                    text-gray-600

                    hover:bg-blue-50
                    hover:text-blue-600

                    dark:text-gray-300
                    dark:hover:bg-gray-800

                    transition

                    cursor-pointer
                  "
                >
                  <ShoppingCart
                    size={19}
                  />

                  <span>
                    Cart
                  </span>

                  {cart?.items
                    ?.length > 0 && (
                    <span
                      className="
                        ml-auto

                        min-w-6
                        h-6

                        px-1

                        rounded-full

                        bg-blue-100
                        text-blue-600

                        text-xs
                        font-bold

                        flex
                        items-center
                        justify-center
                      "
                    >
                      {
                        cart.items
                          .length
                      }
                    </span>
                  )}
                </button>

                {/* PROFILE / LOGIN */}

                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={() =>
                      goTo(
                        "/profile"
                      )
                    }
                    className="
                      w-full

                      flex
                      items-center
                      gap-3

                      px-4
                      py-3

                      rounded-xl

                      text-sm
                      font-semibold

                      text-gray-600

                      hover:bg-blue-50
                      hover:text-blue-600

                      dark:text-gray-300
                      dark:hover:bg-gray-800

                      transition

                      cursor-pointer
                    "
                  >
                    <div
                      className="
                        h-8
                        w-8

                        rounded-lg

                        bg-linear-to-br
                        from-blue-500
                        to-indigo-600

                        text-white

                        flex
                        items-center
                        justify-center

                        text-xs
                        font-bold
                      "
                    >
                      {user?.firstName
                        ?.charAt(0)
                        ?.toUpperCase() || (
                        <User
                          size={16}
                        />
                      )}
                    </div>

                    <div className="text-left min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {user?.firstName ||
                          "My Profile"}
                      </p>

                      <p className="text-[10px] text-gray-400">
                        View your account
                      </p>
                    </div>

                    <ChevronRight
                      size={16}
                      className="ml-auto opacity-50 shrink-0"
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      goTo("/login")
                    }
                    className="
                      w-full

                      flex
                      items-center
                      gap-3

                      px-4
                      py-3

                      rounded-xl

                      text-sm
                      font-semibold

                      text-gray-600

                      hover:bg-gray-50

                      dark:text-gray-300
                      dark:hover:bg-gray-800

                      transition

                      cursor-pointer
                    "
                  >
                    <User size={19} />

                    <span>
                      Login
                    </span>

                    <ChevronRight
                      size={16}
                      className="ml-auto opacity-50"
                    />
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION

          Only important items are shown here.
          Individual categories stay inside the menu.
      ===================================================== */}

      <nav
        className="
          md:hidden

          fixed
          left-0
          right-0
          bottom-0

          z-40

          w-full
          max-w-full

          bg-white/95
          backdrop-blur-xl

          border-t
          border-gray-200

          dark:bg-gray-900/95
          dark:border-gray-800

          pb-[env(safe-area-inset-bottom)]
        "
      >
        <div
          className="
            h-[64px]

            w-full

            flex
            items-center
            justify-around

            px-1
          "
        >
          {/* HOME */}

          <AppNavItem
            name="Home"
            icon={Home}
            active={isActive("/")}
            onClick={() =>
              goTo("/")
            }
          />

          {/* PRODUCTS */}

          <AppNavItem
            name="Products"
            icon={Package}
            active={isActive(
              "/products"
            )}
            onClick={() =>
              goTo("/products")
            }
          />

          {/* CATEGORIES */}

          <AppNavItem
            name="Categories"
            icon={Grid2X2}
            active={
              location.pathname ===
                "/categories" ||
              !!activeCategory
            }
            onClick={() =>
              goTo(
                "/categories"
              )
            }
          />

          {/* MENU */}

          <button
            type="button"
            onClick={() =>
              setMobileMenu(true)
            }
            className="
              flex
              flex-col
              items-center
              justify-center

              gap-1

              h-14
              min-w-[68px]

              px-2

              rounded-lg

              text-gray-600
              dark:text-gray-300

              hover:text-blue-600

              transition

              cursor-pointer
            "
          >
            <Menu size={20} />

            <span
              className="
                text-[11px]
                leading-none
                font-medium
              "
            >
              Menu
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}

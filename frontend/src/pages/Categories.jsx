import {
  ArrowRight,
  Search,
  Smartphone,
  Laptop,
  Tablet,
  Tv,
  Camera,
  Headphones,
  Watch,
  Keyboard,
  Gamepad2,
  Home,
  Cable,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Shirt,
  Dumbbell,
  Car,
  BookOpen,
  Heart,
  Package,
  Grid2X2,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Footer from "../components/Footer";

import {
  getRootCategories,
  getCategoryChildren,
} from "../redux/slices/categorySlice";


/* =========================================================
   CATEGORY ICON HELPER
========================================================= */

const getCategoryIcon = (name = "") => {
  const category = name.toLowerCase();

  if (
    category.includes("mobile") &&
    category.includes("accessor")
  ) {
    return Cable;
  }

  if (
    category.includes("mobile") ||
    category.includes("phone")
  ) {
    return Smartphone;
  }

  if (category.includes("laptop")) {
    return Laptop;
  }

  if (category.includes("tablet")) {
    return Tablet;
  }

  if (
    category.includes("television") ||
    category.includes("tv")
  ) {
    return Tv;
  }

  if (
    category.includes("camera") ||
    category.includes("photography")
  ) {
    return Camera;
  }

  if (
    category.includes("headphone") ||
    category.includes("earphone") ||
    category.includes("audio")
  ) {
    return Headphones;
  }

  if (
    category.includes("watch") ||
    category.includes("wearable")
  ) {
    return Watch;
  }

  if (
    category.includes("computer") ||
    category.includes("keyboard") ||
    category.includes("mouse")
  ) {
    return Keyboard;
  }

  if (
    category.includes("gaming") ||
    category.includes("game")
  ) {
    return Gamepad2;
  }

  if (
    category.includes("home") ||
    category.includes("appliance")
  ) {
    return Home;
  }

  if (
    category.includes("fashion") ||
    category.includes("clothing") ||
    category.includes("cloth")
  ) {
    return Shirt;
  }

  if (
    category.includes("sport") ||
    category.includes("fitness")
  ) {
    return Dumbbell;
  }

  if (
    category.includes("automotive") ||
    category.includes("car")
  ) {
    return Car;
  }

  if (
    category.includes("book")
  ) {
    return BookOpen;
  }

  if (
    category.includes("beauty")
  ) {
    return Sparkles;
  }

  if (
    category.includes("accessor")
  ) {
    return ShoppingBag;
  }

  if (
    category.includes("fashion")
  ) {
    return Shirt;
  }

  return Grid2X2;
};


/* =========================================================
   CATEGORY COLORS
========================================================= */

const categoryColors = [
  {
    gradient:
      "from-blue-600 via-blue-600 to-indigo-600",
    light:
      "bg-blue-50",
    text:
      "text-blue-600",
    hover:
      "group-hover:bg-blue-600",
    border:
      "group-hover:border-blue-600",
  },

  {
    gradient:
      "from-indigo-600 via-indigo-600 to-violet-600",
    light:
      "bg-indigo-50",
    text:
      "text-indigo-600",
    hover:
      "group-hover:bg-indigo-600",
    border:
      "group-hover:border-indigo-600",
  },

  {
    gradient:
      "from-violet-600 via-purple-600 to-fuchsia-600",
    light:
      "bg-violet-50",
    text:
      "text-violet-600",
    hover:
      "group-hover:bg-violet-600",
    border:
      "group-hover:border-violet-600",
  },

  {
    gradient:
      "from-cyan-500 via-blue-600 to-indigo-600",
    light:
      "bg-cyan-50",
    text:
      "text-cyan-600",
    hover:
      "group-hover:bg-cyan-600",
    border:
      "group-hover:border-cyan-600",
  },

  {
    gradient:
      "from-emerald-500 via-teal-600 to-cyan-600",
    light:
      "bg-emerald-50",
    text:
      "text-emerald-600",
    hover:
      "group-hover:bg-emerald-600",
    border:
      "group-hover:border-emerald-600",
  },

  {
    gradient:
      "from-orange-500 via-orange-500 to-red-500",
    light:
      "bg-orange-50",
    text:
      "text-orange-600",
    hover:
      "group-hover:bg-orange-600",
    border:
      "group-hover:border-orange-600",
  },
];


/* =========================================================
   HELPERS
========================================================= */

const getCategoryColor = (index) => {
  return categoryColors[index % categoryColors.length];
};


const getCategoryName = (category) => {
  return (
    category?.name ||
    category?.title ||
    category?.categoryName ||
    "Category"
  );
};


const getCategorySlug = (category) => {
  return (
    category?.slug ||
    category?.path ||
    category?.url ||
    ""
  );
};


const getCategoryId = (category) => {
  return (
    category?._id ||
    category?.id
  );
};


/* =========================================================
   LOADING SKELETON
========================================================= */

function CategorySkeleton() {
  return (
    <section
      className="
        overflow-hidden
        rounded-3xl
        border
        border-gray-200
        bg-white
        shadow-sm
      "
    >
      {/* Header */}

      <div
        className="
          h-[150px]
          bg-gradient-to-r
          from-gray-200
          via-gray-100
          to-gray-200
          animate-pulse
        "
      />

      {/* Cards */}

      <div className="p-4 sm:p-6">

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            gap-3
            sm:gap-4
          "
        >
          {Array.from({ length: 8 }).map(
            (_, index) => (
              <div
                key={index}
                className="
                  h-[105px]
                  rounded-2xl
                  bg-gray-100
                  animate-pulse
                "
              />
            )
          )}
        </div>

      </div>
    </section>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  search,
  onClear,
}) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-gray-200
        bg-white
        px-5
        py-16
        text-center
      "
    >

      <div
        className="
          mx-auto
          h-16
          w-16
          rounded-2xl
          bg-blue-50
          text-blue-600
          flex
          items-center
          justify-center
        "
      >
        <Search size={28} />
      </div>

      <h3
        className="
          mt-5
          text-lg
          font-bold
          text-gray-900
        "
      >
        No categories found
      </h3>

      <p
        className="
          mt-2
          text-sm
          text-gray-500
        "
      >
        We couldn't find anything matching
        {" "}
        "{search}".
      </p>

      <button
        onClick={onClear}
        className="
          mt-5
          rounded-xl
          bg-blue-600
          px-5
          py-2.5
          text-sm
          font-bold
          text-white
          hover:bg-blue-700
          transition
          cursor-pointer
        "
      >
        Clear Search
      </button>

    </div>
  );
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CategoriesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  /* =========================================================
     REDUX STATE
  ========================================================= */

  const {
    rootCategories,
    children,
    loading,
    error,
  } = useSelector((state) => state.category);


  /* =========================================================
     LOAD ROOT CATEGORIES
  ========================================================= */

  useEffect(() => {
    /*
     * Only fetch if we don't already have root categories.
     *
     * This prevents unnecessary API calls when the user
     * comes back to the page.
     */

    if (!rootCategories || rootCategories.length === 0) {
      dispatch(getRootCategories());
    }
  }, [dispatch, rootCategories]);


  /* =========================================================
     LOAD CHILDREN FOR EVERY ROOT CATEGORY
  ========================================================= */

  useEffect(() => {
    if (
      !rootCategories ||
      rootCategories.length === 0
    ) {
      return;
    }

    rootCategories.forEach((category) => {
      const categoryId =
        getCategoryId(category);

      if (!categoryId) {
        return;
      }

      /*
       * Don't request children again if they
       * already exist in Redux.
       */

      if (
        children &&
        Object.prototype.hasOwnProperty.call(
          children,
          categoryId
        )
      ) {
        return;
      }

      dispatch(
        getCategoryChildren(categoryId)
      );
    });

  }, [
    dispatch,
    rootCategories,
    children,
  ]);


  /* =========================================================
     SEARCH / FILTER
  ========================================================= */

  const filteredCategories = useMemo(() => {

    if (!search.trim()) {
      return rootCategories || [];
    }

    const query =
      search.toLowerCase().trim();

    return (rootCategories || [])
      .map((parent) => {

        const parentName =
          getCategoryName(parent);

        const parentDescription =
          parent.description ||
          parent.shortDescription ||
          "";

        const parentMatches =
          parentName
            .toLowerCase()
            .includes(query) ||
          parentDescription
            .toLowerCase()
            .includes(query);

        const parentId =
          getCategoryId(parent);

        const parentChildren =
          children?.[parentId] || [];

        const matchingChildren =
          parentChildren.filter(
            (child) => {

              const childName =
                getCategoryName(child);

              const childDescription =
                child.description ||
                child.shortDescription ||
                "";

              return (
                childName
                  .toLowerCase()
                  .includes(query) ||
                childDescription
                  .toLowerCase()
                  .includes(query)
              );
            }
          );

        /*
         * If the parent itself matches,
         * show all of its children.
         */

        if (parentMatches) {
          return parent;
        }

        /*
         * If only children match,
         * show only matching children.
         */

        if (
          matchingChildren.length > 0
        ) {
          return {
            ...parent,
            __filteredChildren:
              matchingChildren,
          };
        }

        return null;
      })
      .filter(Boolean);

  }, [
    rootCategories,
    children,
    search,
  ]);


  /* =========================================================
     TOTAL CHILDREN
  ========================================================= */

  const totalChildren =
    (rootCategories || []).reduce(
      (total, parent) => {

        const parentId =
          getCategoryId(parent);

        return (
          total +
          (
            children?.[parentId]
              ?.length || 0
          )
        );

      },
      0
    );


  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleCategoryClick = (
    category
  ) => {

    const slug =
      getCategorySlug(category);

    if (!slug) {
      return;
    }

    /*
     * If backend gives:
     *
     * /mobile-phones
     *
     * use it directly.
     */

    if (slug.startsWith("/")) {
      navigate(slug);
      return;
    }

    navigate(`/${slug}`);
  };


  const handleParentClick = (
    category
  ) => {

    const slug =
      getCategorySlug(category);

    if (!slug) {
      return;
    }

    /*
     * Parent categories don't necessarily
     * have their own frontend page.
     *
     * This sends the user to Products with
     * the category slug.
     */

    navigate(
      `/products?category=${encodeURIComponent(
        slug.replace("/", "")
      )}`
    );
  };


  /* =========================================================
     ERROR
  ========================================================= */

  if (
    error &&
    (!rootCategories ||
      rootCategories.length === 0)
  ) {
    return (
      <div className="min-h-screen bg-gray-50">

        <main className="pb-20 lg:pb-0">

          <section
            className="
              max-w-7xl
              mx-auto
              px-4
              sm:px-6
              lg:px-8
              py-16
            "
          >

            <div
              className="
                rounded-3xl
                border
                border-red-100
                bg-white
                px-5
                py-14
                text-center
              "
            >

              <div
                className="
                  mx-auto
                  h-14
                  w-14
                  rounded-2xl
                  bg-red-50
                  text-red-500
                  flex
                  items-center
                  justify-center
                "
              >
                <Package size={25} />
              </div>

              <h2
                className="
                  mt-5
                  text-xl
                  font-bold
                  text-gray-900
                "
              >
                Unable to load categories
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  text-gray-500
                "
              >
                {error}
              </p>

              <button
                onClick={() =>
                  dispatch(
                    getRootCategories()
                  )
                }
                className="
                  mt-5
                  rounded-xl
                  bg-blue-600
                  px-5
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  hover:bg-blue-700
                  transition
                  cursor-pointer
                "
              >
                Try Again
              </button>

            </div>

          </section>

        </main>

        {/* <Footer /> */}

      </div>
    );
  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="pb-20 lg:pb-0">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section
          className="
            relative
            overflow-hidden
          "
        >

          {/* Background */}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-[#0f2470]
              via-[#254edb]
              to-[#6d8cff]
            "
          />

          {/* Decorative circle */}

          <div
            className="
              absolute
              -right-24
              -top-28
              h-80
              w-80
              rounded-full
              bg-white/10
              blur-2xl
            "
          />

          <div
            className="
              absolute
              -left-24
              -bottom-32
              h-80
              w-80
              rounded-full
              bg-indigo-300/20
              blur-3xl
            "
          />

          {/* Dot pattern */}

          <div
            className="
              absolute
              inset-0
              opacity-[0.06]
              bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)]
              [background-size:24px_24px]
            "
          />

          <div
            className="
              relative
              max-w-7xl
              mx-auto
              px-4
              sm:px-6
              lg:px-8
            "
          >

            <div
              className="
                min-h-[310px]
                sm:min-h-[340px]
                flex
                items-center
                justify-center
                text-center
                py-14
              "
            >

              <div
                className="
                  w-full
                  max-w-3xl
                "
              >

                {/* Badge */}

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-white/20
                    bg-white/10
                    px-4
                    py-2
                    text-xs
                    sm:text-sm
                    font-semibold
                    text-blue-50
                    backdrop-blur-md
                  "
                >

                  <Sparkles size={15} />

                  Explore our collection

                </div>

                {/* Heading */}

                <h1
                  className="
                    mt-5
                    text-3xl
                    sm:text-4xl
                    lg:text-5xl
                    font-black
                    tracking-tight
                    text-white
                  "
                >
                  Shop by Category
                </h1>

                {/* Description */}

                <p
                  className="
                    mt-4
                    mx-auto
                    max-w-2xl
                    text-sm
                    sm:text-base
                    lg:text-lg
                    leading-relaxed
                    text-blue-100
                  "
                >
                  Explore our categories and
                  discover exactly what you're
                  looking for.
                </p>

                {/* Search */}

                <div
                  className="
                    relative
                    mt-7
                    max-w-xl
                    mx-auto
                  "
                >

                  <Search
                    size={19}
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search categories..."
                    className="
                      w-full
                      h-12
                      sm:h-14
                      rounded-2xl
                      border
                      border-white/20
                      bg-white
                      pl-11
                      pr-5
                      text-sm
                      sm:text-base
                      text-gray-900
                      placeholder:text-gray-400
                      outline-none
                      shadow-xl
                      focus:ring-4
                      focus:ring-white/20
                    "
                  />

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            CONTENT
        ===================================================== */}

        <section
          className="
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            py-8
            sm:py-10
          "
        >

          {/* ===================================================
              HEADER
          =================================================== */}

          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-end
              sm:justify-between
              gap-4
              mb-7
            "
          >

            <div>

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-widest
                  text-blue-600
                "
              >
                Browse collection
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  sm:text-2xl
                  font-black
                  text-gray-900
                "
              >
                Find what you need
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                Choose a category to explore
                products.
              </p>

            </div>

            {/* Count */}

            {!loading &&
              rootCategories?.length > 0 && (
                <div
                  className="
                    self-start
                    sm:self-auto
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-4
                    py-2.5
                    text-sm
                    text-gray-500
                  "
                >

                  <span
                    className="
                      font-bold
                      text-gray-900
                    "
                  >
                    {rootCategories.length}
                  </span>

                  Categories

                  <span className="text-gray-300">
                    •
                  </span>

                  <span
                    className="
                      font-bold
                      text-gray-900
                    "
                  >
                    {totalChildren}
                  </span>

                  Subcategories

                </div>
              )}

          </div>


          {/* ===================================================
              LOADING
          =================================================== */}

          {loading &&
            (!rootCategories ||
              rootCategories.length === 0) && (
              <div className="space-y-8">

                <CategorySkeleton />

                <CategorySkeleton />

              </div>
            )}


          {/* ===================================================
              EMPTY
          =================================================== */}

          {!loading &&
            rootCategories?.length === 0 && (
              <div
                className="
                  rounded-3xl
                  border
                  border-gray-200
                  bg-white
                  px-5
                  py-16
                  text-center
                "
              >

                <div
                  className="
                    mx-auto
                    h-16
                    w-16
                    rounded-2xl
                    bg-blue-50
                    text-blue-600
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Grid2X2 size={28} />
                </div>

                <h3
                  className="
                    mt-5
                    text-lg
                    font-bold
                    text-gray-900
                  "
                >
                  No categories available
                </h3>

                <p
                  className="
                    mt-2
                    text-sm
                    text-gray-500
                  "
                >
                  Categories will appear here
                  once they are added.
                </p>

              </div>
            )}


          {/* ===================================================
              SEARCH EMPTY
          =================================================== */}

          {!loading &&
            rootCategories?.length > 0 &&
            filteredCategories.length === 0 && (
              <EmptyState
                search={search}
                onClear={() =>
                  setSearch("")
                }
              />
            )}


          {/* ===================================================
              CATEGORY SECTIONS
          =================================================== */}

          {!(
            !loading &&
            rootCategories?.length > 0 &&
            filteredCategories.length === 0
          ) && (
            <div className="space-y-8">

              {filteredCategories.map(
                (parent, parentIndex) => {

                  const parentId =
                    getCategoryId(parent);

                  const allChildren =
                    children?.[parentId] || [];

                  /*
                   * If searching and this parent
                   * matched only through its children,
                   * use the filtered children.
                   */

                  const parentChildren =
                    parent.__filteredChildren ||
                    allChildren;

                  const ParentIcon =
                    getCategoryIcon(
                      getCategoryName(parent)
                    );

                  const color =
                    getCategoryColor(
                      parentIndex
                    );

                  return (
                    <section
                      key={parentId}
                      className="
                        overflow-hidden
                        rounded-3xl
                        border
                        border-gray-200
                        bg-white
                        shadow-sm
                      "
                    >

                      {/* =======================================
                          PARENT HEADER
                      ======================================= */}

                      <div
                        className={`
                          relative
                          overflow-hidden
                          bg-gradient-to-r
                          ${color.gradient}
                          px-5
                          py-6
                          sm:px-7
                          sm:py-7
                        `}
                      >

                        {/* Decorations */}

                        <div
                          className="
                            absolute
                            -right-12
                            -top-20
                            h-52
                            w-52
                            rounded-full
                            bg-white/10
                          "
                        />

                        <div
                          className="
                            absolute
                            right-24
                            bottom-[-80px]
                            h-44
                            w-44
                            rounded-full
                            bg-white/5
                          "
                        />

                        {/* Large background icon */}

                        <div
                          className="
                            absolute
                            right-8
                            top-1/2
                            -translate-y-1/2
                            hidden
                            sm:block
                            text-white/10
                          "
                        >
                          <ParentIcon
                            size={150}
                            strokeWidth={1}
                          />
                        </div>

                        <div
                          className="
                            relative
                            flex
                            flex-col
                            md:flex-row
                            md:items-center
                            md:justify-between
                            gap-5
                          "
                        >

                          {/* Parent info */}

                          <div
                            className="
                              flex
                              items-center
                              gap-4
                            "
                          >

                            <div
                              className="
                                h-14
                                w-14
                                sm:h-16
                                sm:w-16
                                shrink-0
                                rounded-2xl
                                border
                                border-white/20
                                bg-white/15
                                text-white
                                flex
                                items-center
                                justify-center
                                backdrop-blur-md
                              "
                            >
                              <ParentIcon
                                size={29}
                                strokeWidth={1.9}
                              />
                            </div>

                            <div>

                              <div
                                className="
                                  flex
                                  items-center
                                  gap-2
                                "
                              >

                                <h2
                                  className="
                                    text-2xl
                                    sm:text-3xl
                                    font-black
                                    text-white
                                  "
                                >
                                  {getCategoryName(
                                    parent
                                  )}
                                </h2>

                                <span
                                  className="
                                    hidden
                                    sm:inline-flex
                                    rounded-full
                                    bg-white/15
                                    px-2.5
                                    py-1
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-wider
                                    text-white/80
                                  "
                                >
                                  Category
                                </span>

                              </div>

                              <p
                                className="
                                  mt-1
                                  max-w-xl
                                  text-sm
                                  text-white/80
                                "
                              >
                                {parent.description ||
                                  parent.shortDescription ||
                                  `Explore our ${getCategoryName(
                                    parent
                                  )} collection.`}
                              </p>

                            </div>

                          </div>


                          {/* View all */}

                          <button
                            onClick={() =>
                              handleParentClick(
                                parent
                              )
                            }
                            className="
                              relative
                              inline-flex
                              items-center
                              justify-center
                              gap-2
                              rounded-xl
                              bg-white
                              px-4
                              py-2.5
                              text-sm
                              font-bold
                              text-blue-700
                              shadow-lg
                              hover:bg-blue-50
                              transition
                              cursor-pointer
                            "
                          >
                            View All
                            <ArrowRight
                              size={16}
                            />
                          </button>

                        </div>

                      </div>


                      {/* =======================================
                          CHILDREN
                      ======================================= */}

                      <div className="p-4 sm:p-6">

                        <div
                          className="
                            mb-5
                            flex
                            items-center
                            justify-between
                          "
                        >

                          <div>

                            <h3
                              className="
                                text-base
                                sm:text-lg
                                font-bold
                                text-gray-900
                              "
                            >
                              Explore{" "}
                              {getCategoryName(
                                parent
                              )}
                            </h3>

                            <p
                              className="
                                mt-0.5
                                text-xs
                                sm:text-sm
                                text-gray-400
                              "
                            >
                              Browse products by
                              subcategory
                            </p>

                          </div>

                          {parentChildren.length >
                            0 && (
                            <span
                              className="
                                text-xs
                                font-semibold
                                text-gray-400
                              "
                            >
                              {
                                parentChildren.length
                              }{" "}
                              options
                            </span>
                          )}

                        </div>


                        {/* Children loading */}

                        {loading &&
                          parentChildren.length ===
                            0 && (
                            <div
                              className="
                                grid
                                grid-cols-1
                                sm:grid-cols-2
                                lg:grid-cols-3
                                xl:grid-cols-4
                                gap-3
                                sm:gap-4
                              "
                            >

                              {Array.from({
                                length: 4,
                              }).map(
                                (_, index) => (
                                  <div
                                    key={index}
                                    className="
                                      h-[105px]
                                      rounded-2xl
                                      bg-gray-100
                                      animate-pulse
                                    "
                                  />
                                )
                              )}

                            </div>
                          )}


                        {/* No children */}

                        {!loading &&
                          parentChildren.length ===
                            0 && (
                            <div
                              className="
                                rounded-2xl
                                bg-gray-50
                                border
                                border-dashed
                                border-gray-200
                                py-10
                                text-center
                              "
                            >

                              <Package
                                size={25}
                                className="
                                  mx-auto
                                  text-gray-300
                                "
                              />

                              <p
                                className="
                                  mt-3
                                  text-sm
                                  text-gray-500
                                "
                              >
                                No subcategories
                                available.
                              </p>

                            </div>
                          )}


                        {/* Children grid */}

                        {parentChildren.length >
                          0 && (
                          <div
                            className="
                              grid
                              grid-cols-1
                              sm:grid-cols-2
                              lg:grid-cols-3
                              xl:grid-cols-4
                              gap-3
                              sm:gap-4
                            "
                          >

                            {parentChildren.map(
                              (
                                child
                              ) => {

                                const ChildIcon =
                                  getCategoryIcon(
                                    getCategoryName(
                                      child
                                    )
                                  );

                                return (
                                  <button
                                    key={getCategoryId(
                                      child
                                    )}
                                    onClick={() =>
                                      handleCategoryClick(
                                        child
                                      )
                                    }
                                    className="
                                      group
                                      relative
                                      overflow-hidden
                                      flex
                                      items-center
                                      gap-4
                                      rounded-2xl
                                      border
                                      border-gray-100
                                      bg-gray-50
                                      p-4
                                      text-left
                                      hover:border-blue-200
                                      hover:bg-blue-50/50
                                      hover:shadow-md
                                      hover:-translate-y-0.5
                                      transition-all
                                      duration-300
                                      cursor-pointer
                                    "
                                  >

                                    {/* Icon */}

                                    <div
                                      className="
                                        h-12
                                        w-12
                                        shrink-0
                                        rounded-xl
                                        bg-white
                                        border
                                        border-gray-100
                                        text-blue-600
                                        flex
                                        items-center
                                        justify-center
                                        shadow-sm
                                        group-hover:bg-blue-600
                                        group-hover:text-white
                                        group-hover:border-blue-600
                                        transition-all
                                        duration-300
                                      "
                                    >
                                      <ChildIcon
                                        size={22}
                                        strokeWidth={
                                          2
                                        }
                                      />
                                    </div>


                                    {/* Text */}

                                    <div
                                      className="
                                        min-w-0
                                        flex-1
                                      "
                                    >

                                      <h4
                                        className="
                                          text-sm
                                          font-bold
                                          text-gray-900
                                          group-hover:text-blue-600
                                          transition
                                        "
                                      >
                                        {getCategoryName(
                                          child
                                        )}
                                      </h4>

                                      <p
                                        className="
                                          mt-1
                                          text-[11px]
                                          leading-relaxed
                                          text-gray-400
                                          line-clamp-2
                                        "
                                      >
                                        {child.description ||
                                          child.shortDescription ||
                                          `Explore ${getCategoryName(
                                            child
                                          )} products.`}
                                      </p>

                                    </div>


                                    {/* Arrow */}

                                    <div
                                      className="
                                        h-8
                                        w-8
                                        shrink-0
                                        rounded-lg
                                        bg-white
                                        border
                                        border-gray-100
                                        text-gray-400
                                        flex
                                        items-center
                                        justify-center
                                        group-hover:bg-blue-600
                                        group-hover:text-white
                                        group-hover:border-blue-600
                                        transition-all
                                      "
                                    >
                                      <ChevronRight
                                        size={15}
                                      />
                                    </div>


                                    {/* Bottom accent */}

                                    <div
                                      className="
                                        absolute
                                        bottom-0
                                        left-0
                                        right-0
                                        h-0.5
                                        bg-gradient-to-r
                                        from-blue-500
                                        to-indigo-600
                                        scale-x-0
                                        origin-left
                                        group-hover:scale-x-100
                                        transition-transform
                                        duration-300
                                      "
                                    />

                                  </button>
                                );
                              }
                            )}

                          </div>
                        )}

                      </div>

                    </section>
                  );
                }
              )}

            </div>
          )}


          {/* ===================================================
              BOTTOM CTA
          =================================================== */}

          {!search &&
            !loading &&
            rootCategories?.length > 0 && (
              <div
                className="
                  relative
                  overflow-hidden
                  mt-8
                  rounded-3xl
                  bg-gray-900
                  px-6
                  py-8
                  sm:px-10
                  sm:py-10
                "
              >

                {/* Background */}

                <div
                  className="
                    absolute
                    -right-20
                    -top-24
                    h-64
                    w-64
                    rounded-full
                    bg-blue-600/20
                    blur-3xl
                  "
                />

                <div
                  className="
                    absolute
                    -left-20
                    -bottom-24
                    h-64
                    w-64
                    rounded-full
                    bg-indigo-600/20
                    blur-3xl
                  "
                />

                <div
                  className="
                    relative
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    md:justify-between
                    gap-6
                  "
                >

                  <div>

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-xs
                        font-bold
                        uppercase
                        tracking-widest
                        text-blue-400
                      "
                    >
                      <Sparkles size={14} />

                      Everything in one place
                    </div>

                    <h2
                      className="
                        mt-2
                        text-xl
                        sm:text-2xl
                        font-black
                        text-white
                      "
                    >
                      Looking for something else?
                    </h2>

                    <p
                      className="
                        mt-2
                        max-w-xl
                        text-sm
                        text-gray-400
                      "
                    >
                      Explore our complete product
                      collection and discover your
                      next favorite product.
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      navigate("/products")
                    }
                    className="
                      shrink-0
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-blue-600
                      px-5
                      py-3
                      text-sm
                      font-bold
                      text-white
                      hover:bg-blue-500
                      transition
                      cursor-pointer
                    "
                  >
                    View All Products

                    <ArrowRight size={17} />
                  </button>

                </div>

              </div>
            )}

        </section>

      </main>

      {/* <Footer /> */}

    </div>
  );
}




















// import {
//   ArrowRight,
//   Search,
//   Smartphone,
//   Laptop,
//   Headphones,
//   Watch,
//   Shirt,
//   ShoppingBag,
//   Home as HomeIcon,
//   Dumbbell,
//   Gamepad2,
//   Camera,
//   Sparkles,
//   Baby,
//   Car,
//   BookOpen,
//   ChevronRight,
// } from "lucide-react";

// import { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Footer from "../components/Footer";

// export default function CategoriesPage() {
//   const navigate = useNavigate();
//   const [search, setSearch] = useState("");

//   /*
//    * Replace these with the categories coming from your backend
//    * when your category API is ready.
//    */
//   const categories = [
//     {
//       id: 1,
//       name: "Electronics",
//       description: "Latest gadgets & technology",
//       count: 128,
//       icon: Smartphone,
//       color: "blue",
//       gradient: "from-blue-600 to-indigo-600",
//       light: "bg-blue-50",
//       text: "text-blue-600",
//     },
//     {
//       id: 2,
//       name: "Laptops",
//       description: "Powerful laptops for every need",
//       count: 76,
//       icon: Laptop,
//       color: "indigo",
//       gradient: "from-indigo-600 to-violet-600",
//       light: "bg-indigo-50",
//       text: "text-indigo-600",
//     },
//     {
//       id: 3,
//       name: "Audio",
//       description: "Headphones, speakers & more",
//       count: 94,
//       icon: Headphones,
//       color: "purple",
//       gradient: "from-purple-600 to-fuchsia-600",
//       light: "bg-purple-50",
//       text: "text-purple-600",
//     },
//     {
//       id: 4,
//       name: "Fashion",
//       description: "Trending styles for everyone",
//       count: 215,
//       icon: Shirt,
//       color: "pink",
//       gradient: "from-pink-500 to-rose-600",
//       light: "bg-pink-50",
//       text: "text-pink-600",
//     },
//     {
//       id: 5,
//       name: "Watches",
//       description: "Smart & classic watches",
//       count: 62,
//       icon: Watch,
//       color: "cyan",
//       gradient: "from-cyan-500 to-blue-600",
//       light: "bg-cyan-50",
//       text: "text-cyan-600",
//     },
//     {
//       id: 6,
//       name: "Home & Living",
//       description: "Make your home beautiful",
//       count: 143,
//       icon: HomeIcon,
//       color: "emerald",
//       gradient: "from-emerald-500 to-teal-600",
//       light: "bg-emerald-50",
//       text: "text-emerald-600",
//     },
//     {
//       id: 7,
//       name: "Sports",
//       description: "Everything for an active life",
//       count: 87,
//       icon: Dumbbell,
//       color: "orange",
//       gradient: "from-orange-500 to-red-500",
//       light: "bg-orange-50",
//       text: "text-orange-600",
//     },
//     {
//       id: 8,
//       name: "Gaming",
//       description: "Level up your gaming setup",
//       count: 71,
//       icon: Gamepad2,
//       color: "violet",
//       gradient: "from-violet-600 to-purple-700",
//       light: "bg-violet-50",
//       text: "text-violet-600",
//     },
//     {
//       id: 9,
//       name: "Cameras",
//       description: "Capture every special moment",
//       count: 48,
//       icon: Camera,
//       color: "slate",
//       gradient: "from-slate-600 to-gray-800",
//       light: "bg-slate-50",
//       text: "text-slate-600",
//     },
//     {
//       id: 10,
//       name: "Beauty",
//       description: "Beauty & personal care",
//       count: 119,
//       icon: Sparkles,
//       color: "rose",
//       gradient: "from-rose-500 to-pink-600",
//       light: "bg-rose-50",
//       text: "text-rose-600",
//     },
//     {
//       id: 11,
//       name: "Baby & Kids",
//       description: "Products for little ones",
//       count: 83,
//       icon: Baby,
//       color: "sky",
//       gradient: "from-sky-500 to-blue-600",
//       light: "bg-sky-50",
//       text: "text-sky-600",
//     },
//     {
//       id: 12,
//       name: "Automotive",
//       description: "Accessories for your ride",
//       count: 56,
//       icon: Car,
//       color: "red",
//       gradient: "from-red-500 to-orange-600",
//       light: "bg-red-50",
//       text: "text-red-600",
//     },
//     {
//       id: 13,
//       name: "Books",
//       description: "Explore books & knowledge",
//       count: 134,
//       icon: BookOpen,
//       color: "amber",
//       gradient: "from-amber-500 to-orange-600",
//       light: "bg-amber-50",
//       text: "text-amber-600",
//     },
//     {
//       id: 14,
//       name: "Accessories",
//       description: "Complete your everyday style",
//       count: 97,
//       icon: ShoppingBag,
//       color: "teal",
//       gradient: "from-teal-500 to-cyan-600",
//       light: "bg-teal-50",
//       text: "text-teal-600",
//     },
//   ];

//   const filteredCategories = useMemo(() => {
//     return categories.filter((category) =>
//       `${category.name} ${category.description}`
//         .toLowerCase()
//         .includes(search.toLowerCase())
//     );
//   }, [search]);

//   const handleCategory = (category) => {
//     /*
//      * Change this URL if your Products page uses
//      * a different filtering structure.
//      */
//     navigate(
//       `/products?category=${encodeURIComponent(
//         category.name.toLowerCase()
//       )}`
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">

//       <main className="pb-20 lg:pb-0">

//         {/* =====================================================
//             HERO / HEADER
//         ===================================================== */}
//         <section className="relative overflow-hidden">

//           {/* Background */}
//           <div
//             className="
//               absolute inset-0
//               bg-gradient-to-br
//               from-blue-700
//               via-blue-600
//               to-indigo-700
//             "
//           />

//           {/* Decorative circles */}
//           <div
//             className="
//               absolute -right-20 -top-24
//               h-72 w-72
//               rounded-full
//               bg-white/10
//               blur-2xl
//             "
//           />

//           <div
//             className="
//               absolute -left-24 bottom-[-100px]
//               h-80 w-80
//               rounded-full
//               bg-indigo-400/20
//               blur-3xl
//             "
//           />

//           <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//             <div
//               className="
//                 min-h-[300px]
//                 sm:min-h-[340px]
//                 flex items-center
//                 justify-center
//                 text-center
//                 py-14 sm:py-16
//               "
//             >
//               <div className="max-w-3xl">

//                 {/* Badge */}
//                 <div
//                   className="
//                     inline-flex items-center gap-2
//                     rounded-full
//                     bg-white/10
//                     border border-white/20
//                     px-4 py-2
//                     text-xs sm:text-sm
//                     font-semibold
//                     text-blue-50
//                     backdrop-blur-sm
//                   "
//                 >
//                   <Sparkles size={15} />
//                   Explore our collection
//                 </div>

//                 {/* Heading */}
//                 <h1
//                   className="
//                     mt-5
//                     text-3xl
//                     sm:text-4xl
//                     lg:text-5xl
//                     font-black
//                     tracking-tight
//                     text-white
//                   "
//                 >
//                   Shop by Category
//                 </h1>

//                 {/* Description */}
//                 <p
//                   className="
//                     mt-4
//                     mx-auto
//                     max-w-2xl
//                     text-sm
//                     sm:text-base
//                     lg:text-lg
//                     leading-relaxed
//                     text-blue-100
//                   "
//                 >
//                   Discover products you love, organized into categories
//                   to make your shopping experience faster and easier.
//                 </p>

//                 {/* Search */}
//                 <div className="relative mt-7 max-w-xl mx-auto">

//                   <Search
//                     size={19}
//                     className="
//                       absolute left-4 top-1/2
//                       -translate-y-1/2
//                       text-gray-400
//                     "
//                   />

//                   <input
//                     type="text"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     placeholder="Search categories..."
//                     className="
//                       w-full
//                       h-12 sm:h-14
//                       rounded-2xl
//                       border border-white/20
//                       bg-white
//                       pl-11
//                       pr-5
//                       text-sm sm:text-base
//                       text-gray-900
//                       placeholder:text-gray-400
//                       outline-none
//                       shadow-xl
//                       focus:ring-4
//                       focus:ring-white/20
//                     "
//                   />

//                 </div>

//               </div>
//             </div>
//           </div>
//         </section>

//         {/* =====================================================
//             CONTENT
//         ===================================================== */}
//         <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

//           {/* Top row */}
//           <div
//             className="
//               flex flex-col
//               sm:flex-row
//               sm:items-center
//               sm:justify-between
//               gap-4
//               mb-6
//             "
//           >

//             <div>
//               <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
//                 Categories
//               </p>

//               <h2
//                 className="
//                   mt-1
//                   text-xl
//                   sm:text-2xl
//                   font-black
//                   text-gray-900
//                 "
//               >
//                 Find what you're looking for
//               </h2>
//             </div>

//             <div
//               className="
//                 inline-flex
//                 items-center
//                 gap-2
//                 self-start
//                 sm:self-auto
//                 rounded-xl
//                 bg-white
//                 border border-gray-200
//                 px-4 py-2.5
//                 text-sm
//                 font-medium
//                 text-gray-500
//               "
//             >
//               <span className="font-bold text-gray-900">
//                 {filteredCategories.length}
//               </span>
//               Categories
//             </div>

//           </div>

//           {/* =================================================
//               FEATURED CATEGORIES
//           ================================================= */}
//           {!search && (
//             <div className="mb-10">

//               <div
//                 className="
//                   grid
//                   grid-cols-1
//                   md:grid-cols-2
//                   gap-4
//                 "
//               >

//                 {/* Featured 1 */}
//                 <button
//                   onClick={() => handleCategory(categories[0])}
//                   className="
//                     group
//                     relative
//                     overflow-hidden
//                     min-h-[240px]
//                     sm:min-h-[270px]
//                     rounded-3xl
//                     bg-gradient-to-br
//                     from-blue-700
//                     via-blue-600
//                     to-indigo-700
//                     p-6 sm:p-8
//                     text-left
//                     shadow-sm
//                     hover:shadow-xl
//                     hover:-translate-y-1
//                     transition-all
//                     duration-300
//                     cursor-pointer
//                   "
//                 >

//                   <div
//                     className="
//                       absolute
//                       -right-10
//                       -top-10
//                       h-48 w-48
//                       rounded-full
//                       bg-white/10
//                       transition-transform
//                       duration-500
//                       group-hover:scale-125
//                     "
//                   />

//                   <div
//                     className="
//                       absolute
//                       right-8
//                       bottom-6
//                       opacity-10
//                       text-white
//                       transition-all
//                       duration-500
//                       group-hover:opacity-20
//                       group-hover:scale-110
//                     "
//                   >
//                     <Smartphone size={150} strokeWidth={1} />
//                   </div>

//                   <div className="relative z-10">

//                     <div
//                       className="
//                         h-14 w-14
//                         rounded-2xl
//                         bg-white/15
//                         border border-white/20
//                         text-white
//                         flex items-center justify-center
//                         backdrop-blur-sm
//                       "
//                     >
//                       <Smartphone size={28} />
//                     </div>

//                     <p className="mt-6 text-xs font-bold uppercase tracking-widest text-blue-200">
//                       Featured category
//                     </p>

//                     <h3
//                       className="
//                         mt-1
//                         text-2xl sm:text-3xl
//                         font-black
//                         text-white
//                       "
//                     >
//                       Electronics
//                     </h3>

//                     <p className="mt-2 max-w-xs text-sm text-blue-100">
//                       Discover the latest gadgets, devices and smart
//                       technology.
//                     </p>

//                     <div
//                       className="
//                         mt-5
//                         inline-flex
//                         items-center
//                         gap-2
//                         rounded-xl
//                         bg-white
//                         px-4 py-2.5
//                         text-sm
//                         font-bold
//                         text-blue-700
//                         transition
//                         group-hover:bg-blue-50
//                       "
//                     >
//                       Shop Electronics
//                       <ArrowRight
//                         size={16}
//                         className="transition-transform group-hover:translate-x-1"
//                       />
//                     </div>

//                   </div>
//                 </button>

//                 {/* Featured 2 */}
//                 <button
//                   onClick={() => handleCategory(categories[3])}
//                   className="
//                     group
//                     relative
//                     overflow-hidden
//                     min-h-[240px]
//                     sm:min-h-[270px]
//                     rounded-3xl
//                     bg-gradient-to-br
//                     from-pink-500
//                     via-rose-500
//                     to-orange-500
//                     p-6 sm:p-8
//                     text-left
//                     shadow-sm
//                     hover:shadow-xl
//                     hover:-translate-y-1
//                     transition-all
//                     duration-300
//                     cursor-pointer
//                   "
//                 >

//                   <div
//                     className="
//                       absolute
//                       -right-10
//                       -bottom-20
//                       h-64 w-64
//                       rounded-full
//                       bg-white/10
//                       transition-transform
//                       duration-500
//                       group-hover:scale-125
//                     "
//                   />

//                   <div
//                     className="
//                       absolute
//                       right-8
//                       top-8
//                       opacity-10
//                       text-white
//                       transition-all
//                       duration-500
//                       group-hover:opacity-20
//                       group-hover:scale-110
//                     "
//                   >
//                     <Shirt size={150} strokeWidth={1} />
//                   </div>

//                   <div className="relative z-10">

//                     <div
//                       className="
//                         h-14 w-14
//                         rounded-2xl
//                         bg-white/15
//                         border border-white/20
//                         text-white
//                         flex items-center justify-center
//                         backdrop-blur-sm
//                       "
//                     >
//                       <Shirt size={28} />
//                     </div>

//                     <p className="mt-6 text-xs font-bold uppercase tracking-widest text-pink-100">
//                       Trending now
//                     </p>

//                     <h3
//                       className="
//                         mt-1
//                         text-2xl sm:text-3xl
//                         font-black
//                         text-white
//                       "
//                     >
//                       Fashion
//                     </h3>

//                     <p className="mt-2 max-w-xs text-sm text-pink-100">
//                       Upgrade your style with the latest trends and
//                       collections.
//                     </p>

//                     <div
//                       className="
//                         mt-5
//                         inline-flex
//                         items-center
//                         gap-2
//                         rounded-xl
//                         bg-white
//                         px-4 py-2.5
//                         text-sm
//                         font-bold
//                         text-rose-600
//                         transition
//                         group-hover:bg-pink-50
//                       "
//                     >
//                       Explore Fashion
//                       <ArrowRight
//                         size={16}
//                         className="transition-transform group-hover:translate-x-1"
//                       />
//                     </div>

//                   </div>
//                 </button>

//               </div>
//             </div>
//           )}

//           {/* =================================================
//               ALL CATEGORIES
//           ================================================= */}
//           <div>

//             {!search && (
//               <div className="flex items-center justify-between mb-5">

//                 <div>
//                   <h2 className="text-lg sm:text-xl font-black text-gray-900">
//                     All Categories
//                   </h2>

//                   <p className="mt-1 text-sm text-gray-500">
//                     Browse our complete collection
//                   </p>
//                 </div>

//               </div>
//             )}

//             {filteredCategories.length > 0 ? (
//               <div
//                 className="
//                   grid
//                   grid-cols-2
//                   sm:grid-cols-3
//                   md:grid-cols-4
//                   lg:grid-cols-5
//                   xl:grid-cols-7
//                   gap-3
//                   sm:gap-4
//                 "
//               >
//                 {filteredCategories.map((category) => {
//                   const Icon = category.icon;

//                   return (
//                     <button
//                       key={category.id}
//                       onClick={() => handleCategory(category)}
//                       className="
//                         group
//                         relative
//                         overflow-hidden
//                         rounded-2xl
//                         bg-white
//                         border border-gray-100
//                         p-4 sm:p-5
//                         text-left
//                         shadow-sm
//                         hover:shadow-lg
//                         hover:-translate-y-1
//                         hover:border-blue-100
//                         transition-all
//                         duration-300
//                         cursor-pointer
//                       "
//                     >

//                       {/* Icon */}
//                       <div
//                         className={`
//                           h-12 w-12
//                           sm:h-14 sm:w-14
//                           rounded-2xl
//                           ${category.light}
//                           ${category.text}
//                           flex items-center justify-center
//                           transition-all duration-300
//                           group-hover:scale-105
//                         `}
//                       >
//                         <Icon
//                           size={24}
//                           strokeWidth={2}
//                         />
//                       </div>

//                       {/* Content */}
//                       <div className="mt-4">

//                         <h3
//                           className="
//                             text-sm
//                             sm:text-base
//                             font-bold
//                             text-gray-900
//                             group-hover:text-blue-600
//                             transition
//                           "
//                         >
//                           {category.name}
//                         </h3>

//                         <p
//                           className="
//                             mt-1
//                             text-[11px]
//                             sm:text-xs
//                             leading-relaxed
//                             text-gray-400
//                             line-clamp-2
//                           "
//                         >
//                           {category.description}
//                         </p>

//                         <div className="mt-3 flex items-center justify-between">

//                           <span
//                             className="
//                               text-[10px]
//                               sm:text-xs
//                               font-semibold
//                               text-gray-400
//                             "
//                           >
//                             {category.count} products
//                           </span>

//                           <span
//                             className="
//                               h-7 w-7
//                               rounded-lg
//                               bg-gray-50
//                               text-gray-400
//                               flex items-center justify-center
//                               group-hover:bg-blue-50
//                               group-hover:text-blue-600
//                               transition
//                             "
//                           >
//                             <ChevronRight size={14} />
//                           </span>

//                         </div>

//                       </div>

//                       {/* Bottom accent */}
//                       <div
//                         className={`
//                           absolute
//                           bottom-0
//                           left-0
//                           right-0
//                           h-0.5
//                           bg-gradient-to-r
//                           ${category.gradient}
//                           scale-x-0
//                           origin-left
//                           group-hover:scale-x-100
//                           transition-transform
//                           duration-300
//                         `}
//                       />

//                     </button>
//                   );
//                 })}
//               </div>
//             ) : (
//               /* =================================================
//                  EMPTY SEARCH STATE
//               ================================================= */
//               <div
//                 className="
//                   rounded-3xl
//                   border border-gray-200
//                   bg-white
//                   py-16
//                   px-5
//                   text-center
//                 "
//               >
//                 <div
//                   className="
//                     mx-auto
//                     h-16 w-16
//                     rounded-2xl
//                     bg-blue-50
//                     text-blue-600
//                     flex items-center justify-center
//                   "
//                 >
//                   <Search size={28} />
//                 </div>

//                 <h3 className="mt-5 text-lg font-bold text-gray-900">
//                   No categories found
//                 </h3>

//                 <p className="mt-2 text-sm text-gray-500">
//                   We couldn't find a category matching "{search}".
//                 </p>

//                 <button
//                   onClick={() => setSearch("")}
//                   className="
//                     mt-5
//                     rounded-xl
//                     bg-blue-600
//                     px-5 py-2.5
//                     text-sm
//                     font-bold
//                     text-white
//                     hover:bg-blue-700
//                     transition
//                     cursor-pointer
//                   "
//                 >
//                   Clear Search
//                 </button>
//               </div>
//             )}

//           </div>

//           {/* =================================================
//               BOTTOM CTA
//           ================================================= */}
//           {!search && (
//             <div
//               className="
//                 relative
//                 overflow-hidden
//                 mt-10
//                 rounded-3xl
//                 bg-gray-900
//                 px-6 py-8
//                 sm:px-10 sm:py-10
//               "
//             >

//               <div
//                 className="
//                   absolute
//                   right-[-50px]
//                   top-[-80px]
//                   h-64 w-64
//                   rounded-full
//                   bg-blue-600/20
//                   blur-2xl
//                 "
//               />

//               <div
//                 className="
//                   absolute
//                   left-[-70px]
//                   bottom-[-100px]
//                   h-64 w-64
//                   rounded-full
//                   bg-indigo-600/20
//                   blur-2xl
//                 "
//               />

//               <div
//                 className="
//                   relative
//                   flex flex-col
//                   md:flex-row
//                   md:items-center
//                   md:justify-between
//                   gap-6
//                 "
//               >

//                 <div>

//                   <div
//                     className="
//                       inline-flex
//                       items-center gap-2
//                       text-blue-400
//                       text-xs
//                       font-bold
//                       uppercase
//                       tracking-widest
//                     "
//                   >
//                     <Sparkles size={14} />
//                     Can't decide?
//                   </div>

//                   <h2
//                     className="
//                       mt-2
//                       text-xl
//                       sm:text-2xl
//                       font-black
//                       text-white
//                     "
//                   >
//                     Explore all products
//                   </h2>

//                   <p className="mt-2 text-sm text-gray-400">
//                     Browse our complete collection and discover your
//                     next favorite product.
//                   </p>

//                 </div>

//                 <button
//                   onClick={() => navigate("/products")}
//                   className="
//                     shrink-0
//                     inline-flex
//                     items-center
//                     justify-center
//                     gap-2
//                     rounded-xl
//                     bg-blue-600
//                     px-5 py-3
//                     text-sm
//                     font-bold
//                     text-white
//                     hover:bg-blue-500
//                     transition
//                     cursor-pointer
//                   "
//                 >
//                   View All Products
//                   <ArrowRight size={17} />
//                 </button>

//               </div>

//             </div>
//           )}

//         </section>

//       </main>

//       <Footer />

//     </div>
//   );
// }

















































// import {
//   ArrowRight,
//   Search,
//   Smartphone,
//   Laptop,
//   Tablet,
//   Tv,
//   Camera,
//   Headphones,
//   Watch,
//   Keyboard,
//   Gamepad2,
//   Home,
//   Cable,
//   ChevronRight,
//   Sparkles,
// } from "lucide-react";

// import { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Footer from "../components/Footer";

// /*
// |--------------------------------------------------------------------------
// | CATEGORY DATA
// |--------------------------------------------------------------------------
// | This structure mirrors your backend:
// |
// | Electronics
// | ├── Mobile Accessories
// | ├── Mobile Phones
// | ├── Laptops
// | ├── Tablets
// | ├── Televisions
// | ├── Cameras
// | ├── Headphones & Earphones
// | ├── Smartwatches
// | ├── Computer Accessories
// | ├── Gaming
// | └── Home Appliances
// |
// | Later you can replace this static data with your API response.
// |--------------------------------------------------------------------------
// */

// const categories = [
//   {
//     name: "Electronics",
//     slug: "electronics",
//     description:
//       "Discover the latest gadgets, devices and technology for your everyday life.",
//     subcategories: [
//       {
//         name: "Mobile Accessories",
//         slug: "/mobile-accessories",
//         description: "Cases, chargers, cables and more",
//         icon: Cable,
//       },
//       {
//         name: "Mobile Phones",
//         slug: "/mobile-phones",
//         description: "Latest smartphones and mobile devices",
//         icon: Smartphone,
//       },
//       {
//         name: "Laptops",
//         slug: "/laptops",
//         description: "Powerful laptops for work and entertainment",
//         icon: Laptop,
//       },
//       {
//         name: "Tablets",
//         slug: "/tablets",
//         description: "Portable tablets for work and play",
//         icon: Tablet,
//       },
//       {
//         name: "Televisions",
//         slug: "/televisions",
//         description: "Smart TVs and entertainment displays",
//         icon: Tv,
//       },
//       {
//         name: "Cameras",
//         slug: "/cameras",
//         description: "Capture every special moment",
//         icon: Camera,
//       },
//       {
//         name: "Headphones & Earphones",
//         slug: "/headphones-earphones",
//         description: "Wireless headphones and earphones",
//         icon: Headphones,
//       },
//       {
//         name: "Smartwatches",
//         slug: "/smartwatches",
//         description: "Smartwatches and wearable technology",
//         icon: Watch,
//       },
//       {
//         name: "Computer Accessories",
//         slug: "/computer-accessories",
//         description: "Keyboards, mice and computer accessories",
//         icon: Keyboard,
//       },
//       {
//         name: "Gaming",
//         slug: "/gaming",
//         description: "Gaming accessories and equipment",
//         icon: Gamepad2,
//       },
//       {
//         name: "Home Appliances",
//         slug: "/home-appliances",
//         description: "Smart and essential home appliances",
//         icon: Home,
//       },
//     ],
//   },
// ];

// export default function CategoriesPage() {
//   const navigate = useNavigate();

//   const [search, setSearch] = useState("");

//   /*
//   |--------------------------------------------------------------------------
//   | SEARCH
//   |--------------------------------------------------------------------------
//   */

//   const filteredCategories = useMemo(() => {
//     if (!search.trim()) {
//       return categories;
//     }

//     const query = search.toLowerCase().trim();

//     return categories
//       .map((category) => {
//         const parentMatches =
//           category.name.toLowerCase().includes(query) ||
//           category.description.toLowerCase().includes(query);

//         const matchingSubcategories = category.subcategories.filter(
//           (subcategory) =>
//             subcategory.name.toLowerCase().includes(query) ||
//             subcategory.description.toLowerCase().includes(query)
//         );

//         if (parentMatches) {
//           return category;
//         }

//         if (matchingSubcategories.length > 0) {
//           return {
//             ...category,
//             subcategories: matchingSubcategories,
//           };
//         }

//         return null;
//       })
//       .filter(Boolean);
//   }, [search]);

//   /*
//   |--------------------------------------------------------------------------
//   | TOTAL SUBCATEGORIES
//   |--------------------------------------------------------------------------
//   */

//   const totalSubcategories = categories.reduce(
//     (total, category) => total + category.subcategories.length,
//     0
//   );

//   /*
//   |--------------------------------------------------------------------------
//   | NAVIGATION
//   |--------------------------------------------------------------------------
//   */

//   const handleSubcategoryClick = (slug) => {
//     navigate(slug);
//   };

//   const handleParentClick = (slug) => {
//     /*
//      * Change this route if your backend/frontend uses
//      * a different parent-category route.
//      */
//     navigate(`/products?category=${slug}`);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">

//       <main className="pb-20 lg:pb-0">

//         {/* =========================================================
//             HERO
//         ========================================================= */}

//         <section className="relative overflow-hidden">

//           {/* Background */}
//           <div
//             className="
//               absolute inset-0
//               bg-gradient-to-br
//               from-[#0f2470]
//               via-[#2451dc]
//               to-[#657ff0]
//             "
//           />

//           {/* Decorative circles */}
//           <div
//             className="
//               absolute
//               -right-20
//               -top-28
//               h-80
//               w-80
//               rounded-full
//               bg-white/10
//               blur-2xl
//             "
//           />

//           <div
//             className="
//               absolute
//               -left-24
//               -bottom-32
//               h-80
//               w-80
//               rounded-full
//               bg-indigo-300/20
//               blur-3xl
//             "
//           />

//           {/* Decorative grid */}
//           <div
//             className="
//               absolute
//               inset-0
//               opacity-[0.06]
//               bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)]
//               [background-size:24px_24px]
//             "
//           />

//           <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//             <div
//               className="
//                 min-h-[330px]
//                 sm:min-h-[360px]
//                 flex
//                 items-center
//                 justify-center
//                 text-center
//                 py-14
//               "
//             >

//               <div className="w-full max-w-3xl">

//                 {/* Badge */}

//                 <div
//                   className="
//                     inline-flex
//                     items-center
//                     gap-2
//                     rounded-full
//                     border
//                     border-white/20
//                     bg-white/10
//                     px-4
//                     py-2
//                     text-xs
//                     sm:text-sm
//                     font-semibold
//                     text-blue-50
//                     backdrop-blur-md
//                   "
//                 >
//                   <Sparkles size={15} />

//                   Explore our collection
//                 </div>

//                 {/* Heading */}

//                 <h1
//                   className="
//                     mt-5
//                     text-3xl
//                     sm:text-4xl
//                     lg:text-5xl
//                     font-black
//                     tracking-tight
//                     text-white
//                   "
//                 >
//                   Shop by Category
//                 </h1>

//                 {/* Description */}

//                 <p
//                   className="
//                     mt-4
//                     mx-auto
//                     max-w-2xl
//                     text-sm
//                     sm:text-base
//                     lg:text-lg
//                     leading-relaxed
//                     text-blue-100
//                   "
//                 >
//                   Explore our carefully organized categories and
//                   find exactly what you are looking for.
//                 </p>

//                 {/* Search */}

//                 <div className="relative mt-7 max-w-xl mx-auto">

//                   <Search
//                     size={19}
//                     className="
//                       absolute
//                       left-4
//                       top-1/2
//                       -translate-y-1/2
//                       text-gray-400
//                     "
//                   />

//                   <input
//                     type="text"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     placeholder="Search categories..."
//                     className="
//                       w-full
//                       h-12
//                       sm:h-14
//                       rounded-2xl
//                       border
//                       border-white/20
//                       bg-white
//                       pl-11
//                       pr-5
//                       text-sm
//                       sm:text-base
//                       text-gray-900
//                       placeholder:text-gray-400
//                       outline-none
//                       shadow-xl
//                       focus:ring-4
//                       focus:ring-white/20
//                     "
//                   />

//                 </div>

//               </div>

//             </div>

//           </div>
//         </section>

//         {/* =========================================================
//             MAIN CONTENT
//         ========================================================= */}

//         <section
//           className="
//             max-w-7xl
//             mx-auto
//             px-4
//             sm:px-6
//             lg:px-8
//             py-8
//             sm:py-10
//           "
//         >

//           {/* =======================================================
//               PAGE HEADER
//           ======================================================= */}

//           <div
//             className="
//               flex
//               flex-col
//               sm:flex-row
//               sm:items-end
//               sm:justify-between
//               gap-4
//               mb-7
//             "
//           >

//             <div>

//               <p
//                 className="
//                   text-xs
//                   font-bold
//                   uppercase
//                   tracking-widest
//                   text-blue-600
//                 "
//               >
//                 Browse collection
//               </p>

//               <h2
//                 className="
//                   mt-1
//                   text-xl
//                   sm:text-2xl
//                   font-black
//                   text-gray-900
//                 "
//               >
//                 Find what you need
//               </h2>

//               <p className="mt-1 text-sm text-gray-500">
//                 Choose a category to explore products.
//               </p>

//             </div>

//             {/* Category count */}

//             <div
//               className="
//                 self-start
//                 sm:self-auto
//                 inline-flex
//                 items-center
//                 gap-2
//                 rounded-xl
//                 border
//                 border-gray-200
//                 bg-white
//                 px-4
//                 py-2.5
//                 text-sm
//                 text-gray-500
//               "
//             >

//               <span className="font-bold text-gray-900">
//                 {totalSubcategories}
//               </span>

//               Subcategories

//             </div>

//           </div>

//           {/* =======================================================
//               PARENT CATEGORY
//           ======================================================= */}

//           {filteredCategories.length > 0 ? (
//             <div className="space-y-8">

//               {filteredCategories.map((category) => (

//                 <section
//                   key={category.slug}
//                   className="
//                     overflow-hidden
//                     rounded-3xl
//                     border
//                     border-gray-200
//                     bg-white
//                     shadow-sm
//                   "
//                 >

//                   {/* =================================================
//                       PARENT HEADER
//                   ================================================= */}

//                   <div
//                     className="
//                       relative
//                       overflow-hidden
//                       bg-gradient-to-r
//                       from-blue-700
//                       via-blue-600
//                       to-indigo-600
//                       px-5
//                       py-6
//                       sm:px-7
//                       sm:py-7
//                     "
//                   >

//                     {/* Background decoration */}

//                     <div
//                       className="
//                         absolute
//                         -right-12
//                         -top-20
//                         h-52
//                         w-52
//                         rounded-full
//                         bg-white/10
//                       "
//                     />

//                     <div
//                       className="
//                         absolute
//                         right-20
//                         bottom-[-80px]
//                         h-44
//                         w-44
//                         rounded-full
//                         bg-indigo-300/10
//                       "
//                     />

//                     <div
//                       className="
//                         relative
//                         flex
//                         flex-col
//                         md:flex-row
//                         md:items-center
//                         md:justify-between
//                         gap-5
//                       "
//                     >

//                       {/* Parent info */}

//                       <div className="flex items-center gap-4">

//                         <div
//                           className="
//                             h-14
//                             w-14
//                             sm:h-16
//                             sm:w-16
//                             shrink-0
//                             rounded-2xl
//                             border
//                             border-white/20
//                             bg-white/15
//                             text-white
//                             flex
//                             items-center
//                             justify-center
//                             backdrop-blur-md
//                           "
//                         >
//                           <Smartphone
//                             size={29}
//                             strokeWidth={1.9}
//                           />
//                         </div>

//                         <div>

//                           <div
//                             className="
//                               flex
//                               items-center
//                               gap-2
//                             "
//                           >

//                             <h2
//                               className="
//                                 text-2xl
//                                 sm:text-3xl
//                                 font-black
//                                 text-white
//                               "
//                             >
//                               {category.name}
//                             </h2>

//                             <span
//                               className="
//                                 hidden
//                                 sm:inline-flex
//                                 rounded-full
//                                 bg-white/15
//                                 px-2.5
//                                 py-1
//                                 text-[10px]
//                                 font-bold
//                                 uppercase
//                                 tracking-wider
//                                 text-blue-100
//                               "
//                             >
//                               Category
//                             </span>

//                           </div>

//                           <p
//                             className="
//                               mt-1
//                               max-w-xl
//                               text-sm
//                               text-blue-100
//                             "
//                           >
//                             {category.description}
//                           </p>

//                         </div>

//                       </div>

//                       {/* View parent */}

//                       <button
//                         onClick={() =>
//                           handleParentClick(category.slug)
//                         }
//                         className="
//                           inline-flex
//                           items-center
//                           justify-center
//                           gap-2
//                           rounded-xl
//                           bg-white
//                           px-4
//                           py-2.5
//                           text-sm
//                           font-bold
//                           text-blue-700
//                           shadow-lg
//                           hover:bg-blue-50
//                           transition
//                           cursor-pointer
//                         "
//                       >
//                         View All
//                         <ArrowRight size={16} />
//                       </button>

//                     </div>

//                   </div>

//                   {/* =================================================
//                       SUBCATEGORIES
//                   ================================================= */}

//                   <div className="p-4 sm:p-6">

//                     <div
//                       className="
//                         mb-5
//                         flex
//                         items-center
//                         justify-between
//                       "
//                     >

//                       <div>

//                         <h3
//                           className="
//                             text-base
//                             sm:text-lg
//                             font-bold
//                             text-gray-900
//                           "
//                         >
//                           Explore Electronics
//                         </h3>

//                         <p
//                           className="
//                             mt-0.5
//                             text-xs
//                             sm:text-sm
//                             text-gray-400
//                           "
//                         >
//                           Browse products by subcategory
//                         </p>

//                       </div>

//                       <span
//                         className="
//                           text-xs
//                           font-semibold
//                           text-gray-400
//                         "
//                       >
//                         {category.subcategories.length} options
//                       </span>

//                     </div>

//                     {/* Grid */}

//                     <div
//                       className="
//                         grid
//                         grid-cols-1
//                         sm:grid-cols-2
//                         lg:grid-cols-3
//                         xl:grid-cols-4
//                         gap-3
//                         sm:gap-4
//                       "
//                     >

//                       {category.subcategories.map(
//                         (subcategory) => {

//                           const Icon = subcategory.icon;

//                           return (
//                             <button
//                               key={subcategory.slug}
//                               onClick={() =>
//                                 handleSubcategoryClick(
//                                   subcategory.slug
//                                 )
//                               }
//                               className="
//                                 group
//                                 relative
//                                 overflow-hidden
//                                 flex
//                                 items-center
//                                 gap-4
//                                 rounded-2xl
//                                 border
//                                 border-gray-100
//                                 bg-gray-50
//                                 p-4
//                                 text-left
//                                 hover:border-blue-200
//                                 hover:bg-blue-50/50
//                                 hover:shadow-md
//                                 transition-all
//                                 duration-300
//                                 cursor-pointer
//                               "
//                             >

//                               {/* Icon */}

//                               <div
//                                 className="
//                                   h-12
//                                   w-12
//                                   shrink-0
//                                   rounded-xl
//                                   bg-white
//                                   border
//                                   border-gray-100
//                                   text-blue-600
//                                   flex
//                                   items-center
//                                   justify-center
//                                   shadow-sm
//                                   group-hover:bg-blue-600
//                                   group-hover:text-white
//                                   group-hover:border-blue-600
//                                   transition-all
//                                   duration-300
//                                 "
//                               >
//                                 <Icon
//                                   size={22}
//                                   strokeWidth={2}
//                                 />
//                               </div>

//                               {/* Text */}

//                               <div className="min-w-0 flex-1">

//                                 <h4
//                                   className="
//                                     text-sm
//                                     font-bold
//                                     text-gray-900
//                                     group-hover:text-blue-600
//                                     transition
//                                   "
//                                 >
//                                   {subcategory.name}
//                                 </h4>

//                                 <p
//                                   className="
//                                     mt-1
//                                     text-[11px]
//                                     leading-relaxed
//                                     text-gray-400
//                                     line-clamp-2
//                                   "
//                                 >
//                                   {subcategory.description}
//                                 </p>

//                               </div>

//                               {/* Arrow */}

//                               <div
//                                 className="
//                                   h-8
//                                   w-8
//                                   shrink-0
//                                   rounded-lg
//                                   bg-white
//                                   border
//                                   border-gray-100
//                                   text-gray-400
//                                   flex
//                                   items-center
//                                   justify-center
//                                   group-hover:bg-blue-600
//                                   group-hover:text-white
//                                   group-hover:border-blue-600
//                                   transition-all
//                                 "
//                               >
//                                 <ChevronRight size={15} />
//                               </div>

//                             </button>
//                           );
//                         }
//                       )}

//                     </div>

//                   </div>

//                 </section>

//               ))}

//             </div>
//           ) : (

//             /* =======================================================
//                NO RESULTS
//             ======================================================= */

//             <div
//               className="
//                 rounded-3xl
//                 border
//                 border-gray-200
//                 bg-white
//                 px-5
//                 py-16
//                 text-center
//               "
//             >

//               <div
//                 className="
//                   mx-auto
//                   h-16
//                   w-16
//                   rounded-2xl
//                   bg-blue-50
//                   text-blue-600
//                   flex
//                   items-center
//                   justify-center
//                 "
//               >
//                 <Search size={28} />
//               </div>

//               <h3
//                 className="
//                   mt-5
//                   text-lg
//                   font-bold
//                   text-gray-900
//                 "
//               >
//                 No category found
//               </h3>

//               <p
//                 className="
//                   mt-2
//                   text-sm
//                   text-gray-500
//                 "
//               >
//                 We couldn't find anything matching "{search}".
//               </p>

//               <button
//                 onClick={() => setSearch("")}
//                 className="
//                   mt-5
//                   rounded-xl
//                   bg-blue-600
//                   px-5
//                   py-2.5
//                   text-sm
//                   font-bold
//                   text-white
//                   hover:bg-blue-700
//                   transition
//                   cursor-pointer
//                 "
//               >
//                 Clear Search
//               </button>

//             </div>

//           )}

//           {/* =======================================================
//               BOTTOM CTA
//           ======================================================= */}

//           {!search && (
//             <div
//               className="
//                 relative
//                 overflow-hidden
//                 mt-8
//                 rounded-3xl
//                 bg-gray-900
//                 px-6
//                 py-8
//                 sm:px-10
//                 sm:py-10
//               "
//             >

//               {/* Decorations */}

//               <div
//                 className="
//                   absolute
//                   -right-20
//                   -top-24
//                   h-64
//                   w-64
//                   rounded-full
//                   bg-blue-600/20
//                   blur-3xl
//                 "
//               />

//               <div
//                 className="
//                   absolute
//                   -left-20
//                   -bottom-24
//                   h-64
//                   w-64
//                   rounded-full
//                   bg-indigo-600/20
//                   blur-3xl
//                 "
//               />

//               <div
//                 className="
//                   relative
//                   flex
//                   flex-col
//                   md:flex-row
//                   md:items-center
//                   md:justify-between
//                   gap-6
//                 "
//               >

//                 <div>

//                   <div
//                     className="
//                       flex
//                       items-center
//                       gap-2
//                       text-xs
//                       font-bold
//                       uppercase
//                       tracking-widest
//                       text-blue-400
//                     "
//                   >
//                     <Sparkles size={14} />
//                     Everything in one place
//                   </div>

//                   <h2
//                     className="
//                       mt-2
//                       text-xl
//                       sm:text-2xl
//                       font-black
//                       text-white
//                     "
//                   >
//                     Looking for something else?
//                   </h2>

//                   <p
//                     className="
//                       mt-2
//                       max-w-xl
//                       text-sm
//                       text-gray-400
//                     "
//                   >
//                     Explore our complete collection and discover
//                     products from every category.
//                   </p>

//                 </div>

//                 <button
//                   onClick={() => navigate("/products")}
//                   className="
//                     shrink-0
//                     inline-flex
//                     items-center
//                     justify-center
//                     gap-2
//                     rounded-xl
//                     bg-blue-600
//                     px-5
//                     py-3
//                     text-sm
//                     font-bold
//                     text-white
//                     hover:bg-blue-500
//                     transition
//                     cursor-pointer
//                   "
//                 >
//                   View All Products
//                   <ArrowRight size={17} />
//                 </button>

//               </div>

//             </div>
//           )}

//         </section>

//       </main>

//       <Footer />

//     </div>
//   );
// }
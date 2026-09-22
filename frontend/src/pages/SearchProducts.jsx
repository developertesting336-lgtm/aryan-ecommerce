import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Home,
  X,
  Check,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";

import { searchProducts } from "../redux/slices/productSlice";
import ProductCard from "../components/products/ProductCard";
import PageButtons from "../components/PageButtons";

export default function SearchPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const [page, setPage] = useState(1);

  const search = searchParams.get("q") || "";

  const {
    product = [],
    pagination = {},
    loading = false,
    error = null,
  } = useSelector((state) => state.product || {});

  const [sortBy, setSortBy] = useState("relevance");
  const [sortOpen, setSortOpen] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);

  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState("all");

  /*
   * =========================================================
   * PAGINATION DATA
   * =========================================================
   *
   * Your backend should ideally return:
   *
   * pagination: {
   *   currentPage: 1,
   *   totalPages: 5,
   *   totalProducts: 20,
   *   limit: 4
   * }
   *
   * We support a few common names to prevent the buttons
   * from disappearing if your API uses a different field.
   */

  const totalPages = useMemo(() => {
  const parsed = Number(pagination?.totalPages);

  return Number.isFinite(parsed) && parsed > 0
    ? Math.ceil(parsed)
    : 1;
}, [pagination?.totalPages]);


  /*
   * =========================================================
   * RESET PAGE WHEN SEARCH CHANGES
   * =========================================================
   */

  useEffect(() => {
    setPage(1);
  }, [search]);

  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  useEffect(() => {
    if (!search.trim()) return;

    dispatch(
      searchProducts({
        page,
        limit: 10,
        search: search.trim(),
      })
    );
  }, [dispatch, search, page]);

  /*
   * =========================================================
   * SAFETY CHECK FOR PAGE
   * =========================================================
   *
   * If the backend says there are only 2 pages while the user
   * is currently on page 4, move back to the last valid page.
   */

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  /*
   * =========================================================
   * PAGE CHANGE
   * =========================================================
   */

  const handlePageChange = (newPage) => {
    const nextPage = Number(newPage);

    if (!Number.isInteger(nextPage)) {
      return;
    }

    if (nextPage < 1) {
      return;
    }

    if (nextPage > totalPages) {
      return;
    }

    if (nextPage === page) {
      return;
    }

    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * =========================================================
   * CATEGORIES
   * =========================================================
   */

  const categories = useMemo(() => {
    const values = product
      .map((product) => {
        if (typeof product.category === "string") {
          return product.category;
        }

        return product.category?.name;
      })
      .filter(Boolean);

    return [...new Set(values)];
  }, [product]);

  /*
   * =========================================================
   * FILTER + SORT
   * =========================================================
   */

  const visibleProducts = useMemo(() => {
    let result = [...product];

    if (category !== "all") {
      result = result.filter((product) => {
        const productCategory =
          typeof product.category === "string"
            ? product.category
            : product.category?.name;

        return productCategory === category;
      });
    }

    if (price !== "all") {
      result = result.filter((product) => {
        const amount = Number(product.price || 0);

        switch (price) {
          case "under-1000":
            return amount < 1000;

          case "1000-5000":
            return amount >= 1000 && amount <= 5000;

          case "5000-10000":
            return amount > 5000 && amount <= 10000;

          case "above-10000":
            return amount > 10000;

          default:
            return true;
        }
      });
    }

    switch (sortBy) {
      case "price-low":
        result.sort(
          (a, b) =>
            Number(a.price || 0) - Number(b.price || 0)
        );
        break;

      case "price-high":
        result.sort(
          (a, b) =>
            Number(b.price || 0) - Number(a.price || 0)
        );
        break;

      case "discount":
        result.sort(
          (a, b) =>
            Number(b.discount || 0) -
            Number(a.discount || 0)
        );
        break;

      default:
        break;
    }

    return result;
  }, [product, category, price, sortBy]);

  /*
   * =========================================================
   * SORT
   * =========================================================
   */

  const sortOptions = [
    {
      value: "relevance",
      label: "Relevance",
    },
    {
      value: "price-low",
      label: "Price: Low to High",
    },
    {
      value: "price-high",
      label: "Price: High to Low",
    },
    {
      value: "discount",
      label: "Discount",
    },
  ];

  const activeSort =
    sortOptions.find((item) => item.value === sortBy)?.label ||
    "Relevance";

  /*
   * =========================================================
   * FILTER STATE
   * =========================================================
   */

  const hasFilters = category !== "all" || price !== "all";

  const clearFilters = () => {
    setCategory("all");
    setPrice("all");
  };

  return (
    <div className="min-h-screen bg-white text-[#111827] dark:bg-[#0b0d10] dark:text-white">
      <main className="mx-auto max-w-[1500px] px-4 pb-20 pt-4 sm:px-6 lg:px-8">

        {/* =====================================================
            BREADCRUMB
        ===================================================== */}

        <div className="mb-6 flex items-center gap-2 text-[12px] text-gray-400">
          <Home size={13} />

          <span className="hover:text-gray-700 dark:hover:text-gray-200">
            Home
          </span>

          <span>/</span>

          <span>Search</span>

          {search && (
            <>
              <span>/</span>

              <span className="max-w-[180px] truncate font-medium text-gray-700 dark:text-gray-200">
                {search}
              </span>
            </>
          )}
        </div>

        {/* =====================================================
            SEARCH HEADER
        ===================================================== */}

        <section className="border-b border-gray-200 pb-7 dark:border-gray-800">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                Search
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
                {search
                  ? `Results for "${search}"`
                  : "Search products"}
              </h1>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {loading
                  ? "Finding products..."
                  : `${visibleProducts.length} products available`}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && <SearchLoading />}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {!loading && error && (
          <ErrorState
            error={error}
            onRetry={() =>
              dispatch(
                searchProducts({
                  page,
                  limit: 4,
                  search: search.trim(),
                })
              )
            }
          />
        )}

        {/* =====================================================
            EMPTY SEARCH
        ===================================================== */}

        {!loading &&
          !error &&
          search &&
          product.length === 0 && (
            <EmptySearch search={search} />
          )}

        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        {!loading &&
          !error &&
          product.length > 0 && (
            <div className="pt-6">

              {/* =================================================
                  TOOLBAR
              ================================================= */}

              <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {visibleProducts.length}{" "}
                    {visibleProducts.length === 1
                      ? "result"
                      : "results"}
                  </span>

                  {hasFilters && (
                    <>
                      <span className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

                      <button
                        type="button"
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <RotateCcw size={12} />
                        Clear filters
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">

                  {/* Mobile filter */}

                  <button
                    type="button"
                    onClick={() => setFilterOpen(true)}
                    className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-700 transition hover:border-gray-400 dark:border-gray-700 dark:bg-[#111418] dark:text-gray-200 lg:hidden"
                  >
                    <SlidersHorizontal size={14} />

                    Filter

                    {hasFilters && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    )}
                  </button>

                  {/* Sort */}

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setSortOpen((value) => !value)
                      }
                      className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-700 transition hover:border-gray-400 dark:border-gray-700 dark:bg-[#111418] dark:text-gray-200"
                    >
                      <ArrowUpDown size={14} />

                      <span className="hidden sm:inline">
                        Sort by
                      </span>

                      <span>{activeSort}</span>

                      <ChevronDown
                        size={13}
                        className={`transition-transform ${
                          sortOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {sortOpen && (
                      <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-gray-700 dark:bg-[#15191e]">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setSortBy(option.value);
                              setSortOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-medium transition ${
                              sortBy === option.value
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                                : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                            }`}
                          >
                            {option.label}

                            {sortBy === option.value && (
                              <Check size={14} />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* =================================================
                  CONTENT
              ================================================= */}

              <div className="grid grid-cols-1 gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">

                {/* =================================================
                    FILTER SIDEBAR
                ================================================= */}

                <aside className="hidden lg:block">
                  <DesktopFilters
                    categories={categories}
                    category={category}
                    setCategory={setCategory}
                    price={price}
                    setPrice={setPrice}
                    clearFilters={clearFilters}
                    hasFilters={hasFilters}
                  />
                </aside>

                {/* =================================================
                    PRODUCTS
                ================================================= */}

                <section className="min-w-0">
                  {visibleProducts.length === 0 ? (
                    <FilteredEmpty
                      clearFilters={clearFilters}
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                      {visibleProducts.map((product) => (
                        <ProductCard
                          key={product._id}
                          _id={product._id}
                          images={product.images}
                          name={product.name}
                          price={product.price}
                          originalPrice={product.originalPrice}
                          mrp={product.mrp}
                          discount={product.discount}
                          category={product.category}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* =================================================
                  PAGE BUTTONS
              ================================================= */}

              <div className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-800">
                <div className="flex flex-col items-center gap-3">

                  <p className="text-xs text-gray-400">
                    Page{" "}
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {page}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {totalPages}
                    </span>
                  </p>

                  <PageButtons
                    page={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>

            </div>
          )}

      </main>

      {/* =====================================================
          MOBILE FILTER
      ===================================================== */}

      {filterOpen && (
        <MobileFilters
          categories={categories}
          category={category}
          setCategory={setCategory}
          price={price}
          setPrice={setPrice}
          clearFilters={clearFilters}
          close={() => setFilterOpen(false)}
        />
      )}
    </div>
  );
}

/* =========================================================
   DESKTOP FILTERS
========================================================= */

function DesktopFilters({
  categories,
  category,
  setCategory,
  price,
  setPrice,
  clearFilters,
  hasFilters,
}) {
  return (
    <div className="pr-4">

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">
          Filters
        </h2>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400"
          >
            Clear
          </button>
        )}
      </div>

      <div className="border-b border-gray-200 pb-6 dark:border-gray-800">
        <h3 className="mb-3 text-xs font-bold text-gray-900 dark:text-white">
          Category
        </h3>

        <div className="space-y-1">
          <FilterItem
            label="All Categories"
            active={category === "all"}
            onClick={() => setCategory("all")}
          />

          {categories.map((item) => (
            <FilterItem
              key={item}
              label={item}
              active={category === item}
              onClick={() => setCategory(item)}
            />
          ))}
        </div>
      </div>

      <div className="pt-6">
        <h3 className="mb-3 text-xs font-bold text-gray-900 dark:text-white">
          Price
        </h3>

        <div className="space-y-1">
          <FilterItem
            label="All Prices"
            active={price === "all"}
            onClick={() => setPrice("all")}
          />

          <FilterItem
            label="Under ₹1,000"
            active={price === "under-1000"}
            onClick={() => setPrice("under-1000")}
          />

          <FilterItem
            label="₹1,000 – ₹5,000"
            active={price === "1000-5000"}
            onClick={() => setPrice("1000-5000")}
          />

          <FilterItem
            label="₹5,000 – ₹10,000"
            active={price === "5000-10000"}
            onClick={() => setPrice("5000-10000")}
          />

          <FilterItem
            label="Above ₹10,000"
            active={price === "above-10000"}
            onClick={() => setPrice("above-10000")}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FILTER ITEM
========================================================= */

function FilterItem({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition ${
        active
          ? "bg-blue-50 font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      }`}
    >
      <span>{label}</span>

      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
          active
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-gray-300 dark:border-gray-600"
        }`}
      >
        {active && <Check size={9} strokeWidth={3} />}
      </span>
    </button>
  );
}

/* =========================================================
   MOBILE FILTERS
========================================================= */

function MobileFilters({
  categories,
  category,
  setCategory,
  price,
  setPrice,
  clearFilters,
  close,
}) {
  return (
    <div className="fixed inset-0 z-[100] lg:hidden">

      <button
        type="button"
        aria-label="Close filters"
        onClick={close}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />

      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl dark:bg-[#111418]">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Filters
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Refine your results
            </p>
          </div>

          <button
            type="button"
            onClick={close}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300"
          >
            <X size={16} />
          </button>
        </div>

        <div className="border-b border-gray-200 pb-6 dark:border-gray-800">
          <h3 className="mb-3 text-xs font-bold text-gray-900 dark:text-white">
            Category
          </h3>

          <div className="space-y-1">
            <FilterItem
              label="All Categories"
              active={category === "all"}
              onClick={() => setCategory("all")}
            />

            {categories.map((item) => (
              <FilterItem
                key={item}
                label={item}
                active={category === item}
                onClick={() => setCategory(item)}
              />
            ))}
          </div>
        </div>

        <div className="pt-6">
          <h3 className="mb-3 text-xs font-bold text-gray-900 dark:text-white">
            Price
          </h3>

          <div className="space-y-1">
            <FilterItem
              label="All Prices"
              active={price === "all"}
              onClick={() => setPrice("all")}
            />

            <FilterItem
              label="Under ₹1,000"
              active={price === "under-1000"}
              onClick={() => setPrice("under-1000")}
            />

            <FilterItem
              label="₹1,000 – ₹5,000"
              active={price === "1000-5000"}
              onClick={() => setPrice("1000-5000")}
            />

            <FilterItem
              label="₹5,000 – ₹10,000"
              active={price === "5000-10000"}
              onClick={() => setPrice("5000-10000")}
            />

            <FilterItem
              label="Above ₹10,000"
              active={price === "above-10000"}
              onClick={() => setPrice("above-10000")}
            />
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={clearFilters}
            className="h-11 rounded-lg border border-gray-300 text-xs font-bold text-gray-700 dark:border-gray-700 dark:text-gray-300"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={close}
            className="h-11 rounded-lg bg-blue-600 text-xs font-bold text-white hover:bg-blue-700"
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function SearchLoading() {
  return (
    <div className="pt-7">

      <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-5 dark:border-gray-800">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

        <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div>
      <div className="aspect-square animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />

      <div className="space-y-2.5 pt-3">
        <div className="h-2.5 w-16 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />

        <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

        <div className="h-5 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY SEARCH
========================================================= */

function EmptySearch({ search }) {
  return (
    <div className="mx-auto max-w-xl py-24 text-center">

      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
        <Search size={30} />
      </div>

      <h2 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">
        No results found
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
        We couldn't find any products matching{" "}
        <span className="font-semibold text-gray-800 dark:text-gray-200">
          "{search}"
        </span>
        .
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[11px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          Check spelling
        </span>

        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[11px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          Try another keyword
        </span>

        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[11px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          Try a brand name
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   FILTERED EMPTY
========================================================= */

function FilteredEmpty({ clearFilters }) {
  return (
    <div className="border border-gray-200 bg-gray-50 px-6 py-20 text-center dark:border-gray-800 dark:bg-[#111418]">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm dark:bg-gray-800">
        <SlidersHorizontal size={24} />
      </div>

      <h2 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">
        No products match your filters
      </h2>

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Try changing or removing your filters.
      </p>

      <button
        type="button"
        onClick={clearFilters}
        className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900"
      >
        Clear filters
      </button>
    </div>
  );
}

/* =========================================================
   ERROR
========================================================= */

function ErrorState({ error, onRetry }) {
  return (
    <div className="mx-auto max-w-lg py-24 text-center">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl dark:bg-red-500/10">
        ⚠️
      </div>

      <h2 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">
        Unable to load products
      </h2>

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Something went wrong while searching. Please try again.
      </p>

      {error && (
        <p className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900"
      >
        Try again
      </button>
    </div>
  );
}

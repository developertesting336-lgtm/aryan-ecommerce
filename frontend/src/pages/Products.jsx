function FilterContent({
  categories,
  categoriesLoading,
  product,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  priceInput,
  setPriceInput,
  appliedPrice,
  setAppliedPrice,
  applyPriceFilter,
  inStockOnly,
  setInStockOnly,
  clearFilters,
  hasFilters,
}) {
  const handlePriceChange = (field, value) => {
    // Allow empty input
    if (value === "") {
      setPriceInput((prev) => ({
        ...prev,
        [field]: "",
      }));
      return;
    }

    // Only allow digits
    if (!/^\d*$/.test(value)) {
      return;
    }

    setPriceInput((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePriceKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyPriceFilter();
      e.currentTarget.blur();
    }
  };

  const clearMinPrice = () => {
    setPriceInput((prev) => ({
      ...prev,
      min: "",
    }));

    setAppliedPrice((prev) => ({
      ...prev,
      min: "",
    }));
  };

  const clearMaxPrice = () => {
    setPriceInput((prev) => ({
      ...prev,
      max: "",
    }));

    setAppliedPrice((prev) => ({
      ...prev,
      max: "",
    }));
  };

  return (
    <div className="space-y-7">

      {/* =====================================================
          CATEGORIES
      ====================================================== */}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-900">
            Categories
          </h3>

          {selectedCategory !== "all" && (
            <button
              type="button"
              onClick={() => {
                window.scrollTo({
      top: 0,
      behavior: 'smooth' // 'auto' for an instant jump
    });
                setSelectedCategory("all")}}
              className="text-xs font-semibold text-blue-600"
            >
              Reset
            </button>
          )}
        </div>

        {categoriesLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-10 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1">

            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`
                group flex w-full items-center
                justify-between rounded-xl px-3.5 py-2.5
                text-left text-sm transition
                ${
                  selectedCategory === "all"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }
              `}
            >
              <span
                className={
                  selectedCategory === "all"
                    ? "font-semibold"
                    : "font-medium"
                }
              >
                All products
              </span>

              <span className="text-xs text-slate-400">
                {product.length}
              </span>
            </button>

            {categories.map((category) => {
              const active =
                String(selectedCategory) ===
                String(category._id);

              return (
                <button
                  type="button"
                  key={category._id}
                  onClick={() =>{
                    window.scrollTo({
      top: 0,
      behavior: 'smooth' // 'auto' for an instant jump
    });
                    setSelectedCategory(category._id)}
                  }
                  className={`
                    group flex w-full items-center
                    justify-between rounded-xl px-3.5 py-2.5
                    text-left text-sm transition
                    ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }
                  `}
                >
                  <span
                    className={
                      active
                        ? "font-semibold"
                        : "font-medium"
                    }
                  >
                    {category.name}
                  </span>

                  <ChevronRight
                    size={14}
                    className={
                      active
                        ? "text-blue-500"
                        : "text-slate-300"
                    }
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="h-px bg-slate-100" />

      {/* =====================================================
          PRICE
      ====================================================== */}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-900">
            Price range
          </h3>

          {(priceInput.min !== "" ||
            priceInput.max !== "") && (
            <button
              type="button"
              onClick={() => {
                setPriceInput({
                  min: "",
                  max: "",
                });

                setAppliedPrice({
                  min: "",
                  max: "",
                });
              }}
              className="text-xs font-semibold text-blue-600"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">

          {/* MIN */}

          <div className="relative min-w-0 flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              ₹
            </span>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder={Math.floor(
                priceRange.min
              ).toLocaleString("en-IN")}
              value={priceInput.min}
              onChange={(e) =>
                handlePriceChange(
                  "min",
                  e.target.value
                )
              }
              onKeyDown={handlePriceKeyDown}
              className="
                h-10 w-full rounded-xl
                border border-slate-200
                bg-slate-50
                pl-7 pr-2
                text-sm text-slate-900
                outline-none
                transition
                focus:border-blue-500
                focus:bg-white
                focus:ring-4
                focus:ring-blue-500/10
              "
            />
          </div>

          <span className="text-slate-300">—</span>

          {/* MAX */}

          <div className="relative min-w-0 flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              ₹
            </span>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder={Math.ceil(
                priceRange.max
              ).toLocaleString("en-IN")}
              value={priceInput.max}
              onChange={(e) =>
                handlePriceChange(
                  "max",
                  e.target.value
                )
              }
              onKeyDown={handlePriceKeyDown}
              className="
                h-10 w-full rounded-xl
                border border-slate-200
                bg-slate-50
                pl-7 pr-2
                text-sm text-slate-900
                outline-none
                transition
                focus:border-blue-500
                focus:bg-white
                focus:ring-4
                focus:ring-blue-500/10
              "
            />
          </div>
        </div>

        {/* APPLY */}

        <button
          type="button"
          onClick={applyPriceFilter}
          className="
            mt-3 w-full rounded-xl
            bg-blue-600 py-2.5
            text-xs font-bold text-white
            transition hover:bg-blue-700
          "
        >
          Apply price
        </button>

        <p className="mt-2 text-center text-[10px] text-slate-400">
          ₹{Math.floor(priceRange.min).toLocaleString("en-IN")}
          {" — "}
          ₹{Math.ceil(priceRange.max).toLocaleString("en-IN")}
        </p>
      </div>

      <div className="h-px bg-slate-100" />

      {/* =====================================================
          AVAILABILITY
      ====================================================== */}
{/* 
      <div>
        <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-slate-900">
          Availability
        </h3>

        <button
          type="button"
          onClick={() =>
            setInStockOnly((prev) => !prev)
          }
          className="flex w-full items-center justify-between"
        >
          <span className="text-sm font-medium text-slate-600">
            In stock only
          </span>

          <span
            className={`
              flex h-5 w-5 items-center
              justify-center rounded-md border
              ${
                inStockOnly
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 bg-white"
              }
            `}
          >
            {inStockOnly && (
              <Check
                size={13}
                strokeWidth={3}
              />
            )}
          </span>
        </button>
      </div> */}

      {/* =====================================================
          CLEAR
      ====================================================== */}

      {hasFilters && (
        <>
          <div className="h-px bg-slate-100" />

          <button
            type="button"
            onClick={clearFilters}
            className="
              flex w-full items-center
              justify-center gap-2
              rounded-xl
              border border-slate-200
              bg-white px-4 py-2.5
              text-sm font-semibold
              text-slate-600
              hover:bg-slate-50
            "
          >
            <RotateCcw size={14} />
            Clear filters
          </button>
        </>
      )}
    </div>
  );
}








import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getProducts } from "../redux/slices/productSlice";
import { getCategories } from "../redux/slices/categorySlice";

import ProductGrid from "../components/products/ProductGrid";
import ProductGridSkeleton from "../components/products/ProductGridSkeleton";

import {
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
  PackageOpen,
  Search,
  Check,
  ChevronRight,
} from "lucide-react";
import PageButtons from "../components/PageButtons";

export default function Products() {
  const dispatch = useDispatch();

  // =========================================================
  // REDUX
  // =========================================================

  const {
    product = [],
    pagination ,
    loading: productsLoading,
    error: productsError,
  } = useSelector((state) => state.product);

  const {
    categories = [],
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state) => state.category);

  // =========================================================
  // STATE
  // =========================================================

  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [inStockOnly, setInStockOnly] =
    useState(false);

  // =========================================================
  // PRICE STATE
  //
  // priceInput = what user is typing
  // appliedPrice = what is actually filtering products
  // =========================================================

  const [priceInput, setPriceInput] = useState({
    min: "",
    max: "",
  });

  const [appliedPrice, setAppliedPrice] = useState({
    min: "",
    max: "",
  });

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

 useEffect(() => {
  console.log("FETCHING PAGE:", page);

  dispatch(
    getProducts({
      page,
      limit: 10,
    })
  );
}, [dispatch, page]);

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  useEffect(() => {
    if (!categories.length) {
      dispatch(
        getCategories({
          page: 1,
          limit: 100,
          isActive: true,
        })
      );
    }
  }, [dispatch, categories.length]);

  // =========================================================
  // HELPERS
  // =========================================================

  const getPrice = (item) => {
    return Number(item?.price) || 0;
  };

  // =========================================================
  // GET PRODUCT CATEGORY ID
  // =========================================================

  const getCategoryId = (product) => {
    if (!product?.category) {
      return null;
    }

    if (typeof product.category === "string") {
      return product.category;
    }

    return product.category?._id || null;
  };

  // =========================================================
  // CHECK CATEGORY + ALL PARENTS
  //
  // Example:
  //
  // Electronics
  //     ↓
  // Mobile Phones
  //     ↓
  // Smartphones
  //     ↓
  // Product
  //
  // Selecting Electronics should show this product.
  // =========================================================

  const productBelongsToCategory = (
    product,
    selectedCategoryId
  ) => {
    if (!product?.category || !selectedCategoryId) {
      return false;
    }

    // If category is only an ID, we can only check direct match
    if (typeof product.category === "string") {
      return (
        String(product.category) ===
        String(selectedCategoryId)
      );
    }

    let currentCategory = product.category;

    while (currentCategory) {
      if (
        String(currentCategory?._id) ===
        String(selectedCategoryId)
      ) {
        return true;
      }

      currentCategory = currentCategory.parent;

      // Parent can sometimes be just an ID
      if (
        currentCategory &&
        typeof currentCategory === "string"
      ) {
        return (
          String(currentCategory) ===
          String(selectedCategoryId)
        );
      }
    }

    return false;
  };

  // =========================================================
  // PRICE RANGE
  // =========================================================

  const priceRange = useMemo(() => {
    if (!product.length) {
      return {
        min: 0,
        max: 0,
      };
    }

    const prices = product
      .map(getPrice)
      .filter((price) => price >= 0);

    if (!prices.length) {
      return {
        min: 0,
        max: 0,
      };
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [product]);

  // =========================================================
  // PRICE INPUT CHANGE
  // =========================================================

  const handlePriceChange = (field, value) => {
    // Allow empty input
    if (value === "") {
      setPriceInput((prev) => ({
        ...prev,
        [field]: "",
      }));

      return;
    }

    // Only numbers
    if (!/^\d*$/.test(value)) {
      return;
    }

    setPriceInput((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =========================================================
  // APPLY PRICE
  // =========================================================

  const applyPriceFilter = () => {
    let min = priceInput.min;
    let max = priceInput.max;

    const minNumber =
      min === "" ? null : Number(min);

    const maxNumber =
      max === "" ? null : Number(max);

    // Invalid minimum
    if (
      minNumber !== null &&
      Number.isNaN(minNumber)
    ) {
      return;
    }

    // Invalid maximum
    if (
      maxNumber !== null &&
      Number.isNaN(maxNumber)
    ) {
      return;
    }

    // If min > max, don't apply
    if (
      minNumber !== null &&
      maxNumber !== null &&
      minNumber > maxNumber
    ) {
      alert("Minimum price cannot be greater than maximum price");
      return;
    }

    setAppliedPrice({
      min,
      max,
    });
  };

  // =========================================================
  // ENTER KEY FOR PRICE
  // =========================================================

  const handlePriceKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyPriceFilter();
    }
  };

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  const filteredProducts = useMemo(() => {
    let result = [...product];

    // =======================================================
    // CATEGORY
    // =======================================================

    if (selectedCategory !== "all") {
      result = result.filter((item) =>
        productBelongsToCategory(
          item,
          selectedCategory
        )
      );
    }

    // =======================================================
    // MIN PRICE
    // =======================================================

    if (appliedPrice.min !== "") {
      const min = Number(appliedPrice.min);

      if (!Number.isNaN(min)) {
        result = result.filter(
          (item) => getPrice(item) >= min
        );
      }
    }

    // =======================================================
    // MAX PRICE
    // =======================================================

    if (appliedPrice.max !== "") {
      const max = Number(appliedPrice.max);

      if (!Number.isNaN(max)) {
        result = result.filter(
          (item) => getPrice(item) <= max
        );
      }
    }

    // =======================================================
    // STOCK
    // =======================================================

    if (inStockOnly) {
      result = result.filter(
        (item) => Number(item?.stock) > 0
      );
    }

    // =======================================================
    // SORT
    // =======================================================

    if (sort === "price-low") {
      result.sort(
        (a, b) => getPrice(a) - getPrice(b)
      );
    }

    if (sort === "price-high") {
      result.sort(
        (a, b) => getPrice(b) - getPrice(a)
      );
    }

    if (sort === "name") {
      result.sort((a, b) =>
        (a.name || "").localeCompare(
          b.name || ""
        )
      );
    }

    if (sort === "latest") {
      result.sort((a, b) => {
        const dateA = new Date(
          a.createdAt || 0
        ).getTime();

        const dateB = new Date(
          b.createdAt || 0
        ).getTime();

        return dateB - dateA;
      });
    }

    return result;
  }, [
    product,
    selectedCategory,
    appliedPrice,
    inStockOnly,
    sort,
  ]);

  // =========================================================
  // SELECTED CATEGORY NAME
  // =========================================================

  const selectedCategoryName = useMemo(() => {
    if (selectedCategory === "all") {
      return null;
    }

    return (
      categories.find(
        (category) =>
          String(category._id) ===
          String(selectedCategory)
      )?.name || "Category"
    );
  }, [
    categories,
    selectedCategory,
  ]);

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSelectedCategory("all");

    setPriceInput({
      min: "",
      max: "",
    });

    setAppliedPrice({
      min: "",
      max: "",
    });

    setInStockOnly(false);
  };

  const clearMinPrice = () => {
    setPriceInput((prev) => ({
      ...prev,
      min: "",
    }));

    setAppliedPrice((prev) => ({
      ...prev,
      min: "",
    }));
  };

  const clearMaxPrice = () => {
    setPriceInput((prev) => ({
      ...prev,
      max: "",
    }));

    setAppliedPrice((prev) => ({
      ...prev,
      max: "",
    }));
  };

  const hasFilters =
    selectedCategory !== "all" ||
    appliedPrice.min !== "" ||
    appliedPrice.max !== "" ||
    inStockOnly;

  
  
console.log("page",page)
console.log("productspage",product)
  // =========================================================
  // LOADING / ERROR
  // =========================================================

  const loading =
    productsLoading || categoriesLoading;

  const error =
    productsError || categoriesError;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="min-h-screen bg-[#f7f8fa]">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-2 pt-6 text-xs">
            <span className="font-medium text-slate-400">
              Home
            </span>

            <ChevronRight
              size={13}
              className="text-slate-300"
            />

            <span className="font-semibold text-slate-700">
              Products
            </span>
          </div>

          <div className="flex flex-col gap-6 pb-8 pt-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
                  Store collection
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Explore products
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Find products you'll love, with carefully
                selected items for every need.
              </p>
            </div>

            {/* <div className="flex items-center gap-5 self-start lg:self-auto">

              <div>
                <p className="text-xl font-black text-slate-950">
                  {product.length}
                </p>

                <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                  Products
                </p>
              </div>

              <div className="h-9 w-px bg-slate-200" />

              <div>
                <p className="text-xl font-black text-slate-950">
                  {categories.length}
                </p>

                <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                  Categories
                </p>
              </div>

            </div> */}
          </div>
        </div>
      </section>

      {/* =====================================================
          MOBILE FILTER
      ====================================================== */}

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">

          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() =>
              setMobileFiltersOpen(false)
            }
          />

          <div className="
            absolute bottom-0 left-0 right-0
            max-h-[90vh] overflow-y-auto
            rounded-t-[28px] bg-white
            p-6 shadow-2xl
          ">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Filters
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Refine your results
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMobileFiltersOpen(false)
                }
                className="
                  flex h-9 w-9 items-center
                  justify-center rounded-full
                  bg-slate-100 text-slate-600
                "
              >
                <X size={18} />
              </button>
            </div>

            <FilterContent
  categories={categories}
  categoriesLoading={categoriesLoading}
  product={product}
  selectedCategory={selectedCategory}
  setSelectedCategory={setSelectedCategory}
  priceRange={priceRange}
  priceInput={priceInput}
  setPriceInput={setPriceInput}
  appliedPrice={appliedPrice}
  setAppliedPrice={setAppliedPrice}
  applyPriceFilter={applyPriceFilter}
  inStockOnly={inStockOnly}
  setInStockOnly={setInStockOnly}
  clearFilters={clearFilters}
  hasFilters={hasFilters}
/>

            <button
              type="button"
              onClick={() =>
                setMobileFiltersOpen(false)
              }
              className="
                mt-7 w-full rounded-xl
                bg-slate-950 py-3
                text-sm font-bold text-white
                hover:bg-blue-600
              "
            >
              Show {filteredProducts.length} products
            </button>

          </div>
        </div>
      )}

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">

          {/* SIDEBAR */}

          <aside className="hidden lg:block">

            <div className="
              sticky top-6
              rounded-2xl
              border border-slate-200
              bg-white p-5
            ">

              <div className="mb-6 flex items-start justify-between">

                <div>
                  <h2 className="text-sm font-black text-slate-950">
                    Filters
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Refine your results
                  </p>
                </div>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-semibold text-blue-600"
                  >
                    Clear
                  </button>
                )}

              </div>

             <FilterContent
  categories={categories}
  categoriesLoading={categoriesLoading}
  product={product}
  selectedCategory={selectedCategory}
  setSelectedCategory={setSelectedCategory}
  priceRange={priceRange}
  priceInput={priceInput}
  setPriceInput={setPriceInput}
  appliedPrice={appliedPrice}
  setAppliedPrice={setAppliedPrice}
  applyPriceFilter={applyPriceFilter}
  inStockOnly={inStockOnly}
  setInStockOnly={setInStockOnly}
  clearFilters={clearFilters}
  hasFilters={hasFilters}
/>


            </div>

          </aside>

          {/* PRODUCT AREA */}

          <div className="min-w-0">

            {/* TOOLBAR */}

            <div className="
              mb-6
              rounded-2xl
              border border-slate-200
              bg-white
              p-3 sm:p-4
            ">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <div className="
                    flex h-10 w-10
                    items-center justify-center
                    rounded-xl bg-blue-50
                    text-blue-600
                  ">
                    <PackageOpen size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      {filteredProducts.length}{" "}
                      {filteredProducts.length === 1
                        ? "product"
                        : "products"}
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Showing available items
                    </p>
                  </div>

                </div>

                <div className="flex gap-2">

                  {/* MOBILE FILTER */}

                  <button
                    type="button"
                    onClick={() =>
                      setMobileFiltersOpen(true)
                    }
                    className="
                      flex h-10 flex-1
                      items-center justify-center
                      gap-2 rounded-xl
                      border border-slate-200
                      bg-white px-4
                      text-sm font-semibold
                      text-slate-700
                      sm:flex-none lg:hidden
                    "
                  >
                    <SlidersHorizontal size={16} />
                    Filters

                    {hasFilters && (
                      <span className="
                        flex h-5 min-w-5
                        items-center justify-center
                        rounded-full bg-blue-600
                        px-1 text-[10px]
                        font-bold text-white
                      ">
                        !
                      </span>
                    )}
                  </button>

                  {/* SORT */}

                  <div className="relative flex-1 sm:flex-none">

                    <select
                      value={sort}
                      onChange={(e) =>
                        setSort(e.target.value)
                      }
                      className="
                        h-10 w-full
                        appearance-none
                        rounded-xl
                        border border-slate-200
                        bg-white
                        pl-4 pr-10
                        text-sm font-semibold
                        text-slate-700
                        outline-none
                        focus:border-blue-500
                        sm:w-[200px]
                      "
                    >
                      <option value="latest">
                        Newest first
                      </option>

                      <option value="price-low">
                        Price: Low to High
                      </option>

                      <option value="price-high">
                        Price: High to Low
                      </option>

                      <option value="name">
                        Name: A to Z
                      </option>
                    </select>

                    <ChevronDown
                      size={15}
                      className="
                        pointer-events-none
                        absolute right-3
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

                  </div>
                </div>
              </div>

              {/* ACTIVE FILTERS */}

              {hasFilters && (
                <div className="
                  mt-3 flex flex-wrap
                  items-center gap-2
                  border-t border-slate-100
                  pt-3
                ">

                  <span className="text-[11px] font-semibold text-slate-400">
                    Active:
                  </span>

                  {/* CATEGORY */}

                  {selectedCategory !== "all" && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedCategory("all")
                      }
                      className="
                        inline-flex items-center
                        gap-1.5 rounded-full
                        bg-blue-50 px-3 py-1.5
                        text-xs font-semibold
                        text-blue-700
                      "
                    >
                      {selectedCategoryName}
                      <X size={12} />
                    </button>
                  )}

                  {/* MIN */}

                  {appliedPrice.min !== "" && (
                    <button
                      type="button"
                      onClick={clearMinPrice}
                      className="
                        inline-flex items-center
                        gap-1.5 rounded-full
                        bg-blue-50 px-3 py-1.5
                        text-xs font-semibold
                        text-blue-700
                      "
                    >
                      Min ₹
                      {Number(
                        appliedPrice.min
                      ).toLocaleString("en-IN")}
                      <X size={12} />
                    </button>
                  )}

                  {/* MAX */}

                  {appliedPrice.max !== "" && (
                    <button
                      type="button"
                      onClick={clearMaxPrice}
                      className="
                        inline-flex items-center
                        gap-1.5 rounded-full
                        bg-blue-50 px-3 py-1.5
                        text-xs font-semibold
                        text-blue-700
                      "
                    >
                      Max ₹
                      {Number(
                        appliedPrice.max
                      ).toLocaleString("en-IN")}
                      <X size={12} />
                    </button>
                  )}

                  {/* STOCK */}

                  {inStockOnly && (
                    <button
                      type="button"
                      onClick={() =>
                        setInStockOnly(false)
                      }
                      className="
                        inline-flex items-center
                        gap-1.5 rounded-full
                        bg-emerald-50 px-3 py-1.5
                        text-xs font-semibold
                        text-emerald-700
                      "
                    >
                      In stock
                      <X size={12} />
                    </button>
                  )}

                </div>
              )}

            </div>

            {/* STATES */}

            {loading ? (

              <ProductGridSkeleton count={12} />

            ) : error ? (

              <div className="
                rounded-2xl
                border border-red-100
                bg-white px-6 py-20
                text-center
              ">

                <div className="
                  mx-auto flex h-14 w-14
                  items-center justify-center
                  rounded-2xl bg-red-50
                  text-red-500
                ">
                  <RotateCcw size={22} />
                </div>

                <h2 className="mt-5 text-lg font-bold text-slate-950">
                  Something went wrong
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  We couldn't load the catalog right now.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    dispatch(getProducts());

                    dispatch(
                      getCategories({
                        page: 1,
                        limit: 100,
                        isActive: true,
                      })
                    );
                  }}
                  className="
                    mt-5 rounded-xl
                    bg-slate-950 px-5 py-2.5
                    text-sm font-bold text-white
                  "
                >
                  Try again
                </button>

              </div>

            ) : filteredProducts.length === 0 ? (

              <div className="
                rounded-2xl
                border border-slate-200
                bg-white px-6 py-20
                text-center
              ">

                <div className="
                  mx-auto flex h-16 w-16
                  items-center justify-center
                  rounded-2xl bg-slate-100
                  text-slate-400
                ">
                  <Search size={25} />
                </div>

                <h2 className="mt-5 text-lg font-bold text-slate-950">
                  No products found
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Try adjusting your filters.
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="
                      mt-5 inline-flex
                      items-center gap-2
                      rounded-xl
                      bg-slate-950 px-5 py-2.5
                      text-sm font-bold text-white
                    "
                  >
                    <RotateCcw size={15} />
                    Clear filters
                  </button>
                )}

              </div>

            ) : (

              <ProductGrid
                products={filteredProducts}
              />

            )}

          </div>
        </div>
        {/* <PageButtons  page={page}
      totalPages={10}
      onPageChange={setPage} /> */}
      </section>
      <PageButtons  page={page}
      totalPages={pagination.totalPages}
      onPageChange={setPage} />
    </main>
  );
}

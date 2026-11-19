import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

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
  ChevronRight,
} from "lucide-react";

import PageButtons from "../components/PageButtons";

/* =========================================================
   CONSTANTS
========================================================= */

const PRODUCTS_PER_PAGE = 10;

/* =========================================================
   CATEGORY HELPERS
========================================================= */

/**
 * Get category ID from:
 *
 * "123"
 *
 * OR
 *
 * {
 *   _id: "123",
 *   name: "Fashion"
 * }
 */
const getCategoryId = (category) => {
  if (!category) {
    return null;
  }

  if (typeof category === "string") {
    return category;
  }

  return (
    category._id ||
    category.id ||
    null
  );
};

/**
 * Get parent ID from:
 *
 * parent: "123"
 *
 * OR
 *
 * parent: {
 *   _id: "123"
 * }
 *
 * OR
 *
 * parentId: "123"
 */
const getParentId = (category) => {
  if (!category) {
    return null;
  }

  const parent =
    category.parent ??
    category.parentId ??
    null;

  if (!parent) {
    return null;
  }

  if (typeof parent === "string") {
    return parent;
  }

  return (
    parent._id ||
    parent.id ||
    null
  );
};

/**
 * Get all category IDs under a selected category.
 *
 * Example:
 *
 * Fashion
 *   ├── Men
 *   │    ├── T-Shirts
 *   │    └── Jeans
 *   │
 *   └── Women
 *        ├── Dresses
 *        └── Tops
 *
 * Selecting Fashion returns:
 *
 * Fashion
 * Men
 * T-Shirts
 * Jeans
 * Women
 * Dresses
 * Tops
 *
 * This works with unlimited category levels.
 */
const getDescendantCategoryIds = (
  selectedCategoryOrSlug,
  categories
) => {
  const ids = new Set();

  if (!selectedCategoryOrSlug || selectedCategoryOrSlug === "all") {
    return ids;
  }

  // Find target category by _id, slug, or name (case-insensitive)
  const target = Array.isArray(categories)
    ? categories.find(
        (c) =>
          String(c._id) === String(selectedCategoryOrSlug) ||
          String(c.slug || "").toLowerCase() === String(selectedCategoryOrSlug).toLowerCase() ||
          String(c.name || "").toLowerCase() === String(selectedCategoryOrSlug).toLowerCase()
      )
    : null;

  const primaryId = target ? String(target._id) : String(selectedCategoryOrSlug);
  ids.add(primaryId);
  if (target?.slug) ids.add(String(target.slug).toLowerCase());

  let changed = true;

  while (changed) {
    changed = false;

    categories.forEach((category) => {
      const categoryId =
        getCategoryId(category);

      const parentId =
        getParentId(category);

      if (
        !categoryId ||
        !parentId
      ) {
        return;
      }

      if (
        ids.has(String(parentId)) &&
        !ids.has(String(categoryId))
      ) {
        ids.add(
          String(categoryId)
        );
        if (category.slug) {
          ids.add(String(category.slug).toLowerCase());
        }

        changed = true;
      }
    });
  }

  return ids;
};

/**
 * Get the direct category ID from a product.
 *
 * Supports:
 *
 * product.category = "123"
 *
 * OR
 *
 * product.category = {
 *   _id: "123"
 * }
 */
const getProductCategoryId = (
  product
) => {
  if (!product?.category) {
    return null;
  }

  return getCategoryId(
    product.category
  );
};

/* =========================================================
   FILTER CONTENT
========================================================= */

function FilterContent({
  categories,
  categoriesLoading,
  product,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  priceInput,
  setPriceInput,
  setAppliedPrice,
  applyPriceFilter,
  clearFilters,
  hasFilters,
}) {
  // Pre-expand all root categories by default so subcategories are rendered in SSR HTML & visible on mount!
  const [expandedCategories, setExpandedCategories] = useState(() => {
    const initial = {};
    if (Array.isArray(categories)) {
      categories.forEach((cat) => {
        if (!getParentId(cat)) {
          initial[String(cat._id)] = true;
        }
      });
    }
    return initial;
  });

  // Calculate product counts for every category and its descendants
  const categoryCounts = useMemo(() => {
    const counts = {};
    if (!Array.isArray(categories) || !Array.isArray(product)) return counts;

    categories.forEach((cat) => {
      const descIds = getDescendantCategoryIds(cat._id, categories);
      const count = product.filter((p) => {
        const pCatId = getProductCategoryId(p);
        const pSlug = p?.category?.slug;
        const pParentId = getParentId(p?.category);
        return (
          (pCatId && descIds.has(String(pCatId))) ||
          (pSlug && descIds.has(String(pSlug).toLowerCase())) ||
          (pParentId && descIds.has(String(pParentId)))
        );
      }).length;
      counts[String(cat._id)] = count;
    });

    return counts;
  }, [categories, product]);

  // Whenever selectedCategory changes or categories load, auto-expand its entire ancestor chain
  useEffect(() => {
    if (!selectedCategory || selectedCategory === "all" || !Array.isArray(categories) || !categories.length) {
      return;
    }

    const toExpand = {};
    let currentId = selectedCategory;

    toExpand[String(currentId)] = true;

    while (currentId) {
      const currentCat = categories.find(
        (c) =>
          String(c._id) === String(currentId) ||
          String(c.slug || "").toLowerCase() === String(currentId).toLowerCase()
      );
      if (!currentCat) break;
      const parentId = getParentId(currentCat);
      if (parentId) {
        toExpand[String(parentId)] = true;
        currentId = parentId;
      } else {
        break;
      }
    }

    setExpandedCategories((prev) => ({
      ...prev,
      ...toExpand,
    }));
  }, [selectedCategory, categories]);

  /* =========================================================
     PRICE INPUT
  ========================================================= */

  const handlePriceChange = (
    field,
    value
  ) => {
    if (value === "") {
      setPriceInput((prev) => ({
        ...prev,
        [field]: "",
      }));

      return;
    }

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

  /* =========================================================
     GET CHILDREN
  ========================================================= */

  const getChildren = (parentId) => {
    return categories.filter(
      (category) => {
        const categoryParentId =
          getParentId(category);

        return (
          categoryParentId &&
          String(categoryParentId) ===
            String(parentId)
        );
      }
    );
  };

  /* =========================================================
     ROOT CATEGORIES
  ========================================================= */

  const categoryIdSet = useMemo(
    () => new Set(categories.map((c) => String(c._id))),
    [categories]
  );

  const rootCategories = useMemo(() => {
    return categories.filter((category) => {
      const pId = getParentId(category);
      return !pId || !categoryIdSet.has(String(pId));
    });
  }, [categories, categoryIdSet]);

  /* =========================================================
     TOGGLE CATEGORY
  ========================================================= */

  const toggleCategory = (
    categoryId,
    e
  ) => {
    if (e) {
      e.stopPropagation?.();
    }
    setExpandedCategories(
      (prev) => ({
        ...prev,
        [String(categoryId)]:
          !prev[String(categoryId)],
      })
    );
  };

  /* =========================================================
     SELECT CATEGORY
  ========================================================= */

  const selectCategory = (
    categoryId
  ) => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    setExpandedCategories((prev) => ({
      ...prev,
      [String(categoryId)]: true,
    }));

    setSelectedCategory(
      categoryId
    );
  };

  /* =========================================================
     RECURSIVE CATEGORY TREE
  ========================================================= */

  const renderCategoryTree = (
    category,
    level = 0
  ) => {
    const children =
      getChildren(
        category._id
      );

    const hasChildren =
      children.length > 0;

    const isExpanded =
      expandedCategories[
        String(category._id)
      ] === true;

    const active =
      String(
        selectedCategory
      ) ===
      String(category._id) ||
      (category.slug &&
        String(selectedCategory).toLowerCase() ===
          String(category.slug).toLowerCase());

    const count = categoryCounts[String(category._id)] ?? 0;

    return (
      <div key={category._id} className="category-tree-item">
        {/* =================================================
            CATEGORY ROW
        ================================================= */}

        <div
          className={`
            flex w-full items-center justify-between
            rounded-xl transition group
            ${
              active
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                : "text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800"
            }
          `}
        >
          {/* CATEGORY NAME & COUNT */}

          <button
            type="button"
            onClick={() =>
              selectCategory(
                category._id
              )
            }
            className={`
              flex min-w-0 flex-1
              items-center justify-between
              text-left text-sm
              ${
                level === 0
                  ? "px-3.5 py-2.5"
                  : "px-3 py-2"
              }
            `}
            style={{
              paddingLeft:
                level === 0
                  ? undefined
                  : `${12 + level * 14}px`,
            }}
          >
            <div className="flex items-center min-w-0 truncate">
              {level > 0 && (
                <span className="mr-2 text-slate-300 dark:text-gray-600">
                  —
                </span>
              )}

              <span
                className={`truncate ${
                  active
                    ? "font-semibold text-blue-700 dark:text-blue-300"
                    : "font-medium"
                }`}
              >
                {category.name}
              </span>
            </div>

            <span
              className={`ml-2 text-xs font-normal tabular-nums ${
                active
                  ? "text-blue-500 dark:text-blue-300"
                  : "text-slate-400 dark:text-gray-500"
              }`}
            >
              {count}
            </span>
          </button>

          {/* EXPAND BUTTON */}

          {hasChildren && (
            <button
              type="button"
              onClick={(e) =>
                toggleCategory(
                  category._id,
                  e
                )
              }
              className="
                flex h-9 w-9
                shrink-0
                items-center justify-center
                rounded-lg
                text-slate-400
                hover:text-slate-700 dark:hover:text-gray-200
              "
              aria-label={`Toggle ${category.name}`}
            >
              <ChevronDown
                size={15}
                className={`
                  transition-transform duration-200
                  ${
                    isExpanded
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>
          )}
        </div>

        {/* =================================================
            CHILDREN
        ================================================= */}

        {hasChildren &&
          isExpanded && (
            <div
              className={`
                ${
                  level === 0
                    ? "ml-3 border-l border-slate-100 dark:border-gray-800"
                    : "ml-4 border-l border-slate-100 dark:border-gray-800"
                }
              `}
            >
              {children.map(
                (child) =>
                  renderCategoryTree(
                    child,
                    level + 1
                  )
              )}
            </div>
          )}
      </div>
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

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

          {selectedCategory !==
            "all" && (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }

                setSelectedCategory(
                  "all"
                );
              }}
              className="text-xs font-semibold text-blue-600"
            >
              Reset
            </button>
          )}
        </div>

        {categoriesLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-10 animate-pulse rounded-xl bg-slate-100"
                />
              )
            )}
          </div>
        ) : (
          <div
            className="
              max-h-[320px]
              overflow-y-auto
              space-y-1
              pr-2

              [&::-webkit-scrollbar]:w-1
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-slate-200
              hover:[&::-webkit-scrollbar-thumb]:bg-slate-400
            "
          >
            {/* =================================================
                ALL PRODUCTS
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                selectCategory(
                  "all"
                )
              }
              className={`
                group flex w-full items-center
                justify-between rounded-xl
                px-3.5 py-2.5
                text-left text-sm transition
                ${
                  selectedCategory ===
                  "all"
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                    : "text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800"
                }
              `}
            >
              <span
                className={
                  selectedCategory ===
                  "all"
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

            {/* =================================================
                CATEGORY TREE
            ================================================= */}

            {rootCategories.map(
              (category) =>
                renderCategoryTree(
                  category
                )
            )}
          </div>
        )}
      </div>

      <div className="h-px bg-slate-100 dark:bg-gray-800" />

      {/* =====================================================
          PRICE
      ====================================================== */}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-900 dark:text-white">
            Price range
          </h3>

          {(priceInput.min !==
            "" ||
            priceInput.max !==
              "") && (
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
              placeholder={
                priceRange.min
                  ? Math.floor(
                      priceRange.min
                    ).toLocaleString(
                      "en-IN"
                    )
                  : "Min"
              }
              value={
                priceInput.min
              }
              onChange={(e) =>
                handlePriceChange(
                  "min",
                  e.target.value
                )
              }
              onKeyDown={
                handlePriceKeyDown
              }
              className="
                h-10 w-full rounded-xl
                border border-slate-200 dark:border-gray-700
                bg-slate-50 dark:bg-gray-800
                pl-7 pr-2
                text-sm text-slate-900 dark:text-white
                outline-none
                transition
                focus:border-blue-500
                focus:bg-white dark:focus:bg-gray-800
                focus:ring-4
                focus:ring-blue-500/10
              "
            />
          </div>

          <span className="text-slate-300">
            —
          </span>

          {/* MAX */}

          <div className="relative min-w-0 flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              ₹
            </span>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder={
                priceRange.max
                  ? Math.ceil(
                      priceRange.max
                    ).toLocaleString(
                      "en-IN"
                    )
                  : "Max"
              }
              value={
                priceInput.max
              }
              onChange={(e) =>
                handlePriceChange(
                  "max",
                  e.target.value
                )
              }
              onKeyDown={
                handlePriceKeyDown
              }
              className="
                h-10 w-full rounded-xl
                border border-slate-200 dark:border-gray-700
                bg-slate-50 dark:bg-gray-800
                pl-7 pr-2
                text-sm text-slate-900 dark:text-white
                outline-none
                transition
                focus:border-blue-500
                focus:bg-white dark:focus:bg-gray-800
                focus:ring-4
                focus:ring-blue-500/10
              "
            />
          </div>
        </div>

        {/* APPLY */}

        <button
          type="button"
          onClick={
            applyPriceFilter
          }
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
          ₹
          {Math.floor(
            priceRange.min
          ).toLocaleString(
            "en-IN"
          )}
          {" — "}
          ₹
          {Math.ceil(
            priceRange.max
          ).toLocaleString(
            "en-IN"
          )}
        </p>
      </div>

      {/* =====================================================
          CLEAR
      ====================================================== */}

      {hasFilters && (
        <>
          <div className="h-px bg-slate-100" />

          <button
            type="button"
            onClick={
              clearFilters
            }
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

/* =========================================================
   PRODUCTS PAGE
========================================================= */

export default function Products() {
  const dispatch = useDispatch();

  /* =========================================================
     REDUX
  ========================================================= */

  const {
    product = [],
    pagination = {},
    loading: productsLoading,
    error: productsError,
  } = useSelector(
    (state) => state.product
  );

  const {
    categories = [],
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector(
    (state) => state.category
  );

  /* =========================================================
     STATE
  ========================================================= */

  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [sort, setSort] =
    useState("latest");

  const [page, setPage] =
    useState(1);

  const [
    mobileFiltersOpen,
    setMobileFiltersOpen,
  ] = useState(false);

  // Sync selectedCategory with category from URL query param (slug or ID)
  const selectedCategory = useMemo(() => {
    if (!categoryParam || categoryParam === "all") return "all";

    const matched = categories.find(
      (c) =>
        String(c._id) === String(categoryParam) ||
        String(c.slug || "").toLowerCase() === String(categoryParam).toLowerCase() ||
        String(c.name || "").toLowerCase() === String(categoryParam).toLowerCase()
    );

    return matched ? String(matched._id) : categoryParam;
  }, [categoryParam, categories]);

  const [priceInput, setPriceInput] =
    useState({
      min: "",
      max: "",
    });

  const [
    appliedPrice,
    setAppliedPrice,
  ] = useState({
    min: "",
    max: "",
  });

  /* =========================================================
     FETCH ALL PRODUCTS ONCE
     
     IMPORTANT:
     
     Category + price filtering is now FRONTEND ONLY.
     
     Therefore changing:
     
     category
     price
     sort
     
     does NOT call the API again.
  ========================================================= */

  useEffect(() => {
    if (product.length === 0 || pagination?.limit !== 1000) {
      dispatch(
        getProducts({
          page: 1,
          limit: 1000,
        })
      );
    }
  }, [dispatch, product.length, pagination?.limit]);

  /* =========================================================
     FETCH CATEGORIES
  ========================================================= */

  useEffect(() => {
    const hasSubcategories = categories.some((c) => Boolean(c.parent || c.parentId));
    if (!categories.length || !hasSubcategories) {
      dispatch(
        getCategories({
          page: 1,
          limit: 1000,
          isActive: true,
        })
      );
    }
  }, [
    dispatch,
    categories,
  ]);

  /* =========================================================
     GET PRICE
  ========================================================= */

  const getPrice = (item) => {
    return (
      Number(item?.price) || 0
    );
  };

  /* =========================================================
     GLOBAL PRICE RANGE
     
     IMPORTANT:
     
     This uses ALL PRODUCTS, not filtered products.
     
     Therefore the price range doesn't jump around when
     the user changes category.
  ========================================================= */

  const priceRange = useMemo(() => {
    if (!product.length) {
      return {
        min: 0,
        max: 0,
      };
    }

    const prices = product
      .map(getPrice)
      .filter(
        (price) => price >= 0
      );

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

  /* =========================================================
     SELECTED CATEGORY DESCENDANTS
     
     Example:
     
     Selected:
     
     Fashion
     
     categoryIds becomes:
     
     Fashion
     Men
     T-Shirts
     Jeans
     Women
     Dresses
     
     Therefore selecting Fashion shows products from all
     children as well.
  ========================================================= */

  const selectedCategoryIds =
    useMemo(() => {
      if (
        selectedCategory ===
        "all"
      ) {
        return null;
      }

      return getDescendantCategoryIds(
        selectedCategory,
        categories
      );
    }, [
      selectedCategory,
      categories,
    ]);

  /* =========================================================
     FRONTEND FILTERING
     
     FLOW:
     
     ALL PRODUCTS
          ↓
     CATEGORY
          ↓
     PRICE
          ↓
     SORT
          ↓
     PAGINATION
  ========================================================= */

  const filteredProducts =
    useMemo(() => {
      let result = [...product];

      /* =====================================================
         CATEGORY FILTER
      ===================================================== */

      if (
        selectedCategory !==
        "all"
      ) {
        const categoryIds =
          selectedCategoryIds ||
          new Set();

        result = result.filter(
          (item) => {
            const productCategoryId =
              getProductCategoryId(
                item
              );
            const productCategorySlug =
              item?.category?.slug;
            const parentId =
              getParentId(
                item?.category
              );

            if (
              !productCategoryId &&
              !productCategorySlug
            ) {
              return false;
            }

            return (
              (productCategoryId &&
                categoryIds.has(
                  String(
                    productCategoryId
                  )
                )) ||
              (productCategorySlug &&
                categoryIds.has(
                  String(
                    productCategorySlug
                  ).toLowerCase()
                )) ||
              (parentId &&
                categoryIds.has(
                  String(
                    parentId
                  )
                ))
            );
          }
        );
      }

      /* =====================================================
         MIN PRICE
      ===================================================== */

      if (
        appliedPrice.min !==
        ""
      ) {
        const minPrice =
          Number(
            appliedPrice.min
          );

        result = result.filter(
          (item) =>
            getPrice(item) >=
            minPrice
        );
      }

      /* =====================================================
         MAX PRICE
      ===================================================== */

      if (
        appliedPrice.max !==
        ""
      ) {
        const maxPrice =
          Number(
            appliedPrice.max
          );

        result = result.filter(
          (item) =>
            getPrice(item) <=
            maxPrice
        );
      }

      /* =====================================================
         SORT
         
         We are sorting a COPY of product because:
         
         [...product]
         
         prevents mutation of the Redux state.
      ===================================================== */

      switch (sort) {
        case "price-low":
          result.sort(
            (a, b) =>
              getPrice(a) -
              getPrice(b)
          );
          break;

        case "price-high":
          result.sort(
            (a, b) =>
              getPrice(b) -
              getPrice(a)
          );
          break;

        case "name":
          result.sort(
            (a, b) =>
              String(
                a?.name || ""
              ).localeCompare(
                String(
                  b?.name || ""
                )
              )
          );
          break;

        case "latest":
        default:
          result.sort(
            (a, b) =>
              new Date(
                b?.createdAt || 0
              ) -
              new Date(
                a?.createdAt || 0
              )
          );
          break;
      }

      return result;
    }, [
      product,
      selectedCategory,
      selectedCategoryIds,
      appliedPrice.min,
      appliedPrice.max,
      sort,
    ]);

  /* =========================================================
     FRONTEND PAGINATION
     
     IMPORTANT:
     
     Pagination happens AFTER filtering.
     
     Example:
     
     100 products
          ↓
     Fashion
          ↓
     36 products
          ↓
     Price
          ↓
     14 products
          ↓
     10 per page
          ↓
     2 pages
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length /
        PRODUCTS_PER_PAGE
    )
  );

  /* =========================================================
     PAGINATED PRODUCTS
  ========================================================= */

  const paginatedProducts =
    useMemo(() => {
      const startIndex =
        (page - 1) *
        PRODUCTS_PER_PAGE;

      return filteredProducts.slice(
        startIndex,
        startIndex +
          PRODUCTS_PER_PAGE
      );
    }, [
      filteredProducts,
      page,
    ]);

  /* =========================================================
     PROTECT AGAINST INVALID PAGE
     
     Example:
     
     User is on page 5.
     
     Then applies a filter and only 2 pages remain.
     
     Move them automatically to page 2.
  ========================================================= */

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [
    page,
    totalPages,
  ]);

  /* =========================================================
     PRICE INPUT
  ========================================================= */

  const handlePriceChange = (
    field,
    value
  ) => {
    if (value === "") {
      setPriceInput((prev) => ({
        ...prev,
        [field]: "",
      }));

      return;
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    setPriceInput((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =========================================================
     APPLY PRICE FILTER
  ========================================================= */

  const applyPriceFilter = () => {
    const min =
      priceInput.min;

    const max =
      priceInput.max;

    const minNumber =
      min === ""
        ? null
        : Number(min);

    const maxNumber =
      max === ""
        ? null
        : Number(max);

    if (
      minNumber !== null &&
      Number.isNaN(minNumber)
    ) {
      return;
    }

    if (
      maxNumber !== null &&
      Number.isNaN(maxNumber)
    ) {
      return;
    }

    if (
      minNumber !== null &&
      maxNumber !== null &&
      minNumber > maxNumber
    ) {
      alert(
        "Minimum price cannot be greater than maximum price"
      );

      return;
    }

    setPage(1);

    setAppliedPrice({
      min,
      max,
    });
  };

  /* =========================================================
     CATEGORY CHANGE
  ========================================================= */

  const handleCategoryChange = (
    categoryId
  ) => {
    setPage(1);

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (!categoryId || categoryId === "all") {
          next.delete("category");
        } else {
          const cat = categories.find((c) => String(c._id) === String(categoryId));
          next.set("category", cat?.slug || categoryId);
        }
        return next;
      },
      { replace: true }
    );

    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /* =========================================================
     SORT CHANGE
  ========================================================= */

  const handleSortChange = (
    value
  ) => {
    setPage(1);

    setSort(value);
  };

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {
    setPage(1);

    setPriceInput({
      min: "",
      max: "",
    });

    setAppliedPrice({
      min: "",
      max: "",
    });

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("category");
        return next;
      },
      { replace: true }
    );

    setSort("latest");
  };

  /* =========================================================
     CLEAR MIN PRICE
  ========================================================= */

  const clearMinPrice = () => {
    setPage(1);

    setPriceInput((prev) => ({
      ...prev,
      min: "",
    }));

    setAppliedPrice((prev) => ({
      ...prev,
      min: "",
    }));
  };

  /* =========================================================
     CLEAR MAX PRICE
  ========================================================= */

  const clearMaxPrice = () => {
    setPage(1);

    setPriceInput((prev) => ({
      ...prev,
      max: "",
    }));

    setAppliedPrice((prev) => ({
      ...prev,
      max: "",
    }));
  };

  /* =========================================================
     SELECTED CATEGORY NAME
  ========================================================= */

  const selectedCategoryName =
    useMemo(() => {
      if (
        selectedCategory ===
        "all"
      ) {
        return null;
      }

      return (
        categories.find(
          (category) =>
            String(
              category._id
            ) ===
            String(
              selectedCategory
            )
        )?.name ||
        "Category"
      );
    }, [
      categories,
      selectedCategory,
    ]);

  /* =========================================================
     HAS FILTERS
     
     ONLY:
     
     Category
     Price
  ========================================================= */

  const hasFilters =
    selectedCategory !==
      "all" ||
    appliedPrice.min !==
      "" ||
    appliedPrice.max !==
      "";

  /* =========================================================
     LOADING / ERROR
  ========================================================= */

  const loading =
    (productsLoading || categoriesLoading) && product.length === 0;

  const error =
    productsError ||
    categoriesError;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#f7f8fa] dark:bg-gray-950 dark:text-gray-100">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-2 pt-6 text-xs">
            <span className="font-medium text-slate-400">
              Home
            </span>

            <ChevronRight
              size={13}
              className="text-slate-300"
            />

            <span className="font-semibold text-slate-700 dark:text-gray-200">
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

              <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-4xl">
                Explore products
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-gray-400 sm:text-base">
                Find products you'll love, with carefully
                selected items for every need.
              </p>
            </div>
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
              setMobileFiltersOpen(
                false
              )
            }
          />

          <div
            className="
              absolute bottom-0 left-0 right-0
              max-h-[90vh] overflow-y-auto
              rounded-t-[28px] bg-white dark:bg-gray-900 dark:border-t dark:border-gray-800
              p-6 shadow-2xl
            "
          >
            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-lg font-black text-slate-950 dark:text-white">
                  Filters
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Refine your results
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMobileFiltersOpen(
                    false
                  )
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
              categories={
                categories
              }
              categoriesLoading={
                categoriesLoading
              }
              product={product}
              selectedCategory={
                selectedCategory
              }
              setSelectedCategory={
                handleCategoryChange
              }
              priceRange={
                priceRange
              }
              priceInput={
                priceInput
              }
              setPriceInput={
                setPriceInput
              }
              appliedPrice={
                appliedPrice
              }
              setAppliedPrice={
                setAppliedPrice
              }
              applyPriceFilter={
                applyPriceFilter
              }
              clearFilters={
                clearFilters
              }
              hasFilters={
                hasFilters
              }
            />

            <button
              type="button"
              onClick={() =>
                setMobileFiltersOpen(
                  false
                )
              }
              className="
                mt-7 w-full rounded-xl
                bg-slate-950 py-3
                text-sm font-bold text-white
                hover:bg-blue-600
              "
            >
              Show{" "}
              {filteredProducts.length}{" "}
              {filteredProducts.length ===
              1
                ? "product"
                : "products"}
            </button>

          </div>
        </div>
      )}

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="hidden lg:block">

            <div
              className="
                sticky top-6
                rounded-2xl
                border border-slate-200 dark:border-gray-800
                bg-white dark:bg-gray-900 p-5
              "
            >

              <div className="mb-6 flex items-start justify-between">

                <div>
                  <h2 className="text-sm font-black text-slate-950 dark:text-white">
                    Filters
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Refine your results
                  </p>
                </div>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="text-xs font-semibold text-blue-600"
                  >
                    Clear
                  </button>
                )}

              </div>

              <FilterContent
                categories={
                  categories
                }
                categoriesLoading={
                  categoriesLoading
                }
                product={product}
                selectedCategory={
                  selectedCategory
                }
                setSelectedCategory={
                  handleCategoryChange
                }
                priceRange={
                  priceRange
                }
                priceInput={
                  priceInput
                }
                setPriceInput={
                  setPriceInput
                }
                appliedPrice={
                  appliedPrice
                }
                setAppliedPrice={
                  setAppliedPrice
                }
                applyPriceFilter={
                  applyPriceFilter
                }
                clearFilters={
                  clearFilters
                }
                hasFilters={
                  hasFilters
                }
              />

            </div>
          </aside>

          {/* =================================================
              PRODUCT AREA
          ================================================= */}

          <div className="min-w-0">

            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div
              className="
                mb-6
                rounded-2xl
                border border-slate-200 dark:border-gray-800
                bg-white dark:bg-gray-900
                p-3 sm:p-4
              "
            >

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex h-10 w-10
                      items-center justify-center
                      rounded-xl bg-blue-50
                      text-blue-600
                    "
                  >
                    <PackageOpen
                      size={18}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      {
                        filteredProducts.length
                      }{" "}
                      {filteredProducts.length ===
                      1
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
                      setMobileFiltersOpen(
                        true
                      )
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
                    <SlidersHorizontal
                      size={16}
                    />

                    Filters

                    {hasFilters && (
                      <span
                        className="
                          flex h-5 min-w-5
                          items-center justify-center
                          rounded-full bg-blue-600
                          px-1 text-[10px]
                          font-bold text-white
                        "
                      >
                        !
                      </span>
                    )}
                  </button>

                  {/* SORT */}

                  <div className="relative flex-1 sm:flex-none">

                    <select
                      value={sort}
                      onChange={(e) =>
                        handleSortChange(
                          e.target.value
                        )
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

              {/* =================================================
                  ACTIVE FILTERS
              ================================================= */}

              {hasFilters && (
                <div
                  className="
                    mt-3 flex flex-wrap
                    items-center gap-2
                    border-t border-slate-100
                    pt-3
                  "
                >

                  <span className="text-[11px] font-semibold text-slate-400">
                    Active:
                  </span>

                  {/* CATEGORY */}

                  {selectedCategory !==
                    "all" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleCategoryChange(
                          "all"
                        )
                      }
                      className="
                        inline-flex items-center
                        gap-1.5 rounded-full
                        bg-blue-50 px-3 py-1.5
                        text-xs font-semibold
                        text-blue-700
                      "
                    >
                      {
                        selectedCategoryName
                      }

                      <X size={12} />
                    </button>
                  )}

                  {/* MIN */}

                  {appliedPrice.min !==
                    "" && (
                    <button
                      type="button"
                      onClick={
                        clearMinPrice
                      }
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
                      ).toLocaleString(
                        "en-IN"
                      )}

                      <X size={12} />
                    </button>
                  )}

                  {/* MAX */}

                  {appliedPrice.max !==
                    "" && (
                    <button
                      type="button"
                      onClick={
                        clearMaxPrice
                      }
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
                      ).toLocaleString(
                        "en-IN"
                      )}

                      <X size={12} />
                    </button>
                  )}

                </div>
              )}

            </div>

            {/* =================================================
                STATES
            ================================================= */}

            {loading ? (

              <ProductGridSkeleton
                count={12}
              />

            ) : error ? (

              <div
                className="
                  rounded-2xl
                  border border-red-100
                  bg-white px-6 py-20
                  text-center
                "
              >

                <div
                  className="
                    mx-auto flex h-14 w-14
                    items-center justify-center
                    rounded-2xl bg-red-50
                    text-red-500
                  "
                >
                  <RotateCcw
                    size={22}
                  />
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
                    dispatch(
                      getProducts({
                        page: 1,
                        limit: 1000,
                      })
                    );

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

            ) : filteredProducts.length ===
              0 ? (

              <div
                className="
                  rounded-2xl
                  border border-slate-200
                  bg-white px-6 py-20
                  text-center
                "
              >

                <div
                  className="
                    mx-auto flex h-16 w-16
                    items-center justify-center
                    rounded-2xl bg-slate-100
                    text-slate-400
                  "
                >
                  <Search
                    size={25}
                  />
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
                    onClick={
                      clearFilters
                    }
                    className="
                      mt-5 inline-flex
                      items-center gap-2
                      rounded-xl
                      bg-slate-950 px-5 py-2.5
                      text-sm font-bold text-white
                    "
                  >
                    <RotateCcw
                      size={15}
                    />
                    Clear filters
                  </button>
                )}

              </div>

            ) : (

              <ProductGrid
                products={
                  paginatedProducts
                }
              />

            )}

          </div>
        </div>
      </section>

      {/* =====================================================
          PAGINATION
          
          IMPORTANT:
          
          Uses frontend filtered result count.
      ====================================================== */}

      {!loading &&
        !error &&
        filteredProducts.length > 0 &&
        totalPages > 1 && (
          <PageButtons
            page={page}
            totalPages={
              totalPages
            }
            onPageChange={(
              nextPage
            ) => {
              setPage(
                nextPage
              );

              window.scrollTo({
                top: 0,
                behavior:
                  "smooth",
              });
            }}
          />
        )}

    </main>
  );
}
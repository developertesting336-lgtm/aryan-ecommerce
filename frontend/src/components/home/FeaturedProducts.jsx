import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { getProducts } from "../../redux/slices/productSlice";
import ProductCard from "../products/ProductCard";

const INITIAL_LIMIT = 8;
const LOAD_MORE_COUNT = 8;
const SCROLL_THRESHOLD = 250;

export default function FeaturedProducts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const scrollRef = useRef(null);

  // =========================================================
  // FETCH CONTROL
  // =========================================================

  const isFetchingRef = useRef(false);

  const limitRef = useRef(INITIAL_LIMIT);

  // Last number of products returned by API
  const lastReturnedCountRef = useRef(0);

  // Keep IDs from previous API response
  const previousProductIdsRef = useRef([]);

  // =========================================================
  // STATE
  // =========================================================

  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // =========================================================
  // REDUX
  // =========================================================

  const {
    product = [],
    pagination = {},
    loading = false,
    error = null,
  } = useSelector((state) => state.product);

  // =========================================================
  // MEMOIZED PRODUCTS
  // =========================================================

  const featuredProducts = useMemo(() => {
    return Array.isArray(product) ? product : [];
  }, [product]);

  // =========================================================
  // REDUX PAGINATION
  // =========================================================

  const currentPage = pagination?.page ?? 1;

  const totalPages = pagination?.totalPages ?? 0;

  // =========================================================
  // NORMALIZE RESPONSE
  // =========================================================

  const extractProducts = useCallback((payload) => {
    if (Array.isArray(payload)) {
      return {
        products: payload,
        total: null,
        pagination: null,
      };
    }

    // payload.products
    if (Array.isArray(payload?.products)) {
      return {
        products: payload.products,
        total:
          payload.total ??
          payload.count ??
          payload.totalProducts ??
          payload.pagination?.total ??
          null,
        pagination: payload.pagination ?? null,
      };
    }

    // payload.data
    if (Array.isArray(payload?.data)) {
      return {
        products: payload.data,
        total:
          payload.total ??
          payload.count ??
          payload.pagination?.total ??
          null,
        pagination: payload.pagination ?? null,
      };
    }

    // payload.data.products
    if (Array.isArray(payload?.data?.products)) {
      return {
        products: payload.data.products,
        total:
          payload.data.total ??
          payload.data.count ??
          payload.data.totalProducts ??
          payload.total ??
          payload.data.pagination?.total ??
          null,
        pagination:
          payload.data.pagination ??
          payload.pagination ??
          null,
      };
    }

    return {
      products: [],
      total: null,
      pagination: null,
    };
  }, []);

  // =========================================================
  // GET PRODUCT ID
  // =========================================================

  const getProductId = useCallback((item) => {
    return (
      item?._id ||
      item?.id ||
      item?.slug ||
      null
    );
  }, []);

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = useCallback(
    async (requestedLimit) => {
      // ---------------------------------------------
      // Prevent duplicate request
      // ---------------------------------------------

      if (isFetchingRef.current) {
        return;
      }

      // ---------------------------------------------
      // Already finished
      // ---------------------------------------------

      if (
        requestedLimit > INITIAL_LIMIT &&
        totalPages > 0 &&
        currentPage >= totalPages
      ) {
        console.log(
          "[FeaturedProducts] Fetch blocked - no more products."
        );

        setHasMore(false);

        return;
      }

      isFetchingRef.current = true;

      if (requestedLimit > INITIAL_LIMIT) {
        setIsFetchingMore(true);
      }

      try {
        console.log(
          `[FeaturedProducts] Fetching limit=${requestedLimit}`
        );

        const result = await dispatch(
          getProducts({
            limit: requestedLimit,
          })
        );

        // ---------------------------------------------
        // HANDLE RESPONSE
        // ---------------------------------------------

        const {
          products: returnedProducts,
          total,
          pagination: responsePagination,
        } = extractProducts(result?.payload);

        const returnedCount =
          returnedProducts.length;

        console.log(
          "[FeaturedProducts] Response:",
          {
            requestedLimit,
            returnedCount,
            total,
            pagination: responsePagination,
          }
        );

        // =================================================
        // USE RESPONSE PAGINATION
        // =================================================

        const responsePage =
          responsePagination?.page ??
          currentPage;

        const responseTotalPages =
          responsePagination?.totalPages ??
          totalPages;

        if (
          typeof responseTotalPages === "number" &&
          responseTotalPages > 0
        ) {
          setHasMore(
            responsePage < responseTotalPages
          );
        }

        // =================================================
        // FALLBACK - TOTAL
        // =================================================

        else if (
          typeof total === "number" &&
          total >= 0
        ) {
          setHasMore(
            requestedLimit < total
          );
        }

        // =================================================
        // FALLBACK - RESPONSE LENGTH
        // =================================================

        else if (
          returnedCount < requestedLimit
        ) {
          console.log(
            "[FeaturedProducts] API returned fewer products than requested."
          );

          setHasMore(false);
        }

        // =================================================
        // FALLBACK - SAME RESPONSE SIZE
        // =================================================

        else if (
          requestedLimit > INITIAL_LIMIT &&
          returnedCount <=
            lastReturnedCountRef.current
        ) {
          console.log(
            "[FeaturedProducts] Product count did not increase. Stopping."
          );

          setHasMore(false);
        }

        // =================================================
        // FALLBACK - PRODUCT IDS
        // =================================================

        else {
          const currentIds =
            returnedProducts
              .map(getProductId)
              .filter(Boolean);

          const previousIds =
            previousProductIdsRef.current;

          if (
            requestedLimit > INITIAL_LIMIT &&
            currentIds.length > 0 &&
            previousIds.length > 0
          ) {
            const previousSet =
              new Set(previousIds);

            const newProducts =
              currentIds.filter(
                (id) => !previousSet.has(id)
              );

            if (newProducts.length === 0) {
              console.log(
                "[FeaturedProducts] No new products returned. Stopping."
              );

              setHasMore(false);
            } else {
              setHasMore(true);
            }
          } else {
            setHasMore(true);
          }
        }

        // =================================================
        // SAVE RESPONSE INFORMATION
        // =================================================

        lastReturnedCountRef.current =
          returnedCount;

        previousProductIdsRef.current =
          returnedProducts
            .map(getProductId)
            .filter(Boolean);

        // =================================================
        // SAFETY
        // =================================================

        if (returnedCount === 0) {
          setHasMore(false);
        }
      } catch (err) {
        console.error(
          "[FeaturedProducts] Failed to fetch products:",
          err
        );
      } finally {
        isFetchingRef.current = false;
        setIsFetchingMore(false);
      }
    },
    [
      dispatch,
      extractProducts,
      getProductId,
      currentPage,
      totalPages,
    ]
  );

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    // Don't request again if Redux already has products
    if (featuredProducts.length > 0) {
      return;
    }

    // Don't request again if Redux is already on another page
    if (currentPage > 1) {
      return;
    }

    if (isFetchingRef.current) {
      return;
    }

    limitRef.current = INITIAL_LIMIT;

    lastReturnedCountRef.current = 0;

    previousProductIdsRef.current = [];

    setLimit(INITIAL_LIMIT);
    setHasMore(true);

    fetchProducts(INITIAL_LIMIT);
  }, [
    featuredProducts.length,
    currentPage,
    fetchProducts,
  ]);

  // =========================================================
  // LOAD MORE
  // =========================================================

  const loadMoreProducts = useCallback(() => {
    if (isFetchingRef.current) {
      return;
    }

    if (!hasMore) {
      console.log(
        "[FeaturedProducts] No more products - scroll ignored."
      );

      return;
    }

    // ---------------------------------------------
    // Redux pagination check
    // ---------------------------------------------

    if (
      totalPages > 0 &&
      currentPage >= totalPages
    ) {
      console.log(
        "[FeaturedProducts] Redux pagination reached last page."
      );

      setHasMore(false);

      return;
    }

    const currentLimit =
      limitRef.current;

    const nextLimit =
      currentLimit + LOAD_MORE_COUNT;

    console.log(
      `[FeaturedProducts] ${currentLimit} -> ${nextLimit}`
    );

    // Update immediately
    limitRef.current = nextLimit;

    setLimit(nextLimit);

    fetchProducts(nextLimit);
  }, [
    fetchProducts,
    hasMore,
    currentPage,
    totalPages,
  ]);

  // =========================================================
  // INTERNAL SCROLL
  // =========================================================

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      if (isFetchingRef.current) {
        return;
      }

      if (!hasMore) {
        return;
      }

      const {
        scrollTop,
        scrollHeight,
        clientHeight,
      } = container;

      const distanceFromBottom =
        scrollHeight -
        (scrollTop + clientHeight);

      if (
        distanceFromBottom <=
        SCROLL_THRESHOLD
      ) {
        loadMoreProducts();
      }
    };

    container.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      container.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [hasMore, loadMoreProducts]);

  // =========================================================
  // RETRY
  // =========================================================

  const handleRetry = () => {
    if (isFetchingRef.current) {
      return;
    }

    limitRef.current = INITIAL_LIMIT;

    lastReturnedCountRef.current = 0;

    previousProductIdsRef.current = [];

    setLimit(INITIAL_LIMIT);
    setHasMore(true);

    fetchProducts(INITIAL_LIMIT);
  };

  // =========================================================
  // DEBUG
  // =========================================================

  console.log(
    "[FeaturedProducts]",
    {
      page: currentPage,
      totalPages,
      limit,
      products: featuredProducts.length,
      loading,
      isFetchingMore,
      hasMore,
    }
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <section
      className="
        w-full
        max-w-7xl
        mx-auto
        px-3
        min-[375px]:px-4
        sm:px-6
        lg:px-8
        py-7
        sm:py-10
        lg:py-12
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex
          items-end
          justify-between
          gap-3
          sm:gap-4
          mb-5
          sm:mb-8
        "
      >
        <div className="min-w-0">
          <p
            className="
              text-xs
              min-[375px]:text-sm
              font-semibold
              text-blue-600
              mb-1
            "
          >
            Featured Products
          </p>

          <h2
            className="
              text-lg
              min-[375px]:text-xl
              sm:text-2xl
              lg:text-3xl
              font-bold
              text-gray-900
              leading-tight
            "
          >
            Today's Best Deals
          </h2>

          <p
            className="
              hidden
              sm:block
              mt-1
              text-sm
              text-gray-500
            "
          >
            Discover our most popular products
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/products")
          }
          className="
            shrink-0
            whitespace-nowrap
            text-xs
            min-[375px]:text-sm
            sm:text-base
            font-semibold
            text-blue-600
            hover:text-blue-700
            transition
          "
        >
          View All →
        </button>
      </div>

      {/* =====================================================
          INITIAL LOADING
      ===================================================== */}

      {loading &&
        featuredProducts.length === 0 && (
          <div
            className="
              max-h-[70vh]
              overflow-y-auto
              overflow-x-hidden
              pr-1
            "
          >
            <div
              className="
                grid
                grid-cols-1
                min-[375px]:grid-cols-2
                sm:grid-cols-3
                md:grid-cols-4
                lg:grid-cols-5
                gap-3
                min-[375px]:gap-3
                sm:gap-4
                lg:gap-5
              "
            >
              {Array.from({
                length: 10,
              }).map((_, index) => (
                <ProductSkeleton
                  key={index}
                />
              ))}
            </div>
          </div>
        )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {!loading &&
        error &&
        featuredProducts.length === 0 && (
          <div
            className="
              rounded-2xl
              border
              border-red-100
              bg-red-50
              p-6
              sm:p-8
              text-center
            "
          >
            <p
              className="
                font-semibold
                text-red-600
              "
            >
              Unable to load products
            </p>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
              "
            >
              Please try again.
            </p>

            <button
              type="button"
              onClick={handleRetry}
              className="
                mt-4
                rounded-xl
                bg-red-500
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                hover:bg-red-600
                transition
              "
            >
              Try Again
            </button>
          </div>
        )}

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!loading &&
        !error &&
        featuredProducts.length === 0 && (
          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-gray-50
              py-10
              sm:py-12
              text-center
            "
          >
            <p
              className="
                text-sm
                sm:text-base
                text-gray-500
              "
            >
              No products available right now.
            </p>
          </div>
        )}

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      {featuredProducts.length > 0 && (
        <div
          ref={scrollRef}
          className="
            featured-products-scroll
            max-h-[70vh]
            overflow-y-auto
            overflow-x-hidden
            pr-1
            sm:pr-2
          "
        >
          <div
            className="
              grid
              grid-cols-1
              min-[375px]:grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
              gap-3
              sm:gap-4
              lg:gap-5
              items-start
            "
          >
            {featuredProducts.map(
              (item, index) => (
                <div
                  key={
                    item?._id ||
                    item?.id ||
                    item?.slug ||
                    `product-${index}`
                  }
                  className="
                    min-w-0
                    w-full
                  "
                >
                  <ProductCard
                    {...item}
                    rating={
                      item?.rating?.average
                    }
                  />
                </div>
              )
            )}
          </div>

          {/* =================================================
              LOADING MORE
          ================================================= */}

          {isFetchingMore && (
            <div
              className="
                flex
                justify-center
                items-center
                py-6
                text-sm
                text-gray-500
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-gray-300
                    border-t-blue-600
                  "
                />

                <span>
                  Loading more products...
                </span>
              </div>
            </div>
          )}

          {/* =================================================
              NO MORE
          ================================================= */}

          {!isFetchingMore &&
            !hasMore &&
            featuredProducts.length > 0 && (
              <div
                className="
                  flex
                  justify-center
                  py-5
                  text-sm
                  text-gray-400
                "
              >
                No more products available.
              </div>
            )}
        </div>
      )}

      {/* =====================================================
          VIEW ALL
      ===================================================== */}

      {!loading &&
        !error &&
        featuredProducts.length > 10 && (
          <div
            className="
              flex
              justify-center
              mt-6
              sm:mt-8
            "
          >
            <button
              type="button"
              onClick={() =>
                navigate("/products")
              }
              className="
                rounded-xl
                border
                border-gray-200
                bg-white
                px-5
                sm:px-6
                py-2.5
                sm:py-3
                text-xs
                sm:text-sm
                font-semibold
                text-gray-700
                hover:border-blue-500
                hover:bg-blue-50
                hover:text-blue-600
                transition
              "
            >
              Explore All Products
            </button>
          </div>
        )}
    </section>
  );
}

/* =========================================================
   PRODUCT SKELETON
========================================================= */

function ProductSkeleton() {
  return (
    <div
      className="
        w-full
        overflow-hidden
        rounded-xl
        sm:rounded-2xl
        border
        border-gray-100
        bg-white
      "
    >
      <div
        className="
          aspect-square
          w-full
          animate-pulse
          bg-gray-200
        "
      />

      <div
        className="
          space-y-2.5
          sm:space-y-3
          p-3
          sm:p-4
        "
      >
        <div
          className="
            h-3
            w-1/3
            animate-pulse
            rounded
            bg-gray-200
          "
        />

        <div
          className="
            h-4
            w-full
            animate-pulse
            rounded
            bg-gray-200
          "
        />

        <div
          className="
            h-4
            w-2/3
            animate-pulse
            rounded
            bg-gray-200
          "
        />

        <div
          className="
            h-5
            w-1/2
            animate-pulse
            rounded
            bg-gray-200
          "
        />

        <div
          className="
            h-10
            w-full
            animate-pulse
            rounded-xl
            bg-gray-200
          "
        />
      </div>
    </div>
  );
}
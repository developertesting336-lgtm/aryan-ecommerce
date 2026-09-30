import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { getProducts } from "../../redux/slices/productSlice";
import ProductCard from "../products/ProductCard";

export default function FeaturedProducts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // =====================================================
  // SCROLL / LIMIT STATE
  // =====================================================

  const [limit, setLimit] = useState(8);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const scrollRef = useRef(null);

  // Prevent duplicate API calls
  const isFetchingRef = useRef(false);

  // Keep latest limit inside scroll event
  const limitRef = useRef(8);

  // =====================================================
  // PRODUCTS FROM REDUX
  // =====================================================

  const {
    product = [],
    loading,
    error,
  } = useSelector((state) => state.product);

  // =====================================================
  // FETCH PRODUCTS
  //
  // Initial:
  // 8
  //
  // Scroll:
  // 16
  // 24
  // 32
  // ...
  // =====================================================

  useEffect(() => {
    const fetchProducts = async () => {
      if (isFetchingRef.current) {
        return;
      }

      // Don't fetch again when we know
      // there are no more products.
      if (!hasMore && limit > 8) {
        return;
      }

      isFetchingRef.current = true;

      if (limit > 8) {
        setIsFetchingMore(true);
      }

      try {
        console.log(
          "Fetching products with limit:",
          limit
        );

        const result = await dispatch(
          getProducts({
            limit,
          })
        );

        console.log("API result:", result);

        /*
         * If getProducts is created with createAsyncThunk,
         * result.payload normally contains the API response.
         *
         * We don't rely only on this for stopping because
         * different APIs can have different response shapes.
         */

        let returnedProducts = [];

        if (Array.isArray(result?.payload)) {
          returnedProducts = result.payload;
        } else if (
          Array.isArray(result?.payload?.products)
        ) {
          returnedProducts = result.payload.products;
        } else if (
          Array.isArray(result?.payload?.data)
        ) {
          returnedProducts = result.payload.data;
        }

        console.log(
          "Products returned from API:",
          returnedProducts.length
        );

        /*
         * If API returned fewer products than requested,
         * there are no more products available.
         *
         * Example:
         *
         * limit = 24
         * API returns 18
         *
         * Therefore:
         * hasMore = false
         */

        if (
          limit > 8 &&
          returnedProducts.length > 0 &&
          returnedProducts.length < limit
        ) {
          setHasMore(false);

          console.log(
            "No more products available."
          );
        }

        /*
         * If API returned ZERO products,
         * definitely stop further requests.
         */

        if (
          limit > 8 &&
          returnedProducts.length === 0
        ) {
          setHasMore(false);

          console.log(
            "API returned no more products."
          );
        }

        /*
         * Initial request returned fewer than 8.
         * That also means there are no more products.
         */

        if (
          limit === 8 &&
          returnedProducts.length < 8
        ) {
          setHasMore(false);

          console.log(
            "All available products loaded."
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch products:",
          error
        );
      } finally {
        isFetchingRef.current = false;
        setIsFetchingMore(false);
      }
    };

    fetchProducts();
  }, [dispatch, limit, hasMore]);

  // =====================================================
  // ADDITIONAL SAFETY CHECK
  //
  // If Redux contains fewer products than requested,
  // stop infinite loading.
  //
  // Example:
  //
  // limit = 24
  // Redux has only 18
  //
  // => no more API requests
  // =====================================================

  useEffect(() => {
    if (
      limit > 8 &&
      Array.isArray(product) &&
      product.length < limit
    ) {
      setHasMore(false);

      console.log(
        "Stopping infinite scroll because product count",
        product.length,
        "is less than limit",
        limit
      );
    }
  }, [product, limit]);

  // =====================================================
  // INFINITE SCROLL
  // =====================================================

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      // Already fetching
      if (isFetchingRef.current) {
        return;
      }

      // No more products
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

      console.log("Scroll:", {
        scrollTop,
        scrollHeight,
        clientHeight,
        distanceFromBottom,
        hasMore,
        currentLimit: limitRef.current,
      });

      // Load more 200px before bottom
      if (distanceFromBottom <= 200) {
        const nextLimit =
          limitRef.current + 8;

        console.log(
          "Loading more products:",
          nextLimit
        );

        // Update ref immediately
        limitRef.current = nextLimit;

        // Update state
        setLimit(nextLimit);
      }
    };

    container.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      container.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [loading, product.length, hasMore]);

  // =====================================================
  // FEATURED PRODUCTS
  // =====================================================

  const featuredProducts = Array.isArray(product)
    ? product
    : [];

  // =====================================================
  // DEBUG
  // =====================================================

  console.log("=================================");
  console.log("Current limit:", limit);
  console.log(
    "Products:",
    featuredProducts.length
  );
  console.log("Loading:", loading);
  console.log(
    "Fetching more:",
    isFetchingMore
  );
  console.log("Has more:", hasMore);
  console.log("=================================");

  // =====================================================
  // RENDER
  // =====================================================

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
      {/* =================================================
          HEADER
      ================================================= */}

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
          onClick={() => navigate("/products")}
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

      {/* =================================================
          INITIAL LOADING
      ================================================= */}

      {loading &&
        featuredProducts.length === 0 && (
          <div
            className="
              featured-products-scroll
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
              {Array.from({ length: 10 }).map(
                (_, index) => (
                  <ProductSkeleton
                    key={index}
                  />
                )
              )}
            </div>
          </div>
        )}

      {/* =================================================
          ERROR
      ================================================= */}

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
              onClick={() => {
                limitRef.current = 8;

                setLimit(8);

                setHasMore(true);
              }}
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

      {/* =================================================
          EMPTY
      ================================================= */}

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

      {/* =================================================
          PRODUCTS
      ================================================= */}

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
            {featuredProducts.map((item) => (
              <div
                key={item._id}
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
            ))}
          </div>

          {/* =================================================
              LOADING MORE
          ================================================= */}

          {isFetchingMore && hasMore && (
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
              NO MORE PRODUCTS
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

      {/* =================================================
          VIEW ALL
      ================================================= */}

      {!loading &&
        !error &&
        product.length > 10 && (
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

/* =====================================================
   PRODUCT SKELETON
===================================================== */

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
      {/* IMAGE */}

      <div
        className="
          aspect-square
          w-full
          animate-pulse
          bg-gray-200
        "
      />

      {/* CONTENT */}

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
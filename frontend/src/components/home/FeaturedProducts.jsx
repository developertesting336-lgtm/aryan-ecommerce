import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { getProducts } from "../../redux/slices/productSlice";
import ProductCard from "../products/ProductCard";

const INITIAL_LIMIT = 8;
const LOAD_MORE_COUNT = 8;
const SCROLL_THRESHOLD = 250;

export default function FeaturedProducts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const scrollRef = useRef(null);
  const sectionRef = useRef(null);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);

  // Check user motion preference
  const prefersReducedMotion = useReducedMotion();

  // Scroll arrow button disabled states
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // =========================================================
  // DRAG / WHEEL REFS
  // =========================================================

  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

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
    return item?._id || item?.id || item?.slug || null;
  }, []);

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = useCallback(
    async (requestedLimit) => {
      // Prevent duplicate request
      if (isFetchingRef.current) {
        return;
      }

      // Already finished
      if (
        requestedLimit > INITIAL_LIMIT &&
        totalPages > 0 &&
        currentPage >= totalPages
      ) {
        console.log("[FeaturedProducts] Fetch blocked - no more products.");

        setHasMore(false);

        return;
      }

      isFetchingRef.current = true;

      if (requestedLimit > INITIAL_LIMIT) {
        setIsFetchingMore(true);
      }

      try {
        console.log(`[FeaturedProducts] Fetching limit=${requestedLimit}`);

        const result = await dispatch(
          getProducts({
            limit: requestedLimit,
          })
        );

        // HANDLE RESPONSE
        const {
          products: returnedProducts,
          total,
          pagination: responsePagination,
        } = extractProducts(result?.payload);

        const returnedCount = returnedProducts.length;

        console.log("[FeaturedProducts] Response:", {
          requestedLimit,
          returnedCount,
          total,
          pagination: responsePagination,
        });

        // USE RESPONSE PAGINATION
        const responsePage = responsePagination?.page ?? currentPage;

        const responseTotalPages =
          responsePagination?.totalPages ?? totalPages;

        if (
          typeof responseTotalPages === "number" &&
          responseTotalPages > 0
        ) {
          setHasMore(responsePage < responseTotalPages);
        }

        // FALLBACK - TOTAL
        else if (typeof total === "number" && total >= 0) {
          setHasMore(requestedLimit < total);
        }

        // FALLBACK - RESPONSE LENGTH
        else if (returnedCount < requestedLimit) {
          console.log(
            "[FeaturedProducts] API returned fewer products than requested."
          );

          setHasMore(false);
        }

        // FALLBACK - SAME RESPONSE SIZE
        else if (
          requestedLimit > INITIAL_LIMIT &&
          returnedCount <= lastReturnedCountRef.current
        ) {
          console.log(
            "[FeaturedProducts] Product count did not increase. Stopping."
          );

          setHasMore(false);
        }

        // FALLBACK - PRODUCT IDS
        else {
          const currentIds = returnedProducts
            .map(getProductId)
            .filter(Boolean);

          const previousIds = previousProductIdsRef.current;

          if (
            requestedLimit > INITIAL_LIMIT &&
            currentIds.length > 0 &&
            previousIds.length > 0
          ) {
            const previousSet = new Set(previousIds);

            const newProducts = currentIds.filter(
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

        // SAVE RESPONSE INFORMATION
        lastReturnedCountRef.current = returnedCount;

        previousProductIdsRef.current = returnedProducts
          .map(getProductId)
          .filter(Boolean);

        // SAFETY
        if (returnedCount === 0) {
          setHasMore(false);
        }
      } catch (err) {
        console.error("[FeaturedProducts] Failed to fetch products:", err);
      } finally {
        isFetchingRef.current = false;
        setIsFetchingMore(false);
      }
    },
    [dispatch, extractProducts, getProductId, currentPage, totalPages]
  );

  // =========================================================
  // VIEWPORT INTERSECTION OBSERVER (BELOW-THE-FOLD LAZY FETCH)
  // =========================================================

  useEffect(() => {
    if (hasEnteredViewport || featuredProducts.length > 0) return;
    const element = sectionRef.current;
    if (!element) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setHasEnteredViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHasEnteredViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "350px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasEnteredViewport, featuredProducts.length]);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    // Only fetch when section approaches viewport
    if (!hasEnteredViewport) {
      return;
    }

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
    hasEnteredViewport,
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
      console.log("[FeaturedProducts] No more products - scroll ignored.");

      return;
    }

    // Redux pagination check
    if (totalPages > 0 && currentPage >= totalPages) {
      console.log("[FeaturedProducts] Redux pagination reached last page.");

      setHasMore(false);

      return;
    }

    const currentLimit = limitRef.current;

    const nextLimit = currentLimit + LOAD_MORE_COUNT;

    console.log(`[FeaturedProducts] ${currentLimit} -> ${nextLimit}`);

    // Update immediately
    limitRef.current = nextLimit;

    setLimit(nextLimit);

    fetchProducts(nextLimit);
  }, [fetchProducts, hasMore, currentPage, totalPages]);

  // =========================================================
  // SCROLL CONTROLS & ARROW BUTTONS
  // =========================================================

  // Update disabled state of left/right arrow buttons based on scroll position
  const updateScrollButtons = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    // Allow small threshold for subpixel rendering in browsers
    setCanScrollLeft(scrollLeft > 3);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  }, []);

  // Scroll smoothly by exactly one card width (card width + gap)
  const scrollByCard = (direction) => {
    const container = scrollRef.current;
    if (!container) return;

    // Measure the first card width dynamically
    const firstCard = container.querySelector("[data-product-card]");
    const gap = 16; // 1rem gap
    const cardWidth = firstCard
      ? firstCard.getBoundingClientRect().width + gap
      : container.clientWidth;

    container.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  // Horizontal scroll listener (arrow state + load more) & resize listener
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      updateScrollButtons();

      if (isFetchingRef.current || !hasMore) {
        return;
      }

      // Near the right edge -> load more products
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const distanceFromRight = scrollWidth - (scrollLeft + clientWidth);

      if (distanceFromRight <= SCROLL_THRESHOLD) {
        loadMoreProducts();
      }
    };

    updateScrollButtons();

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [hasMore, loadMoreProducts, updateScrollButtons, featuredProducts.length]);

  // =========================================================
  // MOUSE WHEEL → HORIZONTAL + MOUSE DRAG SCROLL
  // =========================================================

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    // Wheel: vertical wheel moves the carousel sideways
    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      if (maxScroll <= 0) return;

      const nextScroll = scroller.scrollLeft + event.deltaY;

      // Only hijack the wheel while horizontal scrolling is possible,
      // so the page can still scroll vertically at either end.
      if (nextScroll > 0 && nextScroll < maxScroll) {
        event.preventDefault();
        scroller.scrollLeft = nextScroll;
      }
    };

    // Drag (mouse only)
    const handlePointerDown = (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;

      isDraggingRef.current = true;
      hasDraggedRef.current = false;
      dragStartXRef.current = event.clientX;
      dragStartScrollLeftRef.current = scroller.scrollLeft;
    };

    const handlePointerMove = (event) => {
      if (!isDraggingRef.current || event.pointerType !== "mouse") return;

      const distance = event.clientX - dragStartXRef.current;

      // Small threshold so normal clicks on cards still work
      if (Math.abs(distance) > 5) {
        hasDraggedRef.current = true;
        scroller.style.cursor = "grabbing";
        scroller.style.userSelect = "none";
      }

      scroller.scrollLeft = dragStartScrollLeftRef.current - distance;
    };

    const stopDragging = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      scroller.style.cursor = "";
      scroller.style.userSelect = "";
    };

    // Block the click that fires right after a drag
    const handleClickCapture = (event) => {
      if (hasDraggedRef.current) {
        event.preventDefault();
        event.stopPropagation();
        hasDraggedRef.current = false;
      }
    };

    // Stop native image/link ghost-dragging
    const handleDragStart = (event) => event.preventDefault();

    scroller.addEventListener("wheel", handleWheel, { passive: false });
    scroller.addEventListener("pointerdown", handlePointerDown);
    scroller.addEventListener("pointermove", handlePointerMove);
    scroller.addEventListener("pointerup", stopDragging);
    scroller.addEventListener("pointercancel", stopDragging);
    scroller.addEventListener("pointerleave", stopDragging);
    scroller.addEventListener("click", handleClickCapture, true);
    scroller.addEventListener("dragstart", handleDragStart);

    return () => {
      scroller.removeEventListener("wheel", handleWheel);
      scroller.removeEventListener("pointerdown", handlePointerDown);
      scroller.removeEventListener("pointermove", handlePointerMove);
      scroller.removeEventListener("pointerup", stopDragging);
      scroller.removeEventListener("pointercancel", stopDragging);
      scroller.removeEventListener("pointerleave", stopDragging);
      scroller.removeEventListener("click", handleClickCapture, true);
      scroller.removeEventListener("dragstart", handleDragStart);
    };
  }, [featuredProducts.length]);

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

  // console.log("[FeaturedProducts]", {
  //   page: currentPage,
  //   totalPages,
  //   limit,
  //   products: featuredProducts.length,
  //   loading,
  //   isFetchingMore,
  //   hasMore,
  // });

  // =========================================================
  // UI
  // =========================================================

  return (
    <motion.section
      ref={sectionRef}
      initial={{
        opacity: 0,
        y: prefersReducedMotion ? 0 : 24,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: "easeOut",
      }}
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
          HEADER WITH TITLE & CAROUSEL CONTROLS
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
              dark:text-white
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
              dark:text-gray-400
            "
          >
            Discover our most popular products
          </p>
        </div>

        {/* Action Controls: Left/Right arrows + View all */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => scrollByCard("left")}
              disabled={!canScrollLeft}
              aria-label="Previous product"
              className="
              cursor-pointer
                flex
                h-8
                w-8
                sm:h-9
                sm:w-9
                items-center
                justify-center
                rounded-full
                border
                border-gray-200
                dark:border-gray-700
                bg-white
                dark:bg-gray-800
                text-gray-700
                dark:text-gray-200
                shadow-xs
                transition
                hover:border-blue-500
                hover:text-blue-600
                active:scale-95
                disabled:cursor-not-allowed
                disabled:opacity-30
                disabled:hover:border-gray-200
                disabled:hover:text-gray-700
              "
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => scrollByCard("right")}
              disabled={!canScrollRight}
              aria-label="Next product"
              className="
              cursor-pointer
                flex
                h-8
                w-8
                sm:h-9
                sm:w-9
                items-center
                justify-center
                rounded-full
                border
                border-gray-200
                dark:border-gray-700
                bg-white
                dark:bg-gray-800
                text-gray-700
                dark:text-gray-200
                shadow-xs
                transition
                hover:border-blue-500
                hover:text-blue-600
                active:scale-95
                disabled:cursor-not-allowed
                disabled:opacity-30
                disabled:hover:border-gray-200
                disabled:hover:text-gray-700
              "
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="
            cursor-pointer
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
      </div>

      {/* =====================================================
          INITIAL LOADING SKELETON
      ===================================================== */}

      {loading && featuredProducts.length === 0 && (
        <div
          className="
            flex
            w-full
            gap-4
            overflow-hidden
            py-2
          "
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="
                shrink-0
                w-full
                sm:w-[calc((100%-1rem)/2)]
                md:w-[calc((100%-2rem)/3)]
                lg:w-[calc((100%-3rem)/4)]
              "
            >
              <ProductSkeleton />
            </div>
          ))}
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {!loading && error && featuredProducts.length === 0 && (
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
          <p className="font-semibold text-red-600">
            Unable to load products
          </p>

          <p className="mt-1 text-sm text-gray-500">Please try again.</p>

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

      {!loading && !error && featuredProducts.length === 0 && (
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
          <p className="text-sm sm:text-base text-gray-500">
            No products available right now.
          </p>
        </div>
      )}

      {/* =====================================================
          PRODUCTS HORIZONTAL SCROLLER
      ===================================================== */}

      {featuredProducts.length > 0 && (
        <div className="relative">
          <div
            ref={scrollRef}
            className="
              flex
              w-full
              overflow-x-auto
              overflow-y-hidden
              snap-x
              snap-mandatory
              md:snap-none
              gap-4
              py-2
              md:cursor-grab
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {featuredProducts.map((item, index) => (
              <div
                key={
                  item?._id ||
                  item?.id ||
                  item?.slug ||
                  `product-${index}`
                }
                data-product-card
                className="
                  min-w-0
                  shrink-0
                  snap-start
                  w-full
                  min-[398px]:w-[calc((100%-1rem)/2)] sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]
                "
              >
                <ProductCard {...item} rating={item?.rating?.average} />
              </div>
            ))}

            {/* LOADING MORE CARD */}
            {isFetchingMore && (
              <div
                className="
                  flex
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-dashed
                  border-gray-200
                  bg-gray-50/60
                  p-6
                  w-full
                  sm:w-[calc((100%-1rem)/2)]
                  md:w-[calc((100%-2rem)/3)]
                  lg:w-[calc((100%-3rem)/4)]
                "
              >
                <div className="flex flex-col items-center gap-2 text-xs font-medium text-gray-500">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  <span>Loading more deals...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          VIEW ALL BOTTOM LINK
      ===================================================== */}

      {!loading && !error && featuredProducts.length > 10 && (
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
            onClick={() => navigate("/products")}
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
              cursor-pointer
            "
          >
            Explore All Products
          </button>
        </div>
      )}
    </motion.section>
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
        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />

        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />

        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />

        <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />

        <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}
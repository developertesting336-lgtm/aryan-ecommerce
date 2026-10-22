import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { getCartRecommendations } from "../../redux/slices/aiSlice";
import ProductCard from "./ProductCard";

const DEBOUNCE_MS = 800; // wait after cart changes before refetching
const MAX_ITEMS = 12; // max cards shown in the carousel

const getId = (item) => {
  const id = item?._id || item?.id || item?.slug;
  return id ? String(id) : "";
};

/**
 * @param {string[]} cartProductIds  product ids already in the cart (they are hidden here)
 */
export default function CartRecommendedProducts({ cartProductIds = [] }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const sectionRef = useRef(null);
  const scrollRef = useRef(null);
  const firstFetchRef = useRef(true);

  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // drag refs
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

  const {
    cartRecommendations = [],
    cartRecLoading: loading = false,
    cartRecError: error = null,
  } = useSelector((state) => state.ai);

  const { user, token } = useSelector((state) => state.auth);
  const isLoggedIn = Boolean(token || user);

  // stable key so the fetch effect only runs when the cart contents change
  const idsKey = useMemo(
    () => [...cartProductIds].map(String).sort().join(","),
    [cartProductIds]
  );

  // Products from store, minus anything already in the cart
  const recommended = useMemo(() => {
    const list = Array.isArray(cartRecommendations) ? cartRecommendations : [];
    const inCart = new Set(cartProductIds.map(String));
    return list.filter((p) => !inCart.has(getId(p))).slice(0, MAX_ITEMS);
  }, [cartRecommendations, cartProductIds]);

  /* ---------- Lazy fetch: only when the section nears the viewport ---------- */
  useEffect(() => {
    if (hasEnteredViewport) return;
    const element = sectionRef.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
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
  }, [hasEnteredViewport]);

  /* ---------- Fetch on first view, then refetch (debounced) when the cart changes ---------- */
  useEffect(() => {
    if (!hasEnteredViewport) return;

    const delay = firstFetchRef.current ? 0 : DEBOUNCE_MS;
    firstFetchRef.current = false;

    const timer = setTimeout(() => {
      // logged in: server reads the cart. guest: send the ids.
      dispatch(
        getCartRecommendations({
          ids: isLoggedIn ? undefined : idsKey.split(",").filter(Boolean),
        })
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [hasEnteredViewport, idsKey, isLoggedIn, dispatch]);

  /* ---------- Arrow buttons ---------- */
  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 3);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  }, []);

  const scrollByCard = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const firstCard = el.querySelector("[data-product-card]");
    const gap = 16;
    const cardWidth = firstCard
      ? firstCard.getBoundingClientRect().width + gap
      : el.clientWidth;

    el.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [recommended.length, updateScrollButtons]);

  /* ---------- Mouse drag to scroll (desktop) ---------- */
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

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

    const handleDragStart = (event) => event.preventDefault();

    scroller.addEventListener("pointerdown", handlePointerDown);
    scroller.addEventListener("pointermove", handlePointerMove);
    scroller.addEventListener("pointerup", stopDragging);
    scroller.addEventListener("pointercancel", stopDragging);
    scroller.addEventListener("pointerleave", stopDragging);
    scroller.addEventListener("click", handleClickCapture, true);
    scroller.addEventListener("dragstart", handleDragStart);

    return () => {
      scroller.removeEventListener("pointerdown", handlePointerDown);
      scroller.removeEventListener("pointermove", handlePointerMove);
      scroller.removeEventListener("pointerup", stopDragging);
      scroller.removeEventListener("pointercancel", stopDragging);
      scroller.removeEventListener("pointerleave", stopDragging);
      scroller.removeEventListener("click", handleClickCapture, true);
      scroller.removeEventListener("dragstart", handleDragStart);
    };
  }, [recommended.length]);

  /* ---------- Render ---------- */
  const showSkeleton = recommended.length === 0 && (loading || !hasEnteredViewport);

  // Nothing to recommend (error / empty) -> hide the whole section quietly
  if (recommended.length === 0 && !showSkeleton) return null;
  if (recommended.length === 0 && error && !loading) return null;

  return (
    <section
      ref={sectionRef}
      className="w-full mt-10 sm:mt-12 lg:mt-14 border-t border-gray-200 dark:border-gray-800 pt-7 sm:pt-10"
    >
      {/* Header */}
      <div className="flex items-end justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
        <div className="min-w-0">
          <p className="text-xs min-[375px]:text-sm font-semibold text-blue-600 mb-1">
            Recommended For You
          </p>

          <h2 className="text-lg min-[375px]:text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            You May Also Like
          </h2>

          <p className="hidden sm:block mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add a little more to your order
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => scrollByCard("left")}
              disabled={!canScrollLeft}
              aria-label="Previous product"
              className="cursor-pointer flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-xs transition hover:border-blue-500 hover:text-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-700"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => scrollByCard("right")}
              disabled={!canScrollRight}
              aria-label="Next product"
              className="cursor-pointer flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-xs transition hover:border-blue-500 hover:text-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-700"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="cursor-pointer shrink-0 whitespace-nowrap text-xs min-[375px]:text-sm sm:text-base font-semibold text-blue-600 hover:text-blue-700 transition"
          >
            View All →
          </button>
        </div>
      </div>

      {/* Skeleton */}
      {showSkeleton && (
        <div className="flex w-full gap-4 overflow-hidden py-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="shrink-0 w-full min-[398px]:w-[calc((100%-1rem)/2)] sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]"
            >
              <ProductSkeleton />
            </div>
          ))}
        </div>
      )}

      {/* Scroller */}
      {recommended.length > 0 && (
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory md:snap-none gap-4 py-2 md:cursor-grab [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {recommended.map((item, index) => (
              <div
                key={getId(item) || `recommended-${index}`}
                data-product-card
                className="min-w-0 shrink-0 snap-start w-full min-[398px]:w-[calc((100%-1rem)/2)] sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]"
              >
                <ProductCard {...item} rating={item?.rating?.average} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------- Skeleton ---------- */

function ProductSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="aspect-square w-full animate-pulse bg-gray-200 dark:bg-gray-800" />

      <div className="space-y-2.5 sm:space-y-3 p-3 sm:p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}
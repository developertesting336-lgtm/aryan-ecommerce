import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { getRecommendedProducts } from "../../redux/slices/aiSlice";
import ProductCard from "../products/ProductCard";

export default function RecommendedProducts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const scrollRef = useRef(null);
  const sectionRef = useRef(null);
  const hasFetchedRef = useRef(false);

  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Arrow button states
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Drag refs
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

  // =========================================================
  // REDUX
  // =========================================================

  // Change this selector to match your auth slice
  const isLoggedIn = useSelector((state) => !!state.auth?.user);

  const {
  recommendedProducts = [],
  recommendLoading = false,
  recommendFetched = false,
  recommendError = null,
} = useSelector((state) => state.ai);

  const products = useMemo(
    () => (Array.isArray(recommendedProducts) ? recommendedProducts : []),
    [recommendedProducts]
  );

  // =========================================================
  // VIEWPORT OBSERVER (LAZY FETCH)
  // =========================================================

  useEffect(() => {
    if (!isLoggedIn || hasEnteredViewport) return;

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
  }, [isLoggedIn, hasEnteredViewport]);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (!isLoggedIn || !hasEnteredViewport) return;
    if (hasFetchedRef.current) return; // fetch once, avoids loops on error

    hasFetchedRef.current = true;
    dispatch(getRecommendedProducts());
  }, [dispatch, isLoggedIn, hasEnteredViewport]);

  // Allow a fresh fetch after logout/login
  useEffect(() => {
    if (!isLoggedIn) {
      hasFetchedRef.current = false;
      setHasEnteredViewport(false);
    }
  }, [isLoggedIn]);

  const handleRetry = () => {
    hasFetchedRef.current = true;
    dispatch(getRecommendedProducts());
  };

  // =========================================================
  // SCROLL CONTROLS
  // =========================================================

  const updateScrollButtons = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 3);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  }, []);

  const scrollByCard = (direction) => {
    const container = scrollRef.current;
    if (!container) return;

    const firstCard = container.querySelector("[data-product-card]");
    const gap = 16;
    const cardWidth = firstCard
      ? firstCard.getBoundingClientRect().width + gap
      : container.clientWidth;

    container.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    updateScrollButtons();

    container.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [updateScrollButtons, products.length]);

  // =========================================================
  // MOUSE WHEEL + DRAG SCROLL
  // =========================================================

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      if (maxScroll <= 0) return;

      const nextScroll = scroller.scrollLeft + event.deltaY;

      if (nextScroll > 0 && nextScroll < maxScroll) {
        event.preventDefault();
        scroller.scrollLeft = nextScroll;
      }
    };

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

    const handleClickCapture = (event) => {
      if (hasDraggedRef.current) {
        event.preventDefault();
        event.stopPropagation();
        hasDraggedRef.current = false;
      }
    };

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
  }, [products.length]);

  // =========================================================
  // UI
  // =========================================================

  // Recommendations are personal: hide the section for guests
  if (!isLoggedIn) return null;

  // Hide silently if loaded but nothing to show (new user + empty catalog, etc.)
  if (hasFetchedRef.current && !recommendLoading && !recommendError && products.length === 0) {
    return null;
  }

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: "easeOut" }}
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
              flex
              items-center
              gap-1
              text-xs
              min-[375px]:text-sm
              font-semibold
              text-blue-600
              mb-1
            "
          >
            <Sparkles size={14} />
            AI Picks
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
            Recommended For You
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
            Picked based on your shopping history
          </p>
        </div>

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
    LOADING SKELETON
===================================================== */}

{products.length === 0 && !recommendError && (recommendLoading || !recommendFetched) && (
  <>
    <div className="mb-3 flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      <span>Finding the best picks for you...</span>
    </div>

    <div className="flex w-full gap-4 overflow-hidden py-2">
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
  </>
)}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {!recommendLoading && recommendError && products.length === 0 && (
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
            Unable to load recommendations
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
          PRODUCTS HORIZONTAL SCROLLER
      ===================================================== */}

      {products.length > 0 && (
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
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((item, index) => (
              <div
                key={item?._id || item?.id || `recommended-${index}`}
                data-product-card
                className="
                  min-w-0
                  shrink-0
                  snap-start
                  w-full
                  sm:w-[calc((100%-1rem)/2)]
                  md:w-[calc((100%-2rem)/3)]
                  lg:w-[calc((100%-3rem)/4)]
                "
              >
                <ProductCard {...item} rating={item?.rating?.average} />

                {/* Gemini's short reason for this pick */}
                {item?.aiReason && (
                  <p
                    className="
                      mt-2
                      flex
                      items-start
                      gap-1
                      px-1
                      text-xs
                      text-gray-500
                      dark:text-gray-400
                    "
                  >
                    <Sparkles size={12} className="mt-0.5 shrink-0 text-blue-500" />
                    <span className="line-clamp-2">{item.aiReason}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
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
      <div className="aspect-square w-full animate-pulse bg-gray-200" />

      <div className="space-y-2.5 sm:space-y-3 p-3 sm:p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}
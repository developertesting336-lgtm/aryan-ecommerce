import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";


const Hero = () => {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);

  const imageRefs = useRef([]);
  const contentRef = useRef(null);
  const isAnimatingRef = useRef(false);

  /*
   * =========================================
   * HOMEPAGE REDUX STATE
   * =========================================
   */
  const homepageState = useSelector(
    (state) => state.homepage || {}
  );

  /*
   * Support your existing possible state names.
   */
  const slides =
    homepageState.hero ||
    homepageState.homepage?.hero ||
    homepageState.data?.hero ||
    [];

  const loading = Boolean(homepageState.loading);


  /*
   * =========================================
   * RESET CURRENT SLIDE
   * =========================================
   *
   * When homepage hero data changes,
   * start slider from the first slide.
   */
  useEffect(() => {
    setCurrentIndex(0);
    isAnimatingRef.current = false;
  }, [slides.length]);

  /*
   * Current slide
   */
  const currentSlide = slides[currentIndex];

  /*
   * =========================================
   * INITIAL GSAP SETUP
   * =========================================
   */
  useEffect(() => {
    if (!slides.length) return;

    imageRefs.current.forEach((image, index) => {
      if (!image) return;

      gsap.set(image, {
        opacity: index === 0 ? 1 : 0,
        scale: index === 0 ? 1 : 1.04,
      });
    });

    return () => {
      gsap.killTweensOf(imageRefs.current);
      gsap.killTweensOf(contentRef.current);
    };
  }, [slides]);

  /*
   * =========================================
   * CHANGE SLIDE
   * =========================================
   */
  const goToSlide = useCallback(
  (nextIndex) => {
    if (
      nextIndex === currentIndex ||
      isAnimatingRef.current
    ) {
      return;
    }

    const currentImage = imageRefs.current[currentIndex];
    const nextImage = imageRefs.current[nextIndex];

    if (!currentImage || !nextImage || !contentRef.current) {
      return;
    }

    isAnimatingRef.current = true;

    const timeline = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });

    // ----------------------------------------
    // 1. Fade current text out
    // ----------------------------------------

    timeline.to(
      contentRef.current,
      {
        opacity: 0,
        y: -20,
        duration: 0.25,
        ease: "power2.in",
      },
      0
    );

    // ----------------------------------------
    // 2. Change React slide immediately
    // ----------------------------------------

    timeline.call(
      () => {
        setCurrentIndex(nextIndex);
      },
      [],
      0.25
    );

    // ----------------------------------------
    // 3. Background transition
    // ----------------------------------------

    timeline.to(
      currentImage,
      {
        opacity: 0,
        scale: 1.04,
        duration: 0.8,
        ease: "power2.inOut",
      },
      0
    );

    timeline.fromTo(
      nextImage,
      {
        opacity: 0,
        scale: 1.04,
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power2.inOut",
      },
      0
    );

    // ----------------------------------------
    // 4. New text comes in
    // ----------------------------------------

    timeline.fromTo(
      contentRef.current,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
      },
      0.25
    );
  },
  [currentIndex]
);

  /*
   * =========================================
   * AUTOMATIC SLIDER
   * =========================================
   */
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      if (!isAnimatingRef.current) {
        const nextIndex =
          (currentIndex + 1) % slides.length;

        goToSlide(nextIndex);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [
    currentIndex,
    goToSlide,
    slides.length,
  ]);

  /*
   * =========================================
   * LOADING STATE
   * =========================================
   */
  
if (loading && !slides.length) {
  return (
    <section
      aria-label="Loading homepage banner"
      aria-busy="true"
      className="
        relative
        h-[520px] min-h-[520px]
        w-full overflow-hidden
        bg-gray-200 animate-pulse
        sm:h-[560px] sm:min-h-[560px]
        md:h-[580px] md:min-h-[580px]
        lg:h-[560px] lg:min-h-[560px]
        xl:h-[600px] xl:min-h-[600px]
      "
    >
      {/* Background skeleton */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400" />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Content skeleton */}
      <div className="relative z-10 flex h-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-4xl flex-col items-center">

          {/* Badge */}
          <div className="mb-5 h-8 w-32 rounded-full bg-white/40 sm:w-40" />

          {/* Main heading */}
          <div className="h-10 w-4/5 max-w-2xl rounded-lg bg-white/50 sm:h-14 md:h-16 lg:h-20" />

          {/* Highlight heading */}
          <div className="mt-3 h-10 w-3/5 max-w-xl rounded-lg bg-white/40 sm:h-14 md:h-16 lg:h-20" />

          {/* Description */}
          <div className="mt-6 flex w-full max-w-xl flex-col items-center gap-2">
            <div className="h-3 w-full rounded bg-white/40 sm:h-4" />
            <div className="h-3 w-5/6 rounded bg-white/40 sm:h-4" />
            <div className="h-3 w-2/3 rounded bg-white/40 sm:h-4" />
          </div>

          {/* Buttons */}
          <div className="mt-8 flex w-full max-w-md flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <div className="h-11 w-full rounded-lg bg-white/60 sm:w-40 sm:rounded-xl" />
            <div className="h-11 w-full rounded-lg border border-white/30 bg-white/20 sm:w-40 sm:rounded-xl" />
          </div>

        </div>
      </div>

      {/* Slider indicators */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-7">
        <div className="h-1.5 w-10 rounded-full bg-white/70" />
        <div className="h-1.5 w-5 rounded-full bg-white/30" />
        <div className="h-1.5 w-5 rounded-full bg-white/30" />
      </div>
    </section>
  );
}

  /*
   * =========================================
   * NO HERO DATA
   * =========================================
   */
  if (!slides.length || !currentSlide) {
    return null;
  }

  return (
    <section
      className="
        relative
        h-[520px]
        min-h-[520px]
        w-full
        overflow-hidden

        sm:h-[560px]
        sm:min-h-[560px]

        md:h-[580px]
        md:min-h-[580px]

        lg:h-[560px]
        lg:min-h-[560px]

        xl:h-[600px]
        xl:min-h-[600px]
      "
    >
      {/* =========================================
          BACKGROUND SLIDES
      ========================================== */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <img
           width={1920}
  height={600}
          loading={index === 0 ? "eager" : "lazy"}
  fetchPriority={index === 0 ? "high" : "low"}
  decoding="async"
            key={slide._id || index}
            ref={(element) => {
              imageRefs.current[index] = element;
            }}
            src={slide.image}
            alt={slide.title}
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              object-center
              will-change-transform
            "
          />
        ))}
      </div>

      {/* =========================================
          LIGHT OVERLAY
      ========================================== */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-b
          from-black/5
          via-black/15
          to-black/45
        "
      />

      {/* =========================================
          HERO CONTENT
      ========================================== */}
      <div
        className="
          relative
          z-10
          flex
          h-full
          items-center
          justify-center
          px-4
          py-10

          sm:px-6
          sm:py-12

          lg:px-8
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-4xl
            text-center
          "
        >
          <div
            ref={contentRef}
            className="
              mx-auto
              flex
              flex-col
              items-center
            "
          >
            {/* =====================================
                BADGE
            ====================================== */}
            <span
              className="
                mb-4
                inline-flex
                items-center
                rounded-full
                border
                border-white/25
                bg-black/20
                px-3
                py-1.5
                text-[11px]
                font-medium
                text-white
                shadow-lg
                backdrop-blur-sm

                sm:mb-5
                sm:px-4
                sm:py-2
                sm:text-sm
              "
            >
              {currentSlide.badge}
            </span>

            {/* =====================================
                HEADING
            ====================================== */}
            <h1
              className="
                max-w-4xl
                text-3xl
                font-bold
                leading-[1.08]
                tracking-tight
                text-white
                drop-shadow-lg

                sm:text-5xl

                md:text-6xl

                lg:text-6xl

                xl:text-7xl
              "
            >
              {currentSlide.title}

              <span className="block text-white/90">
                {currentSlide.highlight}
              </span>
            </h1>

            {/* =====================================
                DESCRIPTION
            ====================================== */}
            <p
              className="
                mx-auto
                mt-4
                max-w-xl
                px-2
                text-xs
                leading-5
                text-white/85
                drop-shadow-md

                sm:mt-5
                sm:px-0
                sm:text-base
                sm:leading-7

                md:text-lg
              "
            >
              {currentSlide.description}
            </p>

            {/* =====================================
                BUTTONS
            ====================================== */}
            <div
              className="
                mt-6
                flex
                w-full
                max-w-md
                flex-col
                items-center
                justify-center
                gap-3

                sm:mt-8
                sm:flex-row
                sm:gap-4
              "
            >
              {/* Primary Button */}
              <button
                type="button"
                onClick={() => {
                  if (
                    currentSlide.primaryButtonLink
                  ) {
                    navigate(
                      currentSlide.primaryButtonLink
                    );
                  }
                }}
                className="
                  w-full
                  rounded-lg
                  bg-white
                  px-5
                  py-2.5
                  text-xs
                  font-semibold
                  text-black
                  shadow-xl
                  transition-all
                  duration-300

                  hover:-translate-y-1
                  hover:bg-white/90
                  hover:shadow-2xl

                  sm:w-auto
                  sm:rounded-xl
                  sm:px-7
                  sm:py-3.5
                  sm:text-sm

                  md:text-base
                "
              >
                {currentSlide.primaryButtonText}
              </button>

              {/* Secondary Button */}
              {currentSlide.secondaryButtonText && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      currentSlide.secondaryButtonLink
                    ) {
                      navigate(
                        currentSlide.secondaryButtonLink
                      );
                    }
                  }}
                  className="
                    w-full
                    rounded-lg
                    border
                    border-white/30
                    bg-black/20
                    px-5
                    py-2.5
                    text-xs
                    font-semibold
                    text-white
                    shadow-lg
                    backdrop-blur-sm
                    transition-all
                    duration-300

                    hover:-translate-y-1
                    hover:bg-black/30
                    hover:shadow-xl

                    sm:w-auto
                    sm:rounded-xl
                    sm:px-7
                    sm:py-3.5
                    sm:text-sm

                    md:text-base
                  "
                >
                  {currentSlide.secondaryButtonText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          SLIDER INDICATORS
      ========================================== */}
      {slides.length > 1 && (
        <div
          className="
            absolute
            bottom-5
            left-1/2
            z-20
            flex
            -translate-x-1/2
            items-center
            gap-1.5

            sm:bottom-7
            sm:gap-2
          "
        >
          {slides.map((slide, index) => (
            <button
              key={slide._id || index}
              type="button"
              onClick={() => goToSlide(index)}
              disabled={isAnimatingRef.current}
              className={`
                h-1
                rounded-full
                transition-all
                duration-500

                sm:h-1.5

                ${
                  index === currentIndex
                    ? "w-8 bg-white shadow-lg sm:w-10"
                    : "w-3 bg-white/40 hover:bg-white/80 sm:w-5"
                }
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Hero;
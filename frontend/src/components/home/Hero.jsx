// import backgroundImage from "../../assets/wallpaperflare.com_wallpaper.jpg";
// import iphoneBanner from "../../assets/iphone banner.webp";
// import React, { useCallback, useEffect, useRef, useState } from "react";
// import gsap from "gsap";

// const slides = [
//   {
//     image: backgroundImage,
//     badge: "🔥 Trending Now",
//     title: "Discover Your Next",
//     highlight: "Favorite Product.",
//     description:
//       "Explore the latest products, trending styles, and everyday essentials — all in one place.",
//     primaryButton: "Shop Now",
//     secondaryButton: "Explore Products",
//   },
//   {
//     image: iphoneBanner,
//     badge: "✨ New Collection",
//     title: "Fresh Styles.",
//     highlight: "Made for You.",
//     description:
//       "Upgrade your style with our latest collection of fashion, accessories, and everyday essentials.",
//     primaryButton: "Shop Collection",
//     secondaryButton: "View Categories",
//   },
//   // {
//   //   image: "/images/hero-3.jpg",
//   //   badge: "⚡ Best Deals",
//   //   title: "Great Products.",
//   //   highlight: "Better Prices.",
//   //   description:
//   //     "Grab amazing deals on products you love and enjoy great value every time you shop.",
//   //   primaryButton: "View Deals",
//   //   secondaryButton: "Shop Now",
//   // },
//   // {
//   //   image: "/images/hero-4.jpg",
//   //   badge: "🚀 Just Arrived",
//   //   title: "Something New",
//   //   highlight: "Is Waiting for You.",
//   //   description:
//   //     "Discover newly added products and find something perfect for your lifestyle.",
//   //   primaryButton: "Discover Now",
//   //   secondaryButton: "Browse Products",
//   // },
// ];

// const Hero = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const imageRefs = useRef([]);
//   const contentRef = useRef(null);
//   const isAnimatingRef = useRef(false);

//   const currentSlide = slides[currentIndex];

//   /*
//    * Initial GSAP setup
//    */
//   useEffect(() => {
//     imageRefs.current.forEach((image, index) => {
//       if (!image) return;

//       gsap.set(image, {
//         opacity: index === 0 ? 1 : 0,
//         scale: index === 0 ? 1 : 1.04,
//       });
//     });

//     return () => {
//       gsap.killTweensOf(imageRefs.current);
//       gsap.killTweensOf(contentRef.current);
//     };
//   }, []);

//   /*
//    * Change slide
//    */
//   const goToSlide = useCallback(
//     (nextIndex) => {
//       if (
//         nextIndex === currentIndex ||
//         isAnimatingRef.current
//       ) {
//         return;
//       }

//       const currentImage = imageRefs.current[currentIndex];
//       const nextImage = imageRefs.current[nextIndex];

//       if (!currentImage || !nextImage) {
//         return;
//       }

//       isAnimatingRef.current = true;

//       const timeline = gsap.timeline({
//         onComplete: () => {
//           setCurrentIndex(nextIndex);
//           isAnimatingRef.current = false;
//         },
//       });

//       /*
//        * Fade/slide out current content
//        */
//       timeline.to(
//         contentRef.current,
//         {
//           opacity: 0,
//           y: -25,
//           duration: 0.35,
//           ease: "power2.in",
//         },
//         0
//       );

//       /*
//        * Current image transition
//        */
//       timeline.to(
//         currentImage,
//         {
//           opacity: 0,
//           scale: 1.04,
//           duration: 1,
//           ease: "power2.inOut",
//         },
//         0
//       );

//       /*
//        * Next image transition
//        */
//       timeline.fromTo(
//         nextImage,
//         {
//           opacity: 0,
//           scale: 1.04,
//         },
//         {
//           opacity: 1,
//           scale: 1,
//           duration: 1,
//           ease: "power2.inOut",
//         },
//         0.15
//       );

//       /*
//        * Update text content
//        */
//       timeline.call(() => {
//         setCurrentIndex(nextIndex);
//       });

//       /*
//        * Animate new content in
//        */
//       timeline.fromTo(
//         contentRef.current,
//         {
//           opacity: 0,
//           y: 25,
//         },
//         {
//           opacity: 1,
//           y: 0,
//           duration: 0.65,
//           ease: "power3.out",
//         },
//         "-=0.35"
//       );
//     },
//     [currentIndex]
//   );

//   /*
//    * Automatic slider
//    */
//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (!isAnimatingRef.current) {
//         const nextIndex =
//           (currentIndex + 1) % slides.length;

//         goToSlide(nextIndex);
//       }
//     }, 5000);

//     return () => {
//       clearInterval(interval);
//     };
//   }, [currentIndex, goToSlide]);

//   return (
//     <section
//       className="
//         relative
//         h-[520px]
//         min-h-[520px]
//         w-full
//         overflow-hidden

//         sm:h-[560px]
//         sm:min-h-[560px]

//         md:h-[580px]
//         md:min-h-[580px]

//         lg:h-[560px]
//         lg:min-h-[560px]

//         xl:h-[600px]
//         xl:min-h-[600px]
//       "
//     >
//       {/* =========================================
//           BACKGROUND SLIDES
//       ========================================== */}
//       <div className="absolute inset-0">
//         {slides.map((slide, index) => (
//           <img
//             key={slide.image}
//             ref={(element) => {
//               imageRefs.current[index] = element;
//             }}
//             src={slide.image}
//             alt={slide.title}
//             className="
//               absolute
//               inset-0
//               h-full
//               w-full
//               object-cover
//               object-center
//               will-change-transform
//             "
//           />
//         ))}
//       </div>

//       {/* =========================================
//           LIGHT OVERLAY
//           Keeps image bright while improving text
//           readability.
//       ========================================== */}
//       <div
//         className="
//           pointer-events-none
//           absolute
//           inset-0
//           bg-gradient-to-b
//           from-black/5
//           via-black/15
//           to-black/45
//         "
//       />

//       {/* =========================================
//           HERO CONTENT
//       ========================================== */}
//       <div
//         className="
//           relative
//           z-10
//           flex
//           h-full
//           items-center
//           justify-center
//           px-4
//           py-10

//           sm:px-6
//           sm:py-12

//           lg:px-8
//         "
//       >
//         <div
//           className="
//             mx-auto
//             w-full
//             max-w-4xl
//             text-center
//           "
//         >
//           <div
//             ref={contentRef}
//             className="
//               mx-auto
//               flex
//               flex-col
//               items-center
//             "
//           >
//             {/* =====================================
//                 BADGE
//             ====================================== */}
//             <span
//               className="
//                 mb-4
//                 inline-flex
//                 items-center
//                 rounded-full
//                 border
//                 border-white/25
//                 bg-black/20
//                 px-3
//                 py-1.5
//                 text-[11px]
//                 font-medium
//                 text-white
//                 shadow-lg
//                 backdrop-blur-sm

//                 sm:mb-5
//                 sm:px-4
//                 sm:py-2
//                 sm:text-sm
//               "
//             >
//               {currentSlide.badge}
//             </span>

//             {/* =====================================
//                 HEADING
//             ====================================== */}
//             <h1
//               className="
//                 max-w-4xl
//                 text-3xl
//                 font-bold
//                 leading-[1.08]
//                 tracking-tight
//                 text-white
//                 drop-shadow-lg

//                 sm:text-5xl

//                 md:text-6xl

//                 lg:text-6xl

//                 xl:text-7xl
//               "
//             >
//               {currentSlide.title}

//               <span className="block text-white/90">
//                 {currentSlide.highlight}
//               </span>
//             </h1>

//             {/* =====================================
//                 DESCRIPTION
//             ====================================== */}
//             <p
//               className="
//                 mx-auto
//                 mt-4
//                 max-w-xl
//                 px-2
//                 text-xs
//                 leading-5
//                 text-white/85
//                 drop-shadow-md

//                 sm:mt-5
//                 sm:px-0
//                 sm:text-base
//                 sm:leading-7

//                 md:text-lg
//               "
//             >
//               {currentSlide.description}
//             </p>

//             {/* =====================================
//                 BUTTONS
//             ====================================== */}
//             <div
//               className="
//                 mt-6
//                 flex
//                 w-full
//                 max-w-md
//                 flex-col
//                 items-center
//                 justify-center
//                 gap-3

//                 sm:mt-8
//                 sm:flex-row
//                 sm:gap-4
//               "
//             >
//               {/* Primary Button */}
//               <button
//                 type="button"
//                 className="
//                   w-full
//                   rounded-lg
//                   bg-white
//                   px-5
//                   py-2.5
//                   text-xs
//                   font-semibold
//                   text-black
//                   shadow-xl
//                   transition-all
//                   duration-300

//                   hover:-translate-y-1
//                   hover:bg-white/90
//                   hover:shadow-2xl

//                   sm:w-auto
//                   sm:rounded-xl
//                   sm:px-7
//                   sm:py-3.5
//                   sm:text-sm

//                   md:text-base
//                 "
//               >
//                 {currentSlide.primaryButton}
//               </button>

//               {/* Secondary Button */}
//               <button
//                 type="button"
//                 className="
//                   w-full
//                   rounded-lg
//                   border
//                   border-white/30
//                   bg-black/20
//                   px-5
//                   py-2.5
//                   text-xs
//                   font-semibold
//                   text-white
//                   shadow-lg
//                   backdrop-blur-sm
//                   transition-all
//                   duration-300

//                   hover:-translate-y-1
//                   hover:bg-black/30
//                   hover:shadow-xl

//                   sm:w-auto
//                   sm:rounded-xl
//                   sm:px-7
//                   sm:py-3.5
//                   sm:text-sm

//                   md:text-base
//                 "
//               >
//                 {currentSlide.secondaryButton}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* =========================================
//           SLIDER INDICATORS
//       ========================================== */}
//       <div
//         className="
//           absolute
//           bottom-5
//           left-1/2
//           z-20
//           flex
//           -translate-x-1/2
//           items-center
//           gap-1.5

//           sm:bottom-7
//           sm:gap-2
//         "
//       >
//         {slides.map((_, index) => (
//           <button
//             key={index}
//             type="button"
//             onClick={() => goToSlide(index)}
//             disabled={isAnimatingRef.current}
//             className={`
//               h-1
//               rounded-full
//               transition-all
//               duration-500

//               sm:h-1.5

//               ${
//                 index === currentIndex
//                   ? "w-8 bg-white shadow-lg sm:w-10"
//                   : "w-3 bg-white/40 hover:bg-white/80 sm:w-5"
//               }
//             `}
//             aria-label={`Go to slide ${index + 1}`}
//           />
//         ))}
//       </div>
//     </section>
//   );
// };

// export default Hero;

















import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getHomepage,
} from "../../redux/slices/content/homepage/homepageSlice";

const Hero = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
   * FETCH HOMEPAGE DATA
   * =========================================
   *
   * API call is handled by Redux thunk.
   * Hero component only dispatches the thunk.
   */
  // useEffect(() => {
  //   dispatch(getHomepage());
  // }, [dispatch]);

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

      const currentImage =
        imageRefs.current[currentIndex];

      const nextImage =
        imageRefs.current[nextIndex];

      if (!currentImage || !nextImage) {
        return;
      }

      isAnimatingRef.current = true;

      const timeline = gsap.timeline({
        onComplete: () => {
          setCurrentIndex(nextIndex);
          isAnimatingRef.current = false;
        },
      });

      /*
       * Fade/slide out current content
       */
      timeline.to(
        contentRef.current,
        {
          opacity: 0,
          y: -25,
          duration: 0.35,
          ease: "power2.in",
        },
        0
      );

      /*
       * Current image transition
       */
      timeline.to(
        currentImage,
        {
          opacity: 0,
          scale: 1.04,
          duration: 1,
          ease: "power2.inOut",
        },
        0
      );

      /*
       * Next image transition
       */
      timeline.fromTo(
        nextImage,
        {
          opacity: 0,
          scale: 1.04,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power2.inOut",
        },
        0.15
      );

      /*
       * Update text content
       */
      timeline.call(() => {
        setCurrentIndex(nextIndex);
      });

      /*
       * Animate new content in
       */
      timeline.fromTo(
        contentRef.current,
        {
          opacity: 0,
          y: 25,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: "power3.out",
        },
        "-=0.35"
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
      />
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
// import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
// import iphone from "../../assets/iphone.webp";
// import second from "../../assets/493988652898829963.jfif";
// import { useNavigate } from "react-router-dom";

// export default function Hero() {
//   const navigate = useNavigate();

//   return (
//     <section className="w-full">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

//           {/* ================= MAIN BANNER ================= */}
//           <div
//             className="
//               relative
//               lg:col-span-2
//               overflow-hidden
//               rounded-2xl
//               min-h-[280px]
//               sm:min-h-[340px]
//               lg:min-h-[390px]
//               bg-gradient-to-br
//               from-[#0f2470]
//               via-[#254edb]
//               to-[#6d8cff]
//             "
//           >

//             {/* Image */}
//             <img
//               src={iphone}
//               alt="iPhone 16 Pro Max"
//               className="
//                 absolute
//                 right-[-30px]
//                 sm:right-0
//                 bottom-0
//                 h-[85%]
//                 sm:h-[90%]
//                 lg:h-full
//                 max-w-[55%]
//                 object-contain
//               "
//             />

//             {/* Overlay */}
//             <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />

//             {/* Content */}
//             <div
//               className="
//                 relative
//                 z-10
//                 flex
//                 h-full
//                 items-center
//                 px-6
//                 sm:px-8
//                 lg:px-12
//                 py-10
//               "
//             >
//               <div className="max-w-[55%] sm:max-w-md text-white">

//                 <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-blue-200">
//                   New Arrival
//                 </p>

//                 <h1
//                   className="
//                     mt-2
//                     text-2xl
//                     sm:text-4xl
//                     lg:text-5xl
//                     font-black
//                     leading-tight
//                   "
//                 >
//                  Discover Something

//                   <br />
//                    New
//                 </h1>

//                 <p className="mt-3 text-sm sm:text-base text-blue-100">
// Explore our latest collection and find something you’ll love.
//                 </p>

//                 <div className="mt-4">
//                   {/* <span className="text-xs text-blue-200">
//                     Starting from
//                   </span> */}

//                   {/* <div className="text-2xl sm:text-3xl font-black">
//                     $899
//                   </div> */}
//                 </div>

//                 <button
//                   onClick={() => navigate("/products")}
//                   className="
//                     mt-5
//                     inline-flex
//                     items-center
//                     gap-2
//                     rounded-xl
//                     bg-white
//                     px-5
//                     py-2.5
//                     text-sm
//                     font-bold
//                     text-blue-700
//                     shadow-lg
//                     hover:bg-gray-100
//                     transition
//                     cursor-pointer
//                   "
//                 >
//                   Shop Now
//                   <ArrowRight size={16} />
//                 </button>

//               </div>
//             </div>

//             {/* Arrows */}
//             {/* <button
//               className="
//                 absolute
//                 left-3
//                 top-1/2
//                 -translate-y-1/2
//                 hidden
//                 sm:flex
//                 h-9
//                 w-9
//                 items-center
//                 justify-center
//                 rounded-full
//                 bg-white/20
//                 text-white
//                 backdrop-blur
//                 hover:bg-white/30
//               "
//             >
//               <ChevronLeft size={20} />
//             </button>

//             <button
//               className="
//                 absolute
//                 right-3
//                 top-1/2
//                 -translate-y-1/2
//                 hidden
//                 sm:flex
//                 h-9
//                 w-9
//                 items-center
//                 justify-center
//                 rounded-full
//                 bg-white/20
//                 text-white
//                 backdrop-blur
//                 hover:bg-white/30
//               "
//             >
//               <ChevronRight size={20} />
//             </button> */}

//             {/* Dots */}
//             {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
//               <span className="h-1.5 w-6 rounded-full bg-white" />
//               <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
//               <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
//             </div> */}

//           </div>

//           {/* ================= SIDE PROMO ================= */}
//           <div
//             className="
//               relative
//               overflow-hidden
//               rounded-2xl
//               min-h-[220px]
//               sm:min-h-[260px]
//               lg:min-h-[390px]
//               group
//             "
//           >

//             <img
//               src={second}
//               alt="Special offer"
//               className="
//                 absolute
//                 inset-0
//                 h-full
//                 w-full
//                 object-cover
//                 transition
//                 duration-700
//                 group-hover:scale-105
//               "
//             />

//             <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

//             <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">

//               <p className="text-sm font-medium text-gray-200">
//                 Limited Time Offer
//               </p>

//               <h2 className="mt-1 text-3xl sm:text-4xl font-black">
//                 50% OFF
//               </h2>

//               <p className="mt-1 text-sm text-gray-200">
//                 Grab your favorite products today.
//               </p>

//               <button
//                 onClick={() => navigate("/products")}
//                 className="
//                   mt-4
//                   rounded-xl
//                   bg-white
//                   px-5
//                   py-2.5
//                   text-sm
//                   font-bold
//                   text-gray-900
//                   hover:bg-gray-100
//                   transition
//                   cursor-pointer
//                 "
//               >
//                 Explore Deals
//               </button>

//             </div>

//           </div>

//         </div>
//       </div>
//     </section>
//   );
// }





// import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw } from "lucide-react";
// import iphone from "../../assets/iphone.webp";
// import second from "../../assets/493988652898829963.jfif";
// import { useNavigate } from "react-router-dom";

// export default function Hero() {
//   const navigate = useNavigate();

//   return (
//     <section className="w-full bg-white">
//       <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

//         {/* =====================================================
//             HERO
//         ====================================================== */}
//         <div className="grid gap-4 lg:grid-cols-[1.65fr_0.8fr]">

//           {/* ================= MAIN HERO ================= */}
//           <div
//             className="
//               group
//               relative
//               min-h-[500px]
//               overflow-hidden
//               rounded-[28px]
//               bg-[#f3f6ff]
//               sm:min-h-[540px]
//               lg:min-h-[590px]
//             "
//           >

//             {/* Decorative background */}
//             <div
//               className="
//                 absolute
//                 -right-32
//                 -top-32
//                 h-[420px]
//                 w-[420px]
//                 rounded-full
//                 bg-blue-200/40
//                 blur-3xl
//               "
//             />

//             <div
//               className="
//                 absolute
//                 bottom-[-180px]
//                 left-[20%]
//                 h-[400px]
//                 w-[400px]
//                 rounded-full
//                 bg-indigo-200/30
//                 blur-3xl
//               "
//             />

//             {/* Small top label */}
//             <div
//               className="
//                 absolute
//                 left-6
//                 top-6
//                 z-20
//                 flex
//                 items-center
//                 gap-2
//                 rounded-full
//                 border
//                 border-gray-200/80
//                 bg-white/80
//                 px-3.5
//                 py-2
//                 text-xs
//                 font-semibold
//                 text-gray-700
//                 shadow-sm
//                 backdrop-blur
//                 sm:left-8
//                 sm:top-8
//               "
//             >
//               <Sparkles size={14} className="text-blue-600" />
//               New collection 2026
//             </div>

//             {/* Product image */}
//             <div
//               className="
//                 absolute
//                 right-[-5%]
//                 top-[16%]
//                 z-10
//                 flex
//                 w-[62%]
//                 justify-center
//                 transition-transform
//                 duration-700
//                 ease-out
//                 group-hover:translate-x-2
//                 sm:right-[0%]
//                 sm:w-[58%]
//                 lg:right-[-2%]
//                 lg:top-[8%]
//                 lg:w-[59%]
//               "
//             >
//               <img
//                 src={iphone}
//                 alt="Latest smartphone"
//                 className="
//                   h-auto
//                   max-h-[390px]
//                   w-full
//                   object-contain
//                   drop-shadow-[0_35px_35px_rgba(30,64,175,0.22)]
//                   sm:max-h-[440px]
//                   lg:max-h-[510px]
//                 "
//               />
//             </div>

//             {/* Main content */}
//             <div
//               className="
//                 relative
//                 z-20
//                 flex
//                 min-h-[500px]
//                 w-full
//                 flex-col
//                 justify-end
//                 p-6
//                 sm:min-h-[540px]
//                 sm:p-9
//                 lg:min-h-[590px]
//                 lg:w-[57%]
//                 lg:justify-center
//                 lg:p-12
//               "
//             >

//               <div className="max-w-[430px]">

//                 <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
//                   Technology, redefined
//                 </p>

//                 <h1
//                   className="
//                     text-[42px]
//                     font-black
//                     leading-[0.98]
//                     tracking-[-0.04em]
//                     text-gray-950
//                     sm:text-5xl
//                     lg:text-[64px]
//                   "
//                 >
//                   Find what
//                   <br />
//                   <span className="text-blue-600">
//                     inspires you.
//                   </span>
//                 </h1>

//                 <p
//                   className="
//                     mt-5
//                     max-w-[380px]
//                     text-sm
//                     leading-6
//                     text-gray-600
//                     sm:text-base
//                   "
//                 >
//                   Discover carefully selected products designed to
//                   make everyday life smarter, simpler, and better.
//                 </p>

//                 {/* CTA */}
//                 <div className="mt-7 flex flex-wrap items-center gap-3">

//                   <button
//                     onClick={() => navigate("/products")}
//                     className="
//                       inline-flex
//                       items-center
//                       gap-2
//                       rounded-xl
//                       bg-gray-950
//                       px-5
//                       py-3
//                       text-sm
//                       font-bold
//                       text-white
//                       shadow-lg
//                       shadow-gray-900/10
//                       transition-all
//                       duration-200
//                       hover:-translate-y-0.5
//                       hover:bg-blue-600
//                       hover:shadow-blue-600/20
//                       cursor-pointer
//                     "
//                   >
//                     Explore products
//                     <ArrowRight size={17} />
//                   </button>

//                   <button
//                     onClick={() => navigate("/products")}
//                     className="
//                       rounded-xl
//                       px-4
//                       py-3
//                       text-sm
//                       font-semibold
//                       text-gray-600
//                       transition
//                       hover:bg-white
//                       hover:text-gray-950
//                       cursor-pointer
//                     "
//                   >
//                     View all
//                   </button>

//                 </div>

//               </div>
//             </div>

//             {/* Floating product card */}
//             <div
//               className="
//                 absolute
//                 bottom-6
//                 right-5
//                 z-30
//                 hidden
//                 w-[205px]
//                 rounded-2xl
//                 border
//                 border-white/80
//                 bg-white/90
//                 p-3
//                 shadow-xl
//                 shadow-blue-900/10
//                 backdrop-blur
//                 sm:block
//                 lg:right-8
//               "
//             >
//               <div className="flex items-center gap-3">

//                 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
//                   <img
//                     src={iphone}
//                     alt=""
//                     className="h-9 w-9 object-contain"
//                   />
//                 </div>

//                 <div className="min-w-0">
//                   <p className="truncate text-xs font-medium text-gray-500">
//                     Featured pick
//                   </p>

//                   <p className="truncate text-sm font-bold text-gray-900">
//                     Latest Smartphone
//                   </p>
//                 </div>

//               </div>

//               <div className="mt-3 flex items-center justify-between">
//                 <span className="text-xs font-medium text-gray-500">
//                   New arrival
//                 </span>

//                 <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-600">
//                   IN STOCK
//                 </span>
//               </div>
//             </div>

//           </div>

//           {/* ================= RIGHT PROMOTION ================= */}
//           <div
//             className="
//               relative
//               min-h-[430px]
//               overflow-hidden
//               rounded-[28px]
//               bg-[#111827]
//               sm:min-h-[470px]
//               lg:min-h-[590px]
//             "
//           >

//             {/* Image */}
//             <img
//               src={second}
//               alt="Featured offer"
//               className="
//                 absolute
//                 inset-0
//                 h-full
//                 w-full
//                 object-cover
//                 opacity-90
//                 transition
//                 duration-700
//                 hover:scale-105
//               "
//             />

//             {/* Dark overlay */}
//             <div
//               className="
//                 absolute
//                 inset-0
//                 bg-gradient-to-b
//                 from-black/10
//                 via-black/25
//                 to-black/90
//               "
//             />

//             {/* Offer badge */}
//             <div className="absolute left-5 top-5 z-10 sm:left-6 sm:top-6">
//               <span
//                 className="
//                   inline-flex
//                   rounded-full
//                   bg-white/95
//                   px-3
//                   py-1.5
//                   text-[11px]
//                   font-bold
//                   uppercase
//                   tracking-wide
//                   text-gray-900
//                   shadow-lg
//                 "
//               >
//                 Limited offer
//               </span>
//             </div>

//             {/* Promo content */}
//             <div
//               className="
//                 absolute
//                 inset-x-0
//                 bottom-0
//                 z-10
//                 p-5
//                 sm:p-6
//                 lg:p-7
//               "
//             >

//               <p className="text-sm font-medium text-white/70">
//                 Selected products
//               </p>

//               <h2
//                 className="
//                   mt-1
//                   text-4xl
//                   font-black
//                   tracking-tight
//                   text-white
//                   sm:text-5xl
//                 "
//               >
//                 50% OFF
//               </h2>

//               <p className="mt-2 max-w-[280px] text-sm leading-5 text-white/70">
//                 Refresh your setup with special prices for a limited time.
//               </p>

//               <button
//                 onClick={() => navigate("/products")}
//                 className="
//                   mt-5
//                   inline-flex
//                   items-center
//                   gap-2
//                   rounded-xl
//                   bg-white
//                   px-5
//                   py-3
//                   text-sm
//                   font-bold
//                   text-gray-950
//                   transition
//                   hover:bg-blue-600
//                   hover:text-white
//                   cursor-pointer
//                 "
//               >
//                 Shop the sale
//                 <ArrowRight size={16} />
//               </button>

//             </div>

//           </div>

//         </div>
//       </div> 
//     </section>
//   );
// }















import backgroundImage from "../../assets/wallpaperflare.com_wallpaper.jpg";
import iphoneBanner from "../../assets/iphone banner.webp";
import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";

const slides = [
  {
    image: backgroundImage,
    badge: "🔥 Trending Now",
    title: "Discover Your Next",
    highlight: "Favorite Product.",
    description:
      "Explore the latest products, trending styles, and everyday essentials — all in one place.",
    primaryButton: "Shop Now",
    secondaryButton: "Explore Products",
  },
  {
    image: iphoneBanner,
    badge: "✨ New Collection",
    title: "Fresh Styles.",
    highlight: "Made for You.",
    description:
      "Upgrade your style with our latest collection of fashion, accessories, and everyday essentials.",
    primaryButton: "Shop Collection",
    secondaryButton: "View Categories",
  },
  // {
  //   image: "/images/hero-3.jpg",
  //   badge: "⚡ Best Deals",
  //   title: "Great Products.",
  //   highlight: "Better Prices.",
  //   description:
  //     "Grab amazing deals on products you love and enjoy great value every time you shop.",
  //   primaryButton: "View Deals",
  //   secondaryButton: "Shop Now",
  // },
  // {
  //   image: "/images/hero-4.jpg",
  //   badge: "🚀 Just Arrived",
  //   title: "Something New",
  //   highlight: "Is Waiting for You.",
  //   description:
  //     "Discover newly added products and find something perfect for your lifestyle.",
  //   primaryButton: "Discover Now",
  //   secondaryButton: "Browse Products",
  // },
];

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const imageRefs = useRef([]);
  const contentRef = useRef(null);
  const isAnimatingRef = useRef(false);

  const currentSlide = slides[currentIndex];

  /*
   * Initial GSAP setup
   */
  useEffect(() => {
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
  }, []);

  /*
   * Change slide
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
   * Automatic slider
   */
  useEffect(() => {
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
  }, [currentIndex, goToSlide]);

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
            key={slide.image}
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
          Keeps image bright while improving text
          readability.
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
                {currentSlide.primaryButton}
              </button>

              {/* Secondary Button */}
              <button
                type="button"
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
                {currentSlide.secondaryButton}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          SLIDER INDICATORS
      ========================================== */}
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
        {slides.map((_, index) => (
          <button
            key={index}
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
    </section>
  );
};

export default Hero;
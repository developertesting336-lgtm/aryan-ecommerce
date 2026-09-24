import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";

import cardImage from "../../assets/Untitled_design_5.png.jpg";
import cardImage1 from "../../assets/jaime-marrero-HHJsM1_b6VY-unsplash.jpg";
import cardImage3 from "../../assets/black-smartwatch.jpg";

// ======================================================
// PROMOTIONAL DATA
// ======================================================

const promoCards = [
  {
    id: "iphone",
    type: "large",
    label: "APPLE IPHONES",
    title: (
      <>
        iPhone Deals. For a
        <br />
        Limited Time.
      </>
    ),
    button: "Shop Now",
    image: cardImage,

    // Background image positioning
    backgroundPosition: "center bottom",
    backgroundSize: "cover",
  },

  {
    id: "trade",
    type: "wide",
    label: "TRADE-IN",
    title: (
      <>
        Trade-In Today.
        <br />
        Save More
        <br />
        On Your Upgrade!
      </>
    ),
    button: "Trade-In",
    image: cardImage1,

    backgroundPosition: "right bottom",
    backgroundSize: "cover",
  },

  {
    id: "technology",
    type: "small",
    title: (
      <>
        Get The Tech
        <br />
        You Want.
        <br />
        <br />
        At The Price You
        <br />
        Deserve.
      </>
    ),
    gradient: true,
  },

  {
    id: "watch",
    type: "small",
    label: "SMARTWATCH",
    title: "Activewear",
    button: "Explore",
    image: cardImage3,
    dark: true,

    backgroundPosition: "center",
    backgroundSize: "cover",
  },
];

// ======================================================
// MAIN COMPONENT
// ======================================================

const PromoGrid = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const backgroundsRef = useRef([]);

  // ====================================================
  // GSAP ENTRANCE + BACKGROUND ANIMATION
  // ====================================================

  useEffect(() => {
    const ctx = gsap.context(() => {
      // -----------------------------------------------
      // Cards entrance
      // -----------------------------------------------

      gsap.fromTo(
        cardsRef.current,
        {
          opacity: 0,
          y: 30,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
        }
      );

      // -----------------------------------------------
      // Background images
      // -----------------------------------------------

      backgroundsRef.current.forEach((background, index) => {
        if (!background) return;

        gsap.fromTo(
          background,
          {
            scale: 1.04,
          },
          {
            scale: 1,
            duration: 1.2,
            delay: index * 0.12,
            ease: "power3.out",
          }
        );
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  // ====================================================
  // BACKGROUND HOVER
  // ====================================================

  const handleMouseEnter = (index) => {
    const background = backgroundsRef.current[index];

    if (!background) return;

    gsap.to(background, {
      scale: 1.06,
      duration: 0.7,
      ease: "power3.out",
    });
  };

  const handleMouseLeave = (index) => {
    const background = backgroundsRef.current[index];

    if (!background) return;

    gsap.to(background, {
      scale: 1,
      duration: 0.7,
      ease: "power3.out",
    });
  };

  // ====================================================
  // CARD
  // ====================================================

  const renderCard = (card, index) => {
    const isLarge = card.type === "large";
    const isWide = card.type === "wide";
    const isSmall = card.type === "small";

    return (
      <motion.div
        key={card.id}
        ref={(element) => {
          cardsRef.current[index] = element;
        }}
        whileHover={{
          y: -4,
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={() => handleMouseLeave(index)}
        className={`
          group
          relative
          overflow-hidden
          rounded-[22px]
          border
          border-slate-200/70
          shadow-[0_4px_20px_rgba(0,0,0,0.04)]
          transition-shadow
          duration-500
          hover:shadow-[0_18px_45px_rgba(0,0,0,0.10)]

          ${
            isLarge
              ? "min-h-[500px] sm:min-h-[540px] lg:min-h-[600px]"
              : ""
          }

          ${
            isWide
              ? "min-h-[300px] sm:min-h-[320px] lg:min-h-[285px]"
              : ""
          }

          ${
            isSmall
              ? "min-h-[300px] sm:min-h-[320px] lg:min-h-[285px]"
              : ""
          }
        `}
      >
        {/* ==================================================
            BACKGROUND IMAGE
        ================================================== */}

        {card.image && (
  <div
    ref={(element) => {
      backgroundsRef.current[index] = element;
    }}
    className={`
      absolute
      inset-0
      z-0
      bg-no-repeat
      will-change-transform

      ${
        card.id === "iphone"
          ? `
            bg-[length:auto_72%]
            bg-[position:72%_bottom]

            sm:bg-[length:auto_78%]
            sm:bg-[position:68%_bottom]

            md:bg-[length:cover]
            md:bg-[position:65%_bottom]

            lg:bg-[length:cover]
            lg:bg-[position:65%_bottom]
          `
          : ""
      }

        ${
  card.id === "trade"
    ? `
      bg-cover
      bg-[position:80%_center]
    `
    : ""
}

      ${
        card.id === "watch"
          ? `
            bg-cover
            bg-center
          `
          : ""
      }
    `}
    style={{
      backgroundImage: `url("${card.image}")`,
    }}
  />
)}

        {/* ==================================================
            BLUE GRADIENT CARD
        ================================================== */}

        {card.gradient && (
          <div
            className="
              absolute
              inset-0
              z-0
              bg-gradient-to-b
              from-blue-500
              via-blue-500
              to-sky-300
            "
          />
        )}

        {/* ==================================================
            IMAGE OVERLAY
        ================================================== */}

        {card.image && (
          <div
            className={`
              absolute
              inset-0
              z-[1]
              transition-all
              duration-500

              ${
                card.dark
                  ? "bg-black/35 group-hover:bg-black/25"
                  : isWide
                  ? "bg-gradient-to-r from-white/10 via-transparent to-transparent"
                  : "bg-gradient-to-b from-white/5 via-transparent to-white/5"
              }
            `}
          />
        )}

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div
          className={`
            relative
            z-10
            flex
            h-full
            min-h-inherit

            ${
              isLarge
                ? `
                  flex-col
                  items-center
                  px-5
                  pt-8
                  text-center

                  sm:px-8
                  sm:pt-9

                  lg:px-10
                  lg:pt-10
                `
                : ""
            }

            ${
              isWide
                ? `
                  flex-col
                  items-start
                  px-6
                  py-8
                  text-left

                  sm:px-8
                  sm:py-8

                  lg:px-9
                  lg:py-8
                `
                : ""
            }

            ${
              isSmall && card.gradient
                ? `
                  min-h-[300px]
                  flex-col
                  items-center
                  justify-center
                  px-5
                  py-8
                  text-center
                  text-white
                `
                : ""
            }

            ${
              isSmall && card.dark
                ? `
                  min-h-[300px]
                  flex-col
                  items-center
                  justify-center
                  px-5
                  py-8
                  text-center
                  text-white
                `
                : ""
            }
          `}
        >
          {/* ==================================================
              LABEL
          ================================================== */}

          {card.label && (
            <span
              className={`
                text-[10px]
                font-semibold
                tracking-[0.17em]

                sm:text-[11px]

                ${
                  card.dark
                    ? "text-white/90"
                    : "text-slate-800"
                }
              `}
            >
              {card.label}
            </span>
          )}

          {/* ==================================================
              TITLE
          ================================================== */}

          <h3
            className={`
              font-semibold
              tracking-tight

              ${
                isLarge
                  ? `
                    mt-5
                    text-[30px]
                    leading-[1.08]

                    sm:mt-6
                    sm:text-4xl

                    md:text-[42px]

                    lg:text-[44px]

                    xl:text-[46px]
                  `
                  : ""
              }

              ${
                isWide
                  ? `
                    mt-4
                    text-[24px]
                    leading-[1.15]

                    sm:mt-5
                    sm:text-[27px]

                    lg:text-[29px]
                  `
                  : ""
              }

              ${
                isSmall && card.gradient
                  ? `
                    text-[28px]
                    leading-[1.18]

                    sm:text-[31px]
                  `
                  : ""
              }

              ${
                isSmall && card.dark
                  ? `
                    mt-4
                    text-[29px]
                    leading-tight

                    sm:text-[32px]
                  `
                  : ""
              }

              ${
                card.dark || card.gradient
                  ? "text-white"
                  : "text-[#252d33]"
              }
            `}
          >
            {card.title}
          </h3>

          {/* ==================================================
              BUTTON
          ================================================== */}

          {card.button && (
            <button
              type="button"
              className={`
                group/button
                mt-5
                inline-flex
                items-center
                gap-1
                border-0
                bg-transparent
                p-0
                text-sm
                font-medium
                outline-none
                transition-colors
                duration-300

                ${
                  card.dark || card.gradient
                    ? "text-white hover:text-white/75"
                    : "text-blue-600 hover:text-blue-700"
                }
              `}
            >
              {card.button}

              <ArrowRight
                size={15}
                strokeWidth={1.8}
                className="
                  transition-transform
                  duration-300
                  group-hover/button:translate-x-1
                "
              />
            </button>
          )}
        </div>

        {/* ==================================================
            HOVER BORDER
        ================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-20
            rounded-[22px]
            opacity-0
            ring-1
            ring-inset
            ring-black/5
            transition-opacity
            duration-500
            group-hover:opacity-100
          "
        />
      </motion.div>
    );
  };

  // ====================================================
  // RETURN
  // ====================================================

  return (
    <section
      ref={sectionRef}
      className="
        w-full
        bg-white
        px-4
        py-8

        sm:px-6
        sm:py-12

        lg:px-8
        lg:py-14

        xl:px-10
      "
    >
      <div
        className="
          mx-auto
          grid
          w-full
          max-w-[1280px]
          grid-cols-1
          gap-4

          lg:grid-cols-2
          lg:grid-rows-2
        "
      >
        {/* ================================================
            LARGE LEFT CARD
        ================================================= */}

        <div className="lg:row-span-2">
          {renderCard(promoCards[0], 0)}
        </div>

        {/* ================================================
            TOP RIGHT CARD
        ================================================= */}

        <div>
          {renderCard(promoCards[1], 1)}
        </div>

        {/* ================================================
            BOTTOM RIGHT CARDS
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            gap-4

            sm:grid-cols-2
          "
        >
          {renderCard(promoCards[2], 2)}

          {renderCard(promoCards[3], 3)}
        </div>
      </div>
    </section>
  );
};

export default PromoGrid;
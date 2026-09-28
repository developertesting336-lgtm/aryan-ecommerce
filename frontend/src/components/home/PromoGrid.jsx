// import React, { useEffect, useRef } from "react";
// import { motion } from "motion/react";
// import gsap from "gsap";
// import { ArrowRight } from "lucide-react";

// import cardImage from "../../assets/Untitled_design_5.png.jpg";
// import cardImage1 from "../../assets/jaime-marrero-HHJsM1_b6VY-unsplash.jpg";
// import cardImage3 from "../../assets/black-smartwatch.jpg";

// // ======================================================
// // PROMOTIONAL DATA
// // ======================================================

// const promoCards = [
//   {
//     id: "iphone",
//     type: "large",
//     label: "APPLE IPHONES",
//     title: (
//       <>
//         iPhone Deals. For a
//         <br />
//         Limited Time.
//       </>
//     ),
//     button: "Shop Now",
//     image: cardImage,

//     // Background image positioning
//     backgroundPosition: "center bottom",
//     backgroundSize: "cover",
//   },

//   {
//     id: "trade",
//     type: "wide",
//     label: "TRADE-IN",
//     title: (
//       <>
//         Trade-In Today.
//         <br />
//         Save More
//         <br />
//         On Your Upgrade!
//       </>
//     ),
//     button: "Trade-In",
//     image: cardImage1,

//     backgroundPosition: "right bottom",
//     backgroundSize: "cover",
//   },

//   {
//     id: "technology",
//     type: "small",
//     title: (
//       <>
//         Get The Tech
//         <br />
//         You Want.
//         <br />
//         <br />
//         At The Price You
//         <br />
//         Deserve.
//       </>
//     ),
//     gradient: true,
//   },

//   {
//     id: "watch",
//     type: "small",
//     label: "SMARTWATCH",
//     title: "Activewear",
//     button: "Explore",
//     image: cardImage3,
//     dark: true,

//     backgroundPosition: "center",
//     backgroundSize: "cover",
//   },
// ];

// // ======================================================
// // MAIN COMPONENT
// // ======================================================

// const PromoGrid = () => {
//   const sectionRef = useRef(null);
//   const cardsRef = useRef([]);
//   const backgroundsRef = useRef([]);

//   // ====================================================
//   // GSAP ENTRANCE + BACKGROUND ANIMATION
//   // ====================================================

//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       // -----------------------------------------------
//       // Cards entrance
//       // -----------------------------------------------

//       gsap.fromTo(
//         cardsRef.current,
//         {
//           opacity: 0,
//           y: 30,
//           scale: 0.98,
//         },
//         {
//           opacity: 1,
//           y: 0,
//           scale: 1,
//           duration: 0.8,
//           stagger: 0.12,
//           ease: "power3.out",
//         }
//       );

//       // -----------------------------------------------
//       // Background images
//       // -----------------------------------------------

//       backgroundsRef.current.forEach((background, index) => {
//         if (!background) return;

//         gsap.fromTo(
//           background,
//           {
//             scale: 1.04,
//           },
//           {
//             scale: 1,
//             duration: 1.2,
//             delay: index * 0.12,
//             ease: "power3.out",
//           }
//         );
//       });
//     }, sectionRef);

//     return () => {
//       ctx.revert();
//     };
//   }, []);

//   // ====================================================
//   // BACKGROUND HOVER
//   // ====================================================

//   const handleMouseEnter = (index) => {
//     const background = backgroundsRef.current[index];

//     if (!background) return;

//     gsap.to(background, {
//       scale: 1.06,
//       duration: 0.7,
//       ease: "power3.out",
//     });
//   };

//   const handleMouseLeave = (index) => {
//     const background = backgroundsRef.current[index];

//     if (!background) return;

//     gsap.to(background, {
//       scale: 1,
//       duration: 0.7,
//       ease: "power3.out",
//     });
//   };

//   // ====================================================
//   // CARD
//   // ====================================================

//   const renderCard = (card, index) => {
//     const isLarge = card.type === "large";
//     const isWide = card.type === "wide";
//     const isSmall = card.type === "small";

//     return (
//       <motion.div
//         key={card.id}
//         ref={(element) => {
//           cardsRef.current[index] = element;
//         }}
//         whileHover={{
//           y: -4,
//         }}
//         transition={{
//           duration: 0.3,
//           ease: "easeOut",
//         }}
//         onMouseEnter={() => handleMouseEnter(index)}
//         onMouseLeave={() => handleMouseLeave(index)}
//         className={`
//           group
//           relative
//           overflow-hidden
//           rounded-[22px]
//           border
//           border-slate-200/70
//           shadow-[0_4px_20px_rgba(0,0,0,0.04)]
//           transition-shadow
//           duration-500
//           hover:shadow-[0_18px_45px_rgba(0,0,0,0.10)]

//           ${
//             isLarge
//               ? "min-h-[500px] sm:min-h-[540px] lg:min-h-[600px]"
//               : ""
//           }

//           ${
//             isWide
//               ? "min-h-[300px] sm:min-h-[320px] lg:min-h-[285px]"
//               : ""
//           }

//           ${
//             isSmall
//               ? "min-h-[300px] sm:min-h-[320px] lg:min-h-[285px]"
//               : ""
//           }
//         `}
//       >
//         {/* ==================================================
//             BACKGROUND IMAGE
//         ================================================== */}

//         {card.image && (
//   <div
//     ref={(element) => {
//       backgroundsRef.current[index] = element;
//     }}
//     className={`
//       absolute
//       inset-0
//       z-0
//       bg-no-repeat
//       will-change-transform

//       ${
//         card.id === "iphone"
//           ? `
//             bg-[length:auto_72%]
//             bg-[position:72%_bottom]

//             sm:bg-[length:auto_78%]
//             sm:bg-[position:68%_bottom]

//             md:bg-[length:cover]
//             md:bg-[position:65%_bottom]

//             lg:bg-[length:cover]
//             lg:bg-[position:65%_bottom]
//           `
//           : ""
//       }

//         ${
//   card.id === "trade"
//     ? `
//       bg-cover
//       bg-[position:80%_center]
//     `
//     : ""
// }

//       ${
//         card.id === "watch"
//           ? `
//             bg-cover
//             bg-center
//           `
//           : ""
//       }
//     `}
//     style={{
//       backgroundImage: `url("${card.image}")`,
//     }}
//   />
// )}

//         {/* ==================================================
//             BLUE GRADIENT CARD
//         ================================================== */}

//         {card.gradient && (
//           <div
//             className="
//               absolute
//               inset-0
//               z-0
//               bg-gradient-to-b
//               from-blue-500
//               via-blue-500
//               to-sky-300
//             "
//           />
//         )}

//         {/* ==================================================
//             IMAGE OVERLAY
//         ================================================== */}

//         {card.image && (
//           <div
//             className={`
//               absolute
//               inset-0
//               z-[1]
//               transition-all
//               duration-500

//               ${
//                 card.dark
//                   ? "bg-black/35 group-hover:bg-black/25"
//                   : isWide
//                   ? "bg-gradient-to-r from-white/10 via-transparent to-transparent"
//                   : "bg-gradient-to-b from-white/5 via-transparent to-white/5"
//               }
//             `}
//           />
//         )}

//         {/* ==================================================
//             CONTENT
//         ================================================== */}

//         <div
//           className={`
//             relative
//             z-10
//             flex
//             h-full
//             min-h-inherit

//             ${
//               isLarge
//                 ? `
//                   flex-col
//                   items-center
//                   px-5
//                   pt-8
//                   text-center

//                   sm:px-8
//                   sm:pt-9

//                   lg:px-10
//                   lg:pt-10
//                 `
//                 : ""
//             }

//             ${
//               isWide
//                 ? `
//                   flex-col
//                   items-start
//                   px-6
//                   py-8
//                   text-left

//                   sm:px-8
//                   sm:py-8

//                   lg:px-9
//                   lg:py-8
//                 `
//                 : ""
//             }

//             ${
//               isSmall && card.gradient
//                 ? `
//                   min-h-[300px]
//                   flex-col
//                   items-center
//                   justify-center
//                   px-5
//                   py-8
//                   text-center
//                   text-white
//                 `
//                 : ""
//             }

//             ${
//               isSmall && card.dark
//                 ? `
//                   min-h-[300px]
//                   flex-col
//                   items-center
//                   justify-center
//                   px-5
//                   py-8
//                   text-center
//                   text-white
//                 `
//                 : ""
//             }
//           `}
//         >
//           {/* ==================================================
//               LABEL
//           ================================================== */}

//           {card.label && (
//             <span
//               className={`
//                 text-[10px]
//                 font-semibold
//                 tracking-[0.17em]

//                 sm:text-[11px]

//                 ${
//                   card.dark
//                     ? "text-white/90"
//                     : "text-slate-800"
//                 }
//               `}
//             >
//               {card.label}
//             </span>
//           )}

//           {/* ==================================================
//               TITLE
//           ================================================== */}

//           <h3
//             className={`
//               font-semibold
//               tracking-tight

//               ${
//                 isLarge
//                   ? `
//                     mt-5
//                     text-[30px]
//                     leading-[1.08]

//                     sm:mt-6
//                     sm:text-4xl

//                     md:text-[42px]

//                     lg:text-[44px]

//                     xl:text-[46px]
//                   `
//                   : ""
//               }

//               ${
//                 isWide
//                   ? `
//                     mt-4
//                     text-[24px]
//                     leading-[1.15]

//                     sm:mt-5
//                     sm:text-[27px]

//                     lg:text-[29px]
//                   `
//                   : ""
//               }

//               ${
//                 isSmall && card.gradient
//                   ? `
//                     text-[28px]
//                     leading-[1.18]

//                     sm:text-[31px]
//                   `
//                   : ""
//               }

//               ${
//                 isSmall && card.dark
//                   ? `
//                     mt-4
//                     text-[29px]
//                     leading-tight

//                     sm:text-[32px]
//                   `
//                   : ""
//               }

//               ${
//                 card.dark || card.gradient
//                   ? "text-white"
//                   : "text-[#252d33]"
//               }
//             `}
//           >
//             {card.title}
//           </h3>

//           {/* ==================================================
//               BUTTON
//           ================================================== */}

//           {card.button && (
//             <button
//               type="button"
//               className={`
//                 group/button
//                 mt-5
//                 inline-flex
//                 items-center
//                 gap-1
//                 border-0
//                 bg-transparent
//                 p-0
//                 text-sm
//                 font-medium
//                 outline-none
//                 transition-colors
//                 duration-300

//                 ${
//                   card.dark || card.gradient
//                     ? "text-white hover:text-white/75"
//                     : "text-blue-600 hover:text-blue-700"
//                 }
//               `}
//             >
//               {card.button}

//               <ArrowRight
//                 size={15}
//                 strokeWidth={1.8}
//                 className="
//                   transition-transform
//                   duration-300
//                   group-hover/button:translate-x-1
//                 "
//               />
//             </button>
//           )}
//         </div>

//         {/* ==================================================
//             HOVER BORDER
//         ================================================== */}

//         <div
//           className="
//             pointer-events-none
//             absolute
//             inset-0
//             z-20
//             rounded-[22px]
//             opacity-0
//             ring-1
//             ring-inset
//             ring-black/5
//             transition-opacity
//             duration-500
//             group-hover:opacity-100
//           "
//         />
//       </motion.div>
//     );
//   };

//   // ====================================================
//   // RETURN
//   // ====================================================

//   return (
//     <section
//       ref={sectionRef}
//       className="
//         w-full
//         bg-white
//         px-4
//         py-8

//         sm:px-6
//         sm:py-12

//         lg:px-8
//         lg:py-14

//         xl:px-10
//       "
//     >
//       <div
//         className="
//           mx-auto
//           grid
//           w-full
//           max-w-[1280px]
//           grid-cols-1
//           gap-4

//           lg:grid-cols-2
//           lg:grid-rows-2
//         "
//       >
//         {/* ================================================
//             LARGE LEFT CARD
//         ================================================= */}

//         <div className="lg:row-span-2">
//           {renderCard(promoCards[0], 0)}
//         </div>

//         {/* ================================================
//             TOP RIGHT CARD
//         ================================================= */}

//         <div>
//           {renderCard(promoCards[1], 1)}
//         </div>

//         {/* ================================================
//             BOTTOM RIGHT CARDS
//         ================================================= */}

//         <div
//           className="
//             grid
//             grid-cols-1
//             gap-4

//             sm:grid-cols-2
//           "
//         >
//           {renderCard(promoCards[2], 2)}

//           {renderCard(promoCards[3], 3)}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default PromoGrid;

















import React, { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "motion/react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getHomepage } from "../../redux/slices/content/homepage/homepageSlice";

// ======================================================
// MAIN COMPONENT
// ======================================================

const PromoGrid = () => {
  const dispatch = useDispatch();
const navigate = useNavigate()
const handleNavigate = (query) => {
  if (!query) return;

  const cleanQuery = query.replace(/^\/+/, "").trim();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  navigate(`/search?q=${encodeURIComponent(cleanQuery)}`);
};
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const backgroundsRef = useRef([]);

  // ====================================================
  // REDUX STATE
  // ====================================================

  // const {
  //   promoGridItems = [],
  //   loading,
  //   error,
  // } = useSelector((state) => state.promoGrid);
  const {
     promoGridItems = [],
    loading = false,
    error = null,
  } = useSelector((state) => state.homepage || {});
  // ====================================================
  // FETCH PROMO GRID DATA
  // ====================================================

  // useEffect(() => {
  //   dispatch(getHomepage());
  // }, [dispatch]);

  // ====================================================
  // PREPARE ACTIVE + SORTED CARDS
  // ====================================================

  const activePromoCards = useMemo(() => {
    return [...promoGridItems]
      .filter((card) => card?.isActive === true)
      .sort((a, b) => {
        return Number(a?.order || 0) - Number(b?.order || 0);
      });
  }, [promoGridItems]);

  // ====================================================
  // GSAP ENTRANCE ANIMATION
  // ====================================================

  useEffect(() => {
    if (!activePromoCards.length) return;

    const ctx = gsap.context(() => {
      // ------------------------------------------------
      // Reset refs
      // ------------------------------------------------

      cardsRef.current = cardsRef.current.slice(
        0,
        activePromoCards.length
      );

      backgroundsRef.current = backgroundsRef.current.slice(
        0,
        activePromoCards.length
      );

      // ------------------------------------------------
      // Cards entrance
      // ------------------------------------------------

      gsap.fromTo(
        cardsRef.current.filter(Boolean),
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

      // ------------------------------------------------
      // Background image entrance
      // ------------------------------------------------

      backgroundsRef.current
        .filter(Boolean)
        .forEach((background, index) => {
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
  }, [activePromoCards]);

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
  // GET CARD TYPE
  // ====================================================

  const getCardType = (card) => {
    return card?.type?.toLowerCase() || "small";
  };

  // ====================================================
  // CARD
  // ====================================================

  const renderCard = (card, index) => {
    const cardType = getCardType(card);

    const isLarge = cardType === "large";
    const isWide = cardType === "wide";
    const isSmall = cardType === "small";

    const hasImage = Boolean(card?.image);
    const hasGradient = Boolean(card?.gradient);
    const isDark = Boolean(card?.dark);

    // --------------------------------------------------
    // Background position
    // --------------------------------------------------

    const backgroundPosition =
      card?.backgroundPosition || "center";

    // --------------------------------------------------
    // Background size
    // --------------------------------------------------

    const backgroundSize =
      card?.backgroundSize || "cover";

    // --------------------------------------------------
    // Title lines
    // --------------------------------------------------

    const titleLines =
      Array.isArray(card?.titleLines) &&
      card.titleLines.length > 0
        ? card.titleLines
        : card?.title
          ? [card.title]
          : [];

    return (
      <motion.div
        key={card?._id || index}
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

        {hasImage && (
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
            `}
            style={{
              backgroundImage: `url("${card.image}")`,
              backgroundPosition,
              backgroundSize,
            }}
          />
        )}

        {/* ==================================================
            BLUE GRADIENT CARD
        ================================================== */}

        {hasGradient && (
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

        {hasImage && (
          <div
            className={`
              absolute
              inset-0
              z-[1]
              transition-all
              duration-500

              ${
                isDark
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
              isSmall && hasGradient
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
              isSmall && isDark
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
              isSmall && !hasGradient && !isDark
                ? `
                  min-h-[300px]
                  flex-col
                  items-start
                  justify-center
                  px-5
                  py-8
                  text-left
                `
                : ""
            }
          `}
        >
          {/* ==================================================
              LABEL
          ================================================== */}

          {card?.label && (
            <span
              className={`
                text-[10px]
                font-semibold
                tracking-[0.17em]

                sm:text-[11px]

                ${
                  isDark || hasGradient
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

          {titleLines.length > 0 && (
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
                  isSmall && hasGradient
                    ? `
                      text-[28px]
                      leading-[1.18]

                      sm:text-[31px]
                    `
                    : ""
                }

                ${
                  isSmall && isDark
                    ? `
                      mt-4
                      text-[29px]
                      leading-tight

                      sm:text-[32px]
                    `
                    : ""
                }

                ${
                  isSmall && !hasGradient && !isDark
                    ? `
                      mt-4
                      text-[28px]
                      leading-tight
                    `
                    : ""
                }

                ${
                  isDark || hasGradient
                    ? "text-white"
                    : "text-[#252d33]"
                }
              `}
            >
              {titleLines.map((line, lineIndex) => (
                <React.Fragment
                  key={`${card?._id || index}-line-${lineIndex}`}
                >
                  {line}

                  {lineIndex < titleLines.length - 1 && (
                    <br />
                  )}
                </React.Fragment>
              ))}
            </h3>
          )}

          {/* ==================================================
    BUTTON
================================================== */}

{card?.buttonText && card?.buttonLink && (
  <motion.button
    type="button"
    onClick={() => handleNavigate(card.buttonLink)}
    whileHover={{
      y: -2,
    }}
    whileTap={{
      scale: 0.97,
    }}
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
        isDark || hasGradient
          ? "text-white hover:text-white/75"
          : "text-blue-600 hover:text-blue-700"
      }
    `}
  >
    {card.buttonText}

    <ArrowRight
      size={15}
      strokeWidth={1.8}
      className="
        transition-transform
        duration-300
        group-hover/button:translate-x-1
      "
    />
  </motion.button>
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
  // LOADING
  // ====================================================

  if (loading && !promoGridItems.length) {
    return (
      <section className="w-full bg-white px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-2">
          <div className="min-h-[500px] animate-pulse rounded-[22px] bg-slate-100 lg:row-span-2" />

          <div className="min-h-[300px] animate-pulse rounded-[22px] bg-slate-100" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-h-[300px] animate-pulse rounded-[22px] bg-slate-100" />
            <div className="min-h-[300px] animate-pulse rounded-[22px] bg-slate-100" />
          </div>
        </div>
      </section>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error && !promoGridItems.length) {
    return (
      <section className="w-full bg-white px-4 py-10">
        <div className="mx-auto max-w-[1280px] rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      </section>
    );
  }

  // ====================================================
  // EMPTY
  // ====================================================

  if (!activePromoCards.length) {
    return null;
  }

  // ====================================================
  // LAYOUT
  // ====================================================

  /*
   * We use card.type to determine where the cards belong.
   *
   * large -> left side, spans two rows
   * wide  -> top-right
   * small -> bottom-right
   */

  const largeCard = activePromoCards.find(
    (card) => card.type === "large"
  );

  const wideCard = activePromoCards.find(
    (card) => card.type === "wide"
  );

  const smallCards = activePromoCards.filter(
    (card) => card.type === "small"
  );

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
        {/* ==================================================
            LARGE LEFT CARD
        ================================================== */}

        {largeCard && (
          <div className="lg:row-span-2">
            {renderCard(
              largeCard,
              activePromoCards.indexOf(largeCard)
            )}
          </div>
        )}

        {/* ==================================================
            TOP RIGHT CARD
        ================================================== */}

        {wideCard && (
          <div>
            {renderCard(
              wideCard,
              activePromoCards.indexOf(wideCard)
            )}
          </div>
        )}

        {/* ==================================================
            BOTTOM RIGHT CARDS
        ================================================== */}

        {smallCards.length > 0 && (
          <div
            className="
              grid
              grid-cols-1
              gap-4

              sm:grid-cols-2
            "
          >
            {smallCards
              .slice(0, 2)
              .map((card) =>
                renderCard(
                  card,
                  activePromoCards.indexOf(card)
                )
              )}
          </div>
        )}
      </div>
    </section>
  );
};

export default PromoGrid;
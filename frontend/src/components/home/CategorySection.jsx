import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import gsap from "gsap";

import macbookImage from "../../assets/neo.webp";
import computeraccs from "../../assets/mouse.webp";
import androidImage from "../../assets/iphone-16-poster-2.png";
import phoneImage from "../../assets/pixel-7a.avif";
import macbookRefurbImage from "../../assets/iphone-16-poster-2.png";
import vrImage from "../../assets/gaming.webp";
import watchImage from "../../assets/watch.jpg";
import headphones from "../../assets/headphone.webp"
import camera from "../../assets/camera.jpg"
import tv from "../../assets/tv.jpeg"
import tablet from "../../assets/tablet.jpg"
import accessories from "../../assets/accessories.png"
import HomeAppliances from "../../assets/-original-imahnjd25gx7gkgm.webp"

import {
  getCategoryChildren,
  getRootCategories,
} from "../../redux/slices/categorySlice";

import CategoryCard from "../CategoryCard";
import { useNavigate } from "react-router-dom";

// =========================================================
// HELPERS
// =========================================================

const getCategoryId = (category) =>
  category?._id ||
  category?.id ||
  category?.categoryId ||
  null;

const getCategoryName = (category) =>
  category?.name ||
  category?.title ||
  category?.categoryName ||
  "Category";

const normalizeName = (value = "") =>
  String(value).toLowerCase().trim();

// =========================================================
// CATEGORY IMAGE MAPPING
// =========================================================

// =========================================================
// CATEGORY IMAGE MAPPING
// =========================================================

const getCategoryAsset = (categoryName, index = 0) => {
  const name = normalizeName(categoryName);

 
  // 💻 Laptops / Computers
  if (
    name === "laptops" ||
    name === "laptop" ||
    name.includes("macbook") ||
    name.includes("notebook") ||
    name === "computer" ||
    name === "pc"
  ) {
    return macbookImage;
  }

  // 🍎 Apple / iPhone / iPad
  if (
    name.includes("apple") ||
    name.includes("iphone") ||
    name.includes("ipad")
  ) {
    return macbookRefurbImage;
  }

  // 📱 Mobile Phones
  if (
    name === "mobile phones" ||
    name === "mobile phone" ||
    name.includes("android") ||
    name.includes("smartphone")
  ) {
    return phoneImage;
  }

  // 🎮 Gaming
  if (
    name.includes("gaming") ||
    name === "game" ||
    name.includes("console") ||
    name.includes("playstation") ||
    name.includes("xbox") ||
    name.includes("vr")
  ) {
    return vrImage;
  }

  // ⌚ Smartwatches
  if (
    name.includes("smartwatch") ||
    name.includes("smart watch") ||
    name === "watch"
  ) {
    return watchImage;
  }

  // 🎧 Headphones & Earphones
  if (
    name.includes("headphone") ||
    name.includes("earphone") ||
    name.includes("earbud") ||
    name.includes("audio") ||
    name.includes("speaker")
  ) {
    console.log("🎧 HEADPHONES MATCH:", name);
    return headphones;
  }

  // 📱 Tablets
  if (
    name === "tablets" ||
    name === "tablet" ||
    name.includes("tab")
  ) {
    return tablet;
  }

  // 📺 TVs / Televisions
  if (
    name === "tv" ||
    name.includes("television") ||
    name.includes("monitor") ||
    name.includes("display")
  ) {
    return tv;
  }

  // 📷 Cameras
  if (
    name.includes("camera") ||
    name.includes("dslr") ||
    name.includes("mirrorless")
  ) {
    return camera;
  }

  // 🏠 Home Appliances
  if (
    name.includes("home appliance") ||
    name === "home appliances"
  ) {
    return HomeAppliances;
  }

  // 🖱️ Computer Accessories
  if (
    name === "computer accessories" ||
    name.includes("keyboard") ||
    name.includes("mouse")
  ) {
    return computeraccs;
  }

  // 🔌 Mobile Accessories
  if (
    name === "mobile accessories" ||
    name.includes("charger") ||
    name.includes("cable")
  ) {
    return accessories;
  }

  // Fallback
  const fallbackImages = [
    macbookImage,
    androidImage,
    phoneImage,
    macbookRefurbImage,
    vrImage,
    watchImage,
    headphones,
    camera,
    tv,
    tablet,
    accessories,
    HomeAppliances,
  ];

  return fallbackImages[index % fallbackImages.length];
};


// =========================================================
// TITLE FORMATTER
// =========================================================

const getTitleLines = (name) => {
  const cleanName = String(name || "").trim();

  if (!cleanName) {
    return ["Category"];
  }

  const words = cleanName.split(/\s+/);

  if (
    cleanName.length <= 18 ||
    words.length <= 2
  ) {
    return [cleanName];
  }

  const midpoint = Math.ceil(words.length / 2);

  return [
    words.slice(0, midpoint).join(" "),
    words.slice(midpoint).join(" "),
  ];
};

// =========================================================
// COMPONENT
// =========================================================

export default function CategorySection() {
  const dispatch = useDispatch();
const navigate = useNavigate()
  const scrollerRef = useRef(null);
  const cardRefs = useRef([]);

const isDraggingRef = useRef(false);
const dragStartXRef = useRef(0);
const dragStartScrollLeftRef = useRef(0);
  const [scrollProgress, setScrollProgress] =
    useState(0);

  const rootCategories = useSelector(
    (state) =>
      state.category?.rootCategories ?? []
  );

  const categoryChildren = useSelector(
    (state) =>
      state.category?.children ?? {}
  );

  const categoryLoading = useSelector(
    (state) =>
      state.category?.loading ?? false
  );
const handleNavigate = (query) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    navigate(`/search?q=${encodeURIComponent(query)}`);
  };
  // =======================================================
  // LOAD ROOT CATEGORIES
  // =======================================================

  useEffect(() => {
    if (!rootCategories.length) {
      dispatch(getRootCategories());
    }
  }, [
    dispatch,
    rootCategories.length,
  ]);

  // =======================================================
  // FIND ELECTRONICS
  // =======================================================

  const electronicsCategory = useMemo(() => {
    return rootCategories.find(
      (category) =>
        normalizeName(
          getCategoryName(category)
        ) === "electronics"
    );
  }, [rootCategories]);

  const electronicsId =
    electronicsCategory
      ? getCategoryId(electronicsCategory)
      : null;

  // =======================================================
  // LOAD ELECTRONICS CHILDREN
  // =======================================================

  useEffect(() => {
    if (!electronicsId) return;

    const alreadyLoaded =
      Object.prototype.hasOwnProperty.call(
        categoryChildren,
        electronicsId
      );

    if (!alreadyLoaded) {
      dispatch(
        getCategoryChildren(electronicsId)
      );
    }
  }, [
    dispatch,
    electronicsId,
    categoryChildren,
  ]);

  // =======================================================
  // GET CHILDREN
  // =======================================================

  const electronicsChildren = useMemo(() => {
    if (!electronicsCategory) {
      return [];
    }

    const embeddedChildren =
      electronicsCategory.children ||
      electronicsCategory.subcategories ||
      [];

    const fetchedChildren = electronicsId
      ? categoryChildren[electronicsId]
      : [];

    if (
      Array.isArray(fetchedChildren) &&
      fetchedChildren.length
    ) {
      return fetchedChildren;
    }

    if (
      Array.isArray(embeddedChildren) &&
      embeddedChildren.length
    ) {
      return embeddedChildren;
    }

    return [];
  }, [
    electronicsCategory,
    electronicsId,
    categoryChildren,
  ]);

  // =======================================================
  // BUILD CARDS
  // =======================================================

  const categories = useMemo(() => {
    return electronicsChildren.map(
      (category, index) => {
        const name =
          getCategoryName(category);

        return {
          id:
            getCategoryId(category) ||
            `electronics-${index}`,

          title: getTitleLines(name),

          image: getCategoryAsset(
            name,
            index
          ),
        };
      }
    );
  }, [electronicsChildren]);
console.log("catcard",categories)
  // =======================================================
  // UPDATE SCROLL PROGRESS
  // =======================================================

  const updateScrollProgress = () => {
    const scroller = scrollerRef.current;

    if (!scroller) return;

    const maxScroll =
      scroller.scrollWidth -
      scroller.clientWidth;

    if (maxScroll <= 0) {
      setScrollProgress(0);
      return;
    }

    const progress =
      (scroller.scrollLeft / maxScroll) * 100;

    setScrollProgress(
      Math.min(100, Math.max(0, progress))
    );
  };

useEffect(() => {
  const scroller = scrollerRef.current;

  if (!scroller) return;

  const handleWheel = (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    const maxScroll =
      scroller.scrollWidth - scroller.clientWidth;

    if (maxScroll <= 0) return;

    const nextScroll =
      scroller.scrollLeft + event.deltaY;

    if (
      nextScroll > 0 &&
      nextScroll < maxScroll
    ) {
      event.preventDefault();

      scroller.scrollLeft = nextScroll;
    }
  };

  scroller.addEventListener(
    "wheel",
    handleWheel,
    { passive: false }
  );

  return () => {
    scroller.removeEventListener(
      "wheel",
      handleWheel
    );
  };
}, [categories]);

  // =======================================================
  // TOUCH / TRACKPAD / MOUSE WHEEL EXPERIENCE
  // =======================================================

 useEffect(() => {
  const scroller = scrollerRef.current;

  if (!scroller) return;

  const handlePointerDown = (event) => {
    if (event.pointerType !== "mouse") return;

    isDraggingRef.current = true;
    dragStartXRef.current = event.clientX;
    dragStartScrollLeftRef.current =
      scroller.scrollLeft;

    scroller.style.cursor = "grabbing";
    scroller.style.userSelect = "none";
  };

  const handlePointerMove = (event) => {
    if (
      !isDraggingRef.current ||
      event.pointerType !== "mouse"
    ) {
      return;
    }

    const distance =
      event.clientX - dragStartXRef.current;

    scroller.scrollLeft =
      dragStartScrollLeftRef.current - distance;
  };

  const stopDragging = () => {
    isDraggingRef.current = false;
    scroller.style.cursor = "grab";
    scroller.style.userSelect = "";
  };

  scroller.addEventListener(
    "pointerdown",
    handlePointerDown
  );

  scroller.addEventListener(
    "pointermove",
    handlePointerMove
  );

  scroller.addEventListener(
    "pointerup",
    stopDragging
  );

  scroller.addEventListener(
    "pointercancel",
    stopDragging
  );

  scroller.addEventListener(
    "pointerleave",
    stopDragging
  );

  return () => {
    scroller.removeEventListener(
      "pointerdown",
      handlePointerDown
    );

    scroller.removeEventListener(
      "pointermove",
      handlePointerMove
    );

    scroller.removeEventListener(
      "pointerup",
      stopDragging
    );

    scroller.removeEventListener(
      "pointercancel",
      stopDragging
    );

    scroller.removeEventListener(
      "pointerleave",
      stopDragging
    );
  };
}, []);
  // =======================================================
  // GSAP MACOS DOCK EFFECT
  //
  // Only active on fine pointer devices.
  // This prevents the effect fighting against touch
  // scrolling on phones/tablets.
  // =======================================================

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;

    if (
      !scroller ||
      !categories.length
    ) {
      return;
    }

    const finePointer =
      window.matchMedia(
        "(pointer: fine)"
      );

    if (!finePointer.matches) {
      return;
    }

    const cards =
      cardRefs.current.filter(Boolean);

    if (!cards.length) {
      return;
    }

    const ctx = gsap.context(() => {
      const resetCards = () => {
        gsap.to(cards, {
          scale: 1,
          y: 0,
          duration: 0.35,
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      const handlePointerMove = (event) => {
        const rect =
          scroller.getBoundingClientRect();

        const mouseX =
          event.clientX - rect.left;

        cards.forEach((card) => {
          const cardRect =
            card.getBoundingClientRect();

          const cardCenter =
            cardRect.left -
            rect.left +
            cardRect.width / 2;

          const distance = Math.abs(
            mouseX - cardCenter
          );

          const maxDistance = 190;

          let influence =
            1 -
            Math.min(
              distance / maxDistance,
              1
            );

          influence =
            influence * influence;

          const scale =
            1 + influence * 0.18;

          const y =
            -influence * 8;

          gsap.to(card, {
            scale,
            y,
            duration: 0.2,
            ease: "power3.out",
            overwrite: "auto",
          });
        });
      };

      const handlePointerLeave = () => {
        resetCards();
      };

      scroller.addEventListener(
        "pointermove",
        handlePointerMove
      );

      scroller.addEventListener(
        "pointerleave",
        handlePointerLeave
      );

      return () => {
        scroller.removeEventListener(
          "pointermove",
          handlePointerMove
        );

        scroller.removeEventListener(
          "pointerleave",
          handlePointerLeave
        );

        gsap.killTweensOf(cards);
      };
    }, scroller);

    return () => {
      ctx.revert();
    };
  }, [categories]);

  // =======================================================
  // CATEGORY SELECT
  // =======================================================

  const handleSelect = (category) => {
    const categoryName =
      category.title.join(" ");

    toast.success(
      `${categoryName} selected`,
      {
        description:
          "Connect this action to your category/product route.",
      }
    );
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <section
      aria-labelledby="category-heading"
      className="
        category-section
        mx-auto
        w-full
        max-w-[1120px]
        px-4
        py-7
        sm:px-6
        lg:px-8
      "
    >
      {/* =====================================================
          HEADING
      ====================================================== */}

      <div className="category-heading mb-5">
        <h1
          id="category-heading"
          className="
            inline-flex
            items-baseline
            text-[19px]
            font-bold
            leading-none
            tracking-[-0.45px]
            text-[#171717]
            sm:text-[21px]
          "
        >
          <span>
            Electronics.
          </span>

          <span className="ml-[5px] font-medium">
            Just for you!
          </span>
        </h1>
      </div>

      {/* =====================================================
          LOADING
      ====================================================== */}

      {categoryLoading &&
        !categories.length && (
          <div
            className="
              flex
              gap-4
              overflow-hidden
            "
          >
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="
                  h-[154px]
                  w-[148px]
                  shrink-0
                  animate-pulse
                  rounded-2xl
                  border
                  border-gray-200
                  bg-gray-100
                  sm:h-[164px]
                  sm:w-[158px]
                "
              />
            ))}
          </div>
        )}

      {/* =====================================================
          CATEGORY SCROLLER
      ====================================================== */}

      {!categoryLoading &&
        categories.length > 0 && (
          <>
            <div
              ref={scrollerRef}
              role="list"
              aria-label="Electronics subcategories"
              className="
                category-scroller

                flex
                w-full
                flex-row
                flex-nowrap
                items-end
                justify-start

                gap-4

                overflow-x-auto
                overflow-y-hidden

                scroll-smooth
                snap-x
                snap-mandatory

                touch-pan-x
                overscroll-x-contain

                pb-5
                pt-5

                [direction:ltr]

                [scrollbar-width:none]
                [-ms-overflow-style:none]

                [&::-webkit-scrollbar]:hidden

                sm:gap-5
              "
            >
              {categories.map(
                (category, index) => (
                  <div
                    key={category.id}
                    ref={(element) => {
                      cardRefs.current[index] =
                        element;
                    }}
                    
                    role="listitem"
                    className="
                      shrink-0
                      snap-start
                      will-change-transform
                    "
                  >
                    <CategoryCard
                      category={category}
                      onSelect={() =>
                       handleNavigate(category.title)
                      }
                    />
                  </div>
                )
              )}
            </div>

            {/* =================================================
                CUSTOM SCROLL PROGRESS
            ================================================== */}

            <div
              aria-hidden="true"
              className="
                mx-auto
                mt-1
                h-[3px]
                w-full
                max-w-[280px]
                overflow-hidden
                rounded-full
                bg-gray-100
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-gray-300
                  transition-[width]
                  duration-100
                  ease-out
                "
                style={{
                  width: `${
                    categories.length > 0
                      ? Math.max(
                          12,
                          scrollProgress
                        )
                      : 12
                  }%`,
                }}
              />
            </div>
          </>
        )}

      {/* =====================================================
          NO CHILDREN
      ====================================================== */}

      {!categoryLoading &&
        electronicsCategory &&
        !categories.length && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-8 text-center">
            <p className="text-sm font-medium text-gray-700">
              No Electronics subcategories
              found.
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Add child categories under
              Electronics from the admin
              panel.
            </p>
          </div>
        )}

      {/* =====================================================
          ELECTRONICS NOT FOUND
      ====================================================== */}

      {!categoryLoading &&
        !electronicsCategory &&
        rootCategories.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-8 text-center">
            <p className="text-sm font-medium text-gray-700">
              Electronics category not
              found.
            </p>
          </div>
        )}
    </section>
  );
}

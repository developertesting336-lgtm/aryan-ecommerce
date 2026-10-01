import {
  Heart,
  ShoppingCart,
  Package,
  Check,
  Star,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { addProduct } from "../../redux/slices/cartSlice";

import {
  showSuccess,
  showError,
} from "../../utils/toast";

import {
  addProductInWish,
  deleteProducts,
} from "../../redux/slices/wishlistSlice";

import { useNavigate } from "react-router-dom";

import {
  motion,
  AnimatePresence,
} from "motion/react";

const BASE_URL =
  "http://localhost:3000/uploads/";

/*
|--------------------------------------------------------------------------
| IMAGE URL HELPER
|--------------------------------------------------------------------------
*/

const getImageUrl = (image) => {
  if (!image) {
    return "/1786052049893.webp";
  }

  // Full URL
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  // /uploads/image.jpg
  if (image.startsWith("/uploads/")) {
    return `http://localhost:3000${image}`;
  }

  // uploads/image.jpg
  if (image.startsWith("uploads/")) {
    return `http://localhost:3000/${image}`;
  }

  // image.jpg
  return `${BASE_URL}${image}`;
};

export default function ProductCard({
  _id,
  images,
  name,
  price,
  originalPrice,
  mrp,
  discount,
  category,
  stock,
  rating
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // =====================================================
  // AUTH
  // =====================================================

  const { user, token } = useSelector(
    (state) => state.auth
  );

  const isLoggedIn = Boolean(token || user);

  // =====================================================
  // CART
  // =====================================================

  const { cart } = useSelector(
    (state) => state.cart
  );

  // =====================================================
  // WISHLIST
  // =====================================================

  const { wishlist } = useSelector(
    (state) => state.wishlist
  );

  // =====================================================
  // CART STATUS
  // =====================================================

  const isAdded =
    cart?.items?.some((item) => {
      const cartProductId =
        item?.productId?._id ||
        item?.productId ||
        item?.product?._id ||
        item?._id;

      return (
        String(cartProductId) ===
        String(_id)
      );
    }) ?? false;

  // =====================================================
  // WISHLIST STATUS
  // =====================================================

  const isWishlisted =
    wishlist?.products?.some((product) => {
      const wishlistProductId =
        product?._id ||
        product?.productId ||
        product?.product?._id;

      return (
        String(wishlistProductId) ===
        String(_id)
      );
    }) ?? false;

  // =====================================================
  // CATEGORY
  // =====================================================

  const categoryName =
    typeof category === "object"
      ? category?.name
      : null;

  const parentCategoryName =
    typeof category === "object"
      ? category?.parent?.name ||
        category?.parentCategory?.name
      : null;

  const brandName =
    parentCategoryName ||
    categoryName ||
    "PRODUCT";

  // =====================================================
  // PRICE
  // =====================================================

  const displayOriginalPrice =
    originalPrice ?? mrp ?? null;

  // =====================================================
  // DISCOUNT
  // =====================================================

  const calculatedDiscount =
    discount ??
    (displayOriginalPrice &&
    Number(displayOriginalPrice) >
      Number(price)
      ? Math.round(
          ((Number(displayOriginalPrice) -
            Number(price)) /
            Number(displayOriginalPrice)) *
            100
        )
      : 0);

  // =====================================================
  // SAVING
  // =====================================================

  const savingAmount =
    displayOriginalPrice &&
    Number(displayOriginalPrice) >
      Number(price)
      ? Number(displayOriginalPrice) -
        Number(price)
      : 0;

  // =====================================================
  // STOCK
  // =====================================================

  const numericStock =
    stock !== undefined &&
    stock !== null &&
    stock !== ""
      ? Number(stock)
      : null;

  const hasStock =
    numericStock === null ||
    numericStock > 0;

  // =====================================================
  // IMAGE
  // =====================================================

  // const productImage =
  //   Array.isArray(images) &&
  //   images.length > 0
  //     ? getImageUrl(images[0])
  //     : "/1786052049893.webp";

  const productImages =
  Array.isArray(images) && images.length > 0
    ? images.map(getImageUrl)
    : ["/1786052049893.webp"];

const [currentImage, setCurrentImage] = useState(0);

  // =====================================================
  // LOGIN
  // =====================================================

  const requireLogin = () => {
    navigate("/login", {
      state: {
        from: `/product/${_id}`,
      },
    });
  };

  // =====================================================
  // CART
  // =====================================================

  const handleCartToggle = async () => {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }

    if (isAdded) {
      navigate("/cart");
      return;
    }

    if (!hasStock) {
      showError(
        "Product is out of stock"
      );
      return;
    }

    try {
      const cartResponse =
        await dispatch(
          addProduct({
            productId: _id,
            price: Number(price) || 0,
            quantity: 1,
          })
        ).unwrap();

      showSuccess(
        cartResponse.message ||
          "Product added to cart"
      );
    } catch (error) {
      showError(
        error.message ||
          "Unable to add product to cart"
      );

      console.error(
        "Failed to add product to cart:",
        error
      );
    }
  };

  // =====================================================
  // WISHLIST
  // =====================================================

  const handleWishlistToggle = async () => {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }

    try {
      if (isWishlisted) {
        const deleteResponse =
          await dispatch(
            deleteProducts(_id)
          ).unwrap();

        showSuccess(
          deleteResponse.message ||
            "Removed from wishlist"
        );
      } else {
        const addResponse =
          await dispatch(
            addProductInWish(_id)
          ).unwrap();

        showSuccess(
          addResponse.message ||
            "Added to wishlist"
        );
      }
    } catch (error) {
      showError(
        error.message ||
          "Wishlist error"
      );

      console.error(
        "Wishlist error:",
        error
      );
    }
  };


// =====================================================
// IMAGE ZOOM
// =====================================================



  // =====================================================
  // PRODUCT DETAILS
  // =====================================================

  const handleProductClick = () => {
    if (!_id) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    navigate(`/product/${_id}`);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -4,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className="
        group
        relative
        flex
        w-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-[22px]
        border
        border-slate-200
        bg-white
        p-2
        shadow-[0_3px_14px_rgba(15,23,42,0.06)]
        transition-all
        duration-300
        hover:border-slate-300
        hover:shadow-[0_12px_30px_rgba(15,23,42,0.11)]
      "
    >

      {/* =================================================
          IMAGE SECTION
      ================================================= */}

      <div
        onClick={handleProductClick}
        className="
          relative
          h-[235px]
          w-full
          cursor-pointer
          overflow-hidden
          rounded-[18px]
          bg-slate-100
        "
      >

        {/* Background */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-br
            from-slate-100
            via-white
            to-slate-100
          "
        />

        {/* =================================================
            BADGE
        ================================================= */}

        {rating > 0 && (
  <div
    className="
      absolute
      left-3
      top-3
      z-30
      flex
      items-center
      gap-1
      rounded-full
      border
      border-slate-200
      bg-white/95
      px-3
      py-1.5
      text-[10px]
      font-medium
      text-slate-700
      shadow-sm
      backdrop-blur-sm
    "
  >
    <Star
      size={12}
      strokeWidth={2.5}
      className="fill-emerald-500 text-emerald-500"
    />

    <span>{Number(rating).toFixed(1)}</span>
  </div>
)}


        {/* =================================================
            WISHLIST
        ================================================= */}

        <motion.button
          type="button"
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          onClick={(e) => {
            e.stopPropagation();
            handleWishlistToggle();
          }}
          whileHover={{
            scale: 1.08,
          }}
          whileTap={{
            scale: 0.9,
          }}
          className="
            absolute
            right-3
            top-3
            z-30
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-slate-200
            bg-white/95
            shadow-sm
            backdrop-blur-sm
            transition-all
            duration-200
            hover:shadow-md
            cursor-pointer
          "
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={
                isWishlisted
                  ? "liked"
                  : "not-liked"
              }
              initial={{
                scale: 0.5,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.5,
                opacity: 0,
              }}
            >
              <Heart
                size={17}
                strokeWidth={2}
                className={
                  isWishlisted
                    ? "fill-rose-500 text-rose-500"
                    : "text-slate-500"
                }
              />
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* =================================================
            PRODUCT IMAGE
        ================================================= */}


{/* =================================================
    PRODUCT IMAGE
================================================= */}

<div
  className="
    absolute
    inset-0
    z-10
    overflow-hidden
    flex
    items-center
    justify-center
  "
 
>
  <AnimatePresence
    mode="wait"
    initial={false}
  >
    <motion.img
  key={currentImage}
  src={productImages[currentImage]}
  alt={`${name || "Product"} ${currentImage + 1}`}
  draggable={false}
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src =
      "/1786052049893.webp";
  }}
  className="
    h-full
    w-full
    select-none
    object-contain
    object-center
    p-3
    will-change-transform
  "
  initial={{
    opacity: 0,
    x: 40,
  }}
  animate={{
    opacity: 1,
    x: 0,
  }}
  exit={{
    opacity: 0,
    x: -40,
  }}
  whileHover={{
    scale: 1.15,
  }}
  transition={{
    opacity: {
      duration: 0.2,
    },
    x: {
      duration: 0.35,
      ease: "easeOut",
    },
    scale: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  }}
  drag="x"
  dragConstraints={{
    left: 0,
    right: 0,
  }}
  dragElastic={0.15}
  onDragEnd={(event, info) => {
    const swipeDistance = info.offset.x;

    if (
      swipeDistance < -50 &&
      currentImage < productImages.length - 1
    ) {
      setCurrentImage((prev) => prev + 1);
    }

    if (
      swipeDistance > 50 &&
      currentImage > 0
    ) {
      setCurrentImage((prev) => prev - 1);
    }
  }}
/>
  </AnimatePresence>

  {/* =================================================
      IMAGE DOTS
  ================================================= */}

  {productImages.length > 1 && (
    <div
      className="
        absolute
        bottom-3
        left-1/2
        z-40
        flex
        -translate-x-1/2
        items-center
        gap-1.5
        rounded-full
        bg-white/90
        px-2.5
        py-1.5
        shadow-sm
        backdrop-blur-sm
      "
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {productImages.map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`View image ${index + 1}`}
          onClick={(e) => {
            e.stopPropagation();

            setCurrentImage(index);
            setImageZoom(false);
          }}
          className={`
            h-1.5
            rounded-full
            cursor-pointer
            transition-all
            duration-300
            ${
              currentImage === index
                ? "w-4 bg-blue-600"
                : "w-1.5 bg-slate-400 hover:bg-slate-600"
            }
          `}
        />
      ))}
    </div>
  )}
</div>




        {/* =================================================
            BOTTOM FADE
        ================================================= */}

  
      </div>

      {/* =================================================
          PRODUCT CONTENT
      ================================================= */}

      <div
        className="
          flex
          flex-col
          px-2
          pb-2
          pt-3
        "
      >

        {/* =================================================
            CATEGORY
        ================================================= */}

        <span
          className="
            mb-1
            truncate
            text-[11px]
            font-medium
            text-emerald-600
          "
        >
          {brandName}
        </span>

        {/* =================================================
            PRODUCT NAME
        ================================================= */}

        <h3
  onClick={handleProductClick}
  className="
    cursor-pointer
    truncate
    text-[15px]
    font-semibold
    leading-[21px]
    tracking-[-0.01em]
    text-slate-900
    transition-colors
    duration-200
    hover:text-blue-600
  "
>
  {name || "Product"}
</h3>

        {/* =================================================
            PRICE
        ================================================= */}

        <div
          className="
            mt-1.5
            flex
            min-h-[25px]
            flex-wrap
            items-center
            gap-x-2
            gap-y-1
          "
        >
          <span
            className="
              text-[16px]
              font-semibold
              tracking-tight
              text-slate-900
            "
          >
            ₹
            {Number(
              price || 0
            ).toLocaleString(
              "en-IN"
            )}
          </span>

          {displayOriginalPrice &&
            Number(
              displayOriginalPrice
            ) >
              Number(price) && (
              <span
                className="
                  text-[11px]
                  font-medium
                  text-slate-400
                  line-through
                "
              >
                ₹
                {Number(
                  displayOriginalPrice
                ).toLocaleString(
                  "en-IN"
                )}
              </span>
            )}

          {calculatedDiscount > 0 && (
            <span
              className="
                text-[10px]
                font-semibold
                text-emerald-600
              "
            >
              {calculatedDiscount}% off
            </span>
          )}
        </div>

        {/* =================================================
            STOCK
        ================================================= */}

        <div
          className="
            mt-1.5
            flex
            items-center
            gap-1.5
          "
        >
          <span
            className={`
              h-1.5
              w-1.5
              flex-shrink-0
              rounded-full
              ${
                hasStock
                  ? "bg-emerald-500"
                  : "bg-red-500"
              }
            `}
          />

          <span
            className={`
              truncate
              text-[10px]
              font-medium
              ${
                hasStock
                  ? "text-emerald-600"
                  : "text-red-500"
              }
            `}
          >
            {hasStock
              ? numericStock !== null
                ? `${numericStock} in stock`
                : "In stock"
              : "Out of stock"}
          </span>

          {savingAmount > 0 && (
            <span
              className="
                ml-auto
                text-[10px]
                font-medium
                text-slate-400
              "
            >
              Save ₹
              {savingAmount.toLocaleString(
                "en-IN"
              )}
            </span>
          )}
        </div>

        {/* =================================================
            CART BUTTON
        ================================================= */}

        <motion.button
          type="button"
          onClick={handleCartToggle}
          whileHover={{
            scale: 1.01,
          }}
          whileTap={{
            scale: 0.98,
          }}
          disabled={!hasStock}
          className={`
            mt-3
            flex
            h-[40px]
            w-full
            items-center
            justify-center
            gap-2
            rounded-full
            text-[12px]
            font-semibold
            transition-all
            duration-200
            cursor-pointer
            ${
              !hasStock
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : isAdded
                ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
                : "bg-blue-600 text-white shadow-sm hover:bg-sky-500"
            }
          `}
        >
          {isAdded ? (
            <>
              <Check
                size={15}
                strokeWidth={2.5}
              />

              <span>
                Go to Cart
              </span>
            </>
          ) : !hasStock ? (
            <>
              <Package
                size={15}
                strokeWidth={2}
              />

              <span>
                Out of Stock
              </span>
            </>
          ) : (
            <>
              <ShoppingCart
                size={15}
                strokeWidth={2.2}
              />

              <span>
                Add to Cart
              </span>
            </>
          )}
        </motion.button>
      </div>
    </motion.article>
  );
}
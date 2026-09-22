// import {
//   Heart,
//   ShoppingCart,
//   Package,
// } from "lucide-react";

// import { useDispatch, useSelector } from "react-redux";

// import { addProduct } from "../../redux/slices/cartSlice";
// import { showSuccess, showError } from "../../utils/toast";

// import {
//   addProductInWish,
//   deleteProducts,
// } from "../../redux/slices/wishlistSlice";

// import { useNavigate } from "react-router-dom";

// const BASE_URL = "http://localhost:3000/uploads/";

// /*
// |--------------------------------------------------------------------------
// | IMAGE URL HELPER
// |--------------------------------------------------------------------------
// |
// | Supports:
// |
// | 1. Full URL
// |    https://example.com/uploads/image.jpg
// |
// | 2. Relative upload path
// |    uploads/image.jpg
// |
// | 3. Filename
// |    image.jpg
// |
// */

// const getImageUrl = (image) => {
//   if (!image) {
//     return "/1786052049893.webp";
//   }

//   // Already a complete URL
//   if (
//     image.startsWith("http://") ||
//     image.startsWith("https://") ||
//     image.startsWith("blob:")
//   ) {
//     return image;
//   }

//   // Already starts with /uploads/
//   if (image.startsWith("/uploads/")) {
//     return `http://localhost:3000${image}`;
//   }

//   // Starts with uploads/
//   if (image.startsWith("uploads/")) {
//     return `http://localhost:3000/${image}`;
//   }

//   // Normal filename
//   return `${BASE_URL}${image}`;
// };

// export default function ProductCard({
//   _id,
//   images,
//   name,
//   price,
//   originalPrice,
//   mrp,
//   discount,
//   category,
// }) {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // =====================================================
//   // AUTH
//   // =====================================================

//   const { user, token } = useSelector(
//     (state) => state.auth
//   );

//   const isLoggedIn = Boolean(token || user);

//   // =====================================================
//   // CART
//   // =====================================================

//   const { cart } = useSelector(
//     (state) => state.cart
//   );

//   // =====================================================
//   // WISHLIST
//   // =====================================================

//   const { wishlist } = useSelector(
//     (state) => state.wishlist
//   );
// // console.log("wish state",wishlist)
//   // =====================================================
//   // CART STATUS
//   // =====================================================

//   const isAdded =
//     cart?.items?.some((item) => {
//       /*
//        * Supports different cart response structures:
//        *
//        * productId: "123"
//        *
//        * productId: {
//        *   _id: "123"
//        * }
//        *
//        * product: {
//        *   _id: "123"
//        * }
//        *
//        * _id: "123"
//        */

//       const cartProductId =
//         item?.productId?._id ||
//         item?.productId ||
//         item?.product?._id ||
//         item?._id;

//       return (
//         String(cartProductId) === String(_id)
//       );
//     }) ?? false;

//   // =====================================================
//   // WISHLIST STATUS
//   // =====================================================

//   const isWishlisted =
//     wishlist?.products?.some((product) => {
//       /*
//        * Supports:
//        *
//        * {
//        *   _id: productId
//        * }
//        *
//        * OR
//        *
//        * {
//        *   productId: productId
//        * }
//        *
//        * OR
//        *
//        * {
//        *   product: {
//        *     _id: productId
//        *   }
//        * }
//        */

//       const wishlistProductId =
//         product?._id ||
//         product?.productId ||
//         product?.product?._id;

//       return (
//         String(wishlistProductId) ===
//         String(_id)
//       );
//     }) ?? false;

//   // =====================================================
//   // CATEGORY
//   // =====================================================

//   /*
//    * New category structure may be:
//    *
//    * category: {
//    *   _id: "...",
//    *   name: "iPhone",
//    *   parent: {
//    *     _id: "...",
//    *     name: "Mobiles"
//    *   }
//    * }
//    *
//    * Or:
//    *
//    * category: "subcategoryId"
//    */

//   const categoryName =
//     typeof category === "object"
//       ? category?.name
//       : null;
//       const parentCategoryName =
//       typeof category === "object"
//       ? category?.parent?.name ||
//       category?.parentCategory?.name
//       : null;

//   // =====================================================
//   // PRICE
//   // =====================================================

//   /*
//    * New API may use:
//    *
//    * price
//    * mrp
//    *
//    * while older frontend used:
//    *
//    * originalPrice
//    */

//   const displayOriginalPrice =
//     originalPrice ?? mrp ?? null;

//   // =====================================================
//   // DISCOUNT
//   // =====================================================

//   const calculatedDiscount =
//     discount ??
//     (displayOriginalPrice &&
//     Number(displayOriginalPrice) >
//       Number(price)
//       ? Math.round(
//           ((Number(displayOriginalPrice) -
//             Number(price)) /
//             Number(displayOriginalPrice)) *
//             100
//         )
//       : 0);

//   // =====================================================
//   // LOGIN
//   // =====================================================

//   const requireLogin = () => {
//     navigate("/login", {
//       state: {
//         from: `/product/${_id}`,
//       },
//     });
//   };

//   // =====================================================
//   // CART
//   // =====================================================

//   const handleCartToggle = async () => {
//     // ---------------------------------------------------
//     // NOT LOGGED IN
//     // ---------------------------------------------------
 
//     if (!isLoggedIn) {
//       requireLogin();
//       return;
//     }

//     // ---------------------------------------------------
//     // ALREADY IN CART
//     // ---------------------------------------------------

//     if (isAdded) {
//       navigate("/cart");
//       return;
//     }

//     // ---------------------------------------------------
//     // ADD TO CART
//     // ---------------------------------------------------

//     try {
//      const cart= await dispatch(
//         addProduct({
//           productId: _id,
//           price: Number(price) || 0,
//           quantity: 1,
//         })
//       ).unwrap();
//       console.log("cartprouct",cart)
//        showSuccess(cart.message || "product  added");
//     } catch (error) {
//       showError(error.message || "cart error");
//       console.error(
//         "Failed to add product to cart:",
//         error
//       );
//     }
//   };

//   // =====================================================
//   // WISHLIST
//   // =====================================================

//   const handleWishlistToggle = async () => {
//     // ---------------------------------------------------
//     // NOT LOGGED IN
//     // ---------------------------------------------------

//     if (!isLoggedIn) {
//       requireLogin();
//       return;
//     }

//     // ---------------------------------------------------
//     // TOGGLE WISHLIST
//     // ---------------------------------------------------

//     try {
//       if (isWishlisted) {
//       const deletefromWish =   await dispatch(
//           deleteProducts(_id)
//         ).unwrap();
//         showSuccess(deletefromWish.message || 'deleted')
//       } else {
//        const addToWish =  await dispatch(
//           addProductInWish(_id)
//         ).unwrap();
//         console.log("wishadd",addToWish)
//         showSuccess(addToWish.message || 'added')
//       }
//     } catch (error) {
//       showError(error.message || 'wishlist error')
//       console.error(
//         "Wishlist error:",
//         error
//       );
//     }
//   };

//   // =====================================================
//   // PRODUCT DETAILS
//   // =====================================================

//   const handleProductClick = () => {
//     if (!_id) {
//       return;
//     }
//  window.scrollTo({
//       top: 0,
//       behavior: 'smooth' // 'auto' for an instant jump
//     });
//     navigate(`/product/${_id}`);
//   };

//   // =====================================================
//   // IMAGE
//   // =====================================================

//   const productImage =
//     Array.isArray(images) &&
//     images.length > 0
//       ? getImageUrl(images[0])
//       : "/1786052049893.webp";

//   // =====================================================
//   // UI
//   // =====================================================

//   return (
//     <div
//       className="
//         group
//         bg-white
//         rounded-2xl
//         border
//         border-gray-200
//         overflow-hidden
//         hover:border-blue-400
//         hover:shadow-lg
//         transition-all
//         duration-300
//       "
//     >

//       {/* =================================================
//           IMAGE
//       ================================================= */}

//       <div
//         className="
//           relative
//           bg-gray-50
//           h-52
//           sm:h-56
//           md:h-60
//           flex
//           items-center
//           justify-center
//           overflow-hidden
//           cursor-pointer
//         "
//         onClick={handleProductClick}
//       >

//         {/* =================================================
//             DISCOUNT
//         ================================================= */}

//         {calculatedDiscount > 0 && (
//           <span
//             className="
//               absolute
//               top-3
//               left-3
//               z-10
//               bg-red-500
//               text-white
//               text-xs
//               px-2.5
//               py-1
//               rounded-full
//               font-semibold
//               shadow-sm
//             "
//           >
//             -{calculatedDiscount}%
//           </span>
//         )}

//         {/* =================================================
//             WISHLIST
//         ================================================= */}

//         <button
//           type="button"
//           aria-label={
//             isWishlisted
//               ? "Remove from wishlist"
//               : "Add to wishlist"
//           }
//           onClick={(e) => {
//             e.stopPropagation();
//             handleWishlistToggle();
//           }}
//           className="
//             absolute
//             top-3
//             right-3
//             z-10
//             h-9
//             w-9
//             rounded-full
//             bg-white
//             shadow
//             flex
//             items-center
//             justify-center
//             hover:bg-red-50
//             transition
//             cursor-pointer
//           "
//         >
//           <Heart
//             size={18}
//             className={
//               isWishlisted
//                 ? "text-red-500 fill-red-500"
//                 : "text-gray-500"
//             }
//           />
//         </button>

//         {/* =================================================
//             PRODUCT IMAGE
//         ================================================= */}

//         {productImage ? (
//           <img
//             src={productImage}
//             alt={name || "Product"}
//             className="
//               w-full
//               h-full
//               object-cover
//               group-hover:scale-105
//               transition-transform
//               duration-500
//             "
//             onError={(e) => {
//               e.currentTarget.onerror = null;
//               e.currentTarget.src =
//                 "/1786052049893.webp";
//             }}
//           />
//         ) : (
//           <Package
//             size={40}
//             className="text-gray-300"
//           />
//         )}

//       </div>

//       {/* =================================================
//           CONTENT
//       ================================================= */}

//       <div className="p-3 sm:p-4">

//         {/* =================================================
//             CATEGORY
//         ================================================= */}

//         {(parentCategoryName ||
//           categoryName) && (
//           <div
//             className="
//               flex
//               items-center
//               gap-1.5
//               mb-2
//               min-w-0
//             "
//           >

//             {parentCategoryName && (
//               <span
//                 className="
//                   text-[10px]
//                   sm:text-xs
//                   font-medium
//                   text-gray-400
//                   truncate
//                   max-w-[45%]
//                 "
//               >
//                 {parentCategoryName}
//               </span>
//             )}

//             {parentCategoryName &&
//               categoryName && (
//                 <span className="text-gray-300">
//                   /
//                 </span>
//               )}

//             {categoryName && (
//               <span
//                 className="
//                   text-[10px]
//                   sm:text-xs
//                   font-semibold
//                   text-blue-600
//                   truncate
//                 "
//               >
//                 {categoryName} 
//               </span>
//             )}

//           </div>
//         )}

//         {/* =================================================
//             NAME
//         ================================================= */}

//         <h3
//           onClick={handleProductClick}
//           className="
//             text-sm
//             font-medium
//             text-gray-800
//             line-clamp-2
//             min-h-[40px]
//             cursor-pointer
//             hover:text-blue-600
//             transition
//           "
//         >
//           {name || "Product"}
//         </h3>

//         {/* =================================================
//             PRICE
//         ================================================= */}

//         <div
//           className="
//             mt-3
//             flex
//             items-center
//             gap-2
//             flex-wrap
//           "
//         >

//           <span
//             className="
//               text-lg
//               sm:text-xl
//               font-bold
//               text-blue-600
//             "
//           >
//             ₹
//             {Number(price || 0).toLocaleString(
//               "en-IN"
//             )}
//           </span>

//           {displayOriginalPrice &&
//             Number(displayOriginalPrice) >
//               Number(price) && (
//               <span
//                 className="
//                   text-xs
//                   sm:text-sm
//                   text-gray-400
//                   line-through
//                 "
//               >
//                 ₹
//                 {Number(
//                   displayOriginalPrice
//                 ).toLocaleString("en-IN")}
//               </span>
//             )}

//         </div>

//         {/* =================================================
//             CART BUTTON
//         ================================================= */}

//         <button
//           type="button"
//           onClick={handleCartToggle}
//           className={`
//             mt-4
//             w-full
//             flex
//             items-center
//             justify-center
//             gap-2
//             rounded-xl
//             py-2.5
//             sm:py-3
//             text-sm
//             sm:text-base
//             font-semibold
//             transition-all
//             cursor-pointer

//             ${
//               isAdded
//                 ? `
//                   bg-green-600
//                   hover:bg-green-700
//                   text-white
//                 `
//                 : `
//                   bg-blue-600
//                   hover:bg-blue-700
//                   text-white
//                 `
//             }
//           `}
//         >

//           <ShoppingCart size={18} />

//           {isAdded
//             ? "Go to Cart"
//             : "Add to Cart"}

//         </button>

//       </div>

//     </div>
//   );
// }

























import {
  Heart,
  ShoppingCart,
  Package,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import { addProduct } from "../../redux/slices/cartSlice";
import { showSuccess, showError } from "../../utils/toast";

import {
  addProductInWish,
  deleteProducts,
} from "../../redux/slices/wishlistSlice";

import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:3000/uploads/";

/*
|--------------------------------------------------------------------------
| IMAGE URL HELPER
|--------------------------------------------------------------------------
|
| Supports:
|
| 1. Full URL
|    https://example.com/uploads/image.jpg
|
| 2. Relative upload path
|    uploads/image.jpg
|
| 3. Filename
|    image.jpg
|
*/

const getImageUrl = (image) => {
  if (!image) {
    return "/1786052049893.webp";
  }

  // Already a complete URL
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  // Already starts with /uploads/
  if (image.startsWith("/uploads/")) {
    return `http://localhost:3000${image}`;
  }

  // Starts with uploads/
  if (image.startsWith("uploads/")) {
    return `http://localhost:3000/${image}`;
  }

  // Normal filename
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
// console.log("wish state",wishlist)
  // =====================================================
  // CART STATUS
  // =====================================================

  const isAdded =
    cart?.items?.some((item) => {
      /*
       * Supports different cart response structures:
       *
       * productId: "123"
       *
       * productId: {
       *   _id: "123"
       * }
       *
       * product: {
       *   _id: "123"
       * }
       *
       * _id: "123"
       */

      const cartProductId =
        item?.productId?._id ||
        item?.productId ||
        item?.product?._id ||
        item?._id;

      return (
        String(cartProductId) === String(_id)
      );
    }) ?? false;

  // =====================================================
  // WISHLIST STATUS
  // =====================================================

  const isWishlisted =
    wishlist?.products?.some((product) => {
      /*
       * Supports:
       *
       * {
       *   _id: productId
       * }
       *
       * OR
       *
       * {
       *   productId: productId
       * }
       *
       * OR
       *
       * {
       *   product: {
       *     _id: productId
       *   }
       * }
       */

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

  /*
   * New category structure may be:
   *
   * category: {
   *   _id: "...",
   *   name: "iPhone",
   *   parent: {
   *     _id: "...",
   *     name: "Mobiles"
   *   }
   * }
   *
   * Or:
   *
   * category: "subcategoryId"
   */

  const categoryName =
    typeof category === "object"
      ? category?.name
      : null;
      const parentCategoryName =
      typeof category === "object"
      ? category?.parent?.name ||
      category?.parentCategory?.name
      : null;

  // =====================================================
  // PRICE
  // =====================================================

  /*
   * New API may use:
   *
   * price
   * mrp
   *
   * while older frontend used:
   *
   * originalPrice
   */

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
    // ---------------------------------------------------
    // NOT LOGGED IN
    // ---------------------------------------------------
 
    if (!isLoggedIn) {
      requireLogin();
      return;
    }

    // ---------------------------------------------------
    // ALREADY IN CART
    // ---------------------------------------------------

    if (isAdded) {
      navigate("/cart");
      return;
    }

    // ---------------------------------------------------
    // ADD TO CART
    // ---------------------------------------------------

    try {
     const cart= await dispatch(
        addProduct({
          productId: _id,
          price: Number(price) || 0,
          quantity: 1,
        })
      ).unwrap();
      console.log("cartprouct",cart)
       showSuccess(cart.message || "product  added");
    } catch (error) {
      showError(error.message || "cart error");
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
    // ---------------------------------------------------
    // NOT LOGGED IN
    // ---------------------------------------------------

    if (!isLoggedIn) {
      requireLogin();
      return;
    }

    // ---------------------------------------------------
    // TOGGLE WISHLIST
    // ---------------------------------------------------

    try {
      if (isWishlisted) {
      const deletefromWish =   await dispatch(
          deleteProducts(_id)
        ).unwrap();
        showSuccess(deletefromWish.message || 'deleted')
      } else {
       const addToWish =  await dispatch(
          addProductInWish(_id)
        ).unwrap();
        console.log("wishadd",addToWish)
        showSuccess(addToWish.message || 'added')
      }
    } catch (error) {
      showError(error.message || 'wishlist error')
      console.error(
        "Wishlist error:",
        error
      );
    }
  };

  // =====================================================
  // PRODUCT DETAILS
  // =====================================================

  const handleProductClick = () => {
    if (!_id) {
      return;
    }
 window.scrollTo({
      top: 0,
      behavior: 'smooth' // 'auto' for an instant jump
    });
    navigate(`/product/${_id}`);
  };

  // =====================================================
  // IMAGE
  // =====================================================

  const productImage =
    Array.isArray(images) &&
    images.length > 0
      ? getImageUrl(images[0])
      : "/1786052049893.webp";

  // =====================================================
  // UI
  // =====================================================

  return (
    <article
      className="
        group relative flex h-full flex-col overflow-hidden
        rounded-3xl border border-slate-200 bg-white
        shadow-sm transition-all duration-300
        hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl
      "
    >
      {/* Product media */}
      <div
        className="
          relative h-60 overflow-hidden bg-slate-100
          sm:h-64 md:h-72
          cursor-pointer
        "
        onClick={handleProductClick}
      >
        {/* Soft background accents */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />

        {/* Discount badge */}
        {calculatedDiscount > 0 && (
          <span
            className="
              absolute left-4 top-4 z-20
              rounded-full bg-slate-900 px-3 py-1.5
              text-[11px] font-bold tracking-wide text-white
              shadow-lg
            "
          >
            {calculatedDiscount}% OFF
          </span>
        )}

        {/* Wishlist */}
        <button
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
          className="
            absolute right-4 top-4 z-20
            flex h-10 w-10 items-center justify-center
            rounded-full border border-white/80 bg-white/95
            text-slate-600 shadow-md backdrop-blur
            transition-all duration-200
            hover:scale-105 hover:bg-white
            hover:text-rose-500
            cursor-pointer
          "
        >
          <Heart
            size={18}
            strokeWidth={2}
            className={
              isWishlisted
                ? "fill-rose-500 text-rose-500"
                : "text-slate-500"
            }
          />
        </button>

        {/* Product image */}
        {productImage ? (
          <img
            src={productImage}
            alt={name || "Product"}
            className="
              relative z-10 h-full w-full object-cover
              transition-transform duration-700
              group-hover:scale-105
            "
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/1786052049893.webp";
            }}
          />
        ) : (
          <div className="relative z-10 flex h-full w-full items-center justify-center">
            <Package size={46} className="text-slate-300" />
          </div>
        )}

        {/* Bottom media fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      {/* Product content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">

        {/* Category */}
        {(parentCategoryName || categoryName) && (
          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            {parentCategoryName && (
              <span
                className="
                  text-[11px] font-medium uppercase
                  tracking-wider text-slate-400
                  whitespace-normal break-words
                "
              >
                {parentCategoryName}
              </span>
            )}

            {parentCategoryName && categoryName && (
              <span className="text-slate-300">•</span>
            )}

            {categoryName && (
              <span
                className="
                  text-[11px] font-bold uppercase
                  tracking-wider text-slate-700
                  whitespace-normal break-words
                "
              >
                {categoryName}
              </span>
            )}
          </div>
        )}

        {/* Product name */}
        <h3
          onClick={handleProductClick}
          className="
            min-h-[44px] cursor-pointer
            line-clamp-2 text-[15px] font-semibold
            leading-6 text-slate-900
            transition-colors duration-200
            hover:text-slate-600
          "
        >
          {name || "Product"}
        </h3>

        {/* Price */}
        <div className="mt-3 flex items-end gap-2">
          <span className="text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
            ₹{Number(price || 0).toLocaleString("en-IN")}
          </span>

          {displayOriginalPrice &&
            Number(displayOriginalPrice) > Number(price) && (
              <span className="mb-0.5 text-sm font-medium text-slate-400 line-through">
                ₹{Number(displayOriginalPrice).toLocaleString("en-IN")}
              </span>
            )}
        </div>

        {/* Action */}
        <button
          type="button"
          onClick={handleCartToggle}
          className={`
            mt-5 flex w-full items-center justify-center gap-2
            rounded-2xl px-4 py-3
            text-sm font-bold
            transition-all duration-200
            active:scale-[0.98]
            cursor-pointer
            ${
              isAdded
                ? `
                  bg-green-600
                  hover:bg-green-700
                  text-white
                `
                : `
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                `
            }
          `}
        >
          <ShoppingCart size={18} strokeWidth={2.2} />
          {isAdded ? "Go to Cart" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}

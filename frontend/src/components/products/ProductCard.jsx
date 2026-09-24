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
//     <article
//       className="
//         group relative flex h-full flex-col overflow-hidden
//         rounded-3xl border border-slate-200 bg-white
//         shadow-sm transition-all duration-300
//         hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl
//       "
//     >
//       {/* Product media */}
//       <div
//         className="
//           relative h-60 overflow-hidden bg-slate-100
//           sm:h-64 md:h-72
//           cursor-pointer
//         "
//         onClick={handleProductClick}
//       >
//         {/* Soft background accents */}
//         <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />

//         {/* Discount badge */}
//         {calculatedDiscount > 0 && (
//           <span
//             className="
//               absolute left-4 top-4 z-20
//               rounded-full bg-slate-900 px-3 py-1.5
//               text-[11px] font-bold tracking-wide text-white
//               shadow-lg
//             "
//           >
//             {calculatedDiscount}% OFF
//           </span>
//         )}

//         {/* Wishlist */}
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
//             absolute right-4 top-4 z-20
//             flex h-10 w-10 items-center justify-center
//             rounded-full border border-white/80 bg-white/95
//             text-slate-600 shadow-md backdrop-blur
//             transition-all duration-200
//             hover:scale-105 hover:bg-white
//             hover:text-rose-500
//             cursor-pointer
//           "
//         >
//           <Heart
//             size={18}
//             strokeWidth={2}
//             className={
//               isWishlisted
//                 ? "fill-rose-500 text-rose-500"
//                 : "text-slate-500"
//             }
//           />
//         </button>

//         {/* Product image */}
//         {productImage ? (
//           <img
//             src={productImage}
//             alt={name || "Product"}
//             className="
//               relative z-10 h-full w-full object-cover
//               transition-transform duration-700
//               group-hover:scale-105
//             "
//             onError={(e) => {
//               e.currentTarget.onerror = null;
//               e.currentTarget.src = "/1786052049893.webp";
//             }}
//           />
//         ) : (
//           <div className="relative z-10 flex h-full w-full items-center justify-center">
//             <Package size={46} className="text-slate-300" />
//           </div>
//         )}

//         {/* Bottom media fade */}
//         <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-black/10 to-transparent" />
//       </div>

//       {/* Product content */}
//       <div className="flex flex-1 flex-col p-4 sm:p-5">

//         {/* Category */}
//         {(parentCategoryName || categoryName) && (
//           <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
//             {parentCategoryName && (
//               <span
//                 className="
//                   text-[11px] font-medium uppercase
//                   tracking-wider text-slate-400
//                   whitespace-normal break-words
//                 "
//               >
//                 {parentCategoryName}
//               </span>
//             )}

//             {parentCategoryName && categoryName && (
//               <span className="text-slate-300">•</span>
//             )}

//             {categoryName && (
//               <span
//                 className="
//                   text-[11px] font-bold uppercase
//                   tracking-wider text-slate-700
//                   whitespace-normal break-words
//                 "
//               >
//                 {categoryName}
//               </span>
//             )}
//           </div>
//         )}

//         {/* Product name */}
//         <h3
//           onClick={handleProductClick}
//           className="
//             min-h-[44px] cursor-pointer
//             line-clamp-2 text-[15px] font-semibold
//             leading-6 text-slate-900
//             transition-colors duration-200
//             hover:text-slate-600
//           "
//         >
//           {name || "Product"}
//         </h3>

//         {/* Price */}
//         <div className="mt-3 flex items-end gap-2">
//           <span className="text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
//             ₹{Number(price || 0).toLocaleString("en-IN")}
//           </span>

//           {displayOriginalPrice &&
//             Number(displayOriginalPrice) > Number(price) && (
//               <span className="mb-0.5 text-sm font-medium text-slate-400 line-through">
//                 ₹{Number(displayOriginalPrice).toLocaleString("en-IN")}
//               </span>
//             )}
//         </div>

//         {/* Action */}
//         <button
//           type="button"
//           onClick={handleCartToggle}
//           className={`
//             mt-5 flex w-full items-center justify-center gap-2
//             rounded-2xl px-4 py-3
//             text-sm font-bold
//             transition-all duration-200
//             active:scale-[0.98]
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
//           <ShoppingCart size={18} strokeWidth={2.2} />
//           {isAdded ? "Go to Cart" : "Add to Cart"}
//         </button>
//       </div>
//     </article>
//   );
// }











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

// import {
//   motion,
//   AnimatePresence,
// } from "motion/react";

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
// |--------------------------------------------------------------------------
// */

// const getImageUrl = (image) => {
//   if (!image) {
//     return "/1786052049893.webp";
//   }

//   // Full URL
//   if (
//     image.startsWith("http://") ||
//     image.startsWith("https://") ||
//     image.startsWith("blob:")
//   ) {
//     return image;
//   }

//   // /uploads/image.jpg
//   if (image.startsWith("/uploads/")) {
//     return `http://localhost:3000${image}`;
//   }

//   // uploads/image.jpg
//   if (image.startsWith("uploads/")) {
//     return `http://localhost:3000/${image}`;
//   }

//   // image.jpg
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
//   stock,
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

//   // =====================================================
//   // CART STATUS
//   // =====================================================

//   const isAdded =
//     cart?.items?.some((item) => {
//       const cartProductId =
//         item?.productId?._id ||
//         item?.productId ||
//         item?.product?._id ||
//         item?._id;

//       return (
//         String(cartProductId) ===
//         String(_id)
//       );
//     }) ?? false;

//   // =====================================================
//   // WISHLIST STATUS
//   // =====================================================

//   const isWishlisted =
//     wishlist?.products?.some((product) => {
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

//   const categoryName =
//     typeof category === "object"
//       ? category?.name
//       : null;

//   const parentCategoryName =
//     typeof category === "object"
//       ? category?.parent?.name ||
//         category?.parentCategory?.name
//       : null;

//   /*
//    * Use parent category as the small brand/category label.
//    */

//   const brandName =
//     parentCategoryName ||
//     categoryName ||
//     "PRODUCT";

//   // =====================================================
//   // PRICE
//   // =====================================================

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
//   // SAVING
//   // =====================================================

//   const savingAmount =
//     displayOriginalPrice &&
//     Number(displayOriginalPrice) >
//       Number(price)
//       ? Number(displayOriginalPrice) -
//         Number(price)
//       : 0;

//   // =====================================================
//   // STOCK
//   // =====================================================

//   const numericStock =
//     stock !== undefined &&
//     stock !== null &&
//     stock !== ""
//       ? Number(stock)
//       : null;

//   const hasStock =
//     numericStock === null ||
//     numericStock > 0;

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
//     // User is not logged in
//     if (!isLoggedIn) {
//       requireLogin();
//       return;
//     }

//     // Already added
//     if (isAdded) {
//       navigate("/cart");
//       return;
//     }

//     // Add product
//     try {
//       const cartResponse =
//         await dispatch(
//           addProduct({
//             productId: _id,
//             price: Number(price) || 0,
//             quantity: 1,
//           })
//         ).unwrap();

//       showSuccess(
//         cartResponse.message ||
//           "Product added"
//       );
//     } catch (error) {
//       showError(
//         error.message ||
//           "Cart error"
//       );

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
//     // User is not logged in
//     if (!isLoggedIn) {
//       requireLogin();
//       return;
//     }

//     try {
//       // Remove
//       if (isWishlisted) {
//         const deleteResponse =
//           await dispatch(
//             deleteProducts(_id)
//           ).unwrap();

//         showSuccess(
//           deleteResponse.message ||
//             "Removed from wishlist"
//         );
//       }

//       // Add
//       else {
//         const addResponse =
//           await dispatch(
//             addProductInWish(_id)
//           ).unwrap();

//         showSuccess(
//           addResponse.message ||
//             "Added to wishlist"
//         );
//       }
//     } catch (error) {
//       showError(
//         error.message ||
//           "Wishlist error"
//       );

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

//     window.scrollTo({
//       top: 0,
//       behavior: "smooth",
//     });

//     navigate(`/product/${_id}`);
//   };

//   // =====================================================
//   // PRODUCT IMAGE
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
//     <motion.article
//       initial={{
//         opacity: 0,
//         y: 8,
//       }}
//       animate={{
//         opacity: 1,
//         y: 0,
//       }}
//       whileHover={{
//         y: -3,
//       }}
//       transition={{
//         duration: 0.25,
//         ease: "easeOut",
//       }}
//       className="
//         group
//         relative
//         flex
//         h-[271px]
//         w-[160px]
//         flex-shrink-0
//         flex-col
//         overflow-hidden
//         rounded-[12px]
//         border
//         border-slate-200
//         bg-white
//         shadow-[0_2px_8px_rgba(15,23,42,0.05)]
//         transition-shadow
//         duration-300
//         hover:shadow-[0_8px_20px_rgba(15,23,42,0.10)]
//       "
//     >

//       {/* =================================================
//           PRODUCT IMAGE
//       ================================================= */}

//       <div
//         onClick={handleProductClick}
//         className="
//           relative
//           h-[145px]
//           w-full
//           flex-shrink-0
//           cursor-pointer
//           overflow-hidden
//           bg-white
//         "
//       >

//         {/* Subtle background */}
//         <div
//           className="
//             pointer-events-none
//             absolute
//             inset-0
//             bg-gradient-to-b
//             from-slate-50
//             via-white
//             to-white
//           "
//         />

//         {/* =================================================
//             SAVE BADGE
//         ================================================= */}

//         {savingAmount > 0 && (
//           <motion.div
//             initial={{
//               opacity: 0,
//               scale: 0.8,
//             }}
//             animate={{
//               opacity: 1,
//               scale: 1,
//             }}
//             className="
//               absolute
//               right-2
//               top-2
//               z-20
//               rounded-full
//               bg-sky-500
//               px-2
//               py-1
//               text-[8px]
//               font-bold
//               leading-none
//               text-white
//               shadow-sm
//             "
//           >
//             Save ₹
//             {savingAmount.toLocaleString(
//               "en-IN"
//             )}
//           </motion.div>
//         )}

//         {/* =================================================
//             WISHLIST
//         ================================================= */}

//         <motion.button
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
//           whileHover={{
//             scale: 1.08,
//           }}
//           whileTap={{
//             scale: 0.9,
//           }}
//           className="
//             absolute
//             left-2
//             top-2
//             z-20
//             flex
//             h-7
//             w-7
//             items-center
//             justify-center
//             rounded-full
//             bg-white/95
//             shadow-sm
//             backdrop-blur-sm
//             transition-colors
//             duration-200
//             hover:text-rose-500
//           "
//         >
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={
//                 isWishlisted
//                   ? "liked"
//                   : "not-liked"
//               }
//               initial={{
//                 scale: 0.5,
//                 opacity: 0,
//               }}
//               animate={{
//                 scale: 1,
//                 opacity: 1,
//               }}
//               exit={{
//                 scale: 0.5,
//                 opacity: 0,
//               }}
//             >
//               <Heart
//                 size={13}
//                 strokeWidth={2}
//                 className={
//                   isWishlisted
//                     ? "fill-rose-500 text-rose-500"
//                     : "text-slate-500"
//                 }
//               />
//             </motion.div>
//           </AnimatePresence>
//         </motion.button>

//         {/* =================================================
//             DISCOUNT
//         ================================================= */}

//         {calculatedDiscount > 0 && (
//           <span
//             className="
//               absolute
//               bottom-2
//               left-2
//               z-20
//               rounded-md
//               bg-slate-900/90
//               px-1.5
//               py-0.5
//               text-[7px]
//               font-bold
//               leading-none
//               text-white
//             "
//           >
//             {calculatedDiscount}% OFF
//           </span>
//         )}

//         {/* =================================================
//             PRODUCT IMAGE
//         ================================================= */}

//         {productImage ? (
//           <motion.img
//             src={productImage}
//             alt={
//               name || "Product"
//             }
//             onError={(e) => {
//               e.currentTarget.onerror =
//                 null;

//               e.currentTarget.src =
//                 "/1786052049893.webp";
//             }}
//             className="
//               relative
//               z-10
//               h-full
//               w-full
//               object-cover
//               object-center
//               transition-transform
//               duration-500
//               ease-out
//               group-hover:scale-[1.025]
//             "
//           />
//         ) : (
//           <div
//             className="
//               relative
//               z-10
//               flex
//               h-full
//               w-full
//               items-center
//               justify-center
//             "
//           >
//             <Package
//               size={30}
//               className="text-slate-300"
//             />
//           </div>
//         )}
//       </div>

//       {/* =================================================
//           PRODUCT CONTENT
//       ================================================= */}

//       <div
//         className="
//           flex
//           min-h-0
//           flex-1
//           flex-col
//           px-2
//           pb-2
//           pt-1.5
//         "
//       >

//         {/* =================================================
//             BRAND / CATEGORY
//         ================================================= */}

//         <div className="mb-0.5 h-[12px]">
//           <span
//             className="
//               block
//               truncate
//               text-[8px]
//               font-semibold
//               uppercase
//               tracking-[0.08em]
//               text-slate-400
//             "
//           >
//             {brandName}
//           </span>
//         </div>

//         {/* =================================================
//             PRODUCT NAME
//         ================================================= */}

//         <h3
//           onClick={handleProductClick}
//           className="
//             h-[30px]
//             cursor-pointer
//             line-clamp-2
//             overflow-hidden
//             text-[11px]
//             font-semibold
//             leading-[15px]
//             text-slate-900
//             transition-colors
//             duration-200
//             hover:text-blue-600
//           "
//         >
//           {name || "Product"}
//         </h3>

//         {/* =================================================
//             PRICE
//         ================================================= */}

//         {/* PRICE + STOCK + CART */}
// <div className="mt-1 flex h-[38px] items-center justify-between">

//   {/* LEFT — PRICE + STOCK */}
//   <div className="min-w-0 flex flex-col justify-center">

//     {/* PRICE */}
//     <div className="flex items-center gap-1">
//       <span className="truncate text-[13px] font-bold tracking-tight text-slate-900">
//         ₹{Number(price || 0).toLocaleString("en-IN")}
//       </span>

//       {displayOriginalPrice &&
//         Number(displayOriginalPrice) > Number(price) && (
//           <span className="truncate text-[8px] font-medium text-slate-400 line-through">
//             ₹{Number(displayOriginalPrice).toLocaleString("en-IN")}
//           </span>
//         )}
//     </div>

//     {/* STOCK */}
//     <div className="mt-[1px] flex h-[11px] items-center gap-1">
//       <span
//         className={`h-[5px] w-[5px] flex-shrink-0 rounded-full ${
//           hasStock ? "bg-emerald-500" : "bg-red-500"
//         }`}
//       />

//       <span
//         className={`truncate text-[8px] font-medium ${
//           hasStock ? "text-emerald-600" : "text-red-500"
//         }`}
//       >
//         {hasStock
//           ? numericStock !== null
//             ? `${numericStock} in stock`
//             : "In stock"
//           : "Out of stock"}
//       </span>
//     </div>
//   </div>

//   {/* RIGHT — CART BUTTON */}
//   <motion.button
//     type="button"
//     onClick={handleCartToggle}
//     whileHover={{ scale: 1.08 }}
//     whileTap={{ scale: 0.9 }}
//     disabled={!hasStock}
//     aria-label={isAdded ? "Go to cart" : "Add to cart"}
//     className={`
//       flex
//       h-7
//       w-7
//       flex-shrink-0
//       items-center
//       justify-center
//       rounded-lg
//       transition-all
//       duration-200

//       ${
//         !hasStock
//           ? "cursor-not-allowed bg-slate-100 text-slate-400"
//           : isAdded
//           ? "bg-emerald-500 text-white shadow-sm"
//           : "bg-slate-900 text-white shadow-sm hover:bg-blue-600"
//       }
//     `}
//   >
//     <ShoppingCart
//       size={12}
//       strokeWidth={2.3}
//     />
//   </motion.button>

// </div>
//       </div>
//     </motion.article>
//   );
// }




















import {
  Heart,
  ShoppingCart,
  Package,
  Check,
} from "lucide-react";

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

  const productImage =
    Array.isArray(images) &&
    images.length > 0
      ? getImageUrl(images[0])
      : "/1786052049893.webp";

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

        {calculatedDiscount > 0 ? (
          <motion.div
            initial={{
              opacity: 0,
              y: -5,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              absolute
              left-3
              top-3
              z-30
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
            {calculatedDiscount >= 30
              ? "Best Seller"
              : `${calculatedDiscount}% OFF`}
          </motion.div>
        ) : (
          <div
            className="
              absolute
              left-3
              top-3
              z-30
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
            Featured
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

        <div
          className="
            absolute
            inset-0
            z-10
            flex
            items-center
            justify-center
            overflow-hidden
          "
        >
          <motion.img
            src={productImage}
            alt={name || "Product"}
            onError={(e) => {
              e.currentTarget.onerror =
                null;

              e.currentTarget.src =
                "/1786052049893.webp";
            }}
            className="
    h-full
    w-full
    object-cover
    object-center
    transition-transform
    duration-500
    ease-out
    group-hover:scale-[1.03]
  "
          />
        </div>

        {/* =================================================
            BOTTOM FADE
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-0
            right-0
            z-20
            h-12
            bg-gradient-to-t
            from-slate-100/70
            to-transparent
          "
        />
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
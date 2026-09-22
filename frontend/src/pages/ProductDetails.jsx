import React, { useEffect, useMemo, useState } from "react";
import {
  FaStar,
  FaStarHalfAlt,
  FaShoppingCart,
  FaBolt,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaHeart,
} from "react-icons/fa";
import AddonProducts from "../components/products/AddonProducts";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { getProducts } from "../redux/slices/productSlice";
import { addProduct } from "../redux/slices/cartSlice";
import {
  addProductInWish,
  deleteProducts,
} from "../redux/slices/wishlistSlice";

import ProductCard from "../components/products/ProductCard";
import { getRelatedProducts } from "../redux/slices/productSlice";
import { showSuccess,showError } from "../utils/toast";
const API_URL = "http://localhost:3000";

/* =========================================================
   IMAGE HELPERS
========================================================= */

const getImageUrl = (image) => {
  if (!image) {
    return "/1786052049893.webp";
  }

  if (
    typeof image === "string" &&
    (image.startsWith("http://") || image.startsWith("https://"))
  ) {
    return image;
  }

  return `${API_URL}/uploads/${image}`;
};

const getProductImages = (images) => {
  if (Array.isArray(images)) {
    return images.filter(Boolean);
  }

  if (images) {
    return [images];
  }

  return [];
};

/* =========================================================
   PRICE HELPER
========================================================= */

const getPricing = (product) => {
  const currentPrice = Number(product?.price || 0);

  /*
   * New version:
   *
   * product.originalPrice
   * product.discount
   *
   * We use those first.
   *
   * Fallback is kept for older products where those fields
   * may not exist.
   */

  let originalPrice = Number(product?.originalPrice || 0);

  let discount = Number(product?.discount || 0);

  if (!originalPrice && currentPrice > 0) {
    originalPrice = Math.round(currentPrice * 1.2);
  }

  if (!discount && originalPrice > currentPrice) {
    discount = Math.round(
      ((originalPrice - currentPrice) / originalPrice) * 100
    );
  }

  return {
    currentPrice,
    originalPrice,
    discount,
  };
};

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />

        <p className="text-gray-600 font-medium">
          Loading product...
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   ERROR
========================================================= */

function ErrorState({ error, onBack }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Something went wrong
        </h2>

        <p className="text-gray-500 mt-2 mb-6">
          {error || "Unable to load product."}
        </p>

        <button
          type="button"
          onClick={onBack}
          className="
            px-6
            py-3
            bg-blue-600
            text-white
            rounded-xl
            font-semibold
            hover:bg-blue-700
            transition
          "
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   NOT FOUND
========================================================= */

function ProductNotFound({ onBack }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🛍️</div>

        <h2 className="text-2xl font-bold text-gray-800">
          Product Not Found
        </h2>

        <p className="text-gray-500 mt-2 mb-6">
          The product you're looking for doesn't exist.
        </p>

        <button
          type="button"
          onClick={onBack}
          className="
            px-6
            py-3
            bg-blue-600
            text-white
            rounded-xl
            font-semibold
            hover:bg-blue-700
            transition
          "
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   RATING
========================================================= */

function Rating() {
  return (
    <div
      className="
        flex
        items-center
        gap-1
        bg-green-600
        text-white
        px-3
        py-1.5
        rounded-lg
        text-sm
        font-bold
        w-fit
      "
    >
      4.5
      <FaStar className="text-xs" />
    </div>
  );
}

/* =========================================================
   BENEFIT
========================================================= */

function Benefit({
  icon,
  color,
  title,
  description,
}) {
  return (
    <div className="flex gap-3 items-start">
      <div
        className={`
          w-10
          h-10
          ${color}
          rounded-full
          flex
          items-center
          justify-center
          flex-shrink-0
        `}
      >
        {icon}
      </div>

      <div>
        <p className="font-semibold text-gray-800 text-sm">
          {title}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCT DETAILS
========================================================= */

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  /* =======================================================
     AUTH
  ======================================================= */

  const { user, token } = useSelector(
    (state) => state.auth
  );

  const isLoggedIn = !!token || !!user;

  /* =======================================================
     PRODUCTS
  ======================================================= */

  const {
    product = [],
    loading,
    error,
  } = useSelector((state) => state.product);
console.log("pro",product)
  /* =======================================================
     CART
  ======================================================= */

  const { cart } = useSelector(
    (state) => state.cart
  );

  /* =======================================================
     WISHLIST
  ======================================================= */

  const { wishlist } = useSelector(
    (state) => state.wishlist
  );

  /* =======================================================
     FIND CURRENT PRODUCT
  ======================================================= */

  const currentProduct = useMemo(() => {
    return product.find(
      (item) =>
        String(item?._id) === String(id)
    );
  }, [product, id]);

const inStock = currentProduct?.stock ?? 0;
 console.log("id from URL:", id);
console.log("products:", product);
console.log("currentProduct:", currentProduct);
console.log("inStock:", inStock);
  /* =======================================================
     CART CHECK
  ======================================================= */

  const isInCart = useMemo(() => {
    return (
      cart?.items?.some((item) => {
        const cartProductId =
          item?.productId?._id ||
          item?.productId ||
          item?.product?._id ||
          item?._id;

        return (
          String(cartProductId) === String(id)
        );
      }) ?? false
    );
  }, [cart?.items, id]);

  /* =======================================================
     WISHLIST CHECK
  ======================================================= */

  const isWishlisted = useMemo(() => {
    return (
      wishlist?.products?.some((item) => {
        const wishlistProductId =
          item?._id ||
          item?.productId?._id ||
          item?.productId ||
          item?.product?._id;

        return (
          String(wishlistProductId) === String(id)
        );
      }) ?? false
    );
  }, [wishlist?.products, id]);

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

useEffect(() => {
  if (!product.length) {
    dispatch(getProducts());
  }
}, [dispatch, product.length]);

useEffect(() => {
  if (currentProduct?._id) {
    dispatch(getRelatedProducts(currentProduct._id));
  }
}, [dispatch, currentProduct?._id]);

  /* =======================================================
     RESET WHEN PRODUCT CHANGES
  ======================================================= */

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
  }, [id]);

  /* =======================================================
     IMAGES
  ======================================================= */

  const images = useMemo(() => {
    return getProductImages(
      currentProduct?.images
    );
  }, [currentProduct]);

  /* =======================================================
     PRICING
  ======================================================= */

  const {
    currentPrice,
    originalPrice,
    discount,
  } = useMemo(() => {
    return getPricing(currentProduct);
  }, [currentProduct]);

  const mainImage =
    images[selectedImage] || images[0];

  /* =======================================================
     RELATED PRODUCTS
  ======================================================= */
const relatedProducts = useMemo(() => {
  if (!currentProduct) {
    return [];
  }

  const currentCategoryId =
    currentProduct?.category?._id || currentProduct?.category;

  return product
    .filter(
      (item) =>
        String(item?._id) !== String(currentProduct?._id) &&
        String(item?.category?._id || item?.category) ===
          String(currentCategoryId)
    )
    .slice(0, 10);
}, [product, currentProduct]);

  /* =======================================================
     LOGIN
  ======================================================= */

  const requireLogin = () => {
    navigate("/login", {
      state: {
        from: `/product/${id}`,
      },
    });
  };

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleCartClick = async () => {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }

    if (isInCart) {
      navigate("/cart");
      return;
    }

    try {
    const addtocart=   await dispatch(
       addProduct({
          productId: id,
          price: currentPrice,
          quantity,
        })
      ).unwrap();
      showSuccess(addtocart.message || 'deleted')
    } catch (error) {
      console.error(
        "Failed to add product to cart:",
        error
      );
    }
  };

  /* =======================================================
     BUY NOW
  ======================================================= */

  const handleBuyNow = async () => {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }

    /*
     * If already in cart, simply go to cart.
     */
    if (isInCart) {
      navigate("/cart");
      return;
    }

    try {
      await dispatch(
        addProduct({
          productId: id,
          price: currentPrice,
          quantity,
        })
      ).unwrap();

      navigate("/cart");
    } catch (error) {
      console.error(
        "Buy now failed:",
        error
      );
    }
  };

  /* =======================================================
     WISHLIST
  ======================================================= */

  const handleWishlist = async () => {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }

    if (!currentProduct) {
      return;
    }

    try {
     if (isWishlisted) {
           const deletefromWish =   await dispatch(
               deleteProducts(id)
             ).unwrap();
             showSuccess(deletefromWish.message || 'deleted')
           } else {
            const addToWish =  await dispatch(
               addProductInWish(id)
             ).unwrap();
             console.log("wishadd",addToWish)
             showSuccess(addToWish.message || 'added')
           }
    } catch (error) {
      console.error(
        "Wishlist error:",
        error
      );
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return <LoadingState />;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <ErrorState
        error={error}
        onBack={() => navigate("/")}
      />
    );
  }

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!currentProduct) {
    return (
      <ProductNotFound
        onBack={() => navigate("/")}
      />
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===================================================
          BREADCRUMB
      =================================================== */}

      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 overflow-hidden">

          <button
            type="button"
            onClick={() => navigate("/")}
            className="
              hover:text-blue-600
              transition
              flex-shrink-0
            "
          >
            Home
          </button>

          <span>/</span>

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="
              hover:text-blue-600
              transition
              flex-shrink-0
            "
          >
            Products
          </button>

          <span>/</span>

          <span className="text-gray-900 font-medium truncate">
            {currentProduct.name}
          </span>

        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* =================================================
            PRODUCT SECTION
        ================================================= */}

        <section
          className="
            bg-white
            rounded-3xl
            border
            border-gray-100
            shadow-sm
            overflow-hidden
          "
        >

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-5 md:p-8">

            {/* =================================================
                PRODUCT IMAGES
            ================================================= */}

            <div>

              <div
                className="
                  relative
                  h-[400px]
                  md:h-[520px]
                  bg-gray-50
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  overflow-hidden
                "
              >

                {/* DISCOUNT */}

                {discount > 0 && (
                  <span
                    className="
                      absolute
                      top-5
                      left-5
                      z-10
                      bg-red-500
                      text-white
                      text-sm
                      font-bold
                      px-4
                      py-2
                      rounded-full
                    "
                  >
                    {discount}% OFF
                  </span>
                )}

                {/* WISHLIST */}

                <button
                  type="button"
                  onClick={handleWishlist}
                  className="
                    absolute
                    top-5
                    right-5
                    z-10
                    w-11
                    h-11
                    bg-white
                    rounded-full
                    shadow-md
                    flex
                    items-center
                    justify-center
                    hover:scale-105
                    transition
                    cursor-pointer
                  "
                  aria-label="Wishlist"
                >
                  <FaHeart
                    className={
                      isWishlisted
                        ? "text-red-500"
                        : "text-gray-500"
                    }
                  />
                </button>

                {/* MAIN IMAGE */}

                <img
                  src={getImageUrl(mainImage)}
                  alt={
                    currentProduct.name ||
                    "Product"
                  }
                  className="
                    w-full
                    h-full
                    object-contain
                    p-8
                    hover:scale-105
                    transition-transform
                    duration-500
                  "
                />

              </div>

              {/* =================================================
                  THUMBNAILS
              ================================================= */}

              {images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">

                  {images.map(
                    (image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() =>
                          setSelectedImage(index)
                        }
                        className={`
                          flex-shrink-0
                          w-20
                          h-20
                          rounded-xl
                          overflow-hidden
                          border-2
                          bg-gray-50
                          transition
                          ${
                            selectedImage ===
                            index
                              ? "border-blue-600"
                              : "border-gray-200 hover:border-gray-400"
                          }
                        `}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`${currentProduct.name} ${
                            index + 1
                          }`}
                          className="
                            w-full
                            h-full
                            object-contain
                            p-2
                          "
                        />
                      </button>
                    )
                  )}

                </div>
              )}

            </div>

            {/* =================================================
                PRODUCT INFORMATION
            ================================================= */}

            <div className="flex flex-col">

              <span
                className="
                  text-sm
                  text-blue-600
                  font-semibold
                  uppercase
                  tracking-wide
                  mb-2
                "
              >
                Premium Collection
              </span>

              <h1
                className="
                  text-2xl
                  md:text-3xl
                  font-bold
                  text-gray-900
                  leading-tight
                "
              >
                {currentProduct.name}
              </h1>

              {/* =================================================
                  VENDOR
              ================================================= */}

              <div className="flex items-center gap-2 mt-3">

                <span className="text-sm text-gray-500">
                  Sold by
                </span>

                <button
                  type="button"
                  className="
                    text-sm
                    font-semibold
                    text-blue-600
                    hover:text-blue-700
                    hover:underline
                  "
                >
                  {currentProduct.vendor?.firstName ||
                    currentProduct.vendor?.name ||
                    "Unknown Vendor"}
                </button>

                <span
                  className="
                    text-xs
                    bg-green-50
                    text-green-600
                    px-2
                    py-1
                    rounded-md
                    font-medium
                  "
                >
                  Verified Seller
                </span>

              </div>

              {/* =================================================
                  RATING
              ================================================= */}

              <div className="flex items-center gap-3 mt-4">

                <Rating />

                <span className="text-gray-500 text-sm">
                  128 Ratings
                </span>

                <span className="text-gray-300">
                  |
                </span>

                <span className="text-gray-500 text-sm">
                  42 Reviews
                </span>

              </div>

              <div className="border-t border-gray-100 my-6" />

              {/* =================================================
                  PRICE
              ================================================= */}

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <span
                    className="
                      text-3xl
                      md:text-4xl
                      font-bold
                      text-gray-900
                    "
                  >
                    ₹
                    {currentPrice.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                  {originalPrice >
                    currentPrice && (
                    <span
                      className="
                        text-lg
                        text-gray-400
                        line-through
                      "
                    >
                      ₹
                      {originalPrice.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  )}

                  {discount > 0 && (
                    <span className="text-green-600 font-bold">
                      {discount}% off
                    </span>
                  )}

                </div>

                <p className="text-sm text-gray-500 mt-2">
                  Inclusive of all taxes
                </p>

              </div>

              {/* =================================================
                  STOCK
              ================================================= */}

              <div className="mt-6 flex items-center gap-2">

                <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />

              { inStock>10? <span className="text-green-600 font-semibold">
                  In Stock
                </span> :
                 <span className="text-green-600 font-semibold">
                 only {inStock} left 
                </span>
                }

                <span className="text-gray-400">
                  •
                </span>

                <span className="text-gray-500 text-sm">
                  Ready to ship
                </span>

              </div>

              {/* =================================================
                  QUANTITY
              ================================================= */}

              <div className="mt-6">

                <p className="font-semibold text-gray-800 mb-3">
                  Quantity
                </p>

                <div
                  className="
                    inline-flex
                    items-center
                    border
                    border-gray-300
                    rounded-xl
                    overflow-hidden
                  "
                >

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) =>
                        Math.max(
                          1,
                          value - 1
                        )
                      )
                    }
                    className="
                      w-11
                      h-11
                      text-lg
                      font-bold
                      hover:bg-gray-100
                      transition
                    "
                  >
                    −
                  </button>

                  <span className="w-12 text-center font-semibold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        (value) => value + 1
                      )
                    }
                    className="
                      w-11
                      h-11
                      text-lg
                      font-bold
                      hover:bg-gray-100
                      transition
                    "
                  >
                    +
                  </button>

                </div>

              </div>

              {/* =================================================
                  ACTION BUTTONS
              ================================================= */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7">

                {/* CART */}

                <button
                  type="button"
                  onClick={handleCartClick}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-3
                    bg-orange-500
                    hover:bg-orange-600
                    text-white
                    font-bold
                    py-4
                    rounded-xl
                    transition
                    shadow-sm
                    cursor-pointer
                  "
                >
                  <FaShoppingCart />

                  {isInCart
                    ? "Go To Cart"
                    : "Add to Cart"}
                </button>

                {/* BUY NOW */}

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-3
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    font-bold
                    py-4
                    rounded-xl
                    transition
                    shadow-sm
                    cursor-pointer
                  "
                >
                  <FaBolt />

                  Buy Now
                </button>

              </div>

              {/* =================================================
                  BENEFITS
              ================================================= */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">

                <Benefit
                  icon={<FaTruck />}
                  color="bg-blue-50 text-blue-600"
                  title="Fast Delivery"
                  description="Delivered to your door"
                />

                <Benefit
                  icon={<FaShieldAlt />}
                  color="bg-green-50 text-green-600"
                  title="Secure Payment"
                  description="100% secure checkout"
                />

                <Benefit
                  icon={<FaUndo />}
                  color="bg-purple-50 text-purple-600"
                  title="Easy Returns"
                  description="Hassle-free returns"
                />

                <Benefit
                  icon={<FaShieldAlt />}
                  color="bg-yellow-50 text-yellow-600"
                  title="Genuine Product"
                  description="Quality guaranteed"
                />

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            RELATED PRODUCTS
        ===================================================== */}

        {relatedProducts.length > 0 && (
          <section className="mt-10">

            <div className="mb-6">

              <p className="text-sm font-semibold text-blue-600 mb-1">
                You May Also Like
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Related Products
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                More products you might be interested in
              </p>

            </div>

            <div
              className="
                grid
                grid-cols-2
                sm:grid-cols-3
                md:grid-cols-4
                lg:grid-cols-5
                gap-3
                sm:gap-4
                lg:gap-5
              "
            >
              {relatedProducts.map(
                (item) => (
                  <ProductCard
                    key={item._id}
                    {...item}
                  />
                )
              )}
            </div>

          </section>
        )}

        {/* =====================================================
            DESCRIPTION
        ===================================================== */}

        <section
          className="
            bg-white
            rounded-3xl
            border
            border-gray-100
            shadow-sm
            mt-10
            p-6
            md:p-8
          "
        >

          <h2 className="text-2xl font-bold text-gray-900">
            Product Description
          </h2>

          <div className="w-16 h-1 bg-blue-600 rounded-full mt-3 mb-6" />

          <p className="text-gray-600 leading-7 whitespace-pre-line">
            {currentProduct.description ||
              "Experience premium quality and excellent performance with this product. Designed with modern features and high-quality materials, this product is perfect for everyday use."}
          </p>

        </section>

        {/* =====================================================
            HIGHLIGHTS
        ===================================================== */}

        <section
          className="
            bg-white
            rounded-3xl
            border
            border-gray-100
            shadow-sm
            mt-6
            p-6
            md:p-8
          "
        >

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Product Highlights
          </h2>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-5
            "
          >

            {[
              {
                title: "Premium Quality",
                description:
                  "Made using high-quality materials",
              },
              {
                title: "Modern Design",
                description:
                  "Stylish and comfortable design",
              },
              {
                title: "Easy to Use",
                description:
                  "Simple and convenient experience",
              },
              {
                title: "Long Lasting",
                description:
                  "Built for reliable everyday use",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="
                  p-5
                  bg-gray-50
                  rounded-2xl
                  border
                  border-gray-100
                "
              >

                <div className="w-2 h-2 bg-blue-600 rounded-full mb-3" />

                <h3 className="font-bold text-gray-800">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-500 mt-2 leading-6">
                  {item.description}
                </p>

              </div>
            ))}

          </div>

        </section>

        <AddonProducts currentProduct={currentProduct} products={product} />

        {/* =====================================================
            REVIEWS
        ===================================================== */}

        <section
          className="
            bg-white
            rounded-3xl
            border
            border-gray-100
            shadow-sm
            mt-6
            p-6
            md:p-8
          "
        >

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-5
            "
          >

            <div>

              <h2 className="text-2xl font-bold text-gray-900">
                Customer Reviews
              </h2>

              <div className="flex items-center gap-3 mt-3">

                <span className="text-4xl font-bold">
                  4.5
                </span>

                <div>

                  <div className="flex text-yellow-400 gap-1">

                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStarHalfAlt />

                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    Based on 128 ratings
                  </p>

                </div>

              </div>

            </div>

            <button
              type="button"
              className="
                border
                border-blue-600
                text-blue-600
                px-6
                py-3
                rounded-xl
                font-semibold
                hover:bg-blue-50
                transition
              "
            >
              Write a Review
            </button>

          </div>

        </section>

      </main>
    </div>
  );
}

export default ProductDetails;
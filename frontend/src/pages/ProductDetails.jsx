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

import {
  getProducts,
  getRelatedProducts,
} from "../redux/slices/productSlice";

import { addProduct } from "../redux/slices/cartSlice";

import {
  addProductInWish,
  deleteProducts,
} from "../redux/slices/wishlistSlice";

import ProductCard from "../components/products/ProductCard";

import { getProductReviews } from "../redux/slices/reviewsSlice";

import {
  showSuccess,
  showError,
} from "../utils/toast";

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
    (image.startsWith("http://") ||
      image.startsWith("https://"))
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

  let originalPrice = Number(
    product?.originalPrice ||
      product?.mrp ||
      0
  );

  let discount = Number(
    product?.discount || 0
  );

  if (!originalPrice && currentPrice > 0) {
    originalPrice = Math.round(
      currentPrice * 1.2
    );
  }

  if (
    !discount &&
    originalPrice > currentPrice &&
    currentPrice > 0
  ) {
    discount = Math.round(
      ((originalPrice - currentPrice) /
        originalPrice) *
        100
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
        <div className="text-6xl mb-4">
          🛍️
        </div>

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

function Rating({ average }) {
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
      {average || 4.5}

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
  const [selectedImage, setSelectedImage] =
    useState(0);

  /* =======================================================
     VARIANT STATE
  ======================================================= */

  const [selectedAttributes, setSelectedAttributes] =
    useState({});

  /* =======================================================
     REVIEWS
  ======================================================= */

  const [reviewsPage, setReviewsPage] =
    useState(1);

  const {
    reviews = [],
    distribution,
    pagination: reviewsPagination,
    loading: reviewsLoading,
    error: reviewsError,
  } = useSelector(
    (state) => state.review
  );

  /* =======================================================
     AUTH
  ======================================================= */

  const { user, token } = useSelector(
    (state) => state.auth
  );

  const isLoggedIn =
    !!token || !!user;

  /* =======================================================
     PRODUCTS
  ======================================================= */

  const {
    product = [],
    loading,
    error,
  } = useSelector(
    (state) => state.product
  );

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
        String(item?._id) ===
        String(id)
    );
  }, [product, id]);

  /* =======================================================
     ACTIVE VARIANTS
     
     IMPORTANT:
     hasVariants MUST be true.
     
     If:
       hasVariants: false
     
     then variants are completely ignored.
  ======================================================= */

  const activeVariants = useMemo(() => {
    if (
      currentProduct?.hasVariants !== true
    ) {
      return [];
    }

    if (
      !Array.isArray(
        currentProduct?.variants
      )
    ) {
      return [];
    }

    return currentProduct.variants.filter(
      (variant) => {
        return (
          variant &&
          variant.isActive !== false &&
          Array.isArray(
            variant.attributes
          ) &&
          variant.attributes.length > 0
        );
      }
    );
  }, [currentProduct]);

  /* =======================================================
     VARIANT ATTRIBUTE GROUPS
     
     Example:
     
     Size:
       S
       M
       L
     
     Color:
       Black
       White
  ======================================================= */

  const variantGroups = useMemo(() => {
    if (!activeVariants.length) {
      return [];
    }

    const groups = {};

    activeVariants.forEach(
      (variant) => {
        if (
          !Array.isArray(
            variant.attributes
          )
        ) {
          return;
        }

        variant.attributes.forEach(
          (attribute) => {
            const name =
              typeof attribute?.name ===
              "string"
                ? attribute.name.trim()
                : "";

            const value =
              typeof attribute?.value ===
              "string"
                ? attribute.value.trim()
                : "";

            if (!name || !value) {
              return;
            }

            if (!groups[name]) {
              groups[name] = [];
            }

            if (
              !groups[name].includes(
                value
              )
            ) {
              groups[name].push(value);
            }
          }
        );
      }
    );

    return Object.entries(groups);
  }, [activeVariants]);

  /* =======================================================
     HAS VARIANTS
  ======================================================= */

  const hasVariantSelection =
    currentProduct?.hasVariants === true &&
    activeVariants.length > 0 &&
    variantGroups.length > 0;

  /* =======================================================
     INITIAL VARIANT SELECTION
     
     Select the complete first valid variant.
     
     This prevents an invalid combination such as:
       Size S + Color Blue
     
     when that combination doesn't actually exist.
  ======================================================= */

  useEffect(() => {
    if (
      currentProduct?.hasVariants !==
        true ||
      !activeVariants.length
    ) {
      setSelectedAttributes({});
      return;
    }

    const firstVariant =
      activeVariants[0];

    const initialSelection = {};

    if (
      Array.isArray(
        firstVariant?.attributes
      )
    ) {
      firstVariant.attributes.forEach(
        (attribute) => {
          const name =
            typeof attribute?.name ===
            "string"
              ? attribute.name.trim()
              : "";

          const value =
            typeof attribute?.value ===
            "string"
              ? attribute.value.trim()
              : "";

          if (name && value) {
            initialSelection[name] =
              value;
          }
        }
      );
    }

    setSelectedAttributes(
      initialSelection
    );

    setQuantity(1);
  }, [
    currentProduct?._id,
    currentProduct?.hasVariants,
    activeVariants,
  ]);

  /* =======================================================
     VARIANT MATCH FUNCTION
  ======================================================= */

  const doesVariantMatchSelection = (
    variant,
    selection
  ) => {
    if (
      !variant ||
      !Array.isArray(
        variant.attributes
      )
    ) {
      return false;
    }

    return Object.entries(
      selection
    ).every(
      ([
        attributeName,
        selectedValue,
      ]) => {
        return variant.attributes.some(
          (attribute) => {
            const attributeNameValue =
              String(
                attribute?.name || ""
              )
                .trim()
                .toLowerCase();

            const attributeValue =
              String(
                attribute?.value || ""
              )
                .trim()
                .toLowerCase();

            return (
              attributeNameValue ===
                String(
                  attributeName
                )
                  .trim()
                  .toLowerCase() &&
              attributeValue ===
                String(
                  selectedValue
                )
                  .trim()
                  .toLowerCase()
            );
          }
        );
      }
    );
  };

  /* =======================================================
     SELECTED VARIANT
  ======================================================= */

  const selectedVariant = useMemo(() => {
    if (
      currentProduct?.hasVariants !==
      true
    ) {
      return null;
    }

    if (!activeVariants.length) {
      return null;
    }

    if (
      !Object.keys(
        selectedAttributes
      ).length
    ) {
      return null;
    }

    return (
      activeVariants.find(
        (variant) =>
          doesVariantMatchSelection(
            variant,
            selectedAttributes
          )
      ) || null
    );
  }, [
    currentProduct?.hasVariants,
    activeVariants,
    selectedAttributes,
  ]);

  /* =======================================================
     CHANGE VARIANT
  ======================================================= */

  const handleAttributeChange = (
    attributeName,
    value
  ) => {
    setSelectedAttributes(
      (previous) => ({
        ...previous,
        [attributeName]: value,
      })
    );

    setQuantity(1);
  };

  /* =======================================================
     VARIANT ID HELPER
  ======================================================= */

  const getVariantId = (
    variant
  ) => {
    if (!variant) {
      return null;
    }

    if (
      typeof variant === "string"
    ) {
      return variant;
    }

    if (
      typeof variant === "number"
    ) {
      return String(variant);
    }

    if (
      typeof variant === "object"
    ) {
      const variantId =
        variant?._id ||
        variant?.id;

      if (!variantId) {
        return null;
      }

      return String(variantId);
    }

    return null;
  };

  /* =======================================================
     VARIANT SKU
  ======================================================= */

  const selectedSku =
    selectedVariant?.sku ||
    currentProduct?.sku ||
    null;

  /* =======================================================
     PRICING
     
     Variant price is used when a valid
     variant is selected.
  ======================================================= */

  const {
    currentPrice,
    originalPrice,
    discount,
  } = useMemo(() => {
    const source =
      currentProduct?.hasVariants ===
        true &&
      selectedVariant
        ? selectedVariant
        : currentProduct;

    return getPricing(source);
  }, [
    currentProduct,
    selectedVariant,
  ]);

  /* =======================================================
     STOCK
     
     Variant stock is used when a valid
     variant is selected.
  ======================================================= */

  const inStock = useMemo(() => {
    const source =
      currentProduct?.hasVariants ===
        true &&
      selectedVariant
        ? selectedVariant
        : currentProduct;

    const stock = Number(
      source?.stock ??
        currentProduct?.stock ??
        0
    );

    if (!Number.isFinite(stock)) {
      return 0;
    }

    return Math.max(0, stock);
  }, [
    currentProduct,
    selectedVariant,
  ]);

  /* =======================================================
     RESET QUANTITY IF STOCK CHANGES
  ======================================================= */

  useEffect(() => {
    setQuantity((previous) => {
      if (inStock <= 0) {
        return 1;
      }

      return Math.min(
        previous,
        inStock
      );
    });
  }, [inStock]);

  /* =======================================================
     VALID VARIANT CHECK
  ======================================================= */

  const variantSelectionRequired =
    hasVariantSelection &&
    !selectedVariant;

  /* =======================================================
     REVIEWS
  ======================================================= */

  useEffect(() => {
    if (currentProduct?._id) {
      dispatch(
        getProductReviews({
          productId:
            currentProduct._id,
          page: reviewsPage,
          limit: 10,
        })
      );
    }
  }, [
    dispatch,
    currentProduct?._id,
    reviewsPage,
  ]);

  /* =======================================================
     CART CHECK
  ======================================================= */

  const isInCart = useMemo(() => {
    return (
      cart?.items?.some(
        (item) => {
          const cartProductId =
            item?.productId?._id ||
            item?.productId ||
            item?.product?._id ||
            item?._id;

          return (
            String(
              cartProductId
            ) === String(id)
          );
        }
      ) ?? false
    );
  }, [
    cart?.items,
    id,
  ]);

  /* =======================================================
     WISHLIST CHECK
  ======================================================= */

  const isWishlisted = useMemo(() => {
    return (
      wishlist?.products?.some(
        (item) => {
          const wishlistProductId =
            item?._id ||
            item?.productId?._id ||
            item?.productId ||
            item?.product?._id;

          return (
            String(
              wishlistProductId
            ) === String(id)
          );
        }
      ) ?? false
    );
  }, [
    wishlist?.products,
    id,
  ]);

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  useEffect(() => {
    if (!product.length) {
      dispatch(getProducts());
    }
  }, [
    dispatch,
    product.length,
  ]);

  /* =======================================================
     RELATED PRODUCTS
  ======================================================= */

  useEffect(() => {
    if (currentProduct?._id) {
      dispatch(
        getRelatedProducts(
          currentProduct._id
        )
      );
    }
  }, [
    dispatch,
    currentProduct?._id,
  ]);

  /* =======================================================
     RESET WHEN PRODUCT CHANGES
  ======================================================= */

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setSelectedAttributes({});
  }, [id]);

  /* =======================================================
     IMAGES
  ======================================================= */

  const images = useMemo(() => {
    return getProductImages(
      currentProduct?.images
    );
  }, [currentProduct]);

  const mainImage =
    images[selectedImage] ||
    images[0];

  /* =======================================================
     RELATED PRODUCTS
  ======================================================= */

  const relatedProducts = useMemo(() => {
    if (!currentProduct) {
      return [];
    }

    const currentCategoryId =
      currentProduct?.category?._id ||
      currentProduct?.category;

    return product
      .filter(
        (item) =>
          String(item?._id) !==
            String(
              currentProduct?._id
            ) &&
          String(
            item?.category?._id ||
              item?.category
          ) ===
            String(
              currentCategoryId
            )
      )
      .slice(0, 10);
  }, [
    product,
    currentProduct,
  ]);

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
     VALIDATE PRODUCT BEFORE CART
  ======================================================= */

  const validateBeforeCart = () => {
    if (
      currentProduct?.hasVariants ===
        true &&
      hasVariantSelection &&
      !selectedVariant
    ) {
      showError(
        "Please select a valid product variant."
      );

      return false;
    }

    if (inStock <= 0) {
      showError(
        "This product is currently out of stock."
      );

      return false;
    }

    if (quantity > inStock) {
      showError(
        `Only ${inStock} item${
          inStock === 1
            ? ""
            : "s"
        } available in stock.`
      );

      setQuantity(
        Math.max(1, inStock)
      );

      return false;
    }

    return true;
  };

  /* =======================================================
     CART PAYLOAD
  ======================================================= */

  const getCartPayload = () => {
    const payload = {
      productId: id,
      price: currentPrice,
      quantity,
    };

    const variantId =
      getVariantId(
        selectedVariant
      );

    if (
      currentProduct?.hasVariants ===
        true &&
      variantId
    ) {
      payload.variantId =
        variantId;
    }

    return payload;
  };

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleCartClick = async () => {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }

    if (!validateBeforeCart()) {
      return;
    }

    if (isInCart) {
      navigate("/cart");
      return;
    }

    try {
      const addtocart =
        await dispatch(
          addProduct(
            getCartPayload()
          )
        ).unwrap();

      showSuccess(
        addtocart?.message ||
          "Product added to cart"
      );
    } catch (error) {
      console.error(
        "Failed to add product to cart:",
        error
      );

      showError(
        error?.message ||
          "Failed to add product to cart"
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

    if (!validateBeforeCart()) {
      return;
    }

    if (isInCart) {
      navigate("/cart");
      return;
    }

    try {
      await dispatch(
        addProduct(
          getCartPayload()
        )
      ).unwrap();

      navigate("/cart");
    } catch (error) {
      console.error(
        "Buy now failed:",
        error
      );

      showError(
        error?.message ||
          "Unable to process Buy Now"
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
        const deletefromWish =
          await dispatch(
            deleteProducts(id)
          ).unwrap();

        showSuccess(
          deletefromWish?.message ||
            "Removed from wishlist"
        );
      } else {
        const addToWish =
          await dispatch(
            addProductInWish(id)
          ).unwrap();

        showSuccess(
          addToWish?.message ||
            "Added to wishlist"
        );
      }
    } catch (error) {
      console.error(
        "Wishlist error:",
        error
      );

      showError(
        error?.message ||
          "Wishlist operation failed"
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
            onClick={() =>
              navigate("/products")
            }
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
                  src={getImageUrl(
                    mainImage
                  )}
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
                    (
                      image,
                      index
                    ) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() =>
                          setSelectedImage(
                            index
                          )
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
                          src={getImageUrl(
                            image
                          )}
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

                <Rating
                  average={
                    currentProduct
                      .rating
                      ?.average || 0
                  }
                />

                <span className="text-gray-500 text-sm">
                  {currentProduct.rating
                    ?.count || 0}
                </span>

                <span className="text-gray-300">
                  |
                </span>

                <span className="text-gray-500 text-sm">
                  {currentProduct.rating
                    ?.count || 0}{" "}
                  Reviews
                </span>

              </div>

              <div className="border-t border-gray-100 my-6" />

              {/* =================================================
                  VARIANTS
                  
                  THIS IS THE ONLY NEW UI SECTION.
                  
                  Design remains same style as your page.
                  
                  It ONLY appears when:
                    currentProduct.hasVariants === true
              ================================================= */}

              {hasVariantSelection && (
                <div className="space-y-5 mb-6">

                  {variantGroups.map(
                    ([
                      attributeName,
                      values,
                    ]) => (
                      <div
                        key={
                          attributeName
                        }
                      >

                        <p className="font-semibold text-gray-800 mb-3">
                          {attributeName}
                        </p>

                        <div className="flex flex-wrap gap-3">

                          {values.map(
                            (value) => {
                              const isSelected =
                                selectedAttributes[
                                  attributeName
                                ] ===
                                value;

                              return (
                                <button
                                  key={
                                    value
                                  }
                                  type="button"
                                  onClick={() =>
                                    handleAttributeChange(
                                      attributeName,
                                      value
                                    )
                                  }
                                  className={`
                                    min-w-[55px]
                                    rounded-lg
                                    border
                                    px-4
                                    py-2
                                    text-sm
                                    font-semibold
                                    transition-all
                                    ${
                                      isSelected
                                        ? "border-gray-900 bg-gray-900 text-white"
                                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-900"
                                    }
                                  `}
                                >
                                  {
                                    value
                                  }
                                </button>
                              );
                            }
                          )}

                        </div>

                      </div>
                    )
                  )}

                  {/* Invalid combination message */}

                  {variantSelectionRequired && (
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                      Please select a valid variant before adding this product to your cart.
                    </div>
                  )}

                  {/* Selected SKU */}

                  {selectedVariant?.sku && (
                    <p className="text-xs text-gray-400">
                      SKU:{" "}
                      {selectedVariant.sku}
                    </p>
                  )}

                </div>
              )}

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

                {inStock > 10 ? (
                  <span className="text-green-600 font-semibold">
                    In Stock
                  </span>
                ) : (
                  <span className="text-green-600 font-semibold">
                    only {inStock} left
                  </span>
                )}

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
                      setQuantity(
                        (value) =>
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
                    disabled={
                      quantity >=
                      inStock
                    }
                    onClick={() =>
                      setQuantity(
                        (value) =>
                          Math.min(
                            value + 1,
                            inStock
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
                      disabled:opacity-40
                      disabled:cursor-not-allowed
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
                  onClick={
                    handleCartClick
                  }
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
                  onClick={
                    handleBuyNow
                  }
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
                title:
                  "Premium Quality",
                description:
                  "Made using high-quality materials",
              },
              {
                title:
                  "Modern Design",
                description:
                  "Stylish and comfortable design",
              },
              {
                title:
                  "Easy to Use",
                description:
                  "Simple and convenient experience",
              },
              {
                title:
                  "Long Lasting",
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

        <AddonProducts
          currentProduct={currentProduct}
          products={product}
        />

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

          <div>

            <h2 className="text-2xl font-bold text-gray-900">
              Customer Reviews
            </h2>

            <div className="flex items-center gap-3 mt-3">

              <span className="text-4xl font-bold">
                {Number(
                  currentProduct.rating
                    ?.average || 0
                ).toFixed(1)}
              </span>

              <div>

                <div className="flex text-yellow-400 gap-1">

                  {[1, 2, 3, 4, 5].map(
                    (star) => {
                      const average =
                        Number(
                          currentProduct
                            .rating
                            ?.average
                        ) || 0;

                      if (
                        average >=
                        star
                      ) {
                        return (
                          <FaStar
                            key={star}
                          />
                        );
                      }

                      if (
                        average >=
                        star - 0.5
                      ) {
                        return (
                          <FaStarHalfAlt
                            key={star}
                          />
                        );
                      }

                      return (
                        <FaStar
                          key={star}
                          className="text-gray-300"
                        />
                      );
                    }
                  )}

                </div>

                <p className="text-sm text-gray-500 mt-1">
                  Based on{" "}
                  {currentProduct
                    .rating?.count ||
                    0}{" "}
                  {Number(
                    currentProduct
                      .rating?.count ||
                      0
                  ) === 1
                    ? "review"
                    : "reviews"}
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              REVIEW LIST
          ================================================= */}

          <div className="mt-8 border-t border-gray-100 pt-6">

            {reviewsLoading ? (

              <div className="space-y-5">

                {[1, 2, 3].map(
                  (item) => (
                    <div
                      key={item}
                      className="animate-pulse"
                    >

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-gray-200" />

                        <div className="space-y-2">

                          <div className="w-28 h-3 bg-gray-200 rounded" />

                          <div className="w-20 h-3 bg-gray-100 rounded" />

                        </div>

                      </div>

                      <div className="w-full h-3 bg-gray-100 rounded mt-4" />

                      <div className="w-3/4 h-3 bg-gray-100 rounded mt-2" />

                    </div>
                  )
                )}

              </div>

            ) : reviewsError ? (

              <div className="text-center py-8">

                <p className="text-sm text-red-500">
                  {reviewsError}
                </p>

              </div>

            ) : reviews.length ===
              0 ? (

              <div className="text-center py-10">

                <div className="text-4xl mb-3">
                  ⭐
                </div>

                <h3 className="text-lg font-semibold text-gray-800">
                  No reviews yet
                </h3>

              </div>

            ) : (

              <div className="space-y-6">

                {reviews.map(
                  (
                    review,
                    index
                  ) => {

                    const reviewRating =
                      Number(
                        review?.rating ||
                          0
                      );

                    const reviewer =
                      review?.user
                        ?.firstName ||
                      review?.user?.name ||
                      review?.customer
                        ?.firstName ||
                      review?.customer
                        ?.name ||
                      review?.user
                        ?.email ||
                      "Customer";

                    const reviewDescription =
                      review?.description ||
                      review?.review ||
                      review?.comment ||
                      "";

                    const reviewDate =
                      review?.createdAt
                        ? new Date(
                            review.createdAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "";

                    return (
                      <div
                        key={
                          review?._id ||
                          review?.id ||
                          index
                        }
                        className="
                          pb-6
                          border-b
                          border-gray-100
                          last:border-b-0
                          last:pb-0
                        "
                      >

                        {/* REVIEWER */}

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex items-center gap-3">

                            <div
                              className="
                                w-10
                                h-10
                                rounded-full
                                bg-blue-100
                                text-blue-600
                                flex
                                items-center
                                justify-center
                                font-bold
                                uppercase
                              "
                            >
                              {reviewer.charAt(
                                0
                              )}
                            </div>

                            <div>

                              <p className="font-semibold text-gray-900">
                                {reviewer}
                              </p>

                              {reviewDate && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {reviewDate}
                                </p>
                              )}

                            </div>

                          </div>

                          {/* RATING */}

                          <div
                            className="
                              flex
                              items-center
                              gap-1
                              bg-green-50
                              text-green-600
                              px-2.5
                              py-1
                              rounded-lg
                              text-xs
                              font-bold
                              shrink-0
                            "
                          >

                            {reviewRating.toFixed(
                              1
                            )}

                            <FaStar className="text-[10px]" />

                          </div>

                        </div>

                        {/* STARS */}

                        <div className="flex items-center gap-1 mt-3">

                          {[1, 2, 3, 4, 5].map(
                            (star) => (
                              <FaStar
                                key={star}
                                className={
                                  star <=
                                  reviewRating
                                    ? "text-yellow-400 text-sm"
                                    : "text-gray-200 text-sm"
                                }
                              />
                            )
                          )}

                        </div>

                        {/* DESCRIPTION */}

                        {reviewDescription && (
                          <p className="text-sm text-gray-600 leading-6 mt-3">
                            {
                              reviewDescription
                            }
                          </p>
                        )}

                        {/* REVIEW IMAGES */}

                        {Array.isArray(
                          review?.images
                        ) &&
                          review.images
                            .length >
                            0 && (
                            <div className="flex flex-wrap gap-3 mt-4">

                              {review.images.map(
                                (
                                  image,
                                  imageIndex
                                ) => (
                                  <img
                                    key={`${image}-${imageIndex}`}
                                    src={getImageUrl(
                                      image
                                    )}
                                    alt={`Review ${
                                      imageIndex +
                                      1
                                    }`}
                                    className="
                                      w-20
                                      h-20
                                      rounded-xl
                                      object-cover
                                      border
                                      border-gray-200
                                    "
                                  />
                                )
                              )}

                            </div>
                          )}

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          {reviewsPagination?.totalPages >
            1 && (
            <div className="flex items-center justify-center gap-2 mt-8">

              <button
                type="button"
                disabled={
                  reviewsPage ===
                  1
                }
                onClick={() =>
                  setReviewsPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
                className="
                  px-4
                  py-2
                  rounded-lg
                  border
                  border-gray-200
                  text-sm
                  font-medium
                  text-gray-700
                  hover:bg-gray-50
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
              >
                Previous
              </button>

              <span className="text-sm text-gray-500 px-2">
                Page{" "}
                {reviewsPage}{" "}
                of{" "}
                {
                  reviewsPagination.totalPages
                }
              </span>

              <button
                type="button"
                disabled={
                  reviewsPage >=
                  reviewsPagination.totalPages
                }
                onClick={() =>
                  setReviewsPage(
                    (page) =>
                      Math.min(
                        reviewsPagination.totalPages,
                        page + 1
                      )
                  )
                }
                className="
                  px-4
                  py-2
                  rounded-lg
                  border
                  border-gray-200
                  text-sm
                  font-medium
                  text-gray-700
                  hover:bg-gray-50
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
              >
                Next
              </button>

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default ProductDetails;
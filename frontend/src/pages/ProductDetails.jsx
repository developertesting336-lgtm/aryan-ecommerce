import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ShareProductButton from "../components/ShareProductButton";
import {
  useSearchParams,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { trackReferralClickApi } from "../api/referralApi";
import { saveProductRef } from "../utils/referral";
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
import { ChevronLeft, ChevronRight } from "lucide-react";

import AddonProducts from "../components/products/AddonProducts";
import { useDispatch, useSelector } from "react-redux";
import PageButtons from "../components/PageButtons";
import { extractIdFromSlug } from "../utils/productSlug";

import {
  getProducts,
  getProductById,
  getRelatedProducts,
} from "../redux/slices/productSlice";
import { addProduct, addToGuestCart } from "../redux/slices/cartSlice";
import {
  addProductInWish,
  deleteProducts,
} from "../redux/slices/wishlistSlice";
import ProductCard from "../components/products/ProductCard";
import { getProductReviews } from "../redux/slices/reviewsSlice";
import { showSuccess, showError } from "../utils/toast";

const API_URL = "http://localhost:3000";

/* =========================================================
   IMAGE HELPERS
========================================================= */

const getImageUrl = (image) => {
  if (!image) return "/wmpj6_512.avif";

  if (
    typeof image === "string" &&
    (image.startsWith("http://") || image.startsWith("https://"))
  ) {
    return image;
  }

  return `${API_URL}/uploads/${image}`;
};

const getProductImages = (images) => {
  if (Array.isArray(images) && images.filter(Boolean).length > 0) {
    return images.filter(Boolean);
  }
  if (images && !Array.isArray(images)) return [images];
  return ["/wmpj6_512.avif"];
};

/* =========================================================
   PRICE HELPER
========================================================= */

const getPricing = (product) => {
  const currentPrice = Number(product?.price || 0);

  let originalPrice = Number(product?.originalPrice || product?.mrp || 0);
  let discount = Number(product?.discount || 0);

  if (!originalPrice && currentPrice > 0) {
    originalPrice = Math.round(currentPrice * 1.2);
  }

  if (!discount && originalPrice > currentPrice && currentPrice > 0) {
    discount = Math.round(
      ((originalPrice - currentPrice) / originalPrice) * 100
    );
  }

  return { currentPrice, originalPrice, discount };
};

/* =========================================================
   REFERRAL CAPTURE
========================================================= */

function useCaptureReferral(productId) {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("ref");

  useEffect(() => {
    if (!code || !productId) return;

    saveProductRef(productId, code);

    // count the click once per browser session
    const key = `ref_clicked_${code}`;

    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      trackReferralClickApi(code).catch(() => {});
    }
  }, [code, productId]);
}


/* =========================================================
   LOADING / ERROR / NOT FOUND
========================================================= */

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Loading product...
        </p>
      </div>
    </div>
  );
}

function ErrorState({ error, onBack }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Something went wrong
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
          {typeof error === "string" ? error : "Unable to load product."}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

function ProductNotFound({ onBack }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🛍️</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Product Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
          The product you're looking for doesn't exist.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
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
    <div className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold w-fit">
      {Number(average || 0).toFixed(1)}
      <FaStar className="text-xs" />
    </div>
  );
}

/* =========================================================
   BENEFIT
========================================================= */

function Benefit({ icon, color, title, description }) {
  return (
    <div className="flex gap-3 items-start">
      <div
        className={`w-10 h-10 ${color} rounded-full flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
          {title}
        </p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
}

/* =========================================================
   VARIANT HELPERS
========================================================= */

const norm = (value) => String(value ?? "").trim().toLowerCase();

const doesVariantMatchSelection = (variant, selection) => {
  if (!variant || !Array.isArray(variant.attributes)) return false;

  return Object.entries(selection).every(([attributeName, selectedValue]) =>
    variant.attributes.some(
      (attribute) =>
        norm(attribute?.name) === norm(attributeName) &&
        norm(attribute?.value) === norm(selectedValue)
    )
  );
};

const getVariantId = (variant) => {
  if (!variant) return null;
  if (typeof variant === "string") return variant;
  if (typeof variant === "number") return String(variant);
  if (typeof variant === "object") {
    const variantId = variant?._id || variant?.id;
    return variantId ? String(variantId) : null;
  }
  return null;
};

/* =========================================================
   PRODUCT DETAILS
========================================================= */

function ProductDetails() {
  const { id: slugOrId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const stateProductId = location?.state?.productId || location?.state?.id;
  const candidateIdFromSlug = extractIdFromSlug(slugOrId);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [reviewsPage, setReviewsPage] = useState(1);

  /* ---------------- REDUX ---------------- */

  const {
    reviews = [],
    pagination: reviewsPagination,
    loading: reviewsLoading,
    error: reviewsError,
  } = useSelector((state) => state.review);

  const { user, token } = useSelector((state) => state.auth);
  const isLoggedIn = !!token || !!user;

  const {
    product = [],
    selectedProduct,
    selectedLoading,
    selectedError,
    relatedProducts: relatedFromStore = [],
    loading,
    error,
  } = useSelector((state) => state.product);

  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);

  /* =======================================================
     FIND CURRENT PRODUCT
     1) look in the already-loaded list
     2) otherwise use the product fetched by id/slug
  ======================================================= */

  const possibleIds = useMemo(
    () =>
      [slugOrId, stateProductId, candidateIdFromSlug]
        .filter(Boolean)
        .map(String),
    [slugOrId, stateProductId, candidateIdFromSlug]
  );

  // The id we ask the backend for when the product isn't in the list
  const productIdToFetch = stateProductId || candidateIdFromSlug || slugOrId;

  const listProduct = useMemo(() => {
    if (!Array.isArray(product) || product.length === 0) return null;

    return (
      product.find((item) => possibleIds.includes(String(item?._id))) ||
      product.find(
        (item) =>
          item?.slug &&
          String(item.slug).toLowerCase() === String(slugOrId).toLowerCase()
      ) ||
      null
    );
  }, [product, possibleIds, slugOrId]);

  const currentProduct = useMemo(() => {
    if (listProduct) return listProduct;

    if (selectedProduct) {
      const matches =
        possibleIds.includes(String(selectedProduct._id)) ||
        (selectedProduct.slug &&
          String(selectedProduct.slug).toLowerCase() ===
            String(slugOrId).toLowerCase());

      if (matches) return selectedProduct;
    }

    return null;
  }, [listProduct, selectedProduct, possibleIds, slugOrId]);

  const resolvedProductId =
    currentProduct?._id || stateProductId || candidateIdFromSlug || slugOrId;

    useEffect(() => {
  if (!Array.isArray(product) || product.length === 0) {
    dispatch(getProducts());
  }
}, [dispatch, product.length]);

  /* =======================================================
     FETCH PRODUCT BY ID IF NOT IN LIST
  ======================================================= */

  useEffect(() => {
    if (listProduct || !productIdToFetch) return;

    // already fetched this product
    if (
      selectedProduct &&
      (possibleIds.includes(String(selectedProduct._id)) ||
        String(selectedProduct.slug || "").toLowerCase() ===
          String(slugOrId).toLowerCase())
    ) {
      return;
    }

    dispatch(getProductById(productIdToFetch));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, productIdToFetch, listProduct]);

  // Save ?ref=CODE for this product when a friend opens a shared link
  useCaptureReferral(currentProduct?._id);

  /* =======================================================
     ACTIVE VARIANTS (only when hasVariants === true)
  ======================================================= */

  const activeVariants = useMemo(() => {
    if (currentProduct?.hasVariants !== true) return [];
    if (!Array.isArray(currentProduct?.variants)) return [];

    return currentProduct.variants.filter(
      (variant) =>
        variant &&
        variant.isActive !== false &&
        Array.isArray(variant.attributes) &&
        variant.attributes.length > 0
    );
  }, [currentProduct]);

  const variantGroups = useMemo(() => {
    if (!activeVariants.length) return [];

    const groups = {};

    activeVariants.forEach((variant) => {
      variant.attributes.forEach((attribute) => {
        const name =
          typeof attribute?.name === "string" ? attribute.name.trim() : "";
        const value =
          typeof attribute?.value === "string" ? attribute.value.trim() : "";

        if (!name || !value) return;

        if (!groups[name]) groups[name] = [];
        if (!groups[name].includes(value)) groups[name].push(value);
      });
    });

    return Object.entries(groups);
  }, [activeVariants]);

  const hasVariantSelection =
    currentProduct?.hasVariants === true &&
    activeVariants.length > 0 &&
    variantGroups.length > 0;

  /* Initial selection = first complete valid variant */

  useEffect(() => {
    if (currentProduct?.hasVariants !== true || !activeVariants.length) {
      setSelectedAttributes({});
      return;
    }

    const firstVariant = activeVariants[0];
    const initialSelection = {};

    firstVariant?.attributes?.forEach((attribute) => {
      const name =
        typeof attribute?.name === "string" ? attribute.name.trim() : "";
      const value =
        typeof attribute?.value === "string" ? attribute.value.trim() : "";

      if (name && value) initialSelection[name] = value;
    });

    setSelectedAttributes(initialSelection);
    setQuantity(1);
  }, [currentProduct?._id, currentProduct?.hasVariants, activeVariants]);

  const selectedVariant = useMemo(() => {
    if (currentProduct?.hasVariants !== true) return null;
    if (!activeVariants.length) return null;
    if (!Object.keys(selectedAttributes).length) return null;

    return (
      activeVariants.find((variant) =>
        doesVariantMatchSelection(variant, selectedAttributes)
      ) || null
    );
  }, [currentProduct?.hasVariants, activeVariants, selectedAttributes]);

  const handleAttributeChange = (attributeName, value) => {
    setSelectedAttributes((previous) => ({
      ...previous,
      [attributeName]: value,
    }));
    setQuantity(1);
  };

  const variantSelectionRequired = hasVariantSelection && !selectedVariant;

  /* =======================================================
     PRICE + STOCK (variant values when a variant is chosen)
  ======================================================= */

  const pricingSource =
    currentProduct?.hasVariants === true && selectedVariant
      ? selectedVariant
      : currentProduct;

  const { currentPrice, originalPrice, discount } = useMemo(
    () => getPricing(pricingSource),
    [pricingSource]
  );

  const inStock = useMemo(() => {
    const stock = Number(pricingSource?.stock ?? currentProduct?.stock ?? 0);
    if (!Number.isFinite(stock)) return 0;
    return Math.max(0, stock);
  }, [pricingSource, currentProduct]);

  useEffect(() => {
    setQuantity((previous) => {
      if (inStock <= 0) return 1;
      return Math.min(previous, inStock);
    });
  }, [inStock]);

  /* =======================================================
     REVIEWS
  ======================================================= */

  useEffect(() => {
    if (currentProduct?._id) {
      dispatch(
        getProductReviews({
          productId: currentProduct._id,
          page: reviewsPage,
          limit: 10,
        })
      );
    }
  }, [dispatch, currentProduct?._id, reviewsPage]);

  /* =======================================================
     CART / WISHLIST CHECKS
  ======================================================= */

  const isInCart = useMemo(
    () =>
      cart?.items?.some((item) => {
        const cartProductId =
          item?.productId?._id ||
          item?.productId ||
          item?.product?._id ||
          item?._id;

        return String(cartProductId) === String(resolvedProductId);
      }) ?? false,
    [cart?.items, resolvedProductId]
  );

  const isWishlisted = useMemo(
    () =>
      wishlist?.products?.some((item) => {
        const wishlistProductId =
          item?._id ||
          item?.productId?._id ||
          item?.productId ||
          item?.product?._id;

        return String(wishlistProductId) === String(resolvedProductId);
      }) ?? false,
    [wishlist?.products, resolvedProductId]
  );

  /* =======================================================
     RELATED PRODUCTS (fetch + derive)
  ======================================================= */

  useEffect(() => {
    if (currentProduct?._id) {
      dispatch(getRelatedProducts(currentProduct._id));
    }
  }, [dispatch, currentProduct?._id]);

 const relatedProducts = useMemo(() => {
  if (!currentProduct || !Array.isArray(product)) return [];

  const currentCategoryId =
    currentProduct?.category?._id || currentProduct?.category;

  if (!currentCategoryId) return [];

  return product
    .filter(
      (item) =>
        String(item?._id) !== String(currentProduct._id) &&
        String(item?.category?._id || item?.category) ===
          String(currentCategoryId)
    )
    .slice(0, 10);
}, [product, currentProduct]);
console.log("relatedProducts",relatedProducts)
  /* =======================================================
     RESET WHEN PRODUCT CHANGES
  ======================================================= */

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setReviewsPage(1);
  }, [slugOrId]);

  /* =======================================================
     IMAGES
  ======================================================= */

  const images = useMemo(
    () => getProductImages(currentProduct?.images),
    [currentProduct]
  );

  const mainImage = images[selectedImage] || images[0];

  /* =======================================================
     RELATED CAROUSEL
  ======================================================= */

  const relatedScrollRef = useRef(null);
  const [canScrollRelatedLeft, setCanScrollRelatedLeft] = useState(false);
  const [canScrollRelatedRight, setCanScrollRelatedRight] = useState(false);

  const updateRelatedScrollButtons = useCallback(() => {
    const container = relatedScrollRef.current;
    if (!container) return;

    setCanScrollRelatedLeft(container.scrollLeft > 3);
    setCanScrollRelatedRight(
      container.scrollLeft + container.clientWidth < container.scrollWidth - 5
    );
  }, []);

  const scrollRelatedProducts = (direction) => {
    const container = relatedScrollRef.current;
    if (!container) return;

    const firstCard = container.querySelector("[data-related-card]");
    const gap = 16;

    const scrollAmount = firstCard
      ? firstCard.getBoundingClientRect().width + gap
      : container.clientWidth;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const container = relatedScrollRef.current;
    if (!container) return;

    updateRelatedScrollButtons();

    container.addEventListener("scroll", updateRelatedScrollButtons, {
      passive: true,
    });
    window.addEventListener("resize", updateRelatedScrollButtons);

    return () => {
      container.removeEventListener("scroll", updateRelatedScrollButtons);
      window.removeEventListener("resize", updateRelatedScrollButtons);
    };
  }, [relatedProducts.length, updateRelatedScrollButtons]);

  /* =======================================================
     ACTIONS
  ======================================================= */

  const requireLogin = () => {
    navigate("/login", { state: { from: `/product/${slugOrId}` } });
  };

  const validateBeforeCart = () => {
    if (
      currentProduct?.hasVariants === true &&
      hasVariantSelection &&
      !selectedVariant
    ) {
      showError("Please select a valid product variant.");
      return false;
    }

    if (inStock <= 0) {
      showError("This product is currently out of stock.");
      return false;
    }

    if (quantity > inStock) {
      showError(
        `Only ${inStock} item${inStock === 1 ? "" : "s"} available in stock.`
      );
      setQuantity(Math.max(1, inStock));
      return false;
    }

    return true;
  };

  const getCartPayload = () => {
    const payload = {
      productId: currentProduct._id,
      price: currentPrice,
      quantity,
    };

    const variantId = getVariantId(selectedVariant);

    if (currentProduct?.hasVariants === true && variantId) {
      payload.variantId = variantId;
    }

    return payload;
  };

  const addGuestItem = () => {
    dispatch(
      addToGuestCart({
        productId: resolvedProductId,
        quantity,
        name: currentProduct?.name || "Product",
        price: Number(currentPrice || currentProduct?.price || 0),
        image: currentProduct?.images?.[0] || "",
        slug: currentProduct?.slug || slugOrId || "",
      })
    );
  };

  const handleCartClick = async (e) => {
    if (e) {
      e.preventDefault?.();
      e.stopPropagation?.();
    }

    if (!validateBeforeCart()) return;

    if (isInCart) {
      navigate("/cart");
      return;
    }

    if (!isLoggedIn) {
      addGuestItem();
      showSuccess("Product added to cart");
      return;
    }

    try {
      const addtocart = await dispatch(addProduct(getCartPayload())).unwrap();
      showSuccess(addtocart?.message || "Product added to cart");
    } catch (err) {
      console.error("Failed to add product to cart:", err);
      showError(err?.message || "Failed to add product to cart");
    }
  };

  const handleBuyNow = async (e) => {
    if (e) {
      e.preventDefault?.();
      e.stopPropagation?.();
    }

    if (!validateBeforeCart()) return;

    if (!isLoggedIn) {
      addGuestItem();
      requireLogin();
      return;
    }

    if (isInCart) {
      navigate("/cart");
      return;
    }

    try {
      await dispatch(addProduct(getCartPayload())).unwrap();
      navigate("/cart");
    } catch (err) {
      console.error("Buy now failed:", err);
      showError(err?.message || "Unable to process Buy Now");
    }
  };

  const handleWishlist = async () => {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }

    if (!currentProduct?._id) return;

    try {
      if (isWishlisted) {
        const res = await dispatch(deleteProducts(currentProduct._id)).unwrap();
        showSuccess(res?.message || "Removed from wishlist");
      } else {
        const res = await dispatch(
          addProductInWish(currentProduct._id)
        ).unwrap();
        showSuccess(res?.message || "Added to wishlist");
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      showError(err?.message || "Wishlist operation failed");
    }
  };

  /* =======================================================
     EARLY RETURNS (all hooks are above this line)
  ======================================================= */

  if (!currentProduct && (loading || selectedLoading)) {
    return <LoadingState />;
  }

  if (!currentProduct && (selectedError || error)) {
    return (
      <ErrorState
        error={selectedError || error}
        onBack={() => navigate("/")}
      />
    );
  }

  if (!currentProduct) {
    // Nothing found yet and no request in flight: show loader for the first
    // render before the fetch effect fires, otherwise "not found".
    if (!selectedProduct && !selectedError && productIdToFetch) {
      return <LoadingState />;
    }
    return <ProductNotFound onBack={() => navigate("/")} />;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 dark:text-gray-100">
      {/* BREADCRUMB */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 overflow-hidden">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="hover:text-blue-600 transition flex-shrink-0"
          >
            Home
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="hover:text-blue-600 transition flex-shrink-0"
          >
            Products
          </button>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium truncate">
            {currentProduct.name}
          </span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* PRODUCT SECTION */}
        <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-5 md:p-8">
            {/* IMAGES */}
            <div>
              <div className="relative h-[400px] md:h-[520px] bg-white border border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-center overflow-hidden">
                {discount > 0 && (
                  <span className="absolute top-5 left-5 z-10 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                    {discount}% OFF
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleWishlist}
                  className="absolute top-5 right-5 z-10 w-11 h-11 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-105 transition cursor-pointer"
                  aria-label="Wishlist"
                >
                  <FaHeart
                    className={isWishlisted ? "text-red-500" : "text-gray-500"}
                  />
                </button>

                <img
                  src={getImageUrl(mainImage)}
                  alt={currentProduct.name || "Product"}
                  className="w-full h-full object-contain p-8 hover:scale-105 transition-transform duration-500"
                />
              </div>

              {images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 bg-white transition ${
                        selectedImage === index
                          ? "border-blue-600"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${currentProduct.name} ${index + 1}`}
                        className="w-full h-full object-contain p-2"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* INFORMATION */}
            <div className="flex flex-col">
              <span className="text-sm text-blue-600 font-semibold uppercase tracking-wide mb-2">
                Premium Collection
              </span>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {currentProduct.name}
              </h1>

              {/* VENDOR */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm text-gray-500">Sold by</span>
                <button
                  type="button"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {currentProduct.vendor?.firstName ||
                    currentProduct.vendor?.name ||
                    "Unknown Vendor"}
                </button>
                <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md font-medium">
                  Verified Seller
                </span>
              </div>

              {/* RATING */}
              <div className="flex items-center gap-3 mt-4">
                <Rating average={currentProduct.rating?.average || 0} />
                <span className="text-gray-500 text-sm">
                  {currentProduct.rating?.count || 0} Reviews
                </span>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 my-6" />

              {/* VARIANTS */}
              {hasVariantSelection && (
                <div className="space-y-5 mb-6">
                  {variantGroups.map(([attributeName, values]) => (
                    <div key={attributeName}>
                      <p className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
                        {attributeName}
                      </p>

                      <div className="flex flex-wrap gap-3">
                        {values.map((value) => {
                          const isSelected =
                            selectedAttributes[attributeName] === value;

                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                handleAttributeChange(attributeName, value)
                              }
                              className={`min-w-[55px] rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
                                isSelected
                                  ? "border-gray-900 bg-gray-900 dark:border-blue-500 dark:bg-blue-600 text-white"
                                  : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-gray-900 dark:hover:border-gray-500"
                              }`}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {variantSelectionRequired && (
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                      Please select a valid variant before adding this product
                      to your cart.
                    </div>
                  )}

                  {selectedVariant?.sku && (
                    <p className="text-xs text-gray-400">
                      SKU: {selectedVariant.sku}
                    </p>
                  )}
                </div>
              )}

              {/* PRICE */}
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    ₹{currentPrice.toLocaleString("en-IN")}
                  </span>

                  {originalPrice > currentPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      ₹{originalPrice.toLocaleString("en-IN")}
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

              {/* STOCK */}
              <div className="mt-6 flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    inStock > 0 ? "bg-green-500" : "bg-red-500"
                  }`}
                />

                {inStock > 10 ? (
                  <span className="text-green-600 font-semibold">In Stock</span>
                ) : inStock > 0 ? (
                  <span className="text-green-600 font-semibold">
                    Only {inStock} left
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">
                    Out of Stock
                  </span>
                )}

                {inStock > 0 && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 text-sm">Ready to ship</span>
                  </>
                )}
              </div>

              {/* QUANTITY */}
              <div className="mt-6">
                <p className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Quantity
                </p>

                <div className="inline-flex items-center border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) => Math.max(1, value - 1))
                    }
                    className="w-11 h-11 text-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    −
                  </button>

                  <span className="w-12 text-center font-semibold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    disabled={quantity >= inStock}
                    onClick={() =>
                      setQuantity((value) => Math.min(value + 1, inStock))
                    }
                    className="w-11 h-11 text-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7">
                <button
                  type="button"
                  onClick={handleCartClick}
                  className="flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition shadow-sm cursor-pointer"
                >
                  <FaShoppingCart />
                  {isInCart ? "Go To Cart" : "Add to Cart"}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-sm cursor-pointer"
                >
                  <FaBolt />
                  Buy Now
                </button>
              </div>

              <div className="mt-6">
                <ShareProductButton product={currentProduct} />
              </div>

              {/* BENEFITS */}
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

        {/* RELATED PRODUCTS — CAROUSEL */}
        {relatedProducts.length > 0 && (
          <section className="mx-auto mt-8 w-full max-w-7xl px-3 py-7 min-[375px]:px-4 sm:mt-10 sm:px-6 sm:py-10 lg:px-8">
            <div className="mb-5 flex items-end justify-between gap-3 sm:mb-8 sm:gap-4">
              <div className="min-w-0">
                <p className="mb-1 text-xs font-semibold text-blue-600 min-[375px]:text-sm">
                  You May Also Like
                </p>
                <h2 className="text-lg font-bold leading-tight text-gray-900 dark:text-white min-[375px]:text-xl sm:text-2xl lg:text-3xl">
                  Related Products
                </h2>
                <p className="mt-1 hidden text-sm text-gray-500 dark:text-gray-400 sm:block">
                  Discover more products you might love
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => scrollRelatedProducts("left")}
                  disabled={!canScrollRelatedLeft}
                  aria-label="Previous related product"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 sm:h-9 sm:w-9"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => scrollRelatedProducts("right")}
                  disabled={!canScrollRelatedRight}
                  aria-label="Next related product"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 sm:h-9 sm:w-9"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div
              ref={relatedScrollRef}
              className="flex w-full gap-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory md:snap-none py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {relatedProducts.map((item, index) => (
                <div
                  key={item._id || item.id || item.slug || `related-${index}`}
                  data-related-card
                  className="min-w-0 w-full shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]"
                >
                  <ProductCard
                    {...item}
                    rating={item?.rating?.average ?? item?.rating}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-center sm:mt-7">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 sm:text-sm"
              >
                Explore All Products
              </button>
            </div>
          </section>
        )}

        {/* DESCRIPTION */}
        <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm mt-10 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Product Description
          </h2>

          <div className="w-16 h-1 bg-blue-600 rounded-full mt-3 mb-6" />

          <p className="text-gray-600 dark:text-gray-300 leading-7 whitespace-pre-line">
            {currentProduct.description ||
              "Experience premium quality and excellent performance with this product. Designed with modern features and high-quality materials, this product is perfect for everyday use."}
          </p>
        </section>

        {/* HIGHLIGHTS */}
        <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm mt-6 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Product Highlights
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: "Premium Quality",
                description: "Made using high-quality materials",
              },
              {
                title: "Modern Design",
                description: "Stylish and comfortable design",
              },
              {
                title: "Easy to Use",
                description: "Simple and convenient experience",
              },
              {
                title: "Long Lasting",
                description: "Built for reliable everyday use",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700"
              >
                <div className="w-2 h-2 bg-blue-600 rounded-full mb-3" />
                <h3 className="font-bold text-gray-800 dark:text-gray-100">
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

        {/* REVIEWS */}
        <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm mt-6 p-6 md:p-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Customer Reviews
            </h2>

            <div className="flex items-center gap-3 mt-3">
              <span className="text-4xl font-bold">
                {Number(currentProduct.rating?.average || 0).toFixed(1)}
              </span>

              <div>
                <div className="flex text-yellow-400 gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const average = Number(currentProduct.rating?.average) || 0;

                    if (average >= star) return <FaStar key={star} />;
                    if (average >= star - 0.5)
                      return <FaStarHalfAlt key={star} />;

                    return <FaStar key={star} className="text-gray-300" />;
                  })}
                </div>

                <p className="text-sm text-gray-500 mt-1">
                  Based on {currentProduct.rating?.count || 0}{" "}
                  {Number(currentProduct.rating?.count || 0) === 1
                    ? "review"
                    : "reviews"}
                </p>
              </div>
            </div>
          </div>

          {/* REVIEW LIST */}
          <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
            {reviewsLoading ? (
              <div className="space-y-5">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="animate-pulse">
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
                ))}
              </div>
            ) : reviewsError ? (
              <div className="text-center py-8">
                <p className="text-sm text-red-500">
                  {typeof reviewsError === "string"
                    ? reviewsError
                    : "Failed to load reviews."}
                </p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">⭐</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  No reviews yet
                </h3>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review, index) => {
                  const reviewRating = Number(review?.rating || 0);

                  const reviewer =
                    review?.user?.firstName ||
                    review?.user?.name ||
                    review?.customer?.firstName ||
                    review?.customer?.name ||
                    review?.user?.email ||
                    "Customer";

                  const reviewDescription =
                    review?.description ||
                    review?.review ||
                    review?.comment ||
                    "";

                  const reviewDate = review?.createdAt
                    ? new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "";

                  return (
                    <div
                      key={review?._id || review?.id || index}
                      className="pb-6 border-b border-gray-100 dark:border-gray-800 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold uppercase">
                            {reviewer.charAt(0)}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {reviewer}
                            </p>
                            {reviewDate && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {reviewDate}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0">
                          {reviewRating.toFixed(1)}
                          <FaStar className="text-[10px]" />
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={
                              star <= reviewRating
                                ? "text-yellow-400 text-sm"
                                : "text-gray-200 text-sm"
                            }
                          />
                        ))}
                      </div>

                      {reviewDescription && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-6 mt-3">
                          {reviewDescription}
                        </p>
                      )}

                      {Array.isArray(review?.images) &&
                        review.images.length > 0 && (
                          <div className="flex flex-wrap gap-3 mt-4">
                            {review.images.map((image, imageIndex) => (
                              <img
                                key={`${image}-${imageIndex}`}
                                src={getImageUrl(image)}
                                alt={`Review ${imageIndex + 1}`}
                                className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                              />
                            ))}
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {reviewsPagination?.totalPages > 1 && (
            <PageButtons
              page={reviewsPage}
              totalPages={reviewsPagination.totalPages}
              onPageChange={(nextPage) => setReviewsPage(nextPage)}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default ProductDetails;
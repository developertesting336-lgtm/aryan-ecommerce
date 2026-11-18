import { renderToString } from "react-dom/server";
import { StaticRouter, matchPath } from "react-router";
import { Provider } from "react-redux";
import { createStore } from "./redux/store";
import Root from "./Root";
import { extractIdFromSlug } from "./utils/productSlug";

// Polyfill minimal storage for SSR in Node if not already stubbed
const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};
if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = memoryStorage;
}
if (typeof globalThis.sessionStorage === "undefined") {
  globalThis.sessionStorage = memoryStorage;
}

const DEFAULT_BACKEND_URL = "https://backend-one-rho-24.vercel.app/api";

function getBackendUrl() {
  const envUrl =
    (typeof process !== "undefined" && process.env?.API_URL) ||
    (typeof process !== "undefined" && process.env?.VITE_API_URL) ||
    (typeof process !== "undefined" && process.env?.VITE_BACKEND_URL) ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_BACKEND_URL);

  return (envUrl || DEFAULT_BACKEND_URL).replace(/\/$/, "");
}

// ============================================================================
// Graceful Fallback Homepage Data
// ============================================================================
const fallbackHomepageData = {
  hero: [
    {
      _id: "hero-1",
      title: "Explore Premium Electronics",
      subtitle: "Discover the latest gadgets and accessories at NovaCart.",
      buttonText: "Shop Now",
      buttonLink: "/products",
      badge: "FEATURED",
      isActive: true,
    },
  ],
  promoCards: [],
  categories: [],
  promoGrid: [],
  shopByNeed: [],
  featuredProducts: [],
};

// ============================================================================
// Server-Side Data Fetching (5-second timeout, Node native fetch)
// ============================================================================
async function fetchHomepageData() {
  const backendUrl = getBackendUrl();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const [homepageRes, rootsRes, productsRes] = await Promise.allSettled([
      fetch(`${backendUrl}/homepage`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }),
      fetch(`${backendUrl}/categories/roots`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }),
      fetch(`${backendUrl}/product?limit=8`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }),
    ]);

    let homepage = { ...fallbackHomepageData };
    let rootCategories = [];
    let products = [];

    if (homepageRes.status === "fulfilled" && homepageRes.value.ok) {
      try {
        const json = await homepageRes.value.json();
        const data = json.data || json || {};
        homepage = {
          hero: data.hero || fallbackHomepageData.hero,
          promoCards: data.promoCards || [],
          categories: data.categories || [],
          promoGrid: data.promoGrid || [],
          shopByNeed: data.shopByNeed || [],
          featuredProducts: data.featuredProducts || [],
        };
      } catch (err) {
        console.error("[SSR] Failed to parse /homepage response:", err.message);
      }
    } else if (homepageRes.status === "rejected") {
      console.error("[SSR] Failed to fetch /homepage:", homepageRes.reason?.message);
    }

    if (rootsRes.status === "fulfilled" && rootsRes.value.ok) {
      try {
        const json = await rootsRes.value.json();
        rootCategories = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
      } catch (err) {
        console.error("[SSR] Failed to parse /categories/roots response:", err.message);
      }
    }

    if (productsRes.status === "fulfilled" && productsRes.value.ok) {
      try {
        const json = await productsRes.value.json();
        products = Array.isArray(json.data?.products)
          ? json.data.products
          : Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.products)
          ? json.products
          : Array.isArray(json)
          ? json
          : [];
      } catch (err) {
        console.error("[SSR] Failed to parse /product response:", err.message);
      }
    }

    // Merge categories & featured products into homepage slice if not directly embedded
    if (!homepage.categories.length && rootCategories.length) {
      homepage.categories = rootCategories;
    }
    if (!homepage.featuredProducts.length && products.length) {
      homepage.featuredProducts = products;
    }

    return {
      homepage,
      rootCategories,
      products,
    };
  } catch (error) {
    console.error("[SSR] Unexpected error during server data fetch:", error.message);
    return {
      homepage: fallbackHomepageData,
      rootCategories: [],
      products: [],
    };
  } finally {
    clearTimeout(timer);
  }
}

// ============================================================================
// Server-Side Data Fetching — Products Page
// ============================================================================
async function fetchProductsPageData() {
  const backendUrl = getBackendUrl();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const [productsRes, categoriesRes] = await Promise.allSettled([
      fetch(`${backendUrl}/product?page=1&limit=1000`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }),
      fetch(`${backendUrl}/categories?page=1&limit=100&isActive=true`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }),
    ]);

    let products = [];
    let categories = [];

    if (productsRes.status === "fulfilled" && productsRes.value.ok) {
      try {
        const json = await productsRes.value.json();
        // API: { data: { products: [...] } }
        products = Array.isArray(json.data?.products)
          ? json.data.products
          : Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.products)
          ? json.products
          : Array.isArray(json)
          ? json
          : [];
      } catch (err) {
        console.error("[SSR /products] Failed to parse /product response:", err.message);
      }
    } else if (productsRes.status === "rejected") {
      console.error("[SSR /products] Failed to fetch /product:", productsRes.reason?.message);
    }

    if (categoriesRes.status === "fulfilled" && categoriesRes.value.ok) {
      try {
        const json = await categoriesRes.value.json();
        // API: { success: true, data: [...] }
        categories = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];
      } catch (err) {
        console.error("[SSR /products] Failed to parse /categories response:", err.message);
      }
    } else if (categoriesRes.status === "rejected") {
      console.error("[SSR /products] Failed to fetch /categories:", categoriesRes.reason?.message);
    }

    return { products, categories };
  } catch (error) {
    console.error("[SSR /products] Unexpected error:", error.message);
    return { products: [], categories: [] };
  } finally {
    clearTimeout(timer);
  }
}

// ============================================================================
// Server-Side Data Fetching — Search Page
// ============================================================================
async function fetchSearchPageData(search, page = 1) {
  if (!search || !search.trim()) {
    return { searchedproducts: [], pagination: {} };
  }

  const backendUrl = getBackendUrl();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const encodedSearch = encodeURIComponent(search.trim());
    const res = await fetch(
      `${backendUrl}/product/search?search=${encodedSearch}&page=${page}&limit=10`,
      {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }
    );

    if (!res.ok) {
      console.error(`[SSR /search] Backend returned ${res.status} for search="${search}"`);
      return { searchedproducts: [], pagination: {} };
    }

    const json = await res.json();
    // API: { data: { product: [...], pagination: {...} } }
    const searchedproducts = Array.isArray(json.data?.product)
      ? json.data.product
      : Array.isArray(json.data?.products)
      ? json.data.products
      : Array.isArray(json.data)
      ? json.data
      : [];
    const pagination = json.data?.pagination || {};

    return { searchedproducts, pagination };
  } catch (error) {
    if (error.name === "AbortError") {
      console.error(`[SSR /search] Timeout fetching search="${search}"`);
    } else {
      console.error("[SSR /search] Unexpected error:", error.message);
    }
    return { searchedproducts: [], pagination: {} };
  } finally {
    clearTimeout(timer);
  }
}

// ============================================================================
// Server-Side Data Fetching — Product Details Page
// ============================================================================
async function fetchProductDetailsData(slugOrId) {
  if (!slugOrId || !slugOrId.trim()) {
    return {
      product: null,
      relatedRelations: [],
      reviews: [],
      reviewPagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      distribution: {},
      productsList: [],
      rootCategories: [],
    };
  }

  const backendUrl = getBackendUrl();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  const candidateId = extractIdFromSlug(slugOrId);
  const primaryId = candidateId || slugOrId;

  try {
    let productRes = await fetch(`${backendUrl}/product/${encodeURIComponent(primaryId)}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!productRes.ok && primaryId !== slugOrId) {
      productRes = await fetch(`${backendUrl}/product/${encodeURIComponent(slugOrId)}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
    }

    let product = null;
    if (productRes.ok) {
      try {
        const json = await productRes.json();
        product = json.data?.product || json.data || json.product || json;
      } catch (err) {
        console.error("[SSR /product] Failed to parse product JSON:", err.message);
      }
    }

    if (!product || !product._id) {
      return {
        product: null,
        relatedRelations: [],
        reviews: [],
        reviewPagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        distribution: {},
        productsList: [],
        rootCategories: [],
      };
    }

    const realProductId = product._id;

    const [reviewsRes, relationsRes, catalogRes, rootsRes] = await Promise.allSettled([
      fetch(`${backendUrl}/reviews/product/${realProductId}?page=1&limit=10`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }),
      fetch(`${backendUrl}/productRelation/${realProductId}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }),
      fetch(`${backendUrl}/product?limit=20`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }),
      fetch(`${backendUrl}/categories/roots`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }),
    ]);

    let reviews = [];
    let reviewPagination = { page: 1, limit: 10, total: 0, totalPages: 0 };
    let distribution = {};
    if (reviewsRes.status === "fulfilled" && reviewsRes.value.ok) {
      try {
        const rJson = await reviewsRes.value.json();
        reviews = Array.isArray(rJson.data?.reviews)
          ? rJson.data.reviews
          : Array.isArray(rJson.reviews)
          ? rJson.reviews
          : [];
        distribution = rJson.data?.distribution || {};
        reviewPagination = rJson.data?.pagination || {
          page: 1,
          limit: 10,
          total: reviews.length,
          totalPages: Math.ceil(reviews.length / 10) || 1,
        };
      } catch (err) {
        console.error("[SSR /product] Failed to parse reviews:", err.message);
      }
    }

    let relatedRelations = [];
    if (relationsRes.status === "fulfilled" && relationsRes.value.ok) {
      try {
        const relJson = await relationsRes.value.json();
        relatedRelations = Array.isArray(relJson.data?.products)
          ? relJson.data.products
          : Array.isArray(relJson.products)
          ? relJson.products
          : [];
      } catch (err) {
        console.error("[SSR /product] Failed to parse relations:", err.message);
      }
    }

    let productsList = [product];
    if (catalogRes.status === "fulfilled" && catalogRes.value.ok) {
      try {
        const catJson = await catalogRes.value.json();
        const prods = Array.isArray(catJson.data?.products)
          ? catJson.data.products
          : Array.isArray(catJson.data)
          ? catJson.data
          : [];
        const map = new Map();
        map.set(String(product._id), product);
        for (const p of prods) {
          if (p && p._id && !map.has(String(p._id))) {
            map.set(String(p._id), p);
          }
        }
        productsList = Array.from(map.values());
      } catch (err) {
        console.error("[SSR /product] Failed to parse catalog products:", err.message);
      }
    }

    let rootCategories = [];
    if (rootsRes.status === "fulfilled" && rootsRes.value.ok) {
      try {
        const rootsJson = await rootsRes.value.json();
        rootCategories = Array.isArray(rootsJson.data) ? rootsJson.data : [];
      } catch (err) {
        console.error("[SSR /product] Failed to parse roots:", err.message);
      }
    }

    return {
      product,
      relatedRelations,
      reviews,
      reviewPagination,
      distribution,
      productsList,
      rootCategories,
    };
  } catch (error) {
    console.error("[SSR /product] Unexpected error fetching product details:", error.message);
    return {
      product: null,
      relatedRelations: [],
      reviews: [],
      reviewPagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      distribution: {},
      productsList: [],
      rootCategories: [],
    };
  } finally {
    clearTimeout(timer);
  }
}

// ============================================================================
// SEO Head Generator
// ============================================================================
function generateSeoHead(pathname, searchQuery, state) {
  const isHome = pathname === "/" || pathname === "";
  const isProducts = pathname === "/products";
  const isSearch = pathname === "/search";
  const productMatch = pathname.match(/^\/(?:product|products)\/([^/]+)/);
  const isProductDetails = Boolean(productMatch);

  const SITE_URL = "https://aryan-ecommerce-mu.vercel.app";
  const ogImage = `${SITE_URL}/Media.jfif`;

  let title, description, canonicalUrl;

  if (isHome) {
    title = "NovaCart | Premium Electronics & Tech Store";
    description =
      "Shop the latest laptops, smartphones, headphones, gaming gear and electronics at NovaCart. Enjoy unbeatable deals, fast delivery and secure checkout.";
    canonicalUrl = SITE_URL;
  } else if (isProducts) {
    title = "All Products | NovaCart";
    const cats = state?.category?.categories || [];
    const catNames = cats
      .slice(0, 5)
      .map((c) => c.name)
      .filter(Boolean)
      .join(", ");
    description = `Browse our full catalog${catNames ? ` including ${catNames}` : ""}. Find the best deals on electronics, fashion, and more at NovaCart.`;
    canonicalUrl = `${SITE_URL}/products`;
  } else if (isSearch) {
    const results = state?.product?.searchedproducts || [];
    title = searchQuery
      ? `Search results for "${searchQuery}" | NovaCart`
      : "Search | NovaCart";
    description = searchQuery
      ? results.length > 0
        ? `Found ${results.length}+ products for "${searchQuery}": ${results
            .slice(0, 3)
            .map((p) => p.name)
            .filter(Boolean)
            .join(", ")} and more at NovaCart.`
        : `No results found for "${searchQuery}". Browse all products at NovaCart.`
      : "Search millions of products at NovaCart — electronics, fashion, home & more.";
    canonicalUrl = searchQuery
      ? `${SITE_URL}/search?q=${encodeURIComponent(searchQuery)}`
      : `${SITE_URL}/search`;
  } else if (isProductDetails) {
    const prod = state?.product?.selectedProduct;
    if (prod) {
      title = `${prod.name || "Product"} | NovaCart`;
      const rawDesc =
        prod.description ||
        `Buy ${prod.name} at NovaCart. High quality, verified seller, best price & fast delivery.`;
      description = rawDesc
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 180);

      const rawImage = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : prod.image;
      let prodOgImage = ogImage;
      if (typeof rawImage === "string") {
        prodOgImage = rawImage.startsWith("http")
          ? rawImage
          : `${getBackendUrl().replace(/\/api\/?$/, "")}/uploads/${rawImage.replace(/^\/?uploads\//, "")}`;
      }
      canonicalUrl = `${SITE_URL}/product/${prod.slug || prod._id}`;

      const price = Number(prod.price || 0);
      const inStock = Number(prod.stock || 0) > 0;
      const ratingAvg = Number(prod.rating?.average || prod.rating || 5);
      const ratingCount = Number(prod.rating?.count || state?.review?.reviews?.length || 1);

      const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: prod.name,
        description,
        image: prodOgImage,
        sku: String(prod._id),
        offers: {
          "@type": "Offer",
          price,
          priceCurrency: "INR",
          availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: canonicalUrl,
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: ratingAvg.toFixed(1),
          reviewCount: ratingCount,
        },
      };

      return [
        `<title>${title}</title>`,
        `<meta name="description" content="${description.replace(/"/g, "&quot;")}" />`,
        `<link rel="canonical" href="${canonicalUrl}" />`,
        `<meta property="og:type" content="product" />`,
        `<meta property="og:title" content="${title.replace(/"/g, "&quot;")}" />`,
        `<meta property="og:description" content="${description.replace(/"/g, "&quot;")}" />`,
        `<meta property="og:url" content="${canonicalUrl}" />`,
        `<meta property="og:image" content="${prodOgImage}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${title.replace(/"/g, "&quot;")}" />`,
        `<meta name="twitter:description" content="${description.replace(/"/g, "&quot;")}" />`,
        `<meta name="twitter:image" content="${prodOgImage}" />`,
        `<script type="application/ld+json">${JSON.stringify(productSchema)}</script>`,
      ].join("\n    ");
    } else {
      title = "Product Details | NovaCart";
      description = "View product details, specifications and reviews at NovaCart.";
      canonicalUrl = `${SITE_URL}${pathname}`;
    }
  } else {
    title = "NovaCart Store";
    description =
      "Shop the latest laptops, smartphones, headphones, gaming gear and electronics at NovaCart.";
    canonicalUrl = `${SITE_URL}${pathname}`;
  }

  // Build JSON-LD
  const featured =
    state?.homepage?.featuredProducts ||
    state?.product?.searchedproducts ||
    state?.product?.product ||
    [];

  const itemListElements = featured.slice(0, 8).map((prod, idx) => {
    const rawImage = Array.isArray(prod.images) ? prod.images[0] : prod.image;
    let imgUrl = ogImage;
    if (typeof rawImage === "string") {
      imgUrl = rawImage.startsWith("http")
        ? rawImage
        : `https://backend-one-rho-24.vercel.app/uploads/${rawImage.replace(/^\/?uploads\//, "")}`;
    }
    return {
      "@type": "ListItem",
      position: idx + 1,
      name: prod.name || prod.title || "Product",
      url: `${SITE_URL}/product/${prod.slug || prod._id}`,
      image: imgUrl,
      offers: {
        "@type": "Offer",
        price: prod.price || 0,
        priceCurrency: "INR",
        availability:
          prod.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      },
    };
  });

  const schemaGraph = [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: "NovaCart",
      description,
      potentialAction: [
        {
          "@type": "SearchAction",
          target: `${SITE_URL}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      ],
    },
  ];

  if (itemListElements.length > 0) {
    const listName = isSearch
      ? `Search results for "${searchQuery}"`
      : isProducts
      ? "All Products"
      : "Featured Products";
    schemaGraph.push({
      "@type": "ItemList",
      name: listName,
      itemListElement: itemListElements,
    });
  }

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": schemaGraph,
  });

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description.replace(/"/g, "&quot;")}" />`,
    `<link rel="canonical" href="${canonicalUrl}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description.replace(/"/g, "&quot;")}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description.replace(/"/g, "&quot;")}" />`,
    `<meta name="twitter:image" content="${ogImage}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].join("\n    ");
}

// ============================================================================
// Main SSR Render Function
// ============================================================================
export async function render(url) {
  const parsedUrl = new URL(url, "http://localhost");
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;
  const searchQuery = searchParams.get("q") || searchParams.get("search") || "";
  const rawPageParam = parseInt(searchParams.get("page"), 10);
  const pageQuery = Number.isInteger(rawPageParam) && rawPageParam > 0 ? rawPageParam : 1;

  const isHome = pathname === "/" || pathname === "";
  const isProducts = pathname === "/products";
  const isSearch = pathname === "/search";
  const productMatch = pathname.match(/^\/(?:product|products)\/([^/]+)/);
  const isProductDetails = Boolean(productMatch);
  const productSlugOrId = productMatch ? decodeURIComponent(productMatch[1]) : null;

  let initialHomepage = fallbackHomepageData;
  let initialRootCategories = [];
  let initialProducts = [];
  let initialCategories = [];
  let initialSearchedProducts = [];
  let initialSelectedProduct = null;
  let initialRelatedRelations = [];
  let initialReviews = [];
  let initialReviewsPagination = { page: 1, limit: 10, total: 0, totalPages: 0 };
  let initialDistribution = {};
  let initialPagination = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  if (isHome) {
    const homeData = await fetchHomepageData();
    initialHomepage = homeData.homepage;
    initialRootCategories = homeData.rootCategories;
    initialProducts = [];
    initialCategories = homeData.rootCategories;
    initialPagination = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    };
  } else if (isProducts) {
    const productsData = await fetchProductsPageData();
    initialProducts = productsData.products;
    initialCategories = productsData.categories;
    initialRootCategories = productsData.categories.filter((c) => !c.parent && !c.parentId);
    initialPagination = {
      page: 1,
      limit: 1000,
      total: productsData.products.length,
      totalPages: 1,
    };
  } else if (isSearch) {
    const searchData = await fetchSearchPageData(searchQuery, pageQuery);
    initialSearchedProducts = searchData.searchedproducts;
    initialPagination = searchData.pagination?.total
      ? searchData.pagination
      : {
          page: pageQuery,
          limit: 10,
          total: initialSearchedProducts.length,
          totalPages: Math.ceil(initialSearchedProducts.length / 10) || 1,
        };
  } else if (isProductDetails) {
    const detailsData = await fetchProductDetailsData(productSlugOrId);
    initialSelectedProduct = detailsData.product;
    initialRelatedRelations = detailsData.relatedRelations;
    initialReviews = detailsData.reviews;
    initialReviewsPagination = detailsData.reviewPagination;
    initialDistribution = detailsData.distribution;
    initialProducts = detailsData.productsList;
    initialRootCategories = detailsData.rootCategories;
    initialCategories = detailsData.rootCategories;
    initialPagination = {
      page: 1,
      limit: 20,
      total: initialProducts.length,
      totalPages: 1,
    };
  }

  // Fresh Redux store per request
  const store = createStore({
    homepage: {
      ...initialHomepage,
      loading: false,
      error: null,
    },
    category: {
      categories: initialCategories,
      rootCategories: initialRootCategories,
      children: {},
      stats: {},
      selectedCategory: null,
      pagination: {
        total: initialCategories.length,
        page: 1,
        limit: 100,
        totalPages: 1,
      },
      loading: false,
      createLoading: false,
      updateLoading: false,
      deleteLoading: false,
      error: null,
      success: false,
      message: null,
    },
    review: {
      reviews: initialReviews,
      distribution: initialDistribution,
      selectedReview: null,
      pagination: initialReviewsPagination,
      loading: false,
      createLoading: false,
      error: null,
    },
    product: {
      product: isProducts || isProductDetails ? initialProducts : [],
      selectedProduct: initialSelectedProduct,
      selectedLoading: false,
      selectedError: null,
      relatedProducts: initialRelatedRelations,
      relatedLoading: false,
      searchedproducts: initialSearchedProducts,
      pagination: initialPagination,
      loading: false,
      error: null,
      createLoading: false,
      createError: null,
      createSuccess: false,
    },
  });

  const html = renderToString(
    <Provider store={store}>
      <StaticRouter location={url}>
        <Root />
      </StaticRouter>
    </Provider>
  );

  const state = store.getState();
  const head = generateSeoHead(pathname, searchQuery, state);

  return { html, state, head };
}

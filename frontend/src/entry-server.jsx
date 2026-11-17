import { renderToString } from "react-dom/server";
import { StaticRouter, matchPath } from "react-router";
import { Provider } from "react-redux";
import { createStore } from "./redux/store";
import Root from "./Root";

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
  const timer = setTimeout(() => controller.abort(), 5000);

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
  const timer = setTimeout(() => controller.abort(), 8000); // slightly longer for 1000 products

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
  const timer = setTimeout(() => controller.abort(), 5000);

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
// SEO Head Generator
// ============================================================================
function generateSeoHead(pathname, searchQuery, state) {
  const isHome = pathname === "/" || pathname === "";
  const isProducts = pathname === "/products";
  const isSearch = pathname === "/search";

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
  const { pathname } = new URL(url, "http://localhost");
  const isHome = pathname === "/" || pathname === "";

  let initialData = {
    homepage: fallbackHomepageData,
    rootCategories: [],
    products: [],
  };

  if (isHome) {
    initialData = await fetchHomepageData();
  }

  // Fresh Redux store per request
  const store = createStore({
    homepage: {
      ...initialData.homepage,
      loading: false,
      error: null,
    },
    category: {
      categories: initialData.rootCategories,
      rootCategories: initialData.rootCategories,
      children: {},
      stats: {},
      selectedCategory: null,
      pagination: { total: initialData.rootCategories.length, page: 1, limit: 10, totalPages: 1 },
      loading: false,
      createLoading: false,
      updateLoading: false,
      deleteLoading: false,
      error: null,
      success: false,
      message: null,
    },
    product: {
      product: initialData.products.length ? initialData.products : initialData.homepage.featuredProducts,
      selectedProduct: null,
      selectedLoading: false,
      selectedError: null,
      relatedProducts: [],
      relatedLoading: false,
      searchedproducts: [],
      pagination: {
        page: 1,
        limit: 8,
        total: initialData.products.length,
        totalPages: 1,
      },
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
  const head = generateSeoHead(pathname, state);

  return { html, state, head };
}

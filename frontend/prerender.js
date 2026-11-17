import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// ============================================================================
// Fake Storage Stubs for Node SSR
// ============================================================================
const memoryStorage = {
  getItem: () => null,
  setItem: () => { },
  removeItem: () => { },
  clear: () => { },
};
globalThis.localStorage = memoryStorage;
globalThis.sessionStorage = memoryStorage;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "dist");
const templatePath = path.join(distDir, "index.html");
const serverEntryPath = path.join(distDir, "server", "entry-server.js");

// ============================================================================
// Routes to Pre-render
// ============================================================================
const routes = [
  { url: "/", file: "index.html" },
  { url: "/login", file: "login/index.html" },
  { url: "/signup", file: "signup/index.html" },
  { url: "/register", file: "register/index.html" },
];

// ============================================================================
// Fallback Homepage Data
// ============================================================================
const defaultHomepageData = {
  hero: [
    {
      _id: "hero-fallback",
      title: "Explore Premium Electronics",
      subtitle: "Discover the latest gadgets and accessories at NovaCart.",
      buttonText: "Shop Now",
      buttonLink: "/products",
      badge: "FEATURED",
    },
  ],
  promoCards: [],
  categories: [],
  promoGrid: [],
  shopByNeed: [],
  featuredProducts: [],
};

async function getHomepageData() {
  const base = (
    process.env.API_URL ||
    process.env.VITE_API_URL ||
    process.env.VITE_BACKEND_URL ||
    "https://backend-one-rho-24.vercel.app/api"
  ).replace(/\/$/, "");
  const BACKEND_URL = `${base}/homepage`;
  console.log(`\n📡 Fetching homepage data from ${BACKEND_URL}...`);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(BACKEND_URL, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`⚠️ Backend responded with HTTP ${res.status}. Using fallback.`);
      return defaultHomepageData;
    }

    const json = await res.json();
    const data = json.data || json;
    console.log("✅ Successfully fetched live homepage data!");
    return {
      hero: data.hero || defaultHomepageData.hero,
      promoCards: data.promoCards || [],
      categories: data.categories || [],
      promoGrid: data.promoGrid || [],
      shopByNeed: data.shopByNeed || [],
      featuredProducts: data.featuredProducts || [],
    };
  } catch (error) {
    console.warn(`⚠️ Failed to reach backend (${error.message}). Using fallback.`);
    return defaultHomepageData;
  }
}

// ============================================================================
// Main Pre-render Pipeline
// ============================================================================
async function runPrerender() {
  console.log("🚀 Starting build-time static pre-rendering (SSG)...");

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Client template not found at ${templatePath}. Run 'vite build' first.`);
  }

  if (!fs.existsSync(serverEntryPath)) {
    throw new Error(`Server entry not found at ${serverEntryPath}. Run 'vite build --ssr' first.`);
  }

  const template = fs.readFileSync(templatePath, "utf-8");
  const { render } = await import(pathToFileURL(serverEntryPath).href);

  const homepageData = await getHomepageData();

  for (const route of routes) {
    console.log(`\n⚙️  Pre-rendering: ${route.url}`);

    let preloadedState = undefined;
    if (route.url === "/") {
      preloadedState = {
        homepage: {
          ...homepageData,
          loading: false,
          error: null,
        },
      };
    }

    try {
      const result = await render(route.url, preloadedState);
      const htmlContent = result.html || "";
      const stateJson = JSON.stringify(result.state || {}).replace(/</g, "\\u003c");
      const stateScript = `<script>window.__PRELOADED_STATE__=${stateJson};window.__INITIAL_DATA__=window.__PRELOADED_STATE__;</script>`;

      let pageHtml = template;

      // Inject server-rendered HTML into container
      if (pageHtml.includes("<!--app-html-->")) {
        pageHtml = pageHtml.replace("<!--app-html-->", htmlContent);
      } else if (pageHtml.includes('<div id="root"></div>')) {
        pageHtml = pageHtml.replace('<div id="root"></div>', `<div id="root">${htmlContent}</div>`);
      } else {
        pageHtml = pageHtml.replace(
          /<div id="root">[\s\S]*?<\/div>/,
          `<div id="root">${htmlContent}</div>`
        );
      }

      // Inject hydration state
      if (pageHtml.includes("<!--app-state-->")) {
        pageHtml = pageHtml.replace("<!--app-state-->", stateScript);
      } else {
        pageHtml = pageHtml.replace("</body>", `${stateScript}</body>`);
      }

      const targetPath = path.join(distDir, route.file);
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.writeFileSync(targetPath, pageHtml, "utf-8");

      const sizeKb = (Buffer.byteLength(pageHtml, "utf-8") / 1024).toFixed(1);
      console.log(`✨ Generated: dist/${route.file} (${sizeKb} KB)`);
    } catch (err) {
      console.error(`❌ Failed to pre-render route ${route.url}:`, err);
      throw err;
    }
  }

  console.log("\n🎉 Static pre-rendering completed successfully!");
}

runPrerender().catch((err) => {
  console.error("FATAL prerender error:", err);
  process.exit(1);
});


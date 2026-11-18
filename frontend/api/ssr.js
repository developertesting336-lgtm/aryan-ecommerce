import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Polyfill minimal storage for SSR in Node serverless function
const memoryStorage = {
  getItem: () => null,
  setItem: () => { },
  removeItem: () => { },
  clear: () => { },
};
if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = memoryStorage;
}
if (typeof globalThis.sessionStorage === "undefined") {
  globalThis.sessionStorage = memoryStorage;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let cachedTemplate = null;
function getTemplate() {
  if (cachedTemplate) return cachedTemplate;

  const candidatePaths = [
    path.join(process.cwd(), "dist", "client", "template.html"),
    path.join(process.cwd(), "dist", "server", "template.html"),
    path.join(process.cwd(), "dist", "template.html"),
    path.join(__dirname, "..", "dist", "client", "template.html"),
    path.join(__dirname, "..", "dist", "server", "template.html"),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      cachedTemplate = fs.readFileSync(candidate, "utf-8");
      return cachedTemplate;
    }
  }

  throw new Error(
    `Template not found. Checked: ${candidatePaths.join(", ")}`
  );
}

let cachedRenderModule = null;
async function getRenderFunction() {
  if (cachedRenderModule) return cachedRenderModule;

  const candidatePaths = [
    path.join(process.cwd(), "dist", "server", "entry-server.js"),
    path.join(__dirname, "..", "dist", "server", "entry-server.js"),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      const module = await import(pathToFileURL(candidate).href);
      cachedRenderModule = module.render;
      return cachedRenderModule;
    }
  }

  throw new Error(
    `Server entry not found. Checked: ${candidatePaths.join(", ")}`
  );
}

export default async function handler(req, res) {
  let template;
  try {
    template = getTemplate();
  } catch (err) {
    console.error("TEMPLATE LOAD ERROR:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end("Server Error: HTML template missing. " + err.message);
    return;
  }

  // Parse true requested path (Vercel rewrite forwards as ?__p=...)
  const incoming = new URL(req.url, "http://localhost");
  const paramPath = incoming.searchParams.get("__p");
  let url = paramPath || req.headers["x-matched-path"] || req.url;
  url = "/" + url.replace(/^\/+/, "");
  if (paramPath) {
    const extraParams = new URLSearchParams(incoming.searchParams);
    extraParams.delete("__p");
    const queryStr = extraParams.toString();
    if (queryStr) {
      url = url.includes("?") ? `${url}&${queryStr}` : `${url}?${queryStr}`;
    }
  }

  let html = "";
  let head = "";
  let stateScript = "";

  try {
    const render = await getRenderFunction();
    const result = await render(url);
    html = result.html || "";
    head = result.head || "";

    const jsonState = JSON.stringify(result.state || {})
      .replace(/</g, "\\u003c")
      .replace(/\u2028/g, "\\u2028")
      .replace(/\u2029/g, "\\u2029");
    stateScript = `<script>window.__PRELOADED_STATE__=${jsonState};window.__INITIAL_DATA__=window.__PRELOADED_STATE__;</script>`;

    // Short ISR-style edge caching on Vercel
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    res.setHeader("x-ssr", "hit");
    res.setHeader("x-ssr-url", url);
  } catch (err) {
    console.error("SSR RENDER ERROR for", url, err);
    // If render fails, log loudly and fall back to client template so site remains available
    res.setHeader("x-ssr", "failed");
    res.setHeader("x-ssr-error", String(err && err.message).replace(/[^\x20-\x7e]/g, " ").slice(0, 200));
  }

  let finalHtml = template;

  // 1. Inject Head
  if (finalHtml.includes("<!--app-head-->")) {
    finalHtml = finalHtml.replace("<!--app-head-->", head);
  } else if (head) {
    finalHtml = finalHtml.replace("</head>", `${head}\n</head>`);
  }

  // 2. Inject HTML
  if (finalHtml.includes("<!--app-html-->")) {
    finalHtml = finalHtml.replace("<!--app-html-->", html);
  } else if (finalHtml.includes('<div id="root"></div>')) {
    finalHtml = finalHtml.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  } else {
    finalHtml = finalHtml.replace(
      /<div id="root">[\s\S]*?<\/div>/,
      `<div id="root">${html}</div>`
    );
  }

  // 3. Inject State Script
  if (finalHtml.includes("<!--app-state-->")) {
    finalHtml = finalHtml.replace("<!--app-state-->", stateScript);
  } else if (stateScript) {
    finalHtml = finalHtml.replace("</body>", `${stateScript}\n</body>`);
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(finalHtml);
}


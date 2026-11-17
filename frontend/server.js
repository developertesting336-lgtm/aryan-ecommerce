import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
globalThis.require = globalThis.require || require;

// Polyfill minimal storage for SSR in Node
const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};
globalThis.localStorage = memoryStorage;
globalThis.sessionStorage = memoryStorage;

import fs from "node:fs/promises";
import path from "node:path";
import express from "express";

const isProd = process.env.NODE_ENV === "production";
const port = process.env.PORT || 5173;
const SSR_PATHS = ["/", "/products", "/search"];

const app = express();
let vite;

if (!isProd) {
  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });
  app.use(vite.middlewares);
} else {
  app.use((await import("compression")).default());
  app.use(
    (await import("sirv")).default("./dist/client", {
      extensions: [],
    })
  );
}

app.use(async (req, res, next) => {
  const url = req.originalUrl;
  const pathname = url.split("?")[0].replace(/\/$/, "") || "/";

  // Skip static asset requests that were not handled by sirv/vite
  if (
    pathname.startsWith("/assets/") ||
    pathname.match(/\.(ico|png|jpg|jpeg|webp|avif|svg|jfif|css|js|json)$/)
  ) {
    return next();
  }

  try {
    let template;
    let render;

    if (!isProd) {
      template = await fs.readFile("./index.html", "utf-8");
      template = await vite.transformIndexHtml(url, template);
      const mod = await vite.ssrLoadModule("/src/entry-server.jsx");
      render = mod.render;
    } else {
      const templatePath = path.resolve("./dist/client/template.html");
      template = await fs.readFile(templatePath, "utf-8");
      const serverEntryPath = path.resolve("./dist/server/entry-server.js");
      const mod = await import(serverEntryPath);
      render = mod.render;
    }

    let html = "";
    let head = "";
    let stateScript = "";

    try {
      const result = await render(url);
      html = result.html || "";
      head = result.head || "";

      const jsonState = JSON.stringify(result.state || {}).replace(/</g, "\\u003c");
      stateScript = `<script>window.__PRELOADED_STATE__=${jsonState};window.__INITIAL_DATA__=window.__PRELOADED_STATE__;</script>`;
    } catch (ssrErr) {
      console.error(`🚨 [SSR FAILURE] Error while rendering "${url}":`, ssrErr);
      if (pathname === "/") {
        // Loudly fail in dev on homepage SSR error so it cannot be missed
        console.error("💥 Critical SSR failure on homepage ('/'). Check backend connectivity or component rendering.");
      }
      throw ssrErr;
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

    res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).send(finalHtml);
  } catch (e) {
    if (!isProd && vite) {
      vite.ssrFixStacktrace(e);
    }
    console.error("SERVER REQUEST ERROR:", e);
    res.status(500).end(e.stack || e.message);
  }
});

app.listen(port, () => console.log(`🚀 SSR Server running at http://localhost:${port}`));

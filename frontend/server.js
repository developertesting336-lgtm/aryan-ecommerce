// Fake storage for SSR: the server has no browser storage
const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};
globalThis.localStorage = memoryStorage;
globalThis.sessionStorage = memoryStorage;

import fs from "node:fs/promises";
import express from "express";

const isProd = process.env.NODE_ENV === "production";
const port = process.env.PORT || 5173;
const SSR_PATHS = ["/", "/products", "/search"];

const prodTemplate = isProd ? await fs.readFile("./dist/client/index.html", "utf-8") : "";
const app = express();
let vite;

if (!isProd) {
  const { createServer } = await import("vite");
  vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
  app.use(vite.middlewares);
} else {
  app.use((await import("compression")).default());
  app.use((await import("sirv")).default("./dist/client", { extensions: [] }));
}

app.use( async (req, res) => {
  try {
    const url = req.originalUrl;
    const pathname = url.split("?")[0].replace(/\/$/, "") || "/";

    let template = isProd ? prodTemplate : await fs.readFile("./index.html", "utf-8");
    if (!isProd) template = await vite.transformIndexHtml(url, template);

    let html = "", stateScript = "";

    if (SSR_PATHS.includes(pathname)) {
      const { render } = isProd
        ? await import("./dist/server/entry-server.js")
        : await vite.ssrLoadModule("/src/entry-server.jsx");
      const result = await render(url);
      html = result.html;
      const json = JSON.stringify(result.state).replace(/</g, "\\u003c");
      stateScript = `<script>window.__PRELOADED_STATE__=${json}</script>`;
    }

    res.status(200).set({ "Content-Type": "text/html" }).send(
      template.replace("<!--app-html-->", html).replace("<!--app-state-->", stateScript)
    );
  } catch (e) {
    vite?.ssrFixStacktrace(e);
    res.status(500).end(e.stack);
  }
});

app.listen(port, () => console.log(`http://localhost:${port}`));
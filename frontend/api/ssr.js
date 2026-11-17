import fs from "node:fs";
import path from "node:path";

// Same fake storage as server.js, set before the app code loads
const memoryStorage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
globalThis.localStorage = memoryStorage;
globalThis.sessionStorage = memoryStorage;

const SSR_PATHS = ["/", "/products", "/search"];
const template = fs.readFileSync(
  path.join(process.cwd(), "dist/server/template.html"),
  "utf-8"
);

export default async function handler(req, res) {
  try {
    const url = req.url;
    const pathname = url.split("?")[0].replace(/\/$/, "") || "/";

    let html = "";
    let stateScript = "";

    if (SSR_PATHS.includes(pathname)) {
      const { render } = await import("../dist/server/entry-server.js");
      const result = await render(url);
      html = result.html;
      const json = JSON.stringify(result.state).replace(/</g, "\\u003c");
      stateScript = `<script>window.__PRELOADED_STATE__=${json}</script>`;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(
      template
        .replace("<!--app-html-->", html)
        .replace("<!--app-state-->", stateScript)
    );
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.end("Server error");
  }
}
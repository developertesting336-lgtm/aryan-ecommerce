import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Fake storage for SSR: the server has no browser storage
const memoryStorage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
try {
  globalThis.localStorage = memoryStorage;
  globalThis.sessionStorage = memoryStorage;
} catch (e) {
  console.warn("Could not stub storage:", e.message);
}

const SSR_PATHS = ["/", "/products", "/search"];

// Resolve relative to this file (not process.cwd()) so it works on Vercel
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(__dirname, "..", "dist", "server", "template.html");

let cachedTemplate;
function getTemplate() {
  // Read inside the handler: a missing file now gives a readable error
  // in the logs instead of crashing the whole function on load.
  if (!cachedTemplate) cachedTemplate = fs.readFileSync(TEMPLATE_PATH, "utf-8");
  return cachedTemplate;
}

export default async function handler(req, res) {
  let template;
  try {
    template = getTemplate();
  } catch (e) {
    console.error("TEMPLATE READ FAILED:", TEMPLATE_PATH, e);
    res.statusCode = 500;
    res.end("Template not found: " + e.message);
    return;
  }

  const url = req.url;
  const pathname = url.split("?")[0].replace(/\/$/, "") || "/";
  let html = "";
  let stateScript = "";
  let ssrStatus = "skipped";

  if (SSR_PATHS.includes(pathname)) {
    try {
      const { render } = await import("../dist/server/entry-server.js");
      const result = await render(url);
      html = result.html;
      const json = JSON.stringify(result.state).replace(/</g, "\\u003c");
      stateScript = `<script>window.__PRELOADED_STATE__=${json}</script>`;
      ssrStatus = "ok";
    } catch (e) {
      ssrStatus = "failed";
      // Fall back to client-side rendering instead of showing a 500
      console.error("SSR RENDER FAILED for", url, e);
    }
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.setHeader("x-ssr", ssrStatus); // check in Network tab: ok | failed | skipped
  res.end(
    template
      .replace("<!--app-html-->", html)
      .replace("<!--app-state-->", stateScript)
  );
}
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const clientIndex = path.join(rootDir, "dist", "client", "index.html");
const clientTemplate = path.join(rootDir, "dist", "client", "template.html");
const serverTemplate = path.join(rootDir, "dist", "server", "template.html");

if (!fs.existsSync(clientIndex)) {
  console.error("❌ Cannot prepare SSR: dist/client/index.html not found.");
  process.exit(1);
}

// 1. Copy index.html to template.html in both dist/client and dist/server
fs.copyFileSync(clientIndex, clientTemplate);
fs.mkdirSync(path.dirname(serverTemplate), { recursive: true });
fs.copyFileSync(clientIndex, serverTemplate);
console.log("✅ Copied dist/client/index.html -> template.html");

// 2. Remove dist/client/index.html so Vercel forwards "/" to /api/ssr
fs.rmSync(clientIndex);
console.log("✅ Removed dist/client/index.html (prevents static CDN from serving empty shell)");


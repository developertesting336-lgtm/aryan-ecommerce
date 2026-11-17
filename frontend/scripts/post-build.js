import fs from "node:fs";

// Move (not copy) the template so Vercel can't serve it as a static file.
// A static dist/client/index.html would win over the /api/ssr rewrite
// and "/" would be served WITHOUT server-rendered content.
fs.copyFileSync("dist/client/index.html", "dist/server/template.html");
fs.rmSync("dist/client/index.html");

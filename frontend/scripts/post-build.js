import fs from "node:fs";

fs.copyFileSync("dist/client/index.html", "dist/server/template.html");
if (process.env.VERCEL) fs.rmSync("dist/client/index.html");
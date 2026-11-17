import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const template = fs.readFileSync(path.join(root, "dist/server/template.html"), "utf-8");

export default async function handler(req, res) {
  const { render } = await import("../dist/server/entry-server.js");
  const rendered = await render(req.url);
  const html = template
    .replace("<!--app-head-->", rendered.head ?? "")
    .replace("<!--app-html-->", rendered.html ?? "");
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}

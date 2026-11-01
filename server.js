const { createServer } = require("http");
const { readFile } = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

// only the page and the built bundle are served
const PUBLIC = [path.join(ROOT, "index.html"), path.join(ROOT, "dist") + path.sep];

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".map": "application/json",
  ".svg": "image/svg+xml",
};

createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const filePath = path.join(ROOT, urlPath === "/" ? "index.html" : urlPath);

  if (!PUBLIC.some((allowed) => filePath === allowed || filePath.startsWith(allowed))) {
    res.writeHead(404);
    return res.end("404: File not found");
  }

  readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("404: File not found");
    }
    res.writeHead(200, { "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Spots UI running at http://localhost:${PORT}`));

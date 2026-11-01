// Builds src/ into dist/. `node build.js --watch` rebuilds on change and reloads the page.
const esbuild = require("esbuild");

require("dotenv").config();

const watch = process.argv.includes("--watch");

const build = () =>
  esbuild.build({
    entryPoints: ["src/index.jsx"],
    bundle: true,
    outdir: "dist",
    entryNames: "bundle",
    jsx: "automatic",
    sourcemap: true,
    minify: !watch,
    target: ["es6"], // older 32-bit browsers
    logLevel: "info",
    define: {
      "process.env.REACT_APP_API_URL": JSON.stringify(process.env.REACT_APP_API_URL || ""),
      "process.env.NODE_ENV": JSON.stringify(watch ? "development" : "production"),
    },
  });

build().catch(() => process.exit(1));

if (watch) {
  const chokidar = require("chokidar");
  const WebSocket = require("ws");

  // the page connects here and reloads when a rebuild finishes
  const wss = new WebSocket.Server({ port: 8081 });
  chokidar.watch("src").on("change", async () => {
    console.log("File changed, rebuilding...");
    await build().catch(() => {});
    wss.clients.forEach((ws) => ws.readyState === WebSocket.OPEN && ws.send("reload"));
  });
}

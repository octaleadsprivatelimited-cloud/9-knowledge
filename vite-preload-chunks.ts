import { readFileSync, writeFileSync } from "fs";
import path from "path";

/** Preload critical chunks so they load in parallel with the main script and app is ready in seconds. */
export function preloadChunksPlugin(base = "/") {
  let chunkFiles: string[] = [];
  let outDir = "dist";

  return {
    name: "preload-chunks",
    apply: "build",
    configResolved(config: { build: { outDir: string } }) {
      outDir = config.build.outDir;
    },
    writeBundle(_: unknown, bundle: Record<string, { type: string; fileName: string }>) {
      const critical = ["react-vendor", "firebase-vendor", "vendor", "App-"];
      const seen = new Set<string>();
      chunkFiles = Object.values(bundle)
        .filter((o) => o.type === "chunk" && critical.some((c) => o.fileName.includes(c)))
        .map((o) => o.fileName)
        .filter((f) => !seen.has(f) && seen.add(f));
    },
    closeBundle() {
      if (chunkFiles.length === 0) return;
      const htmlPath = path.resolve(outDir, "index.html");
      try {
        let html = readFileSync(htmlPath, "utf-8");
        const basePath = base.endsWith("/") ? base.slice(0, -1) : base;
        const links = chunkFiles
          .map((f) => `<link rel="modulepreload" crossorigin href="${basePath}/${f}">`)
          .join("\n    ");
        if (html.includes("</head>")) {
          html = html.replace("</head>", `\n    ${links}\n  </head>`);
        }
        writeFileSync(htmlPath, html);
      } catch (e) {
        console.warn("[preload-chunks] Could not inject preloads:", e);
      }
    },
  };
}

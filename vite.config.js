import { defineConfig } from "vite";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const passthroughFiles = [
  "app.js",
  "supabase-client.js",
  "cordel_rhyme_bank.js",
  "prediction_engine_v2.js",
  "inanna_observando.webp",
  "inanna_lendo.webp",
  "inanna_celebrando.webp",
  "emoji.png",
  "miado_suave.mp3",
  "inannaVID.mp4",
  "inanna-app-icon.png",
  "cordel-logo-card.png",
  "CORDEL 2.0 SEM FUNDO.png",
  "inanna_footer_embed_snippet.html",
];

function copyRuntimeStaticFiles() {
  return {
    name: "copy-runtime-static-files",
    closeBundle() {
      const outDir = resolve(projectRoot, "dist");
      mkdirSync(outDir, { recursive: true });
      passthroughFiles.forEach((fileName) => {
        const source = resolve(projectRoot, fileName);
        if (!existsSync(source)) return;
        copyFileSync(source, resolve(outDir, fileName));
      });
    },
  };
}

export default defineConfig({
  plugins: [copyRuntimeStaticFiles()],
  build: {
    outDir: "dist",
  },
  server: {
    host: "0.0.0.0",
  },
});

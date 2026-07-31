import { defineConfig } from "vite";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));
// Arquivos servidos crus, sem passar pelo Vite. `app.js` NÃO entra aqui: ele é
// o entry <script type="module"> do index.html, então o Vite já o compila para
// /assets/index-*.js. Copiá-lo também publicava uma segunda cópia, não-minificada
// e nunca executada — peso morto que ainda enganava quem depurava produção.
// Os três abaixo entram como <script> clássico (sem type="module"), que o Vite
// não processa: esses precisam mesmo da cópia crua.
const passthroughFiles = [
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
  "template-poesia.png",
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

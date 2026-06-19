import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const staticAssets = ["tematicas_jogo.csv"];

for (const asset of staticAssets) {
  const from = resolve(asset);
  const to = resolve("dist", asset);
  await mkdir(dirname(to), { recursive: true });
  await copyFile(from, to);
}

/**
 * pnpm sanity:build-seed          — ghi lại seed/sanity/documents.json
 * pnpm sanity:build-seed --check  — chỉ kiểm tệp trong repo == bản sinh lại, lệch thì exit 1
 * Không gọi mạng.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { SeedAsset } from "../../lib/content/seed-assets";
import { EN_TRANSLATED_IDS, enOverlays, enSingletonOverlays } from "./content/en-copy";
import { viOverlays } from "./content/vi-copy";
import { buildSeed, serializeSeed, type EnCopy } from "./seed-build";

const EN_COPY: EnCopy = { translatedIds: EN_TRANSLATED_IDS, overlays: enOverlays, singletonOverlays: enSingletonOverlays };

const root = process.cwd();
const read = (p: string) => JSON.parse(readFileSync(join(root, p), "utf8")) as never;
const out = join(root, "seed/sanity/documents.json");

const text = serializeSeed(
  buildSeed(read("scripts/sanity/content/base.json"), viOverlays, read("seed/sanity/assets.json") as SeedAsset[], EN_COPY),
);

if (process.argv.includes("--check")) {
  if (readFileSync(out, "utf8") !== text) {
    console.error("[sanity:build-seed] documents.json lệch bản sinh — chạy `pnpm sanity:build-seed`");
    process.exit(1);
  }
  console.log("[sanity:build-seed] documents.json khớp bản sinh");
} else {
  writeFileSync(out, text);
  console.log("[sanity:build-seed] đã ghi seed/sanity/documents.json");
}

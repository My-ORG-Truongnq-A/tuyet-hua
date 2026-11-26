/**
 * Sinh seed/sanity/assets.json từ ảnh trong seed/sanity/assets/ (ND-07: sinh bằng script, không sửa tay).
 * Ảnh giữ nguyên byte khách gửi (ND-06). Không gọi mạng.
 *   pnpm seed:assets          — ghi lại assets.json
 *   pnpm seed:assets --check  — chỉ kiểm, lệch thì exit 1
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SEED_ASSET_DIR, seedAssetEntry } from "../lib/content/seed-assets";

const root = process.cwd();
const dir = join(root, SEED_ASSET_DIR);
const out = join(root, "seed/sanity/assets.json");

const files = readdirSync(dir)
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  .sort();
const manifest = files.map((f) => seedAssetEntry(f, readFileSync(join(dir, f))));
const text = `${JSON.stringify(manifest, null, 2)}\n`;

if (process.argv.includes("--check")) {
  const current = readFileSync(out, "utf8");
  if (current !== text) {
    console.error("[seed:assets] assets.json lệch ảnh trong seed/sanity/assets/ — chạy pnpm seed:assets");
    process.exit(1);
  }
  console.log(`[seed:assets] khớp ${manifest.length} ảnh`);
} else {
  writeFileSync(out, text);
  console.log(`[seed:assets] ghi ${manifest.length} ảnh vào seed/sanity/assets.json`);
}

/**
 * pnpm seed:validate [--file <tệp trong seed/>] — kiểm seed theo schema, không gọi mạng (CM-02, ND-10).
 * Mặc định seed/sanity/documents.json. Lỗi → in từng dòng và exit 1.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { SeedAsset } from "../lib/content/seed-assets";
import { checkSeed } from "../sanity/lib/seed-check";

const root = process.cwd();
const argIndex = process.argv.indexOf("--file");
const file = argIndex > 0 ? process.argv[argIndex + 1]! : "sanity/documents.json";
const read = (p: string) => JSON.parse(readFileSync(join(root, "seed", p), "utf8")) as unknown;

const assets = read("sanity/assets.json") as SeedAsset[];
for (const a of assets) {
  if (!existsSync(join(root, "seed/sanity/assets", a.file))) {
    console.error(`[seed:validate] assets.json có «${a.file}» nhưng không có tệp ảnh`);
    process.exit(1);
  }
}
const status = (file === "sanity/documents.json" ? read("sanity/field-status.json") : { pendingRequired: {} }) as {
  pendingRequired: Record<string, string>;
};

async function main() {
const docs = read(file);
const issues = await checkSeed({ docs, assets, pendingRequired: Object.keys(status.pendingRequired) });
if (issues.length) {
  for (const i of issues) console.error(`✗ ${i.id}${i.path ? ` › ${i.path}` : ""}: ${i.message}`);
  console.error(`[seed:validate] seed/${file}: ${issues.length} lỗi`);
  process.exit(1);
}
console.log(`[seed:validate] seed/${file}: ${(docs as unknown[]).length} document hợp lệ`);
}

void main();

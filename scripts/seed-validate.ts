/**
 * pnpm seed:validate [--file <tệp trong seed/>] — kiểm seed theo schema, không gọi mạng (CM-02, ND-10).
 * Mặc định seed/sanity/documents.json. Lỗi → in từng dòng và exit 1.
 * Tệp field-status.json cạnh tệp seed (nếu có):
 *   pendingRequired: trường bắt buộc đang chờ khách (được trống);
 *   expectedIssues: lỗi CHỦ ĐÍCH của fixture (ví dụ cảm nhận chưa đồng ý để kiểm bộ lọc) — không dùng cho seed thật.
 * Ảnh chân dung hero (homePage-*.hero.image): CẢNH BÁO khi không tách nền hoặc rộng < 1200 px (T6.6, MI-06) — không chặn.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { SeedAsset } from "../lib/content/seed-assets";
import { checkSeed } from "../sanity/lib/seed-check";
import { heroImageWarnings, inspectImage } from "./images/hero-check";

const root = process.cwd();
const argIndex = process.argv.indexOf("--file");
const file = argIndex > 0 ? process.argv[argIndex + 1]! : "sanity/documents.json";
const read = (p: string) => JSON.parse(readFileSync(join(root, "seed", p), "utf8")) as unknown;

type FieldStatus = { pendingRequired?: Record<string, string>; expectedIssues?: Record<string, string> };

async function main() {
  const assets = read("sanity/assets.json") as SeedAsset[];
  for (const a of assets) {
    if (!existsSync(join(root, "seed/sanity/assets", a.file))) {
      console.error(`[seed:validate] assets.json có «${a.file}» nhưng không có tệp ảnh`);
      process.exit(1);
    }
  }
  const statusFile = join(dirname(file), "field-status.json");
  const status = (existsSync(join(root, "seed", statusFile)) ? read(statusFile) : {}) as FieldStatus;
  const expected = new Set(Object.keys(status.expectedIssues ?? {}));

  const docs = read(file);
  const issues = (await checkSeed({ docs, assets, pendingRequired: Object.keys(status.pendingRequired ?? {}) })).filter(
    (i) => !expected.has(`${i.id}.${i.path}`),
  );
  if (issues.length) {
    for (const i of issues) console.error(`✗ ${i.id}${i.path ? ` › ${i.path}` : ""}: ${i.message}`);
    console.error(`[seed:validate] seed/${file}: ${issues.length} lỗi`);
    process.exit(1);
  }
  await warnHeroImages(docs as { _id: string; _type: string; hero?: { image?: { image?: { _sanityAsset?: string; asset?: { _ref?: string } } } } }[], assets);
  console.log(`[seed:validate] seed/${file}: ${(docs as unknown[]).length} document hợp lệ`);
}

async function warnHeroImages(
  docs: { _id: string; _type: string; hero?: { image?: { image?: { _sanityAsset?: string; asset?: { _ref?: string } } } } }[],
  assets: SeedAsset[],
) {
  for (const doc of docs) {
    if (doc._type !== "homePage" || doc._id.startsWith("drafts.")) continue;
    const ref = doc.hero?.image?.image?._sanityAsset ?? doc.hero?.image?.image?.asset?._ref;
    const asset = assets.find((a) => a._sanityAsset === ref || a.assetId === ref);
    if (!asset) continue;
    const info = await inspectImage(readFileSync(join(root, "seed/sanity/assets", asset.file)));
    for (const w of heroImageWarnings(info)) console.warn(`⚠ ${doc._id} › hero.image (${asset.file}): ${w}`);
  }
}

void main();

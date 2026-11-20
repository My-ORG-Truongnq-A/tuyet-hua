/**
 * pnpm seed:validate [--file <tệp trong seed/>] — kiểm seed theo schema, không gọi mạng (CM-02, ND-10).
 * Mặc định seed/sanity/documents.json. Lỗi → in từng dòng và exit 1.
 * Tệp field-status.json cạnh tệp seed (nếu có):
 *   pendingRequired: trường bắt buộc đang chờ khách (được trống);
 *   expectedIssues: lỗi CHỦ ĐÍCH của fixture (ví dụ cảm nhận chưa đồng ý để kiểm bộ lọc) — không dùng cho seed thật.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { SeedAsset } from "../lib/content/seed-assets";
import { checkSeed } from "../sanity/lib/seed-check";

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
  console.log(`[seed:validate] seed/${file}: ${(docs as unknown[]).length} document hợp lệ`);
}

void main();

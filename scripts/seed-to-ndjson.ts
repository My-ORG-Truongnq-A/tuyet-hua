/**
 * pnpm seed:ndjson [--file <tệp trong seed/>] [--out <đường dẫn>] — chuyển seed sang NDJSON để DigiForge
 * đẩy lên Sanity SAU G5 (T2.9). Chỉ ghi tệp, KHÔNG gọi mạng, không có lệnh ghi Sanity ở đây.
 * Ảnh giữ nguyên cú pháp `_sanityAsset: image@file://…` mà công cụ nhập của Sanity hiểu.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { toNdjson } from "./ndjson";

const arg = (name: string, fallback: string) => {
  const i = process.argv.indexOf(name);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1]! : fallback;
};

const root = process.cwd();
const file = arg("--file", "sanity/documents.json");
const out = join(root, arg("--out", "tmp/seed.ndjson"));
const docs = JSON.parse(readFileSync(join(root, "seed", file), "utf8")) as unknown;
const text = toNdjson(docs);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, text);
console.log(`[seed:ndjson] ${text.split("\n").filter(Boolean).length} document → ${out}`);

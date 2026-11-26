import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { evaluate, parse } from "groq-js";
import { materializeSeedAssets, type SeedAsset } from "./seed-assets";

/**
 * Nguồn seed: chạy CHÍNH truy vấn GROQ của Sanity bằng groq-js trên seed/sanity/documents.json.
 * Đây là chế độ chạy THẬT (bản xem thử local, QA, G5, production khi không bật Sanity) — Q-118.
 * Loader làm đúng việc `sanity dataset import` làm (bỏ bản nháp, ảnh → asset), không map riêng từng trường.
 */
export type SanityDocument = { _id: string; _type: string; [key: string]: unknown };

/** Đường dẫn tương đối trong thư mục seed/ (giới hạn phạm vi đọc tệp — tránh trace cả project). */
export const DEFAULT_SEED_FILE = "sanity/documents.json";
/** Một bảng asset cho mọi tệp seed (cả fixture) — sinh bằng pnpm seed:assets. */
export const SEED_ASSETS_FILE = "sanity/assets.json";

/** Bỏ bản nháp / bản phát hành chưa publish — giống perspective "published" của Sanity (D-08). */
export function publishedOnly(docs: SanityDocument[]): SanityDocument[] {
  return docs.filter((d) => !d._id.startsWith("drafts.") && !d._id.startsWith("versions."));
}

/** Dataset seed sẵn sàng truy vấn: đã publish + asset ảo cho mọi ảnh. */
export function prepareSeed(docs: SanityDocument[], assets: SeedAsset[]): SanityDocument[] {
  return materializeSeedAssets(publishedOnly(docs), assets);
}

export async function queryDocuments<T>(
  docs: SanityDocument[],
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  const tree = parse(query, { params });
  const value = await evaluate(tree, { dataset: docs, params });
  return (await value.get()) as T;
}

let cached: { file: string; docs: Promise<SanityDocument[]> } | null = null;

const readJson = async (file: string): Promise<unknown> =>
  JSON.parse(await readFile(join(process.cwd(), "seed", file), "utf8")) as unknown;

/** Seed là tệp trong repo, bất biến trong một bản build → giữ trong bộ nhớ ở production; dev đọc lại mỗi lần. */
export function loadSeed(file: string): Promise<SanityDocument[]> {
  const memo = process.env.NODE_ENV === "production";
  if (memo && cached?.file === file) return cached.docs;
  const docs = Promise.all([readJson(file), readJson(SEED_ASSETS_FILE)]).then(([parsed, assets]) => {
    if (!Array.isArray(parsed)) throw new Error(`[seed] seed/${file} phải là mảng document`);
    if (!Array.isArray(assets)) throw new Error(`[seed] seed/${SEED_ASSETS_FILE} phải là mảng asset`);
    return prepareSeed(parsed as SanityDocument[], assets as SeedAsset[]);
  });
  if (memo) cached = { file, docs };
  return docs;
}

export async function querySeed<T>(file: string, query: string, params: Record<string, unknown> = {}): Promise<T> {
  return queryDocuments<T>(await loadSeed(file), query, params);
}

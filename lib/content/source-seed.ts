import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { evaluate, parse } from "groq-js";

/**
 * Nguồn seed: chạy CHÍNH truy vấn GROQ của Sanity bằng groq-js trên seed/sanity/documents.json.
 * Đây là chế độ chạy THẬT (bản xem thử local, QA, G5, production khi không bật Sanity) — Q-118.
 */
export type SanityDocument = { _id: string; _type: string; [key: string]: unknown };

/** Đường dẫn tương đối trong thư mục seed/ (giới hạn phạm vi đọc tệp — tránh trace cả project). */
export const DEFAULT_SEED_FILE = "sanity/documents.json";

/** Bỏ bản nháp / bản phát hành chưa publish — giống perspective "published" của Sanity. */
export function publishedOnly(docs: SanityDocument[]): SanityDocument[] {
  return docs.filter((d) => !d._id.startsWith("drafts.") && !d._id.startsWith("versions."));
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

/** Seed là tệp trong repo, bất biến trong một bản build → giữ trong bộ nhớ ở production; dev đọc lại mỗi lần. */
export function loadSeed(file: string): Promise<SanityDocument[]> {
  const memo = process.env.NODE_ENV === "production";
  if (memo && cached?.file === file) return cached.docs;
  const docs = readFile(join(process.cwd(), "seed", file), "utf8").then((text) => {
    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error(`[seed] seed/${file} phải là mảng document`);
    return publishedOnly(parsed as SanityDocument[]);
  });
  if (memo) cached = { file, docs };
  return docs;
}

export async function querySeed<T>(file: string, query: string, params: Record<string, unknown> = {}): Promise<T> {
  return queryDocuments<T>(await loadSeed(file), query, params);
}

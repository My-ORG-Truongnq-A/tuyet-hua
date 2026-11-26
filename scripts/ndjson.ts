/** Mảng document → NDJSON (một document mỗi dòng). Hàm thuần cho seed:ndjson. */
export function toNdjson(docs: unknown): string {
  if (!Array.isArray(docs)) throw new Error("[seed:ndjson] seed phải là mảng document");
  return docs.map((d) => JSON.stringify(d)).join("\n") + (docs.length ? "\n" : "");
}

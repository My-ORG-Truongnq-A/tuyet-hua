/** Cắt chuỗi theo ranh giới từ (mô tả meta ≤ 160 ký tự — seo_plan). */
export function truncateWords(text: string | null | undefined, max = 160): string | null {
  const t = text?.replace(/\s+/g, " ").trim();
  if (!t) return null;
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const at = cut.lastIndexOf(" ");
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,.;:–-]+$/, "")}…`;
}

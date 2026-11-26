import type { Lang } from "./env";

export type { Lang } from "./env";
export { LANGUAGES } from "./env";

/** Trường dịch theo field: { vi, en }. */
export type Localized<T = string> = Partial<Record<Lang, T | null>>;

/**
 * Lấy giá trị đúng ngôn ngữ, KHÔNG fallback sang ngôn ngữ khác (REQ-17, CM-10):
 * trang en thiếu bản dịch phải ẩn / không sinh URL chứ không hiện chữ Việt.
 * Chuỗi thường (trường không dịch như số điện thoại) trả nguyên.
 */
export function pickLocale(value: Localized | string | null | undefined, lang: Lang): string | null {
  if (typeof value === "string") return value.trim() ? value : null;
  if (!value || typeof value !== "object") return null;
  const v = value[lang];
  return typeof v === "string" && v.trim() ? v : null;
}

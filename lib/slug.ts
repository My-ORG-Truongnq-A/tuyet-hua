/**
 * Slug tiếng Việt không dấu (T1.4). Module thuần — dùng chung cho Studio (slugify của trường slug)
 * và site. Không phụ thuộc runtime nào.
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX_LENGTH = 96;

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/, "");
}

export function isValidSlug(value: string | null | undefined): boolean {
  return typeof value === "string" && SLUG_PATTERN.test(value);
}

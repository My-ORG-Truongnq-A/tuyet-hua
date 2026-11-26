/**
 * Phân trang ?trang=N (T3.11). Số bài / trang lấy siteSettings.blog.postsPerPage; trống → DEFAULT_POSTS_PER_PAGE
 * (lib/content/pages.ts). Giá trị sai hoặc vượt số trang → null để trang trả 404.
 */
export const PAGE_PARAM = "trang";

export function resolvePage(
  raw: string | string[] | undefined,
  total: number,
  perPage: number,
): { page: number; totalPages: number } | null {
  const totalPages = Math.max(1, Math.ceil(Math.max(0, total) / Math.max(1, perPage)));
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === undefined) return { page: 1, totalPages };
  if (!/^[1-9]\d{0,4}$/.test(value)) return null;
  const page = Number(value);
  return page <= totalPages ? { page, totalPages } : null;
}

export function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?${PAGE_PARAM}=${page}`;
}

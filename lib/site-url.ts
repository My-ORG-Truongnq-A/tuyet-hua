import { env } from "./env";

/**
 * Hằng SITE_URL duy nhất (SEO-02): metadataBase, canonical, og:url, og:image, sitemap,
 * robots `Sitemap:`, JSON-LD, llms.txt đều lấy từ đây. Không đọc NEXT_PUBLIC_SITE_URL ở chỗ khác.
 */
export const SITE_URL = env.siteUrl;
export const SITE_HOST = new URL(SITE_URL).host;

/** Ghép path với origin; bỏ / cuối (trailingSlash: false); URL tuyệt đối giữ nguyên. */
export function absoluteUrlFor(siteUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const url = new URL(path.startsWith("/") ? path : `/${path}`, siteUrl);
  const trimmed = url.pathname.replace(/\/+$/, "");
  const pathname = trimmed || (url.search || url.hash ? "/" : "");
  return `${url.origin}${pathname}${url.search}${url.hash}`;
}

export const absoluteUrl = (path: string) => absoluteUrlFor(SITE_URL, path);

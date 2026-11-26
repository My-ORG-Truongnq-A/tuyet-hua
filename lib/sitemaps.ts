import type { Lang } from "./env";
import { absoluteUrlFor } from "./site-url";

/**
 * Sitemap tách theo loại (SEO): /sitemap.xml là index, /sitemaps/<loại>.xml là urlset.
 * <loc> tuyệt đối theo SITE_URL; xhtml:link hreflang chỉ khi trang có bản dịch thật.
 */
export type SitemapEntry = {
  path: string;
  lastModified?: string | null;
  /** Đường dẫn theo ngôn ngữ (gồm chính trang) cho các ngôn ngữ đang bật và có bản dịch. */
  alternates?: Partial<Record<Lang, string>>;
};

const XML_HEAD = '<?xml version="1.0" encoding="UTF-8"?>\n';

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isoDate(v: string | null | undefined): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export type SitemapIndexItem = { name: string; lastModified?: string | null };

/**
 * Sitemap con đưa vào index (SEO-06): bỏ tệp không có URL nào (vd. chưa có bài viết), lastmod = mục mới nhất
 * (thiếu thì `fallback`). `entries: null` = không đọc được nội dung → vẫn giữ tên, không làm rơi URL thật vì lỗi tạm.
 */
export function sitemapIndexItems(
  sources: { name: string; entries: SitemapEntry[] | null }[],
  fallback?: string | null,
): SitemapIndexItem[] {
  const out: SitemapIndexItem[] = [];
  for (const { name, entries } of sources) {
    if (entries === null) {
      out.push({ name, lastModified: fallback ?? null });
      continue;
    }
    if (entries.length === 0) continue;
    let latest: string | null = null;
    for (const e of entries) {
      const d = isoDate(e.lastModified);
      if (d && (!latest || d > latest)) latest = d;
    }
    out.push({ name, lastModified: latest ?? fallback ?? null });
  }
  return out;
}

export function sitemapIndexXml(siteUrl: string, sitemaps: SitemapIndexItem[]): string {
  const items = sitemaps
    .map(({ name, lastModified }) => {
      const lastmod = isoDate(lastModified);
      return `  <sitemap><loc>${esc(`${siteUrl}/sitemaps/${name}.xml`)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</sitemap>`;
    })
    .join("\n");
  return `${XML_HEAD}<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
}

export function urlsetXml(siteUrl: string, entries: SitemapEntry[]): string {
  const abs = (p: string) => esc(absoluteUrlFor(siteUrl, p));
  const body = entries
    .map((e) => {
      const lines = [`    <loc>${abs(e.path)}</loc>`];
      const lastmod = isoDate(e.lastModified);
      if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
      const alts = Object.entries(e.alternates ?? {}).filter((x): x is [string, string] => Boolean(x[1]));
      if (alts.length > 1) {
        for (const [lang, p] of alts) lines.push(`    <xhtml:link rel="alternate" hreflang="${lang}" href="${abs(p)}"/>`);
        const def = e.alternates?.vi;
        if (def) lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(def)}"/>`);
      }
      return `  <url>\n${lines.join("\n")}\n  </url>`;
    })
    .join("\n");
  return `${XML_HEAD}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;
}

export const XML_HEADERS = { "Content-Type": "application/xml; charset=utf-8" } as const;

/**
 * Phản hồi sitemap con: có URL → 200; rỗng → 404 noindex (SEO-06: không phơi danh mục rỗng, index cũng bỏ tệp này);
 * `null` = không đọc được nội dung → 200 urlset rỗng hợp lệ (không 500, không báo «không tồn tại» vì lỗi tạm).
 */
export function urlsetResponse(siteUrl: string, entries: SitemapEntry[] | null): Response {
  if (entries && entries.length === 0) {
    return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" } });
  }
  return new Response(urlsetXml(siteUrl, entries ?? []), { headers: XML_HEADERS });
}

/** Đọc mục sitemap; lỗi → null + ghi log (route sitemap không trả 500). */
export async function loadEntries(label: string, load: () => Promise<SitemapEntry[]>): Promise<SitemapEntry[] | null> {
  try {
    return await load();
  } catch (error) {
    console.error(`[sitemap] không đọc được ${label}`, error);
    return null;
  }
}

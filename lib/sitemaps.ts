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

export function sitemapIndexXml(siteUrl: string, names: string[], lastModified?: string | null): string {
  const lastmod = isoDate(lastModified);
  const items = names
    .map(
      (n) =>
        `  <sitemap><loc>${esc(`${siteUrl}/sitemaps/${n}.xml`)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</sitemap>`,
    )
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

/** Các sitemap con (app/sitemaps/<tên>.xml). */
export const SITEMAPS = ["pages", "projects", "posts"];

export const XML_HEADERS = { "Content-Type": "application/xml; charset=utf-8" } as const;

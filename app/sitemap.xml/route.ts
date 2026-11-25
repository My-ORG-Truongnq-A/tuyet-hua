import { getSiteSettings } from "@/lib/content/site-settings";
import { pageEntries, postEntries, projectEntries } from "@/lib/content/sitemap-entries";
import { SITE_URL } from "@/lib/site-url";
import { sitemapIndexItems, sitemapIndexXml, XML_HEADERS, type SitemapEntry } from "@/lib/sitemaps";

/**
 * Sitemap index (KT-03: có thời hạn làm mới). Sitemap con: pages, projects, posts (app/sitemaps/<tên>.xml) —
 * chỉ liệt kê tệp có URL (SEO-06: chưa có bài viết thì không trỏ tới posts.xml rỗng); lastmod = mục mới nhất.
 */
export const revalidate = 3600;

const SOURCES: { name: string; load: () => Promise<SitemapEntry[]> }[] = [
  { name: "pages", load: pageEntries },
  { name: "projects", load: projectEntries },
  { name: "posts", load: postEntries },
];

async function safe<T>(label: string, load: () => Promise<T>): Promise<T | null> {
  try {
    return await load();
  } catch (error) {
    console.error(`[sitemap] không đọc được ${label}`, error);
    return null;
  }
}

export async function GET() {
  const [settings, ...lists] = await Promise.all([
    safe("siteSettings", () => getSiteSettings("vi")),
    ...SOURCES.map((s) => safe(s.name, s.load)),
  ]);
  const items = sitemapIndexItems(
    SOURCES.map((s, i) => ({ name: s.name, entries: (lists[i] as SitemapEntry[] | null) ?? null })),
    settings?.updatedAt ?? null,
  );
  return new Response(sitemapIndexXml(SITE_URL, items), { headers: XML_HEADERS });
}

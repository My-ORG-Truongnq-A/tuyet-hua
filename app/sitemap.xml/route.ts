import { getSiteSettings } from "@/lib/content/site-settings";
import { pageEntries, postEntries, projectEntries } from "@/lib/content/sitemap-entries";
import { SITE_URL } from "@/lib/site-url";
import { loadEntries, sitemapIndexItems, sitemapIndexXml, XML_HEADERS } from "@/lib/sitemaps";

/**
 * Sitemap index (KT-03: có thời hạn làm mới). Sitemap con: pages, projects, posts (app/sitemaps/<tên>.xml) —
 * chỉ liệt kê tệp có URL (SEO-06: chưa có bài viết thì không trỏ tới posts.xml); lastmod = mục mới nhất.
 */
export const revalidate = 3600;

export async function GET() {
  const [settings, pages, projects, posts] = await Promise.all([
    getSiteSettings("vi").catch((error: unknown) => {
      console.error("[sitemap] không đọc được siteSettings", error);
      return null;
    }),
    loadEntries("pages", pageEntries),
    loadEntries("projects", projectEntries),
    loadEntries("posts", postEntries),
  ]);
  const items = sitemapIndexItems(
    [
      { name: "pages", entries: pages },
      { name: "projects", entries: projects },
      { name: "posts", entries: posts },
    ],
    settings?.updatedAt ?? null,
  );
  return new Response(sitemapIndexXml(SITE_URL, items), { headers: XML_HEADERS });
}

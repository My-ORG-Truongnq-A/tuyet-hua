import { getSiteSettings } from "@/lib/content/site-settings";
import { env } from "@/lib/env";
import { pathFor } from "@/lib/routes";
import { SITE_URL } from "@/lib/site-url";
import { urlsetXml, XML_HEADERS, type SitemapEntry } from "@/lib/sitemaps";
import { BUILT_PAGES } from "@/lib/ui-strings";

/** Trang tĩnh đã dựng (KT-03). Bản en chỉ vào khi tiếng Anh đang bật (REQ-17). */
export const revalidate = 3600;

export async function GET() {
  let updatedAt: string | null = null;
  try {
    updatedAt = (await getSiteSettings("vi")).updatedAt;
  } catch (error) {
    console.error("[sitemap] không đọc được siteSettings", error);
  }
  const entries: SitemapEntry[] = BUILT_PAGES.flatMap((key) => {
    const alternates = Object.fromEntries(env.languages.map((l) => [l, pathFor(key, l)]));
    return env.languages.map((lang) => ({ path: pathFor(key, lang), lastModified: updatedAt, alternates }));
  });
  return new Response(urlsetXml(SITE_URL, entries), { headers: XML_HEADERS });
}

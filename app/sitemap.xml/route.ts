import { getSiteSettings } from "@/lib/content/site-settings";
import { SITE_URL } from "@/lib/site-url";
import { SITEMAPS, sitemapIndexXml, XML_HEADERS } from "@/lib/sitemaps";

/** Sitemap index (KT-03: có thời hạn làm mới). Bước sau thêm projects / posts. */
export const revalidate = 3600;

export async function GET() {
  let updatedAt: string | null = null;
  try {
    updatedAt = (await getSiteSettings("vi")).updatedAt;
  } catch (error) {
    console.error("[sitemap] không đọc được siteSettings", error);
  }
  return new Response(sitemapIndexXml(SITE_URL, SITEMAPS, updatedAt), { headers: XML_HEADERS });
}

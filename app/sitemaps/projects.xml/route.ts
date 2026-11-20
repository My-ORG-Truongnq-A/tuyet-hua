import { projectEntries } from "@/lib/content/sitemap-entries";
import { SITE_URL } from "@/lib/site-url";
import { urlsetXml, XML_HEADERS } from "@/lib/sitemaps";

/** Chi tiết dự án đã publish (T5.2). Lỗi đọc nội dung → sitemap rỗng hợp lệ + ghi log, không 500. */
export const revalidate = 3600;

export async function GET() {
  let entries: Awaited<ReturnType<typeof projectEntries>> = [];
  try {
    entries = await projectEntries();
  } catch (error) {
    console.error("[sitemap] không đọc được nội dung", error);
  }
  return new Response(urlsetXml(SITE_URL, entries), { headers: XML_HEADERS });
}

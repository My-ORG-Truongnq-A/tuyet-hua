import { postEntries } from "@/lib/content/sitemap-entries";
import { SITE_URL } from "@/lib/site-url";
import { loadEntries, urlsetResponse } from "@/lib/sitemaps";

/** Chi tiết bài viết đã đăng (không gồm trang ?trang=N) (T5.2). Rỗng → 404 (SEO-06); lỗi đọc nội dung → sitemap rỗng hợp lệ + ghi log, không 500. */
export const revalidate = 3600;

export async function GET() {
  return urlsetResponse(SITE_URL, await loadEntries("posts", postEntries));
}

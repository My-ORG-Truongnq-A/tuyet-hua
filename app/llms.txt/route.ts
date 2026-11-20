import { getProjects } from "@/lib/content/pages";
import { getSiteSettings } from "@/lib/content/site-settings";
import { llmsTxt, type LlmsPage } from "@/lib/llms";
import { pathFor } from "@/lib/routes";
import { SITE_URL } from "@/lib/site-url";
import { BUILT_PAGES, fillPattern, UI } from "@/lib/ui-strings";

/**
 * /llms.txt sinh từ siteSettings + danh sách dự án (GEO-06, T5.3). Trường trống bỏ dòng; không số liệu chưa
 * xác nhận (chỉ dùng tên, tóm tắt, mẫu mô tả seo_plan).
 */
export const revalidate = 3600;

export async function GET() {
  const [settings, projects] = await Promise.all([getSiteSettings("vi"), getProjects("vi")]);
  const values = { personName: settings.personName, area: settings.area };
  const desc = UI.vi.seo.descriptions;
  const pages: LlmsPage[] = BUILT_PAGES.map((key) => ({
    title: UI.vi.pages[key],
    path: pathFor(key, "vi"),
    description:
      key === "home"
        ? settings.tagline
        : fillPattern(desc[key as keyof typeof desc], values),
  }));
  for (const p of projects) {
    pages.push({ title: p.title, path: pathFor("projectDetail", "vi", { slug: p.slug }), description: p.summary });
  }
  return new Response(llmsTxt({ settings, siteUrl: SITE_URL, pages }), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

import { getSiteSettings } from "@/lib/content/site-settings";
import { llmsTxt } from "@/lib/llms";
import { pathFor } from "@/lib/routes";
import { SITE_URL } from "@/lib/site-url";
import { BUILT_PAGES, UI } from "@/lib/ui-strings";

/** /llms.txt sinh từ siteSettings (GEO-06, KT-03). */
export const revalidate = 3600;

export async function GET() {
  const settings = await getSiteSettings("vi");
  const pages = BUILT_PAGES.map((key) => ({
    title: UI.vi.pages[key],
    path: pathFor(key, "vi"),
    description: key === "home" ? settings.tagline : null,
  }));
  return new Response(llmsTxt({ settings, siteUrl: SITE_URL, pages }), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

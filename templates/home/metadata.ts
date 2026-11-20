import type { Metadata } from "next";
import { getPage } from "@/lib/content/pages";
import { getSiteSettings } from "@/lib/content/site-settings";
import { env, type Lang } from "@/lib/env";
import { pathFor } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";
import { UI } from "@/lib/ui-strings";
import { notFoundMetadata } from "../not-found/metadata";
import { ogImage, otherLang } from "../shared/page-data";
import type { HomePage } from "./home.data";

/**
 * Metadata trang chủ: title tuyệt đối (không ghép titleTemplate) — homePage.seo.title, trống thì mẫu seo_plan
 * «{brandName} – Tư vấn bất động sản {khu vực}». hreflang chỉ khi bản ngôn ngữ kia tồn tại và đang bật.
 */
export async function homeMetadata(lang: Lang): Promise<Metadata> {
  const [settings, page] = await Promise.all([getSiteSettings(lang), getPage<HomePage>("homePage", lang)]);
  if (!env.languages.includes(lang)) return notFoundMetadata(lang);
  const other = otherLang(lang);
  const hasOther = env.languages.includes(other) && (await getPage("homePage", other)) !== null;
  const fallbackTitle = settings.area ? `${settings.brandName} – ${UI[lang].seo.homeTopic} ${settings.area}` : settings.brandName;
  return buildMetadata({
    lang,
    path: pathFor("home", lang),
    absoluteTitle: page?.seo?.title?.trim() || fallbackTitle,
    description: page?.seo?.description,
    settings,
    translations: hasOther ? { [other]: pathFor("home", other) } : {},
    image: ogImage(page?.seo?.ogImage, settings),
    noindex: page?.seo?.noindex === true,
    type: "profile",
  });
}

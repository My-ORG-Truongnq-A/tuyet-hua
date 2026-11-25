import type { Metadata } from "next";
import { getNavigation, getPage, type PageType } from "@/lib/content/pages";
import { getSiteSettings, type SiteSettings } from "@/lib/content/site-settings";
import type { ImageField, PageDocument } from "@/lib/content/types";
import { env, type Lang } from "@/lib/env";
import { breadcrumbNode } from "@/lib/json-ld";
import { navLabel } from "@/lib/navigation";
import { ogCard, ogFromImage } from "@/lib/og";
import { pathFor, type PageKey } from "@/lib/routes";
import { buildMetadata, type MetadataInput } from "@/lib/seo";
import { SITE_URL } from "@/lib/site-url";
import { truncateWords } from "@/lib/text";
import { fillPattern, UI } from "@/lib/ui-strings";
import type { Crumb } from "@/components/layout/Breadcrumb";
import { notFoundMetadata } from "../not-found/metadata";

/**
 * Dữ liệu / metadata dùng chung cho template trang (P4). Mọi trang đọc qua lớp dữ liệu (lib/content),
 * metadata qua buildMetadata, breadcrumb hiển thị và JSON-LD dùng cùng danh sách mục.
 */
export type DescriptionKey = keyof (typeof UI)["vi"]["seo"]["descriptions"];

export const otherLang = (lang: Lang): Lang => (lang === "vi" ? "en" : "vi");

/**
 * Ảnh OG (SEO-14, JPEG 1200×630): ảnh riêng theo thứ tự ưu tiên (seo.ogImage → ảnh đại diện / ảnh bìa)
 * → ảnh mặc định siteSettings → thẻ soạn sẵn của loại trang. Luôn có ảnh; alt để trống thì buildMetadata lấy title.
 */
export function ogImage(
  own: (ImageField | null | undefined)[],
  settings: SiteSettings,
  page: PageKey,
  lang: Lang,
): NonNullable<MetadataInput["image"]> {
  for (const image of [...own, settings.seo.ogImage]) {
    const og = ogFromImage(image, "");
    if (og) return og;
  }
  return ogCard(page, lang, "");
}

/** Mô tả: seo.description → đoạn mở đầu → mẫu seo_plan (điền từ CMS) → mặc định siteSettings. */
export function pageDescription(
  lang: Lang,
  settings: SiteSettings,
  key: DescriptionKey,
  candidates: (string | null | undefined)[],
  values: Record<string, string | null | undefined> = {},
): string | null {
  const own = candidates.find((c) => typeof c === "string" && c.trim());
  if (own) return truncateWords(own);
  return fillPattern(UI[lang].seo.descriptions[key], { personName: settings.personName, area: settings.area, ...values });
}

type StaticPageArgs = { type: PageType; key: PageKey; lang: Lang; descKey: DescriptionKey; ogType?: MetadataInput["type"] };

/** Metadata trang tĩnh: hreflang chỉ khi bản ngôn ngữ kia tồn tại và đang bật (REQ-17). */
export async function staticPageMetadata({ type, key, lang, descKey, ogType }: StaticPageArgs): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage(type, lang), getSiteSettings(lang)]);
  if (!page || !env.languages.includes(lang)) return notFoundMetadata(lang);
  const other = otherLang(lang);
  const hasOther = env.languages.includes(other) && (await getPage(type, other)) !== null;
  const seo = page.seo ?? null;
  return buildMetadata({
    lang,
    path: pathFor(key, lang),
    title: seo?.title || page.title || UI[lang].pages[key],
    description: pageDescription(lang, settings, descKey, [seo?.description, typeof page.intro === "string" ? page.intro : null]),
    settings,
    translations: hasOther ? { [other]: pathFor(key, other) } : {},
    image: ogImage([seo?.ogImage], settings, key, lang),
    noindex: seo?.noindex === true,
    type: ogType,
  });
}

/** Trang tĩnh + siteSettings + menu cho template; null khi ngôn ngữ tắt hoặc chưa có document. */
export async function loadStaticPage<T extends PageDocument>(type: PageType, lang: Lang) {
  if (!env.languages.includes(lang)) return null;
  const [page, settings, nav] = await Promise.all([getPage<T>(type, lang), getSiteSettings(lang), getNavigation()]);
  return page ? { page, settings, nav } : null;
}

/** Breadcrumb: Trang chủ (ui.breadcrumbHomeLabel) › mục menu › trang. Nhãn mục lấy từ menu CMS. */
export function breadcrumbs(
  lang: Lang,
  settings: SiteSettings,
  nav: Awaited<ReturnType<typeof getNavigation>>,
  trail: ({ target: string; key: PageKey } | Crumb)[],
): Crumb[] {
  const home: Crumb = { label: settings.ui.breadcrumbHome ?? UI[lang].pages.home, path: pathFor("home", lang) };
  return [
    home,
    ...trail.map((c) =>
      "key" in c ? { label: navLabel(nav.header.navItems, c.target, lang) ?? UI[lang].pages[c.key], path: pathFor(c.key, lang) } : c,
    ),
  ];
}

export const breadcrumbJsonLd = (items: Crumb[]) => breadcrumbNode(SITE_URL, items.map((c) => ({ name: c.label, path: c.path })));

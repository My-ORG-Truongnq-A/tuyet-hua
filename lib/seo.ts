import type { Metadata } from "next";
import type { SiteSettings } from "./content/site-settings";
import { env, type Lang } from "./env";
import { indexingAllowed } from "./indexing";
import { absoluteUrlFor, SITE_HOST, SITE_URL } from "./site-url";

/**
 * buildMetadata — mọi route dùng hàm này (SEO): title thương hiệu, description, canonical tuyệt đối,
 * hreflang chỉ khi có bản dịch thật, Open Graph, robots theo indexing guard (SEO-01).
 */
export type MetadataInput = {
  lang: Lang;
  /** Đường dẫn canonical của chính trang. */
  path: string;
  /** Tiêu đề trang, ghép titleTemplate của siteSettings. */
  title?: string | null;
  /** Tiêu đề tuyệt đối (trang chủ). */
  absoluteTitle?: string;
  description?: string | null;
  settings: SiteSettings;
  /** Đường dẫn bản dịch đang có, theo ngôn ngữ (không gồm chính trang). */
  translations?: Partial<Record<Lang, string>>;
  image?: { url: string; width?: number; height?: number; alt?: string } | null;
  noindex?: boolean;
  type?: "website" | "article" | "profile";
};

export type MetadataContext = { siteUrl: string; indexable: boolean; languages: readonly Lang[] };

const OG_LOCALE: Record<Lang, string> = { vi: "vi_VN", en: "en_US" };

export function buildMetadataFor(input: MetadataInput, ctx: MetadataContext): Metadata {
  const { lang, settings } = input;
  const abs = (p: string) => absoluteUrlFor(ctx.siteUrl, p);
  const canonical = abs(input.path);
  const title =
    input.absoluteTitle ??
    (input.title ? settings.seo.titleTemplate.replace("%s", input.title) : settings.personName || undefined);
  const description = input.description?.trim() || settings.seo.description || undefined;

  const paths: Partial<Record<Lang, string>> = { ...input.translations, [lang]: input.path };
  const languages: Record<string, string> = {};
  for (const l of ctx.languages) {
    const p = paths[l];
    if (p) languages[l] = abs(p);
  }
  if (languages.vi) languages["x-default"] = languages.vi;

  const indexable = ctx.indexable && !input.noindex;
  // SEO-14: ảnh OG có width / height / alt (alt trống → title trang).
  const images = input.image ? [{ ...input.image, url: abs(input.image.url), alt: input.image.alt || title }] : undefined;

  return {
    metadataBase: new URL(ctx.siteUrl),
    title: title ? { absolute: title } : undefined,
    description,
    alternates: { canonical, languages },
    robots: { index: indexable, follow: indexable },
    openGraph: {
      type: input.type === "article" ? "article" : input.type === "profile" ? "profile" : "website",
      url: canonical,
      siteName: settings.personName || undefined,
      title,
      description,
      locale: OG_LOCALE[lang],
      images,
    },
    twitter: { card: images ? "summary_large_image" : "summary", title, description, images },
  };
}

/** Site có được index không (theo cấu hình; header X-Robots-Tag xử lý thêm theo host). */
export const SITE_INDEXABLE = indexingAllowed({
  isProductionDeploy: env.isProductionDeploy,
  allowIndexing: env.allowIndexing,
  canonicalHost: SITE_HOST,
});

export function buildMetadata(input: MetadataInput): Metadata {
  return buildMetadataFor(input, { siteUrl: SITE_URL, indexable: SITE_INDEXABLE, languages: env.languages });
}

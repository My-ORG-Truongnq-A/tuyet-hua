import { cache } from "react";
import { pickLocale, type Lang, type Localized } from "../i18n";
import { fetchContent } from "./index";
import { SITE_SETTINGS_QUERY } from "./queries";

/** Dữ kiện doanh nghiệp — MỘT nguồn cho header, footer, JSON-LD, llms.txt (GEO-03, ND-05). */
export type RawSiteSettings = {
  _updatedAt?: string;
  personName?: string | null;
  jobTitle?: Localized | null;
  organization?: string | null;
  tagline?: Localized | null;
  phone?: string | null;
  zaloPhone?: string | null;
  email?: string | null;
  area?: Localized | null;
  socials?: { _key?: string; platform?: string | null; url?: string | null }[] | null;
  seoDefaults?: { titleTemplate?: string | null; description?: Localized | null } | null;
};

export type SiteSettings = {
  updatedAt: string | null;
  personName: string;
  jobTitle: string | null;
  organization: string | null;
  tagline: string | null;
  phone: string | null;
  /** Số Zalo; thiếu thì dùng phone. Không có số mặc định trong code. */
  zaloPhone: string | null;
  email: string | null;
  area: string | null;
  socials: { platform: string; url: string }[];
  seo: { titleTemplate: string; description: string | null };
};

const text = (v: string | null | undefined) => (typeof v === "string" && v.trim() ? v.trim() : null);

export function normalizeSiteSettings(raw: RawSiteSettings | null | undefined, lang: Lang): SiteSettings {
  const phone = text(raw?.phone);
  return {
    updatedAt: raw?._updatedAt ?? null,
    personName: text(raw?.personName) ?? "",
    jobTitle: pickLocale(raw?.jobTitle, lang),
    organization: text(raw?.organization),
    tagline: pickLocale(raw?.tagline, lang),
    phone,
    zaloPhone: text(raw?.zaloPhone) ?? phone,
    email: text(raw?.email),
    area: pickLocale(raw?.area, lang),
    socials: (raw?.socials ?? []).flatMap((s) =>
      text(s.platform) && text(s.url) ? [{ platform: s.platform!.trim(), url: s.url!.trim() }] : [],
    ),
    seo: {
      titleTemplate: text(raw?.seoDefaults?.titleTemplate) ?? "%s",
      description: pickLocale(raw?.seoDefaults?.description, lang),
    },
  };
}

/** Một lần đọc mỗi request (React cache), dữ liệu cache theo tag ở tầng nguồn. */
export const getSiteSettings = cache(async (lang: Lang): Promise<SiteSettings> => {
  const raw = await fetchContent<RawSiteSettings | null>(SITE_SETTINGS_QUERY, { tags: ["siteSettings"] });
  return normalizeSiteSettings(raw, lang);
});

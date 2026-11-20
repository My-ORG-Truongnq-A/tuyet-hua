import { cache } from "react";
import { pickLocale, type Lang, type Localized } from "../i18n";
import { loadContent } from "./index";
import { SITE_SETTINGS_QUERY } from "./queries";
import type { Figure, ImageField } from "./types";

/** Dữ kiện doanh nghiệp — MỘT nguồn cho header, footer, JSON-LD, llms.txt (GEO-03, ND-05, REQ-18). */
type L = Localized | null | undefined;

export type RawSiteSettings = {
  _updatedAt?: string;
  brandName?: string | null;
  personName?: string | null;
  jobTitle?: L;
  tagline?: L;
  logo?: Figure | null;
  contact?: {
    phone?: string | null;
    zaloPhone?: string | null;
    email?: string | null;
    address?: {
      streetAddress?: string | null;
      ward?: string | null;
      locality?: string | null;
      region?: string | null;
      country?: string | null;
    } | null;
    serviceArea?: L;
    openingHours?: { days?: string[] | null; opens?: string | null; closes?: string | null }[] | null;
    openingHoursNote?: L;
    socialLinks?: { platform?: string | null; url?: string | null }[] | null;
  } | null;
  ui?: {
    zaloCtaLabel?: L;
    callCtaLabel?: L;
    consultCtaLabel?: L;
    joinTeamCta?: { label?: L; kind?: string | null; href?: string | null } | null;
    languageSwitchLabel?: L;
    readMoreLabel?: L;
    breadcrumbHomeLabel?: L;
    notFound?: { title?: L; body?: L } | null;
  } | null;
  seoDefaults?: { titleTemplate?: L; description?: L; ogImage?: ImageField | null } | null;
  blog?: { postsPerPage?: number | null } | null;
  integrations?: { gtmId?: string | null; ga4Id?: string | null; gscVerification?: string | null } | null;
};

export type SiteSettings = {
  updatedAt: string | null;
  brandName: string;
  personName: string;
  jobTitle: string | null;
  tagline: string | null;
  logo: Figure | null;
  phone: string | null;
  /** Số Zalo; thiếu thì dùng phone. Không có số mặc định trong code. */
  zaloPhone: string | null;
  email: string | null;
  address: NonNullable<NonNullable<RawSiteSettings["contact"]>["address"]> | null;
  area: string | null;
  openingHours: { days: string[]; opens: string; closes: string }[];
  openingHoursNote: string | null;
  socials: { platform: string; url: string }[];
  ui: {
    zaloCta: string | null;
    callCta: string | null;
    consultCta: string | null;
    joinTeam: { label: string | null; kind: "zalo" | "phone" | "external"; href: string | null };
    languageSwitch: string | null;
    readMore: string | null;
    breadcrumbHome: string | null;
    notFoundTitle: string | null;
    notFoundBody: string | null;
  };
  seo: { titleTemplate: string; description: string | null; ogImage: ImageField | null };
  postsPerPage: number | null;
  integrations: { gtmId: string | null; ga4Id: string | null; gscVerification: string | null };
};

const text = (v: string | null | undefined) => (typeof v === "string" && v.trim() ? v.trim() : null);
const hasAny = (o: object | null | undefined) => !!o && Object.values(o).some((v) => typeof v === "string" && v.trim());

export function normalizeSiteSettings(raw: RawSiteSettings | null | undefined, lang: Lang): SiteSettings {
  const c = raw?.contact;
  const ui = raw?.ui;
  const phone = text(c?.phone);
  const kind = ui?.joinTeamCta?.kind;
  const template = pickLocale(raw?.seoDefaults?.titleTemplate, lang);
  return {
    updatedAt: raw?._updatedAt ?? null,
    brandName: text(raw?.brandName) ?? text(raw?.personName) ?? "",
    personName: text(raw?.personName) ?? "",
    jobTitle: pickLocale(raw?.jobTitle, lang),
    tagline: pickLocale(raw?.tagline, lang),
    logo: raw?.logo?.image ? raw.logo : null,
    phone,
    zaloPhone: text(c?.zaloPhone) ?? phone,
    email: text(c?.email),
    address: hasAny(c?.address) ? c!.address! : null,
    area: pickLocale(c?.serviceArea, lang),
    openingHours: (c?.openingHours ?? []).flatMap((h) =>
      h.days?.length && text(h.opens) && text(h.closes) ? [{ days: h.days, opens: h.opens!, closes: h.closes! }] : [],
    ),
    openingHoursNote: pickLocale(c?.openingHoursNote, lang),
    socials: (c?.socialLinks ?? []).flatMap((s) =>
      text(s.platform) && text(s.url) ? [{ platform: s.platform!.trim(), url: s.url!.trim() }] : [],
    ),
    ui: {
      zaloCta: pickLocale(ui?.zaloCtaLabel, lang),
      callCta: pickLocale(ui?.callCtaLabel, lang),
      consultCta: pickLocale(ui?.consultCtaLabel, lang),
      joinTeam: {
        label: pickLocale(ui?.joinTeamCta?.label, lang),
        kind: kind === "phone" || kind === "external" ? kind : "zalo",
        href: kind === "external" ? text(ui?.joinTeamCta?.href) : null,
      },
      languageSwitch: pickLocale(ui?.languageSwitchLabel, lang),
      readMore: pickLocale(ui?.readMoreLabel, lang),
      breadcrumbHome: pickLocale(ui?.breadcrumbHomeLabel, lang),
      notFoundTitle: pickLocale(ui?.notFound?.title, lang),
      notFoundBody: pickLocale(ui?.notFound?.body, lang),
    },
    seo: {
      titleTemplate: template?.includes("%s") ? template : "%s",
      description: pickLocale(raw?.seoDefaults?.description, lang),
      ogImage: raw?.seoDefaults?.ogImage?.asset ? raw.seoDefaults.ogImage : null,
    },
    postsPerPage: typeof raw?.blog?.postsPerPage === "number" ? raw.blog.postsPerPage : null,
    integrations: {
      gtmId: text(raw?.integrations?.gtmId),
      ga4Id: text(raw?.integrations?.ga4Id),
      gscVerification: text(raw?.integrations?.gscVerification),
    },
  };
}

/** Một lần đọc mỗi request (React cache), dữ liệu cache theo tag ở tầng nguồn. */
export const getSiteSettings = cache(async (lang: Lang): Promise<SiteSettings> => {
  const raw = await loadContent<RawSiteSettings | null>(SITE_SETTINGS_QUERY, { tags: ["siteSettings"] });
  return normalizeSiteSettings(raw, lang);
});

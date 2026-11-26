import { telHref, zaloHref } from "./contact";
import type { LinkValue } from "./content/types";
import type { Lang } from "./env";
import { pathFor, type PageKey } from "./routes";

/**
 * Liên kết từ CMS (object `link`) → href thật (T3.4). Một nguồn cho mọi nút: Zalo / gọi lấy số từ siteSettings,
 * nội bộ tham chiếu singleton trang (_id cố định <type>-<lang> — D-05). Không xác định được → null (ẩn nút).
 */
export type ResolvedLink = {
  href: string;
  label: string | null;
  kind: "zalo" | "phone" | "internal" | "external";
  external: boolean;
};

export type LinkContext = { lang: Lang; zaloPhone: string | null; phone: string | null };

/** Loại singleton trang → pageKey của lib/routes. */
export const PAGE_TYPE_TO_KEY: Record<string, PageKey> = {
  homePage: "home",
  aboutPage: "about",
  projectsPage: "projects",
  teamPage: "team",
  articlesPage: "posts",
  contactPage: "contact",
  privacyPage: "privacy",
};

/** Giá trị target của mục menu CMS (NAV_TARGETS) → pageKey; "services", "partners" chưa có trang (MI-03). */
const NAV_TARGET_TO_KEY: Record<string, PageKey> = {
  home: "home",
  about: "about",
  projects: "projects",
  team: "team",
  articles: "posts",
  contact: "contact",
  privacy: "privacy",
};

export function navTargetPath(target: string | null | undefined, lang: Lang): string | null {
  const key = target ? NAV_TARGET_TO_KEY[target] : undefined;
  return key ? pathFor(key, lang) : null;
}

function internalPath(ref: string | undefined, lang: Lang): string | null {
  const m = ref?.match(/^([A-Za-z]+)-(vi|en)$/);
  const key = m ? PAGE_TYPE_TO_KEY[m[1]!] : undefined;
  return key ? pathFor(key, lang) : null;
}

export function resolveLink(link: LinkValue | null | undefined, ctx: LinkContext): ResolvedLink | null {
  if (!link?.kind) return null;
  const label = link.label?.trim() || null;
  let href: string | null = null;
  switch (link.kind) {
    case "zalo":
      href = zaloHref(ctx.zaloPhone);
      break;
    case "phone":
      href = telHref(ctx.phone);
      break;
    case "internal":
      href = internalPath(link.internal?._ref, ctx.lang);
      break;
    case "external":
      href = link.href && /^https:\/\/[^\s]+$/.test(link.href) ? link.href : null;
      break;
  }
  if (!href) return null;
  return { href, label, kind: link.kind, external: link.kind === "zalo" || link.kind === "external" };
}

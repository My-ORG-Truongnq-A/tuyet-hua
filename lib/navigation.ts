import type { NavItem } from "./content/types";
import type { Lang } from "./env";
import { pickLocale } from "./i18n";
import { navTargetPath } from "./links";

/**
 * Menu từ singleton header / footer trong CMS (T3.1, REQ-29): bỏ mục ẩn, mục chưa có trang, mục thiếu nhãn ở
 * ngôn ngữ đang xem (không fallback — REQ-17). Tối đa 7 mục chữ: đủ 8 mục thì bỏ «Trang chủ».
 */
export type SiteNavItem = { target: string; href: string; label: string };

export const MAX_NAV_ITEMS = 7;

export function buildNav(items: NavItem[] | null | undefined, lang: Lang): SiteNavItem[] {
  const out = (items ?? []).flatMap((it) => {
    if (it.visible === false || !it.target) return [];
    const href = navTargetPath(it.target, lang);
    const label = pickLocale(it.label ?? null, lang);
    return href && label ? [{ target: it.target, href, label }] : [];
  });
  return out.length > MAX_NAV_ITEMS ? out.filter((x) => x.target !== "home").slice(0, MAX_NAV_ITEMS) : out;
}

/** Nhãn menu của một trang (breadcrumb, H1 danh sách bài — MI-02). */
export function navLabel(items: NavItem[] | null | undefined, target: string, lang: Lang): string | null {
  const it = (items ?? []).find((x) => x.target === target);
  return it ? pickLocale(it.label ?? null, lang) : null;
}

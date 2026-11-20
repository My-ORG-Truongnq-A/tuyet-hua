import type { Lang } from "./env";

/**
 * Bảng pageKey → đường dẫn theo ngôn ngữ (BP-01). vi không tiền tố, en dưới /en (SEO-16).
 * Thêm trang = thêm một dòng ở đây; route /dich-vu, /doi-tac chỉ thêm khi khách chốt (MI-03).
 * Module thuần (không import runtime) để client component dùng được.
 */
export const ROUTES = {
  home: { vi: "/", en: "/en" },
  about: { vi: "/gioi-thieu", en: "/en/about" },
  projects: { vi: "/du-an", en: "/en/projects" },
  projectDetail: { vi: "/du-an/:slug", en: "/en/projects/:slug" },
  team: { vi: "/dao-tao-doi-ngu", en: "/en/training-and-team" },
  posts: { vi: "/bai-viet", en: "/en/articles" },
  postDetail: { vi: "/bai-viet/:slug", en: "/en/articles/:slug" },
  contact: { vi: "/lien-he", en: "/en/contact" },
  privacy: { vi: "/chinh-sach-bao-mat", en: "/en/privacy-policy" },
} as const satisfies Record<string, Record<Lang, string>>;

export type PageKey = keyof typeof ROUTES;
export type RouteParams = { slug?: string };
export type RouteMatch = { key: PageKey; lang: Lang; params: RouteParams };

const LANGS: Lang[] = ["vi", "en"];

export function pathFor(key: PageKey, lang: Lang, params: RouteParams = {}): string {
  return ROUTES[key][lang].replace(":slug", () => {
    if (!params.slug) throw new Error(`pathFor(${key}): thiếu slug`);
    return encodeURIComponent(params.slug);
  });
}

function normalize(pathname: string): string {
  const p = pathname.split(/[?#]/)[0] ?? "/";
  return p.length > 1 ? p.replace(/\/+$/, "") : "/";
}

export function matchPath(pathname: string): RouteMatch | null {
  const path = normalize(pathname);
  for (const key of Object.keys(ROUTES) as PageKey[]) {
    for (const lang of LANGS) {
      const pattern = ROUTES[key][lang];
      const re = new RegExp(`^${pattern.replace(":slug", "([^/]+)")}$`);
      const m = path.match(re);
      if (m) return { key, lang, params: m[1] ? { slug: decodeURIComponent(m[1]) } : {} };
    }
  }
  return null;
}

/** Đường dẫn tương ứng ở ngôn ngữ khác cho trang tĩnh; trang có slug cần bảng bản dịch (CMS) nên trả null. */
export function alternatePath(pathname: string, target: Lang): string | null {
  const match = matchPath(pathname);
  if (!match || match.params.slug) return null;
  return pathFor(match.key, target);
}

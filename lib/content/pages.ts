import { cache } from "react";
import type { Lang } from "../i18n";
import { loadContent } from "./index";
import {
  NAVIGATION_QUERY,
  PAGE_QUERY,
  POST_BY_SLUG_QUERY,
  POST_COUNT_QUERY,
  POST_LIST_QUERY,
  PROJECT_BY_SLUG_QUERY,
  PROJECT_LIST_QUERY,
  REDIRECTS_QUERY,
  TESTIMONIALS_QUERY,
  TRANSLATIONS_QUERY,
} from "./queries";
import type { NavItem, PageDocument, PostListItem, ProjectListItem, Testimonial } from "./types";

/**
 * Getter nội dung theo trang. Tag cache = tên loại nội dung (KT-02): webhook làm mới đúng loại vừa publish.
 * Mọi getter đi qua loadContent → cùng truy vấn, cùng hậu xử lý cho seed và Sanity.
 */
export const PAGE_TYPES = [
  "homePage",
  "aboutPage",
  "projectsPage",
  "teamPage",
  "articlesPage",
  "contactPage",
  "privacyPage",
] as const;
export type PageType = (typeof PAGE_TYPES)[number];

/** Số bài mỗi trang khi siteSettings.blog.postsPerPage trống. */
export const DEFAULT_POSTS_PER_PAGE = 9;

export const getPage = cache(
  <T extends PageDocument = PageDocument>(type: PageType, lang: Lang): Promise<T | null> =>
    loadContent<T | null>(PAGE_QUERY, { params: { type, lang }, tags: [type] }),
);

export const getProjects = cache(
  (lang: Lang): Promise<ProjectListItem[]> =>
    loadContent<ProjectListItem[]>(PROJECT_LIST_QUERY, { params: { lang }, tags: ["project"] }),
);

export const getProjectBySlug = cache(
  <T extends PageDocument = PageDocument>(lang: Lang, slug: string): Promise<T | null> =>
    loadContent<T | null>(PROJECT_BY_SLUG_QUERY, { params: { lang, slug }, tags: ["project"] }),
);

/** Trang bài viết thứ `page` (bắt đầu từ 1). */
export const getPosts = cache(
  async (lang: Lang, page = 1, perPage = DEFAULT_POSTS_PER_PAGE): Promise<{ items: PostListItem[]; total: number }> => {
    const start = Math.max(0, (Math.max(1, Math.floor(page)) - 1) * perPage);
    const [items, total] = await Promise.all([
      loadContent<PostListItem[]>(POST_LIST_QUERY, { params: { lang, start, end: start + perPage }, tags: ["post"] }),
      loadContent<number>(POST_COUNT_QUERY, { params: { lang }, tags: ["post"] }),
    ]);
    return { items, total };
  },
);

export const getPostBySlug = cache(
  <T extends PageDocument = PageDocument>(lang: Lang, slug: string): Promise<T | null> =>
    loadContent<T | null>(POST_BY_SLUG_QUERY, { params: { lang, slug }, tags: ["post"] }),
);

export const getTestimonials = cache(
  (lang: Lang): Promise<Testimonial[]> => loadContent<Testimonial[]>(TESTIMONIALS_QUERY, { params: { lang }, tags: ["testimonial"] }),
);

export type TranslationRef = { _type: string; language: string; slug?: string | null };

/** Bản dịch của project / post (nút chuyển ngôn ngữ, hreflang). Không có bản dịch → []. */
export const getTranslations = cache(
  async (id: string): Promise<TranslationRef[]> =>
    ((await loadContent<(TranslationRef | null)[] | null>(TRANSLATIONS_QUERY, {
      params: { id },
      tags: ["translation.metadata"],
    })) ?? []).filter((t): t is TranslationRef => !!t?.language),
);

export type RedirectRule = { from: string; to: string; permanent: boolean };

export const getRedirects = cache(async (): Promise<RedirectRule[]> => {
  const list = await loadContent<{ from?: string; to?: string; permanent?: boolean }[] | null>(REDIRECTS_QUERY, {
    tags: ["siteSettings"],
  });
  return (list ?? []).flatMap((r) => (r.from && r.to ? [{ from: r.from, to: r.to, permanent: r.permanent !== false }] : []));
});

export type Navigation = {
  header: { navItems: NavItem[]; showLanguageSwitch: boolean };
  footer: { navItems: NavItem[]; legalItems: NavItem[]; copyrightText: { vi?: string | null; en?: string | null } | null };
};

export const getNavigation = cache(async (): Promise<Navigation> => {
  const raw = await loadContent<{
    header?: { navItems?: NavItem[] | null; showLanguageSwitch?: boolean | null } | null;
    footer?: { navItems?: NavItem[] | null; legalItems?: NavItem[] | null; copyrightText?: Navigation["footer"]["copyrightText"] } | null;
  }>(NAVIGATION_QUERY, { tags: ["header", "footer"] });
  return {
    header: { navItems: raw.header?.navItems ?? [], showLanguageSwitch: raw.header?.showLanguageSwitch === true },
    footer: {
      navItems: raw.footer?.navItems ?? [],
      legalItems: raw.footer?.legalItems ?? [],
      copyrightText: raw.footer?.copyrightText ?? null,
    },
  };
});

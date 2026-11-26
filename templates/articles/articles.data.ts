import type { Metadata } from "next";
import { cache } from "react";
import { DEFAULT_POSTS_PER_PAGE, getPostBySlug, getPosts, getTranslations } from "@/lib/content/pages";
import { getSiteSettings } from "@/lib/content/site-settings";
import type { Figure, PageDocument } from "@/lib/content/types";
import { env, type Lang } from "@/lib/env";
import { resolvePage } from "@/lib/pagination";
import type { PortableValue } from "@/lib/portable-text";
import { pathFor } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";
import { truncateWords } from "@/lib/text";
import { UI } from "@/lib/ui-strings";
import { notFoundMetadata } from "../not-found/metadata";
import { ogImage, staticPageMetadata } from "../shared/page-data";

export type Post = PageDocument & {
  title: string;
  publishedAt?: string | null;
  excerpt?: string | null;
  coverImage?: Figure | null;
  body?: PortableValue;
  faqs?: { _key?: string; question?: string | null; answer?: PortableValue }[] | null;
};

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Trang bài viết thứ N (T3.11): ?trang sai / vượt số trang → null (404). */
export const loadPostPage = cache(async (lang: Lang, raw: string | string[] | undefined) => {
  if (!env.languages.includes(lang)) return null;
  const settings = await getSiteSettings(lang);
  const perPage = settings.postsPerPage && settings.postsPerPage > 0 ? settings.postsPerPage : DEFAULT_POSTS_PER_PAGE;
  const first = await getPosts(lang, 1, perPage);
  const page = resolvePage(raw, first.total, perPage);
  if (!page) return null;
  const list = page.page === 1 ? first : await getPosts(lang, page.page, perPage);
  return { ...page, items: list.items, total: list.total };
});

/** Danh sách bài: trang ≥ 2 canonical tự trỏ chính nó (?trang=N), tiêu đề thêm «Trang N». */
export async function articlesMetadata(lang: Lang, raw: string | string[] | undefined): Promise<Metadata> {
  const pageData = await loadPostPage(lang, raw);
  if (!pageData) return notFoundMetadata(lang);
  const base = await staticPageMetadata({ type: "articlesPage", key: "posts", lang, descKey: "posts" });
  if (pageData.page === 1) return base;
  const path = `${pathFor("posts", lang)}?trang=${pageData.page}`;
  const title = typeof base.title === "object" && base.title && "absolute" in base.title ? base.title.absolute : null;
  return {
    ...base,
    title: title ? { absolute: `${title} – ${UI[lang].pagination.page(pageData.page)}` } : base.title,
    alternates: { canonical: new URL(path, base.metadataBase ?? undefined).toString() },
  };
}

export const loadPost = cache(async (lang: Lang, slug: string): Promise<Post | null> => {
  if (!env.languages.includes(lang)) return null;
  return getPostBySlug<Post>(lang, slug);
});

export async function postTranslations(id: string, lang: Lang): Promise<Partial<Record<Lang, string>>> {
  const out: Partial<Record<Lang, string>> = {};
  for (const r of await getTranslations(id)) {
    const l = r.language as Lang;
    if (l !== lang && env.languages.includes(l) && r.slug && r._type === "post") out[l] = pathFor("postDetail", l, { slug: r.slug });
  }
  return out;
}

export async function postStaticParams(lang: Lang) {
  if (!env.languages.includes(lang)) return [];
  const { total } = await getPosts(lang, 1, 1);
  if (!total) return [];
  return (await getPosts(lang, 1, total)).items.map((p) => ({ slug: p.slug }));
}

export async function postMetadata(lang: Lang, slug: string): Promise<Metadata> {
  const [post, settings] = await Promise.all([loadPost(lang, slug), getSiteSettings(lang)]);
  if (!post) return notFoundMetadata(lang);
  return buildMetadata({
    lang,
    path: pathFor("postDetail", lang, { slug }),
    title: post.seo?.title || post.title,
    description: truncateWords(post.seo?.description || post.excerpt),
    settings,
    translations: await postTranslations(post._id, lang),
    image: ogImage([post.seo?.ogImage, post.coverImage?.pending ? null : post.coverImage?.image], settings, "postDetail", lang),
    noindex: post.seo?.noindex === true,
    type: "article",
  });
}

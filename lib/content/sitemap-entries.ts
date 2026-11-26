import { env, type Lang } from "../env";
import { PAGE_TYPE_TO_KEY } from "../links";
import { pathFor, type PageKey } from "../routes";
import type { SitemapEntry } from "../sitemaps";
import { BUILT_PAGES } from "../ui-strings";
import { getPage, getPostBySlug, getPosts, getProjectBySlug, getProjects, getTranslations, type PageType } from "./pages";
import type { PageDocument } from "./types";

/**
 * Mục sitemap theo loại (T5.2), đọc qua lớp dữ liệu: chỉ trang có document ở ngôn ngữ đang bật, bỏ seo.noindex,
 * không có ?trang=N; hreflang chỉ khi có bản dịch thật. Thêm dự án / bài trong CMS → tự có trong sitemap.
 */
const KEY_TO_TYPE = Object.fromEntries(Object.entries(PAGE_TYPE_TO_KEY).map(([type, key]) => [key, type])) as Partial<Record<PageKey, PageType>>;

const indexable = (doc: PageDocument | null) => Boolean(doc) && doc!.seo?.noindex !== true;

export async function pageEntries(): Promise<SitemapEntry[]> {
  const out: SitemapEntry[] = [];
  for (const key of BUILT_PAGES) {
    const type = KEY_TO_TYPE[key];
    if (!type) continue;
    const docs = await Promise.all(env.languages.map(async (lang) => [lang, await getPage(type, lang)] as const));
    const present = docs.filter(([, d]) => indexable(d));
    const alternates = Object.fromEntries(present.map(([l]) => [l, pathFor(key, l)]));
    for (const [lang, doc] of present) out.push({ path: pathFor(key, lang), lastModified: doc!._updatedAt, alternates });
  }
  return out;
}

async function detailEntries(
  kind: "project" | "post",
  list: (lang: Lang) => Promise<{ _id: string; slug: string; _updatedAt?: string }[]>,
): Promise<SitemapEntry[]> {
  const key: PageKey = kind === "project" ? "projectDetail" : "postDetail";
  const bySlug = kind === "project" ? getProjectBySlug : getPostBySlug;
  const out: SitemapEntry[] = [];
  for (const lang of env.languages) {
    for (const item of await list(lang)) {
      if (!indexable(await bySlug(lang, item.slug))) continue;
      const alternates: Partial<Record<Lang, string>> = { [lang]: pathFor(key, lang, { slug: item.slug }) };
      for (const tr of await getTranslations(item._id)) {
        const l = tr.language as Lang;
        if (l !== lang && env.languages.includes(l) && tr.slug && tr._type === kind) alternates[l] = pathFor(key, l, { slug: tr.slug });
      }
      out.push({ path: alternates[lang]!, lastModified: item._updatedAt, alternates });
    }
  }
  return out;
}

export const projectEntries = () => detailEntries("project", getProjects);

export const postEntries = () =>
  detailEntries("post", async (lang) => {
    const { total } = await getPosts(lang, 1, 1);
    return total ? (await getPosts(lang, 1, total)).items : [];
  });

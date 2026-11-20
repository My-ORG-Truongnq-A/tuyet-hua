import { notFound } from "next/navigation";
import { Pagination } from "@/components/content/Pagination";
import { PendingLabel } from "@/components/content/PendingLabel";
import { Section } from "@/components/content/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import type { PageDocument } from "@/lib/content/types";
import type { Lang } from "@/lib/env";
import { graph, itemListNode, webPageNode } from "@/lib/json-ld";
import { navLabel } from "@/lib/navigation";
import { pathFor } from "@/lib/routes";
import { SITE_URL } from "@/lib/site-url";
import { UI } from "@/lib/ui-strings";
import { PostItem } from "../shared/blocks";
import { PageHero } from "../shared/PageHero";
import { breadcrumbJsonLd, breadcrumbs, loadStaticPage } from "../shared/page-data";
import { loadPostPage } from "./articles.data";

type ArticlesPage = PageDocument & { intro?: string | null; emptyStateText?: string | null };

/**
 * Danh sách bài viết (T4.13): mới nhất trước, phân trang ?trang=N. Không có bài → articlesPage.emptyStateText
 * (trống thì chỉ tiêu đề + mở đầu; preview có nhãn chờ). /en/articles chỉ liệt kê bài có bản en (GROQ theo language).
 */
export async function ArticleListTemplate({ lang, trang }: { lang: Lang; trang: string | string[] | undefined }) {
  const [data, list] = await Promise.all([loadStaticPage<ArticlesPage>("articlesPage", lang), loadPostPage(lang, trang)]);
  if (!data || !list) notFound();
  const { page, settings, nav } = data;
  const t = UI[lang];
  const base = pathFor("posts", lang);
  const title = page.title || navLabel(nav.header.navItems, "articles", lang) || t.pages.posts;
  const crumbs = breadcrumbs(lang, settings, nav, [{ target: "articles", key: "posts" }]);
  const items = list.items.map((p) => ({ name: p.title, path: pathFor("postDetail", lang, { slug: p.slug }) }));
  return (
    <>
      <JsonLd
        data={graph([
          webPageNode({
            siteUrl: SITE_URL,
            path: list.page > 1 ? `${base}?trang=${list.page}` : base,
            name: title,
            lang,
            type: "CollectionPage",
            description: page.intro,
            hasPart: items.length ? itemListNode(SITE_URL, items) : null,
          }),
          breadcrumbJsonLd(crumbs),
        ])}
      />
      <PageHero crumbs={crumbs} crumbLabel={t.breadcrumb} title={title} lead={page.intro} />
      <Section name="postList">
        {list.items.length ? (
          <div className="border-b border-(--line-subtle)">
            {list.items.map((p) => (
              <PostItem key={p._id} post={p} lang={lang} withImage headingLevel="h2" />
            ))}
          </div>
        ) : page.emptyStateText ? (
          <p className="text-lead text-(--on-page-muted)">{page.emptyStateText}</p>
        ) : (
          <PendingLabel>{t.pending.firstPost}</PendingLabel>
        )}
        <Pagination basePath={base} page={list.page} totalPages={list.totalPages} lang={lang} />
      </Section>
    </>
  );
}

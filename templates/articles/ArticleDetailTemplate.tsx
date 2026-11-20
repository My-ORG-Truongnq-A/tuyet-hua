import { notFound } from "next/navigation";
import { RichText } from "@/components/content/RichText";
import { Section } from "@/components/content/Section";
import { CtaLink } from "@/components/cta/CtaLink";
import { Figure } from "@/components/media/Figure";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getNavigation } from "@/lib/content/pages";
import { getSiteSettings } from "@/lib/content/site-settings";
import type { Lang } from "@/lib/env";
import { resolveFigure } from "@/lib/image";
import { blogPostingNode, faqPageNode, graph } from "@/lib/json-ld";
import { resolveLink } from "@/lib/links";
import { hasBlocks, toPlainText } from "@/lib/portable-text";
import { pathFor } from "@/lib/routes";
import { SITE_URL } from "@/lib/site-url";
import { formatDate, UI } from "@/lib/ui-strings";
import { CtaBand, TextLink } from "../shared/blocks";
import { breadcrumbJsonLd, breadcrumbs } from "../shared/page-data";
import { loadPost } from "./articles.data";

/**
 * Chi tiết bài viết (T4.14): H1 = tiêu đề, ảnh bìa có alt, ngày đăng / cập nhật, tác giả (Person — liên kết trang
 * Giới thiệu), nội dung rich text, câu hỏi thường gặp, CTA Zalo cuối bài. JSON-LD BlogPosting + BreadcrumbList (+ FAQPage).
 */
export async function ArticleDetailTemplate({ lang, slug }: { lang: Lang; slug: string }) {
  const post = await loadPost(lang, slug);
  if (!post) notFound();
  const [settings, nav] = await Promise.all([getSiteSettings(lang), getNavigation()]);
  const t = UI[lang];
  const path = pathFor("postDetail", lang, { slug });
  const crumbs = breadcrumbs(lang, settings, nav, [{ target: "articles", key: "posts" }, { label: post.title, path }]);
  const published = formatDate(post.publishedAt, lang);
  const updated = post._updatedAt && post._updatedAt.slice(0, 10) !== post.publishedAt?.slice(0, 10) ? formatDate(post._updatedAt, lang) : null;
  const cover = resolveFigure(post.coverImage);
  const faqs = (post.faqs ?? []).filter((f) => f.question?.trim() && hasBlocks(f.answer));
  const zalo = resolveLink({ kind: "zalo" }, { lang, zaloPhone: settings.zaloPhone, phone: settings.phone });

  return (
    <>
      <JsonLd
        data={graph([
          blogPostingNode({
            siteUrl: SITE_URL,
            path,
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt,
            dateModified: post._updatedAt,
            image: cover?.src,
            lang,
          }),
          breadcrumbJsonLd(crumbs),
          faqPageNode(faqs.map((f) => ({ question: f.question!, answer: toPlainText(f.answer) }))),
        ])}
      />
      <article data-section="article">
        <header className="container-page pt-8 pb-10 lg:pt-12">
          <Breadcrumb items={crumbs} label={t.breadcrumb} className="text-(--on-page-muted)" />
          <h1 className="mt-8 max-w-4xl font-display text-display text-(--on-page-heading) [overflow-wrap:anywhere]">{post.title}</h1>
          {post.excerpt && <p className="mt-5 max-w-(--container-prose) text-lead text-(--on-page-muted)">{post.excerpt}</p>}
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            {published && (
              <div className="flex gap-2">
                <dt className="text-(--on-page-muted)">{t.posts.published}</dt>
                <dd>
                  <time dateTime={post.publishedAt ?? undefined}>{published}</time>
                </dd>
              </div>
            )}
            {updated && (
              <div className="flex gap-2">
                <dt className="text-(--on-page-muted)">{t.posts.updated}</dt>
                <dd>
                  <time dateTime={post._updatedAt}>{updated}</time>
                </dd>
              </div>
            )}
            {settings.personName && (
              <div className="flex gap-2">
                <dt className="text-(--on-page-muted)">{t.posts.author}</dt>
                <dd>
                  <a href={pathFor("about", lang)} rel="author" className="font-medium text-emerald-800 underline-offset-4 hover:underline">
                    {settings.personName}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </header>
        <div className="container-page">
          <Figure
            figure={post.coverImage}
            lang={lang}
            hero
            sizes="(min-width: 1216px) 1152px, 100vw"
            className="overflow-hidden rounded-sm"
            imgClassName="aspect-[16/9] h-auto object-cover"
          />
          <RichText value={post.body} lang={lang} className="mx-auto mt-12 text-lead" />
        </div>
      </article>

      <Section name="faqs" heading={t.project.faqs} empty={!faqs.length}>
        <div className="mt-8 max-w-(--container-prose)">
          {faqs.map((f, i) => (
            <div key={f._key ?? i} className="border-b border-(--line-subtle) py-5">
              <h3 className="font-semibold">{f.question}</h3>
              <RichText value={f.answer} lang={lang} className="mt-2 text-(--on-page-muted)" />
            </div>
          ))}
        </div>
      </Section>

      <div className="container-page py-10">
        <TextLink href={pathFor("posts", lang)}>{t.posts.all}</TextLink>
      </div>

      <CtaBand title={t.sections.connect} body={settings.area}>
        <CtaLink link={zalo} fallbackLabel={settings.ui.zaloCta ?? t.zaloCta} />
      </CtaBand>
    </>
  );
}

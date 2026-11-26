import { notFound } from "next/navigation";
import { PendingLabel } from "@/components/content/PendingLabel";
import { QuickFacts } from "@/components/content/QuickFacts";
import { RichText } from "@/components/content/RichText";
import { Section } from "@/components/content/Section";
import { CtaLink } from "@/components/cta/CtaLink";
import { Figure } from "@/components/media/Figure";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Figure as FigureValue, LinkValue, PageDocument } from "@/lib/content/types";
import type { Lang } from "@/lib/env";
import { graph, personNode, webPageNode } from "@/lib/json-ld";
import { resolveLink } from "@/lib/links";
import { hasBlocks, type PortableValue } from "@/lib/portable-text";
import { pathFor } from "@/lib/routes";
import { SITE_URL } from "@/lib/site-url";
import { UI } from "@/lib/ui-strings";
import { CtaBand } from "../shared/blocks";
import { PageHero } from "../shared/PageHero";
import { breadcrumbJsonLd, breadcrumbs, loadStaticPage } from "../shared/page-data";

/** aboutPage (content_model). Thành tích qua gate (confirmed); ảnh qua gate (usageApproved). */
type AboutPage = PageDocument & {
  heroImage?: FigureValue | null;
  intro?: string | null;
  brandStory?: { heading?: string | null; body?: PortableValue } | null;
  positioning?: { heading?: string | null; roles?: { _key?: string; share?: number | null; title?: string | null; description?: string | null }[] | null } | null;
  bio?: PortableValue;
  timeline?: { _key?: string; period?: string | null; role?: string | null; organization?: string | null; description?: string | null }[] | null;
  achievements?: { _key?: string; title?: string | null; year?: string | null; description?: string | null; pending?: boolean }[] | null;
  cta?: LinkValue | null;
};

/**
 * Giới thiệu về tôi (T4.9 — phần chung): chân dung, chức danh, «Thông tin nhanh» dưới H1, brand story,
 * định vị 60 / 40 (positioning.roles), tiểu sử / chặng đường / thành tích (trống → ẩn), CTA Zalo trong nội dung.
 * Chỉ render khối có trường CMS (R-04): khối «cách làm việc», «khoảnh khắc» của mockup chưa có trường → chưa dựng.
 */
export async function AboutTemplate({ lang }: { lang: Lang }) {
  const data = await loadStaticPage<AboutPage>("aboutPage", lang);
  if (!data) notFound();
  const { page, settings, nav } = data;
  const t = UI[lang];
  const path = pathFor("about", lang);
  const title = page.title || t.pages.about;
  const crumbs = breadcrumbs(lang, settings, nav, [{ label: title, path }]);
  const cta = resolveLink(page.cta ?? { kind: "zalo" }, { lang, zaloPhone: settings.zaloPhone, phone: settings.phone });
  const roles = (page.positioning?.roles ?? []).filter((r) => r.title?.trim());
  const totalShare = roles.reduce((n, r) => n + (r.share ?? 0), 0);
  const timeline = (page.timeline ?? []).filter((x) => x.role?.trim() || x.period?.trim());
  const achievements = (page.achievements ?? []).filter((x) => x.title?.trim());

  return (
    <>
      <JsonLd
        data={graph([
          webPageNode({ siteUrl: SITE_URL, path, name: title, lang, type: "ProfilePage", mainEntity: true, description: page.intro }),
          personNode(settings, SITE_URL),
          breadcrumbJsonLd(crumbs),
        ])}
      />
      <PageHero
        crumbs={crumbs}
        crumbLabel={t.breadcrumb}
        eyebrow={settings.personName}
        title={title}
        lead={
          <>
            {settings.jobTitle && <p className="text-sm font-medium uppercase tracking-caps text-(--on-hero-accent)">{settings.jobTitle}</p>}
            {page.intro && <p className="mt-4">{page.intro}</p>}
          </>
        }
        actions={<CtaLink link={cta} fallbackLabel={settings.ui.zaloCta ?? t.zaloCta} />}
        media={
          <div className="order-first mx-auto w-full max-w-60 sm:max-w-72 lg:order-none lg:mr-0 lg:max-w-[24rem]">
            <Figure
              figure={page.heroImage}
              lang={lang}
              hero
              sizes="(min-width: 1024px) 24rem, (min-width: 640px) 18rem, 15rem"
              imgClassName="aspect-[4/5] h-auto rounded-sm bg-ivory-50 object-cover object-top ring-1 ring-(--line-accent)"
              placeholder={t.pending.image}
              tone="dark"
              caption={false}
            />
          </div>
        }
      />

      <section data-section="quickFacts" className="container-page pt-12">
        <QuickFacts settings={settings} lang={lang} className="max-w-2xl" />
      </section>

      <Section name="brandStory" eyebrow={t.about.story} heading={page.brandStory?.heading} empty={!page.brandStory?.heading && !hasBlocks(page.brandStory?.body)}>
        <RichText value={page.brandStory?.body} lang={lang} className="mt-6 text-lead" />
        {!hasBlocks(page.brandStory?.body) && (
          <p className="mt-6">
            <PendingLabel>{t.pending.content}</PendingLabel>
          </p>
        )}
      </Section>

      <Section name="positioning" tone="alt" eyebrow={t.about.roles} heading={page.positioning?.heading} empty={!roles.length}>
        {totalShare > 0 && (
          <div aria-hidden="true" className="mt-10 flex h-1.5 overflow-hidden rounded-xs">
            {roles.map((r, i) => (
              <span key={r._key ?? i} style={{ width: `${((r.share ?? 0) / totalShare) * 100}%` }} className={i % 2 ? "bg-gold-400" : "bg-emerald-800"} />
            ))}
          </div>
        )}
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          {roles.map((r, i) => (
            <div key={r._key ?? i}>
              {typeof r.share === "number" && <p className="font-display text-stat text-(--on-page-heading)">{r.share}%</p>}
              <h3 className="mt-2 font-display text-h3 text-(--on-page-heading)">{r.title}</h3>
              {r.description && <p className="mt-3 max-w-(--container-prose) text-(--on-page-muted)">{r.description}</p>}
            </div>
          ))}
        </div>
      </Section>

      <Section name="bio" heading={t.about.bio} empty={!hasBlocks(page.bio)}>
        <RichText value={page.bio} lang={lang} className="mt-6" />
      </Section>

      <Section name="journey" tone="alt" empty={!timeline.length && !achievements.length}>
        <div className="grid gap-12 lg:grid-cols-2">
          {timeline.length > 0 && (
            <div>
              <h2 className="font-display text-h2 text-(--on-page-heading)">{t.about.timeline}</h2>
              <ol className="mt-6 border-l border-(--line-accent) pl-6">
                {timeline.map((x, i) => (
                  <li key={x._key ?? i} className="pb-6 last:pb-0">
                    {x.period && <p className="text-sm text-(--on-page-accent)">{x.period}</p>}
                    <p className="font-medium">{[x.role, x.organization].filter(Boolean).join(" · ")}</p>
                    {x.description && <p className="mt-1 text-sm text-(--on-page-muted)">{x.description}</p>}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {achievements.length > 0 && (
            <div>
              <h2 className="font-display text-h2 text-(--on-page-heading)">{t.about.achievements}</h2>
              <ul className="mt-6 border-t border-(--on-page-heading)">
                {achievements.map((x, i) => (
                  <li key={x._key ?? i} className="border-b border-(--line-subtle) py-4">
                    <p className="font-medium">
                      {x.year && <span className="mr-3 text-(--on-page-accent)">{x.year}</span>}
                      {x.title}
                    </p>
                    {x.description && <p className="mt-1 text-sm text-(--on-page-muted)">{x.description}</p>}
                    {x.pending && <PendingLabel className="mt-2">{t.pending.confirm}</PendingLabel>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      <CtaBand title={t.sections.connect} body={settings.area}>
        <CtaLink link={cta} fallbackLabel={settings.ui.zaloCta ?? t.zaloCta} />
      </CtaBand>
    </>
  );
}

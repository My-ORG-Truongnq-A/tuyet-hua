import { notFound } from "next/navigation";
import { PendingLabel } from "@/components/content/PendingLabel";
import { RichText } from "@/components/content/RichText";
import { Section } from "@/components/content/Section";
import { CtaLink } from "@/components/cta/CtaLink";
import { Figure } from "@/components/media/Figure";
import { JsonLd } from "@/components/seo/JsonLd";
import { zaloHref, telHref } from "@/lib/contact";
import type { Figure as FigureValue, HighlightStat, PageDocument } from "@/lib/content/types";
import type { Lang } from "@/lib/env";
import { resolveFigure } from "@/lib/image";
import { graph, webPageNode } from "@/lib/json-ld";
import type { ResolvedLink } from "@/lib/links";
import { hasBlocks, type PortableValue } from "@/lib/portable-text";
import { pathFor } from "@/lib/routes";
import { SITE_URL } from "@/lib/site-url";
import { UI } from "@/lib/ui-strings";
import { CtaBand, StatList, ValueList, type ValueItem } from "../shared/blocks";
import { PageHero } from "../shared/PageHero";
import { breadcrumbJsonLd, breadcrumbs, loadStaticPage } from "../shared/page-data";

type TeamPage = PageDocument & {
  heroImage?: FigureValue | null;
  intro?: string | null;
  leaderSection?: { heading?: string | null; body?: PortableValue } | null;
  trainingPoints?: ValueItem[] | null;
  stats?: HighlightStat[] | null;
  gallery?: FigureValue[] | null;
  joinCtaHeading?: string | null;
};

/**
 * Đào tạo & Đội ngũ (T4.12, YC-04): vai trò dẫn dắt, nội dung đào tạo, số liệu (qua gate), ảnh hoạt động
 * (release chỉ ảnh đã xác nhận quyền dùng — MI-07), CTA «Tham gia đội ngũ» là LIÊN KẾT (không form ứng tuyển).
 */
export async function TeamTemplate({ lang }: { lang: Lang }) {
  const data = await loadStaticPage<TeamPage>("teamPage", lang);
  if (!data) notFound();
  const { page, settings, nav } = data;
  const t = UI[lang];
  const path = pathFor("team", lang);
  const title = page.title || t.pages.team;
  const crumbs = breadcrumbs(lang, settings, nav, [{ target: "team", key: "team" }]);
  const gallery = (page.gallery ?? []).filter((f) => resolveFigure(f));
  const pendingCount = gallery.filter((f) => f.pending).length;
  const join = settings.ui.joinTeam;
  const joinHref = join.kind === "external" ? join.href : join.kind === "phone" ? telHref(settings.phone) : zaloHref(settings.zaloPhone);
  const joinLink: ResolvedLink | null = joinHref
    ? { href: joinHref, label: join.label, kind: join.kind, external: join.kind !== "phone" }
    : null;
  const [lead, ...rest] = gallery;

  return (
    <>
      <JsonLd data={graph([webPageNode({ siteUrl: SITE_URL, path, name: title, lang, description: page.intro }), breadcrumbJsonLd(crumbs)])} />
      <PageHero
        crumbs={crumbs}
        crumbLabel={t.breadcrumb}
        title={title}
        lead={page.intro}
        actions={<CtaLink link={joinLink} fallbackLabel={t.team.join} />}
        media={
          page.heroImage ? (
            <Figure
              figure={page.heroImage}
              lang={lang}
              hero
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="overflow-hidden rounded-sm"
              imgClassName="aspect-[4/3] h-auto object-cover"
            />
          ) : undefined
        }
      />

      <Section name="leader" eyebrow={t.team.leader} heading={page.leaderSection?.heading}>
        <RichText value={page.leaderSection?.body} lang={lang} className="mt-6 text-lead" />
        {!hasBlocks(page.leaderSection?.body) && (
          <p className="mt-6">
            <PendingLabel>{t.pending.content}</PendingLabel>
          </p>
        )}
      </Section>

      <Section name="training" tone="alt" heading={t.team.training} empty={!(page.trainingPoints ?? []).some((i) => i.title?.trim())}>
        <ValueList items={page.trainingPoints ?? []} />
      </Section>

      <Section name="stats" heading={t.team.stats} empty={!page.stats?.length}>
        <StatList stats={page.stats} lang={lang} />
      </Section>

      <Section name="gallery" heading={t.team.gallery} empty={!lead}>
        {pendingCount > 0 && (
          <p className="mt-4">
            <PendingLabel>{t.pending.confirm}</PendingLabel>
          </p>
        )}
        <div className="mt-10 grid gap-3 sm:grid-cols-[1.6fr_1fr]">
          <Figure figure={lead} lang={lang} sizes="(min-width: 640px) 60vw, 100vw" imgClassName="aspect-[4/3] h-auto rounded-sm object-cover" />
          {rest.length > 0 && (
            <div className="grid gap-3">
              {rest.map((f, i) => (
                <Figure key={f._key ?? i} figure={f} lang={lang} sizes="(min-width: 640px) 38vw, 100vw" imgClassName="aspect-[4/3] h-auto rounded-sm object-cover" />
              ))}
            </div>
          )}
        </div>
      </Section>

      <CtaBand name="join" title={page.joinCtaHeading ?? t.team.join} body={settings.area}>
        <CtaLink link={joinLink} fallbackLabel={t.team.join} />
      </CtaBand>
    </>
  );
}

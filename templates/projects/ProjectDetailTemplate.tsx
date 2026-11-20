import { notFound } from "next/navigation";
import { PendingLabel } from "@/components/content/PendingLabel";
import { RichText } from "@/components/content/RichText";
import { Section } from "@/components/content/Section";
import { CtaLink, TextLink } from "@/components/cta/CtaLink";
import { Figure } from "@/components/media/Figure";
import { JsonLd } from "@/components/seo/JsonLd";
import { getNavigation, getProjects } from "@/lib/content/pages";
import { getSiteSettings } from "@/lib/content/site-settings";
import { env, type Lang } from "@/lib/env";
import { resolveFigure } from "@/lib/image";
import { faqPageNode, graph, placeNode, webPageNode } from "@/lib/json-ld";
import { resolveLink } from "@/lib/links";
import { hasBlocks, toPlainText } from "@/lib/portable-text";
import { pathFor } from "@/lib/routes";
import { SITE_URL } from "@/lib/site-url";
import { UI } from "@/lib/ui-strings";
import { CtaBand } from "../shared/blocks";
import { PageHero } from "../shared/PageHero";
import { breadcrumbJsonLd, breadcrumbs } from "../shared/page-data";
import { loadProject } from "./project.data";
import { ValueProposition } from "./ValueProposition";

/**
 * Chi tiết dự án — MẪU CHUNG cho mọi bản ghi project (T4.11, YC-02): hero dự án → «Một tài sản – Ba giá trị» →
 * góc nhìn người trong cuộc → bảng thông tin (trường trống bỏ dòng; preview hiện «chờ nội dung») → nội dung →
 * thư viện ảnh → câu hỏi thường gặp → CTA Zalo + dự án khác. Dùng chung header / footer / CTA thương hiệu cá nhân (REQ-01).
 * JSON-LD WebPage + Place + BreadcrumbList (+ FAQPage) — không Offer / giá / lợi suất.
 */
export async function ProjectDetailTemplate({ lang, slug }: { lang: Lang; slug: string }) {
  const project = await loadProject(lang, slug);
  if (!project) notFound();
  const [settings, nav, all] = await Promise.all([getSiteSettings(lang), getNavigation(), getProjects(lang)]);
  const t = UI[lang];
  const path = pathFor("projectDetail", lang, { slug });
  const crumbs = breadcrumbs(lang, settings, nav, [{ target: "projects", key: "projects" }, { label: project.title, path }]);
  const cta = resolveLink(project.cta ?? { kind: "zalo" }, { lang, zaloPhone: settings.zaloPhone, phone: settings.phone });
  const preview = env.contentMode === "preview";

  const L = t.project.factLabels;
  const facts = [
    { k: L.location, v: project.location },
    { k: L.developer, v: project.developer },
    { k: L.productTypes, v: (project.productTypes ?? []).filter(Boolean).join(", ") },
    { k: L.legalStatus, v: project.legalStatus },
    { k: L.progress, v: project.progress },
  ].filter((f) => f.v?.trim() || preview);
  const gallery = (project.gallery ?? []).filter((f) => resolveFigure(f));
  const faqs = (project.faqs ?? []).filter((f) => f.question?.trim() && hasBlocks(f.answer));
  const others = all.filter((p) => p.slug !== slug);
  const hero = resolveFigure(project.heroImage);

  return (
    <>
      <JsonLd
        data={graph([
          webPageNode({ siteUrl: SITE_URL, path, name: project.title, lang, description: project.summary }),
          placeNode({ siteUrl: SITE_URL, path, name: project.title, description: project.summary, image: hero?.src, address: project.location }),
          breadcrumbJsonLd(crumbs),
          faqPageNode(faqs.map((f) => ({ question: f.question!, answer: toPlainText(f.answer) }))),
        ])}
      />
      <PageHero
        crumbs={crumbs}
        crumbLabel={t.breadcrumb}
        eyebrow={[project.featured ? t.project.featured : t.project.eyebrow, project.location].filter(Boolean).join(" · ")}
        title={project.title}
        lead={
          project.valueProposition?.keyMessage ? (
            <p className="font-display text-h3 italic text-(--on-hero)">{project.valueProposition.keyMessage}</p>
          ) : (
            project.summary
          )
        }
        actions={<CtaLink link={cta} fallbackLabel={settings.ui.zaloCta ?? t.zaloCta} />}
        media={
          <Figure
            figure={project.heroImage}
            lang={lang}
            hero
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="overflow-hidden rounded-sm"
            imgClassName="aspect-[16/10] h-auto object-cover"
            placeholder={`${t.pending.image} — ${project.title}`}
            tone="dark"
          />
        }
      />

      <ValueProposition lang={lang} value={project.valueProposition} />

      <Section name="personalExperience" tone="alt" eyebrow={t.project.experience} empty={!hasBlocks(project.personalExperience)}>
        <RichText value={project.personalExperience} lang={lang} className="mt-6 text-lead" />
      </Section>

      <Section name="facts" eyebrow={t.project.facts} empty={!facts.length}>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <p className="text-sm text-(--on-page-muted)">{t.project.factsNote}</p>
          <dl className="border-t border-(--on-page-heading)">
            {facts.map((f) => (
              <div key={f.k} className="grid grid-cols-[8rem_1fr] gap-4 border-b border-(--line-subtle) py-4 text-sm sm:grid-cols-[12rem_1fr]">
                <dt className="text-(--on-page-muted)">{f.k}</dt>
                <dd className="font-medium">{f.v?.trim() ? f.v : <PendingLabel>{t.pending.content}</PendingLabel>}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section name="body" heading={t.project.details} empty={!hasBlocks(project.body)}>
        <RichText value={project.body} lang={lang} className="mt-6" />
      </Section>

      <Section name="gallery" heading={t.project.gallery} empty={!gallery.length}>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((f, i) => (
            <li key={f._key ?? i}>
              <Figure figure={f} lang={lang} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" imgClassName="aspect-[4/3] h-auto rounded-sm object-cover" />
            </li>
          ))}
        </ul>
      </Section>

      <Section name="faqs" tone="alt" heading={t.project.faqs} empty={!faqs.length}>
        <div className="mt-8 max-w-(--container-prose)">
          {faqs.map((f, i) => (
            <details key={f._key ?? i} className="group border-b border-(--line-subtle) py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                <h3>{f.question}</h3>
                <span aria-hidden="true" className="transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <RichText value={f.answer} lang={lang} className="mt-2 text-(--on-page-muted)" />
            </details>
          ))}
        </div>
      </Section>

      <CtaBand title={t.project.ctaTitle(project.title)} body={t.project.ctaBody}>
        <CtaLink link={cta} fallbackLabel={settings.ui.zaloCta ?? t.zaloCta} />
        {others.length > 0 && (
          <ul className="flex flex-wrap gap-x-6" aria-label={t.project.others}>
            {others.slice(0, 3).map((p) => (
              <li key={p._id}>
                <TextLink tone="dark" href={pathFor("projectDetail", lang, { slug: p.slug })}>
                  {`${t.project.others}: ${p.title}`}
                </TextLink>
              </li>
            ))}
          </ul>
        )}
      </CtaBand>
    </>
  );
}

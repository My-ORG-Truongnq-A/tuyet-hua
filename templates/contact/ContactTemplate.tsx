import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { QuickFacts } from "@/components/content/QuickFacts";
import { Section } from "@/components/content/Section";
import { Figure } from "@/components/media/Figure";
import { JsonLd } from "@/components/seo/JsonLd";
import { PhoneText, ZaloButton } from "@/components/ui/ContactLinks";
import type { Figure as FigureValue, PageDocument } from "@/lib/content/types";
import type { Lang } from "@/lib/env";
import { graph, personNode, webPageNode } from "@/lib/json-ld";
import { pathFor } from "@/lib/routes";
import { SITE_URL } from "@/lib/site-url";
import { UI } from "@/lib/ui-strings";
import { PageHero } from "../shared/PageHero";
import { breadcrumbJsonLd, breadcrumbs, loadStaticPage } from "../shared/page-data";

type ContactPage = PageDocument & { intro?: string | null; image?: FigureValue | null };

/**
 * Liên hệ (T4.15): KHÔNG form (facts.features.leadForm = no). Nút Zalo, số gọi, khu vực, «Thông tin nhanh»;
 * email / địa chỉ / giờ làm việc / mạng xã hội chỉ hiện khi có giá trị (REQ-18). JSON-LD ContactPage + Person.
 */
export async function ContactTemplate({ lang }: { lang: Lang }) {
  const data = await loadStaticPage<ContactPage>("contactPage", lang);
  if (!data) notFound();
  const { page, settings, nav } = data;
  const t = UI[lang];
  const path = pathFor("contact", lang);
  const title = page.title || t.pages.contact;
  const crumbs = breadcrumbs(lang, settings, nav, [{ target: "contact", key: "contact" }]);
  const zaloLabel = settings.ui.zaloCta ?? t.zaloCta;
  const address = settings.address
    ? [settings.address.streetAddress, settings.address.ward, settings.address.locality, settings.address.region].filter(Boolean).join(", ")
    : null;
  const extras = [
    settings.email && { k: t.contact.email, v: <a href={`mailto:${settings.email}`} className="break-all text-emerald-800 underline-offset-4 hover:underline">{settings.email}</a> },
    address && { k: t.contact.address, v: address },
    (settings.openingHoursNote || settings.openingHours.length > 0) && {
      k: t.contact.hours,
      v: settings.openingHoursNote ?? settings.openingHours.map((h) => `${h.days.join(", ")}: ${h.opens}–${h.closes}`).join("; "),
    },
    settings.socials.length > 0 && {
      k: t.contact.socials,
      v: (
        <span className="flex flex-wrap gap-x-4">
          {settings.socials.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer me" className="capitalize text-emerald-800 underline-offset-4 hover:underline">
              {s.platform}
            </a>
          ))}
        </span>
      ),
    },
  ].filter(Boolean) as { k: string; v: ReactNode }[];

  return (
    <>
      <JsonLd
        data={graph([
          webPageNode({ siteUrl: SITE_URL, path, name: title, lang, type: "ContactPage", mainEntity: true, description: page.intro }),
          personNode(settings, SITE_URL),
          breadcrumbJsonLd(crumbs),
        ])}
      />
      <PageHero
        crumbs={crumbs}
        crumbLabel={t.breadcrumb}
        title={title}
        lead={page.intro}
        actions={
          <>
            <ZaloButton phone={settings.zaloPhone} label={zaloLabel} />
            <PhoneText phone={settings.phone} className="font-semibold" />
          </>
        }
      />
      <Section name="channels">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <QuickFacts settings={settings} lang={lang} />
            {extras.length > 0 && (
              <dl className="mt-8 border-t border-(--on-page-heading)">
                {extras.map((e) => (
                  <div key={e.k} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-(--line-subtle) py-3 text-sm sm:grid-cols-[8rem_1fr]">
                    <dt className="text-(--on-page-muted)">{e.k}</dt>
                    <dd className="font-medium">{e.v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <Figure figure={page.image} lang={lang} sizes="(min-width: 1024px) 35vw, 100vw" imgClassName="aspect-[4/5] h-auto rounded-sm object-cover" />
        </div>
      </Section>
    </>
  );
}

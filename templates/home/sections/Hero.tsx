import { CtaLink } from "@/components/cta/CtaLink";
import { Figure } from "@/components/media/Figure";
import { PhoneText } from "@/components/ui/ContactLinks";
import type { SiteSettings } from "@/lib/content/site-settings";
import type { Lang } from "@/lib/env";
import { resolveLink } from "@/lib/links";
import { pathFor } from "@/lib/routes";
import { UI } from "@/lib/ui-strings";
import type { HomePage } from "../home.data";

/**
 * Hero trang chủ (T4.2 — phần chung): chân dung (ảnh LCP: eager + fetchpriority high, KHÔNG hiệu ứng), H1 = personName,
 * chức danh, tagline nguyên văn từ siteSettings (đoạn văn, không phải H1), CTA chính Zalo + CTA phụ → /du-an.
 * Bố cục khung vòm (A) / khối emerald lệch (B) do phương án được chọn thay (T4.2-A / T4.2-B).
 */
export function Hero({ lang, settings, hero }: { lang: Lang; settings: SiteSettings; hero: HomePage["hero"] }) {
  const t = UI[lang];
  const ctx = { lang, zaloPhone: settings.zaloPhone, phone: settings.phone };
  const primary = resolveLink(hero?.primaryCta ?? { kind: "zalo" }, ctx);
  const secondary = resolveLink(hero?.secondaryCta, ctx) ?? { href: pathFor("projects", lang), label: null, kind: "internal" as const, external: false };
  const eyebrow = hero?.subline?.trim() || settings.jobTitle;
  return (
    <section data-section="hero" aria-labelledby="hero-title" className="surface-hero relative overflow-hidden bg-(--surface-hero) text-(--on-hero)">
      <div className="container-page grid items-center gap-8 pt-6 pb-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:pt-12 lg:pb-20">
        <div className="order-2 lg:order-1">
          {eyebrow && <p className="text-eyebrow font-semibold uppercase text-(--on-hero-accent)">{eyebrow}</p>}
          <h1 id="hero-title" className="mt-3 font-display text-display [overflow-wrap:anywhere]">
            {settings.personName}
          </h1>
          <div className="animate-rise">
            {hero?.headline && <p className="mt-4 text-lead text-(--on-hero-muted)">{hero.headline}</p>}
            {settings.tagline && (
              <p className="mt-5 max-w-(--container-prose) font-display text-h3 uppercase tracking-title">{settings.tagline}</p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <CtaLink link={primary} fallbackLabel={settings.ui.consultCta ?? t.zaloCta} />
              <CtaLink link={secondary} fallbackLabel={t.pages.projects} variant="secondary" />
            </div>
            <PhoneText phone={settings.phone} className="mt-4 font-semibold text-(--on-hero-muted)" />
          </div>
        </div>
        <div className="order-1 mx-auto w-full max-w-56 sm:max-w-72 lg:order-2 lg:mr-0 lg:max-w-[26rem]">
          <Figure
            figure={hero?.image}
            lang={lang}
            hero
            sizes="(min-width: 1024px) 26rem, (min-width: 640px) 18rem, 14rem"
            className="relative"
            imgClassName="aspect-[4/5] h-auto rounded-sm bg-ivory-50 object-cover object-top ring-1 ring-(--line-accent)"
            placeholder={t.pending.image}
            tone="dark"
            caption={false}
          />
        </div>
      </div>
    </section>
  );
}

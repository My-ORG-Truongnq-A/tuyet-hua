import { ZaloButton } from "@/components/ui/ContactLinks";
import { Icon } from "@/components/ui/Icon";
import { getSiteSettings } from "@/lib/content/site-settings";
import type { Lang } from "@/lib/env";
import { pathFor } from "@/lib/routes";
import { MAIN_NAV, UI } from "@/lib/ui-strings";

/** 404 có thương hiệu (KT-06, SEO-12, T4.17): nằm trong header / footer, link về trang chính + nút Zalo. */
export async function NotFoundTemplate({ lang }: { lang: Lang }) {
  const settings = await getSiteSettings(lang);
  const t = UI[lang];
  const links = (["home", ...MAIN_NAV] as const).map((key) => ({ href: pathFor(key, lang), label: t.pages[key] }));
  return (
    <section className="container-page section-y" aria-labelledby="nf-title">
      <p className="text-eyebrow font-semibold uppercase text-(--on-page-accent)">{t.notFound.eyebrow}</p>
      <h1 id="nf-title" className="mt-3 font-display text-h2 text-(--on-page-heading)">
        {settings.ui.notFoundTitle ?? t.notFound.title}
      </h1>
      <p className="mt-4 max-w-(--container-prose) text-lead text-(--on-page-muted)">{settings.ui.notFoundBody ?? t.notFound.body}</p>
      <h2 className="mt-10 text-eyebrow font-semibold uppercase">{t.notFound.links}</h2>
      <ul className="mt-3 grid max-w-(--container-prose) gap-1 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="group inline-flex min-h-11 items-center gap-2 font-medium text-(--on-page-link)">
              {l.label}
              <Icon name="arrow" className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <ZaloButton phone={settings.zaloPhone} label={settings.ui.zaloCta ?? t.zaloCta} />
      </div>
    </section>
  );
}

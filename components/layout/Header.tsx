import type { SiteSettings } from "@/lib/content/site-settings";
import type { Lang } from "@/lib/env";
import { pathFor } from "@/lib/routes";
import { MAIN_NAV, UI } from "@/lib/ui-strings";
import { ZaloButton } from "../ui/ContactLinks";
import { Icon } from "../ui/Icon";
import { LangSwitch } from "./LangSwitch";
import { NavLinks } from "./NavLinks";

/**
 * Header chung (T3.1 — phần khung). Màu theo token ngữ nghĩa --surface-hero / --on-hero nên đổi theo
 * phương án (pa1 nền emerald, pa2 nền ngà) mà không đổi markup. Menu nằm sẵn trong HTML (GD-05).
 * Logo: chưa có tệp gốc (MI-05) → wordmark chữ từ siteSettings.
 */
export function Header({ lang, settings, languages }: { lang: Lang; settings: SiteSettings; languages: readonly Lang[] }) {
  const t = UI[lang];
  const items = MAIN_NAV.map((key) => ({ href: pathFor(key, lang), label: t.pages[key] }));
  return (
    <header className="surface-hero relative z-30 bg-(--surface-hero) text-(--on-hero)">
      <div className="container-page flex min-h-(--header-h) items-center justify-between gap-4 py-3">
        <a href={pathFor("home", lang)} className="min-w-0" aria-label={`${settings.personName} — ${t.pages.home}`}>
          <span className="block font-display text-lg leading-tight text-balance sm:text-2xl">{settings.personName}</span>
          {settings.jobTitle && (
            <span className="block text-micro font-medium uppercase tracking-caps text-(--on-hero-accent)">
              {settings.jobTitle}
            </span>
          )}
        </a>

        <nav aria-label={t.mainNav} className="hidden xl:block">
          <NavLinks items={items} variant="bar" />
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-(--on-hero-muted) sm:block">
            <LangSwitch lang={lang} languages={languages} label={t.langSwitch} />
          </div>
          <ZaloButton phone={settings.zaloPhone} label={t.zaloCta} className="hidden sm:inline-flex" />
          <details className="relative xl:hidden">
            <summary
              aria-label={t.openMenu}
              className="grid size-11 cursor-pointer list-none place-items-center rounded-sm ring-1 ring-current/30 [&::-webkit-details-marker]:hidden"
            >
              <Icon name="menu" />
            </summary>
            <div className="absolute right-0 mt-2 w-64 rounded-sm bg-ivory-50 p-2 text-ink-900 shadow-lift">
              <nav aria-label={t.mainNav}>
                <NavLinks items={items} variant="sheet" />
              </nav>
              {languages.length > 1 && (
                <div className="mt-2 border-t border-line px-3 pt-2 text-ink-600">
                  <LangSwitch lang={lang} languages={languages} label={t.langSwitch} />
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

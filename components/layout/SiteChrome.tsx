import type { ReactNode } from "react";
import { getNavigation } from "@/lib/content/pages";
import { getSiteSettings } from "@/lib/content/site-settings";
import { env, type Lang } from "@/lib/env";
import { pickLocale } from "@/lib/i18n";
import { buildNav, type SiteNavItem } from "@/lib/navigation";
import { pathFor } from "@/lib/routes";
import { MAIN_NAV, UI } from "@/lib/ui-strings";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MobileContactBar } from "./MobileContactBar";

/**
 * Khung trang công khai: skip link, header, main, footer, thanh liên hệ mobile.
 * Menu lấy từ singleton header / footer; CMS trống → menu mặc định theo luồng YC-08.
 * Nút VI / EN chỉ khi header.showLanguageSwitch = true và SITE_LANGUAGES có en.
 */
export async function SiteChrome({ lang, children }: { lang: Lang; children: ReactNode }) {
  const [settings, navigation] = await Promise.all([getSiteSettings(lang), getNavigation()]);
  const t = UI[lang];
  const fallback: SiteNavItem[] = MAIN_NAV.map((key) => ({ target: key, href: pathFor(key, lang), label: t.pages[key] }));
  const headerItems = buildNav(navigation.header.navItems, lang);
  const footerItems = buildNav(navigation.footer.navItems, lang);
  const languages: readonly Lang[] = navigation.header.showLanguageSwitch ? env.languages : [lang];
  return (
    <>
      <a
        href="#noi-dung"
        className="sr-only z-50 rounded-sm bg-ivory-50 px-4 py-3 text-ink-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t.skipToContent}
      </a>
      <Header lang={lang} settings={settings} items={headerItems.length ? headerItems : fallback} languages={languages} />
      <main id="noi-dung" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer
        lang={lang}
        settings={settings}
        items={footerItems.length ? footerItems : fallback}
        legal={buildNav(navigation.footer.legalItems, lang)}
        copyright={pickLocale(navigation.footer.copyrightText, lang)}
      />
      <MobileContactBar lang={lang} settings={settings} />
    </>
  );
}

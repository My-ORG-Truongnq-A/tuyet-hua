import type { ReactNode } from "react";
import { getSiteSettings } from "@/lib/content/site-settings";
import { env, type Lang } from "@/lib/env";
import { UI } from "@/lib/ui-strings";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MobileContactBar } from "./MobileContactBar";

/**
 * Khung trang công khai: skip link, header, main, footer, thanh liên hệ mobile.
 * Không tracking / widget ở bước khung (forms_tracking làm sau).
 */
export async function SiteChrome({ lang, children }: { lang: Lang; children: ReactNode }) {
  const settings = await getSiteSettings(lang);
  const t = UI[lang];
  return (
    <>
      <a
        href="#noi-dung"
        className="sr-only z-50 rounded-sm bg-ivory-50 px-4 py-3 text-ink-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t.skipToContent}
      </a>
      <Header lang={lang} settings={settings} languages={env.languages} />
      <main id="noi-dung" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer lang={lang} settings={settings} />
      <MobileContactBar lang={lang} settings={settings} />
    </>
  );
}

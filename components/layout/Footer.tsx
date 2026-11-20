import type { SiteSettings } from "@/lib/content/site-settings";
import type { Lang } from "@/lib/env";
import { pathFor } from "@/lib/routes";
import { MAIN_NAV, UI } from "@/lib/ui-strings";
import { PhoneText } from "../ui/ContactLinks";
import { Icon } from "../ui/Icon";

/**
 * Footer chung (T3.3 — phần khung): tên + chức danh, tagline, liên hệ, khu vực, liên kết, chính sách, năm.
 * NAP bằng HTML text từ siteSettings (GEO-03). Trường trống → ẩn dòng. emerald-950 chỉ dùng ở đây.
 */
export function Footer({ lang, settings }: { lang: Lang; settings: SiteSettings }) {
  const t = UI[lang];
  const year = new Date().getFullYear();
  const role = settings.jobTitle;
  return (
    <footer className="surface-dark bg-(--surface-footer) pb-24 text-emerald-100 sm:pb-0">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl text-ivory-100">{settings.personName}</p>
          {role && <p className="mt-1 text-sm text-gold-300">{role}</p>}
          {settings.tagline && <p className="mt-4 max-w-80 text-sm">{settings.tagline}</p>}
        </div>

        {settings.phone && (
          <div>
            <p className="text-eyebrow font-semibold uppercase text-gold-300">{t.phoneLabel}</p>
            <PhoneText phone={settings.phone} className="mt-2 text-lg font-semibold text-ivory-100" />
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="mt-1 flex min-h-11 items-center gap-2 text-ivory-100">
                <Icon name="mail" className="size-5" /> {settings.email}
              </a>
            )}
          </div>
        )}

        {settings.area && (
          <div>
            <p className="text-eyebrow font-semibold uppercase text-gold-300">{t.areaLabel}</p>
            <p className="mt-3 flex items-center gap-2 text-ivory-100">
              <Icon name="pin" className="size-5" /> {settings.area}
            </p>
          </div>
        )}

        <nav aria-label={t.quickLinks}>
          <p className="text-eyebrow font-semibold uppercase text-gold-300">{t.quickLinks}</p>
          <ul className="mt-2">
            {MAIN_NAV.map((key) => (
              <li key={key}>
                <a href={pathFor(key, lang)} className="inline-flex min-h-11 items-center hover:text-ivory-100">
                  {t.pages[key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-emerald-800">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-5 text-xs">
          <p>
            © {year} {settings.personName}. {t.disclaimer}
          </p>
          <a href={pathFor("privacy", lang)} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
            {t.pages.privacy}
          </a>
        </div>
      </div>
    </footer>
  );
}

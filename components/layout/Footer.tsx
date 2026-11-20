import type { SiteSettings } from "@/lib/content/site-settings";
import type { Lang } from "@/lib/env";
import type { SiteNavItem } from "@/lib/navigation";
import { pathFor } from "@/lib/routes";
import { UI } from "@/lib/ui-strings";
import { PhoneText } from "../ui/ContactLinks";
import { Icon } from "../ui/Icon";

/**
 * Footer chung (T3.3): tên + chức danh, tagline, liên hệ, khu vực, liên kết (singleton footer), chính sách, năm.
 * NAP bằng HTML text từ siteSettings (GEO-03). Email / mạng xã hội / địa chỉ / giờ làm việc chỉ hiện khi có giá trị
 * (REQ-18). Năm bản quyền tính lúc build. emerald-950 (--surface-footer) chỉ dùng ở đây.
 */
export function Footer({
  lang,
  settings,
  items,
  legal,
  copyright,
}: {
  lang: Lang;
  settings: SiteSettings;
  items: SiteNavItem[];
  legal: SiteNavItem[];
  copyright: string | null;
}) {
  const t = UI[lang];
  const year = new Date().getFullYear();
  const privacyPath = pathFor("privacy", lang);
  const legalLinks = legal.some((l) => l.href === privacyPath)
    ? legal
    : [...legal, { target: "privacy", href: privacyPath, label: t.pages.privacy }];
  const address = settings.address
    ? [settings.address.streetAddress, settings.address.ward, settings.address.locality, settings.address.region]
        .filter(Boolean)
        .join(", ")
    : null;
  return (
    <footer className="surface-dark bg-(--surface-footer) pb-24 text-emerald-100 sm:pb-0">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl text-ivory-100">{settings.brandName}</p>
          {settings.jobTitle && <p className="mt-1 text-sm text-gold-300">{settings.jobTitle}</p>}
          {settings.tagline && <p className="mt-4 max-w-80 text-sm">{settings.tagline}</p>}
        </div>

        {(settings.phone || settings.email) && (
          <div>
            <p className="text-eyebrow font-semibold uppercase text-gold-300">{t.phoneLabel}</p>
            <PhoneText phone={settings.phone} className="mt-2 text-lg font-semibold text-ivory-100" />
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="mt-1 flex min-h-11 items-center gap-2 break-all text-ivory-100">
                <Icon name="mail" className="size-5 shrink-0" /> {settings.email}
              </a>
            )}
          </div>
        )}

        {(settings.area || address || settings.openingHoursNote) && (
          <div>
            <p className="text-eyebrow font-semibold uppercase text-gold-300">{t.areaLabel}</p>
            {settings.area && (
              <p className="mt-3 flex items-center gap-2 text-ivory-100">
                <Icon name="pin" className="size-5 shrink-0" /> {settings.area}
              </p>
            )}
            {address && <p className="mt-2 text-sm">{address}</p>}
            {settings.openingHoursNote && <p className="mt-2 text-sm">{settings.openingHoursNote}</p>}
          </div>
        )}

        {(items.length > 0 || settings.socials.length > 0) && (
          <nav aria-label={t.quickLinks}>
            <p className="text-eyebrow font-semibold uppercase text-gold-300">{t.quickLinks}</p>
            <ul className="mt-2">
              {items.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="inline-flex min-h-11 items-center hover:text-ivory-100">
                    {n.label}
                  </a>
                </li>
              ))}
              {settings.socials.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="inline-flex min-h-11 items-center capitalize hover:text-ivory-100"
                  >
                    {s.platform}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className="border-t border-emerald-800">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-5 text-xs">
          <p>{copyright ? `© ${year} ${copyright}` : `© ${year} ${settings.brandName}. ${t.disclaimer}`}</p>
          <ul className="flex flex-wrap gap-x-6">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

import { PhoneText, ZaloButton } from "@/components/ui/ContactLinks";
import { Icon } from "@/components/ui/Icon";
import type { SiteSettings } from "@/lib/content/site-settings";
import type { Lang } from "@/lib/env";
import { UI } from "@/lib/ui-strings";
import type { HomePage } from "../home.data";

/**
 * Kết nối — theo dải cuối mockup: nền emerald sâu, vòng tròn vàng có icon điện thoại, tiêu đề + lời mời,
 * rồi các cột Zalo / Hotline · Email · Khu vực hoạt động. Mọi giá trị từ siteSettings; trống → cột ẩn (REQ-18).
 */
export function Connect({ lang, settings, section }: { lang: Lang; settings: SiteSettings; section: HomePage["connectSection"] }) {
  const t = UI[lang];
  const zaloLabel = settings.ui.zaloCta ?? t.zaloCta;
  return (
    <section data-section="connect" aria-labelledby="connect-title" className="surface-dark bg-(--surface-band) bg-(image:--surface-band-image) text-emerald-100">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:items-center lg:gap-8">
        <div className="flex items-start gap-5">
          <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full bg-(image:--gradient-gold) text-emerald-950 shadow-soft">
            <Icon name="phone" className="size-6" />
          </span>
          <div>
            <h2 id="connect-title" className="font-display text-h3 uppercase tracking-wide text-ivory-100">
              {section?.heading ?? t.sections.connect}
            </h2>
            {section?.body && <p className="mt-2 text-sm">{section.body}</p>}
            <ZaloButton phone={settings.zaloPhone} label={zaloLabel} className="mt-5" />
          </div>
        </div>

        {settings.phone && (
          <div className="lg:border-l lg:border-emerald-700 lg:pl-8">
            <p className="text-eyebrow font-semibold uppercase text-gold-300">{t.phoneLabel}</p>
            <PhoneText phone={settings.phone} className="text-lg font-semibold text-ivory-100" />
          </div>
        )}
        {settings.email && (
          <div className="lg:border-l lg:border-emerald-700 lg:pl-8">
            <p className="text-eyebrow font-semibold uppercase text-gold-300">Email</p>
            <a href={`mailto:${settings.email}`} className="inline-flex min-h-11 items-center break-all text-ivory-100">
              {settings.email}
            </a>
          </div>
        )}
        {settings.area && (
          <div className="lg:border-l lg:border-emerald-700 lg:pl-8">
            <p className="text-eyebrow font-semibold uppercase text-gold-300">{t.areaLabel}</p>
            <p className="mt-2 flex items-center gap-2 font-semibold text-ivory-100">
              <Icon name="pin" className="size-5 shrink-0" /> {settings.area}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

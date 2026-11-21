import type { SiteSettings } from "@/lib/content/site-settings";
import type { Lang } from "@/lib/env";
import { resolveFigure } from "@/lib/image";
import type { SiteNavItem } from "@/lib/navigation";
import { pathFor } from "@/lib/routes";
import { UI } from "@/lib/ui-strings";
import { SiteImage } from "../media/SiteImage";
import { ZaloButton } from "../ui/ContactLinks";
import { LangSwitch } from "./LangSwitch";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";

/**
 * Header chung (T3.1): menu từ singleton header (CMS), aria-current, nút Zalo, chuyển VI / EN khi bật.
 * Màu theo token ngữ nghĩa --surface-hero / --on-hero nên đổi theo phương án (pa1 / pa2) mà không đổi markup.
 * Logo chỉ hiện khi đã xác nhận quyền dùng (REQ-26); còn lại là wordmark chữ. Tên ở header KHÔNG phải H1.
 */
export function Header({
  lang,
  settings,
  items,
  languages,
}: {
  lang: Lang;
  settings: SiteSettings;
  items: SiteNavItem[];
  languages: readonly Lang[];
}) {
  const t = UI[lang];
  const logo = settings.logo?.usageApproved === true ? resolveFigure(settings.logo) : null;
  const links = items.map(({ href, label }) => ({ href, label }));
  const zaloLabel = settings.ui.zaloCta ?? t.zaloCta;
  return (
    <header data-track-area="header" className="surface-hero relative z-30 bg-(--surface-hero) text-(--on-hero)">
      <div className="container-page flex min-h-(--header-h) items-center justify-between gap-4 py-3">
        <a href={pathFor("home", lang)} className="min-w-0" aria-label={`${settings.brandName} — ${t.pages.home}`}>
          {logo ? (
            <SiteImage
              src={logo.src}
              width={logo.width}
              height={logo.height}
              alt=""
              sizes="200px"
              loading="eager"
              className="h-10 w-auto sm:h-12"
            />
          ) : (
            <>
              <span className="block font-display text-lg leading-tight text-balance sm:text-2xl">{settings.brandName}</span>
              {settings.jobTitle && (
                <span className="hidden text-micro font-medium uppercase tracking-caps text-(--on-hero-accent) sm:block">
                  {settings.jobTitle.split("|")[0]?.trim()}
                </span>
              )}
            </>
          )}
        </a>

        {links.length > 0 && (
          <nav aria-label={t.mainNav} className="hidden xl:block">
            <NavLinks items={links} variant="bar" />
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-(--on-hero-muted) sm:block">
            <LangSwitch lang={lang} languages={languages} label={t.langSwitch} />
          </div>
          <ZaloButton phone={settings.zaloPhone} label={zaloLabel} className="max-sm:hidden" />
          <div className="xl:hidden">
            <MobileMenu items={links} openLabel={t.openMenu} closeLabel={t.closeMenu} navLabel={t.mainNav}>
              <ZaloButton phone={settings.zaloPhone} label={zaloLabel} className="w-full" />
              {languages.length > 1 && (
                <div className="text-ink-600">
                  <LangSwitch lang={lang} languages={languages} label={t.langSwitch} />
                </div>
              )}
            </MobileMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

import type { SiteSettings } from "@/lib/content/site-settings";
import type { Lang } from "@/lib/env";
import { zaloHref } from "@/lib/contact";
import { UI } from "@/lib/ui-strings";
import { CallIconLink, ZaloButton } from "../ui/ContactLinks";

/** Thanh Zalo + Gọi cố định đáy màn hình trên mobile (T3.2 — phần khung, MB): CTA luôn trong tầm tay. */
export function MobileContactBar({ lang, settings }: { lang: Lang; settings: SiteSettings }) {
  if (!zaloHref(settings.zaloPhone)) return null;
  const t = UI[lang];
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[1fr_auto] gap-2 border-t border-line bg-ivory-50/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
      <ZaloButton phone={settings.zaloPhone} label={t.zaloMobile} className="w-full" />
      <CallIconLink phone={settings.phone} label={t.callLabel} className="text-emerald-800" />
    </div>
  );
}

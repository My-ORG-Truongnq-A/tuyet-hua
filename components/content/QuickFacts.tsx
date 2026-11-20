import type { SiteSettings } from "@/lib/content/site-settings";
import type { Lang } from "@/lib/env";
import { UI } from "@/lib/ui-strings";
import { PhoneText, ZaloButton } from "../ui/ContactLinks";

/**
 * «Thông tin nhanh» (T3.10 — GEO): Ai / Vai trò / Khu vực / Liên hệ, cùng nguồn siteSettings với JSON-LD Person.
 * Trường trống → bỏ dòng.
 */
export function QuickFacts({
  settings,
  lang,
  tone = "light",
  className = "",
  headingLevel = "h2",
}: {
  settings: SiteSettings;
  lang: Lang;
  tone?: "light" | "dark";
  className?: string;
  headingLevel?: "h2" | "h3";
}) {
  const t = UI[lang].quickFacts;
  const rows = [
    { k: t.who, v: settings.personName },
    { k: t.role, v: settings.jobTitle },
    { k: t.area, v: settings.area },
  ].filter((r): r is { k: string; v: string } => Boolean(r.v));
  const hasContact = Boolean(settings.phone || settings.zaloPhone);
  if (!rows.length && !hasContact) return null;
  const dark = tone === "dark";
  const Heading = headingLevel;
  return (
    <div data-block="quick-facts" className={className}>
      <Heading className={`text-eyebrow font-semibold uppercase ${dark ? "text-gold-300" : "text-(--on-page-accent)"}`}>{t.title}</Heading>
      <dl className={`mt-4 border-t ${dark ? "border-emerald-700" : "border-(--on-page-heading)"}`}>
        {rows.map((r) => (
          <div
            key={r.k}
            className={`grid grid-cols-[6.5rem_1fr] gap-4 border-b py-3 text-sm sm:grid-cols-[8rem_1fr] ${
              dark ? "border-emerald-700" : "border-(--line-subtle)"
            }`}
          >
            <dt className={dark ? "text-emerald-100" : "text-(--on-page-muted)"}>{r.k}</dt>
            <dd className="font-medium [overflow-wrap:anywhere]">{r.v}</dd>
          </div>
        ))}
        {hasContact && (
          <div
            className={`grid grid-cols-[6.5rem_1fr] items-center gap-4 border-b py-3 text-sm sm:grid-cols-[8rem_1fr] ${
              dark ? "border-emerald-700" : "border-(--line-subtle)"
            }`}
          >
            <dt className={dark ? "text-emerald-100" : "text-(--on-page-muted)"}>{t.contact}</dt>
            <dd className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <ZaloButton phone={settings.zaloPhone} label={settings.ui.zaloCta ?? UI[lang].zaloCta} />
              <PhoneText phone={settings.phone} className="font-semibold" />
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}

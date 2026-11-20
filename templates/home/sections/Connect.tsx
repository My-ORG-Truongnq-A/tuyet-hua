import { QuickFacts } from "@/components/content/QuickFacts";
import { Section } from "@/components/content/Section";
import type { SiteSettings } from "@/lib/content/site-settings";
import type { Lang } from "@/lib/env";
import { UI } from "@/lib/ui-strings";
import type { HomePage } from "../home.data";

/** Kết nối (T4.8): Zalo, gọi điện, khu vực — «Thông tin nhanh» từ siteSettings (không viết cứng). */
export function Connect({ lang, settings, section }: { lang: Lang; settings: SiteSettings; section: HomePage["connectSection"] }) {
  return (
    <Section name="connect" tone="band" heading={section?.heading ?? UI[lang].sections.connect} intro={section?.body}>
      <QuickFacts settings={settings} lang={lang} tone="dark" headingLevel="h3" className="mt-10 max-w-2xl" />
    </Section>
  );
}

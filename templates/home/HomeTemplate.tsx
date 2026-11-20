import { JsonLd } from "@/components/seo/JsonLd";
import { PhoneText, ZaloButton } from "@/components/ui/ContactLinks";
import { getSiteSettings } from "@/lib/content/site-settings";
import type { Lang } from "@/lib/env";
import { graph, personNode, webPageNode, websiteNode } from "@/lib/json-ld";
import { pathFor } from "@/lib/routes";
import { SITE_URL } from "@/lib/site-url";
import { UI } from "@/lib/ui-strings";

/**
 * Trang chủ — KHUNG (bước dựng nền). Chỉ có hero dữ liệu chung: H1 = personName (T4.1), chức danh,
 * tagline nguyên văn, CTA Zalo. Bố cục từng khối (chân dung, Về tôi, Giá trị, Dự án, Uy tín, Kiến thức, Kết nối)
 * dựng ở bước implement_templates theo phương án mockup được chọn ở G2.
 * Không animate H1 / phần tử LCP (HN-02).
 */
export async function HomeTemplate({ lang }: { lang: Lang }) {
  const settings = await getSiteSettings(lang);
  const t = UI[lang];
  const path = pathFor("home", lang);
  return (
    <>
      <JsonLd
        data={graph([
          websiteNode(settings, SITE_URL, lang),
          personNode(settings, SITE_URL),
          webPageNode({ siteUrl: SITE_URL, path, name: settings.personName, lang, description: settings.seo.description }),
        ])}
      />
      <section className="surface-hero bg-(--surface-hero) text-(--on-hero)" aria-labelledby="hero-title">
        <div className="container-page section-y grid gap-6">
          {settings.jobTitle && (
            <p className="text-eyebrow font-semibold uppercase text-(--on-hero-accent)">{settings.jobTitle}</p>
          )}
          <h1 id="hero-title" className="font-display text-display">
            {settings.personName}
          </h1>
          {settings.tagline && (
            <p className="max-w-(--container-prose) font-display text-h3 uppercase tracking-title text-(--on-hero-muted)">
              {settings.tagline}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <ZaloButton phone={settings.zaloPhone} label={t.zaloCta} />
            <PhoneText phone={settings.phone} className="font-semibold" />
          </div>
        </div>
      </section>
    </>
  );
}

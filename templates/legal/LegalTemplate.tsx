import { notFound } from "next/navigation";
import { PendingLabel } from "@/components/content/PendingLabel";
import { RichText } from "@/components/content/RichText";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import type { PageDocument } from "@/lib/content/types";
import type { Lang } from "@/lib/env";
import { graph, webPageNode } from "@/lib/json-ld";
import { hasBlocks, type PortableValue } from "@/lib/portable-text";
import { pathFor } from "@/lib/routes";
import { SITE_URL } from "@/lib/site-url";
import { formatDate, UI } from "@/lib/ui-strings";
import { breadcrumbJsonLd, breadcrumbs, loadStaticPage } from "../shared/page-data";

type PrivacyPage = PageDocument & { body?: PortableValue; lastUpdated?: string | null };

/**
 * Chính sách bảo mật (T4.16): nội dung từ privacyPage.body, ngày cập nhật khi có. Nội dung đang chờ người duyệt
 * pháp lý (MI-16) → preview hiện nhãn «chờ nội dung».
 */
export async function LegalTemplate({ lang }: { lang: Lang }) {
  const data = await loadStaticPage<PrivacyPage>("privacyPage", lang);
  if (!data) notFound();
  const { page, settings, nav } = data;
  const t = UI[lang];
  const path = pathFor("privacy", lang);
  const title = page.title || t.pages.privacy;
  const crumbs = breadcrumbs(lang, settings, nav, [{ label: title, path }]);
  const updated = formatDate(page.lastUpdated, lang);
  return (
    <>
      <JsonLd data={graph([webPageNode({ siteUrl: SITE_URL, path, name: title, lang }), breadcrumbJsonLd(crumbs)])} />
      <article data-section="legal" className="container-page section-y">
        <Breadcrumb items={crumbs} label={t.breadcrumb} className="text-(--on-page-muted)" />
        <h1 className="mt-8 font-display text-h2 text-(--on-page-heading)">{title}</h1>
        {updated && (
          <p className="mt-3 text-sm text-(--on-page-muted)">
            {t.legal.lastUpdated}: <time dateTime={page.lastUpdated ?? undefined}>{updated}</time>
          </p>
        )}
        <RichText value={page.body} lang={lang} className="mt-8" />
        {!hasBlocks(page.body) && (
          <p className="mt-8">
            <PendingLabel>{t.pending.content}</PendingLabel>
          </p>
        )}
      </article>
    </>
  );
}

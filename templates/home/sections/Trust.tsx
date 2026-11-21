import { PendingLabel } from "@/components/content/PendingLabel";
import { RichText } from "@/components/content/RichText";
import { CtaLink } from "@/components/cta/CtaLink";
import { Figure } from "@/components/media/Figure";
import { PendingImage } from "@/components/media/PendingImage";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { Figure as FigureValue, HighlightStat, Testimonial } from "@/lib/content/types";
import { env, type Lang } from "@/lib/env";
import { hasBlocks } from "@/lib/portable-text";
import { pathFor } from "@/lib/routes";
import { UI } from "@/lib/ui-strings";
import type { HomePage } from "../home.data";
import { Testimonials } from "./Testimonials";

const STAT_ICONS: IconName[] = ["calendar", "people", "building", "people"];

/**
 * Uy tín & đội ngũ — theo mockup, 3 tầng trong một khối:
 * (1) dải số liệu 4 cột (icon + số lớn + nhãn, vạch ngăn) — CHỈ số đã qua gate; chưa có số → preview hiện một nhãn
 *     chờ ghi rõ số cần, release ẩn (không dùng số minh hoạ của mockup);
 * (2) «Leader & người đào tạo»: tiêu đề + đoạn văn + nút champagne «Tham gia đội ngũ cùng Tuyết» → /dao-tao-doi-ngu
 *     (REQ-04 — liên kết, không form) | ảnh đào tạo / đội ngũ;
 * (3) cảm nhận khách hàng (chỉ bản đã đồng ý — D-10).
 * Ảnh: trustSection.image nếu có; không thì tối đa 3 ảnh gallery trang Đội ngũ (ảnh khách, đã qua gate) — như mockup;
 * không có ảnh nào mới hiện ô chờ.
 */
export function Trust({
  lang,
  section,
  gallery,
  testimonials,
}: {
  lang: Lang;
  section: HomePage["trustSection"];
  gallery?: FigureValue[] | null;
  testimonials: Testimonial[];
}) {
  const t = UI[lang];
  const photos = (gallery ?? []).filter((g) => g?.image).slice(0, 3);
  const hasBody = hasBlocks(section?.body);
  const heading = section?.heading ?? t.sections.trust;
  return (
    <section data-section="trust" aria-labelledby="trust-title">
      <StatBand stats={section?.stats} lang={lang} />

      <div className="container-page section-y grid gap-10 lg:grid-cols-[1fr_1.45fr] lg:items-center lg:gap-12">
        <div>
          <p className="text-eyebrow font-semibold uppercase text-(--on-page-accent)">{t.homeEyebrow.leader}</p>
          <h2 id="trust-title" className="mt-3 font-display text-h2 text-(--on-page-heading)">
            {heading}
          </h2>
          <RichText value={section?.body} lang={lang} className="mt-4" />
          {!hasBody && (
            <p className="mt-4">
              <PendingLabel>{t.pending.content}</PendingLabel>
            </p>
          )}
          <p className="mt-6">
            <CtaLink
              link={{ href: pathFor("team", lang), label: section?.teamLinkLabel ?? null, kind: "internal", external: false }}
              fallbackLabel={t.pages.team}
            />
          </p>
        </div>
        <div>
        <div className="grid gap-4 sm:grid-cols-3">
          {section?.image ? (
            <Figure
              figure={section.image}
              lang={lang}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="overflow-hidden rounded-(--radius-card) sm:col-span-3"
              imgClassName="aspect-[16/9] h-auto object-cover"
              caption={false}
            />
          ) : photos.length ? (
            photos.map((g, i) => (
              <Figure
                key={g._key ?? i}
                figure={g}
                lang={lang}
                sizes="(min-width: 1024px) 18vw, (min-width: 640px) 33vw, 100vw"
                className={`overflow-hidden rounded-(--radius-card) ${i ? "max-sm:hidden" : ""}`}
                imgClassName="aspect-[4/3] h-auto object-cover"
                caption={false}
              />
            ))
          ) : (
            [0, 1, 2].map((i) => (
              <PendingImage key={i} note={t.pending.teamImage} className={`aspect-[4/3] rounded-(--radius-card) ${i ? "max-sm:hidden" : ""}`} />
            ))
          )}
        </div>
        {/* Nhãn kỹ năng dưới ảnh (mockup) — chữ nhỏ có điểm vàng, không phải thẻ */}
        <ul className="mt-5 flex flex-wrap justify-between gap-x-6 gap-y-2 text-xs text-(--on-page-muted)">
          {t.homeExtra.trustTags.map((tag) => (
            <li key={tag} className="flex items-center gap-2">
              <span aria-hidden="true" className="size-1.5 rotate-45 bg-gold-500" />
              {tag}
            </li>
          ))}
        </ul>
        </div>
      </div>

      <Testimonials lang={lang} heading={section?.testimonialsHeading} items={testimonials} />
    </section>
  );
}

function StatBand({ stats, lang }: { stats: HighlightStat[] | null | undefined; lang: Lang }) {
  const t = UI[lang];
  const list = (stats ?? []).filter((s) => s.value?.trim() && s.label?.trim());
  if (!list.length && env.contentMode !== "preview") return null;
  return (
    <div className="border-y border-(--line-subtle) bg-(--surface-page)">
      {list.length ? (
        <dl className="container-page grid grid-cols-2 gap-y-8 py-10 lg:grid-cols-4">
          {list.map((s, i) => (
            <div key={s._key ?? i} className="flex items-center gap-4 px-2 lg:justify-center lg:border-l lg:border-(--line-subtle) lg:first:border-l-0">
              <Icon name={STAT_ICONS[i % STAT_ICONS.length]!} className="hidden size-10 shrink-0 text-emerald-800 sm:block" />
              <div className="flex flex-col">
                <dt className="text-sm text-(--on-page-muted)">{s.label}</dt>
                <dd className="order-first font-display text-stat text-(--on-page-heading)">{s.value}</dd>
                {s.pending && (
                  <dd className="mt-1">
                    <PendingLabel>{t.pending.confirm}</PendingLabel>
                  </dd>
                )}
              </div>
            </div>
          ))}
        </dl>
      ) : (
        /* Preview: giữ bố cục 4 ô của mockup, giá trị là nhãn «Chờ số» — KHÔNG dùng số minh hoạ (5+, 200+…). Release ẩn cả dải. */
        <dl data-pending="" aria-label={t.pending.stats} className="container-page grid grid-cols-2 gap-y-8 py-8 lg:grid-cols-4">
          {t.pending.statSlots.map((label, i) => (
            <div key={label} className="flex items-center gap-4 px-2 lg:justify-center lg:border-l lg:border-(--line-subtle) lg:first:border-l-0">
              <Icon name={STAT_ICONS[i % STAT_ICONS.length]!} className="hidden size-10 shrink-0 text-emerald-800 sm:block" />
              <div className="flex flex-col">
                <dt className="max-w-44 text-sm text-(--on-page-muted)">{label}</dt>
                <dd className="order-first flex items-center gap-2 font-display text-h2 text-stone-300">
                  <span aria-hidden="true">—</span>
                  <PendingLabel>{t.pending.statValue}</PendingLabel>
                </dd>
              </div>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

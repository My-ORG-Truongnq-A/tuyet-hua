import { CtaLink } from "@/components/cta/CtaLink";
import { Figure } from "@/components/media/Figure";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { SiteSettings } from "@/lib/content/site-settings";
import { env, type Lang } from "@/lib/env";
import { resolveFigure } from "@/lib/image";
import { resolveLink } from "@/lib/links";
import { pathFor } from "@/lib/routes";
import { UI } from "@/lib/ui-strings";
import type { HomePage } from "../home.data";

/** Tagline «A. B. C.» → ba vế (mockup: vế 1 là dòng nhỏ, vế 2–3 là tiêu đề lớn, vế 3 màu vàng). Không đủ 3 vế → null. */
export function splitTagline(tagline: string | null | undefined): [string, string, string] | null {
  const parts = (tagline ?? "")
    .split(/(?<=\.)\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length === 3 ? [parts[0]!, parts[1]!, parts[2]!] : null;
}

const bare = (s: string) => s.replace(/\.$/, "");
/** Trụ cột hero viết thường kiểu câu như mockup («Thấu hiểu thị trường»), dù tagline lưu VIẾT HOA. */
const sentence = (s: string, lang: Lang) => {
  const low = bare(s).toLocaleLowerCase(lang);
  return low.charAt(0).toLocaleUpperCase(lang) + low.slice(1);
};

/**
 * Hero trang chủ — dựng bám mockup khách (anh-dan-131204-1.png), lần sửa theo change request «bản hiện tại chưa đạt»:
 * - PA1: nền emerald sâu + hoạ tiết vịnh / núi đá vôi dạng VECTOR (trang trí, aria-hidden — không phải ảnh thật, không
 *   giả ảnh Hạ Long), đường cong vàng; chữ trái: tên (H1, nhãn nhỏ), vế 1 tagline (nhãn vàng), vế 2–3 tiêu đề lớn
 *   (vế 3 vàng), đoạn mô tả, 2 CTA, 3 trụ cột (icon + vế tagline + dòng phụ). Chân dung TÁCH NỀN bên phải, to, chân ảnh
 *   chạm đáy hero, không khung — như mockup.
 * - PA2 (`pa2:`): nền ngà, chân dung tách nền TRÁI đứng trên khối emerald bo vòm, chữ phải.
 * Ảnh chân dung là ảnh LCP: eager + fetchpriority high, KHÔNG hiệu ứng. H1 = personName (SEO, e2e).
 * Ảnh hero trong CMS cần là ảnh đã tách nền (PNG/WebP trong suốt) — Studio + seed:validate cảnh báo (T6.6).
 * Release mà ảnh chưa xác nhận quyền dùng (lớp dữ liệu đã bỏ ảnh) → bỏ cả cột chân dung (không quầng sáng / khung trống);
 * hero còn H1, tagline, CTA Zalo trên một cột.
 */
export function Hero({
  lang,
  settings,
  hero,
}: {
  lang: Lang;
  settings: SiteSettings;
  hero: HomePage["hero"];
}) {
  const t = UI[lang];
  const ctx = { lang, zaloPhone: settings.zaloPhone, phone: settings.phone };
  const primary = resolveLink(hero?.primaryCta ?? { kind: "zalo" }, ctx);
  const secondary = resolveLink(hero?.secondaryCta, ctx) ?? { href: pathFor("projects", lang), label: null, kind: "internal" as const, external: false };
  const tagline = splitTagline(settings.tagline);
  const pillarIcons: IconName[] = ["chart", "diamond", "people"];
  const showPortrait = Boolean(resolveFigure(hero?.image)) || env.contentMode === "preview";
  return (
    <section
      data-section="hero"
      aria-labelledby="hero-title"
      className="surface-hero relative isolate overflow-hidden bg-(--surface-hero) bg-(image:--surface-hero-image) text-(--on-hero)"
    >
      <BayArt />

      <div
        data-portrait={showPortrait ? undefined : "none"}
        className={`container-page grid gap-6 pt-6 lg:min-h-(--hero-min-h) lg:pt-0 ${
          showPortrait ? "lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 pa2:lg:grid-cols-[0.9fr_1.1fr] pa2:lg:gap-12" : "lg:max-w-4xl"
        }`}
      >
        <div className="pb-10 lg:self-center lg:py-14 pa2:lg:order-2">
          <h1 id="hero-title" className="flex items-center gap-3 text-eyebrow font-semibold uppercase text-(--on-hero-muted) [overflow-wrap:anywhere]">
            <span aria-hidden="true" className="h-px w-8 shrink-0 bg-(--line-accent)" />
            {settings.personName}
          </h1>

          <div className="animate-rise">
            {tagline ? (
              <p className="mt-5 font-display uppercase">
                {/* Dấu chấm cuối mỗi vế ẩn bằng mắt (mockup không có) nhưng giữ cho trình đọc màn hình */}
                <span className="block text-lead tracking-title text-(--on-hero-accent)">
                  {bare(tagline[0])}
                  <span className="sr-only">. </span>
                </span>
                <span className="mt-3 block text-display-caps tracking-[0.02em] [overflow-wrap:anywhere]">
                  {bare(tagline[1])}
                  <span className="sr-only">. </span>
                </span>
                <span className="block text-display-caps tracking-[0.02em] text-(--on-hero-accent) [overflow-wrap:anywhere]">
                  {bare(tagline[2])}
                  <span className="sr-only">.</span>
                </span>
              </p>
            ) : (
              settings.tagline && <p className="mt-6 font-display text-display-caps uppercase">{settings.tagline}</p>
            )}
            {hero?.headline && <p className="mt-5 max-w-[34rem] text-(--on-hero-muted)">{hero.headline}</p>}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <CtaLink link={primary} fallbackLabel={settings.ui.consultCta ?? t.zaloCta} />
              <CtaLink link={secondary} fallbackLabel={t.pages.projects} variant="secondary" />
            </div>
          </div>

          {tagline && (
            <ul className="mt-9 grid gap-4 sm:grid-cols-3 sm:gap-4">
              {tagline.map((p, i) => {
                const note = hero?.pillarNotes?.[i]?.trim();
                return (
                  <li key={i} className="flex items-start gap-2.5">
                    <Icon name={pillarIcons[i]!} className="size-7 shrink-0 text-(--on-hero-accent)" />
                    <span className="text-sm leading-snug">
                      <span className="block font-semibold">{sentence(p, lang)}</span>
                      {note && <span className="block text-xs text-(--on-hero-muted)">{note}</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Chân dung tách nền: PA1 phải, chạm đáy hero, không khung; PA2 trái, đứng trên khối emerald bo vòm */}
        {showPortrait && (
          <div className="relative order-first mx-auto w-full max-w-52 self-end sm:max-w-64 lg:order-none lg:mr-0 lg:max-w-[30rem] pa2:mt-4 pa2:lg:order-1 pa2:lg:mr-auto pa2:lg:ml-0 pa2:lg:mt-12 pa2:lg:max-w-[28rem]">
            <span aria-hidden="true" className="absolute inset-x-[6%] top-[14%] bottom-0 -z-10 hidden rounded-(--radius-arch) bg-emerald-800 ring-1 ring-gold-500/60 ring-offset-8 ring-offset-ivory-50 pa2:block" />
            <span aria-hidden="true" className="absolute inset-x-[8%] top-[12%] bottom-0 -z-10 rounded-full bg-(image:--gradient-halo) pa2:hidden" />
            <Figure
              figure={hero?.image}
              lang={lang}
              hero
              sizes="(min-width: 1024px) 30rem, (min-width: 640px) 16rem, 13rem"
              imgClassName="aspect-[630/780] h-auto object-cover object-top"
              placeholder={t.pending.image}
              caption={false}
            />
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Hoạ tiết vịnh Hạ Long dạng vector (mockup dùng ảnh nền vịnh — chưa có ảnh thật có quyền dùng, KHÔNG dùng ảnh AI):
 * dãy núi đá vôi nhiều lớp + mặt nước + đường cong vàng. Chỉ PA1; màu lấy từ token qua currentColor / class.
 */
function BayArt() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 900 520"
      preserveAspectRatio="xMaxYMax slice"
      fill="none"
      className="pointer-events-none absolute inset-y-0 right-0 -z-10 h-full w-full [mask-image:linear-gradient(to_right,transparent,black_35%)] lg:w-[70%] pa2:hidden"
    >
      <g className="text-emerald-800" fill="currentColor">
        <path
          opacity="0.5"
          d="M0 520V400L60 392C90 360 105 300 130 296C150 294 160 350 175 356C190 330 205 270 232 266C258 262 268 330 290 340C310 320 330 300 352 304C372 308 380 360 400 362C430 300 452 210 485 206C515 204 525 300 548 316C570 300 585 286 606 290C630 296 640 340 660 344C690 290 712 236 742 232C770 230 782 300 800 320C820 300 840 280 862 284C880 288 890 310 900 320V520Z"
        />
        <path
          opacity="0.85"
          d="M0 520V440C40 438 70 436 100 432C130 400 150 360 175 358C198 356 205 400 222 410C245 390 262 350 290 348C315 346 322 400 345 414C370 400 392 380 418 382C445 384 452 420 470 428C500 380 528 330 560 328C590 326 600 390 622 410C650 396 672 382 698 384C724 386 734 420 752 430C780 400 806 372 834 370C860 368 880 400 900 416V520Z"
        />
      </g>
      <g className="text-emerald-600">
        <path stroke="currentColor" strokeWidth="1" opacity="0.35" d="M0 470h900M120 486h780M260 502h640" />
      </g>
      <g className="text-gold-500" stroke="currentColor">
        <path strokeWidth="1.5" opacity="0.75" d="M80 520C330 520 560 470 700 380S860 190 900 150" />
        <path strokeWidth="0.75" opacity="0.4" d="M160 520C400 516 600 476 740 396S880 230 900 214" />
      </g>
    </svg>
  );
}

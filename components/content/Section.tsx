import type { ReactNode } from "react";

/**
 * Khung khối nội dung (T3.7): `empty` → không render gì (không tiêu đề mồ côi); mỗi khối có data-section=<tên>
 * để e2e đọc thứ tự. Màu theo token ngữ nghĩa (đổi theo phương án pa1 / pa2 mà không đổi markup).
 */
export type SectionTone = "page" | "alt" | "band";

const TONE: Record<SectionTone, string> = {
  page: "",
  alt: "bg-(--surface-alt)",
  band: "surface-dark bg-(--surface-band) bg-(image:--surface-band-image) text-(--on-band)",
};

export function Section({
  name,
  id,
  tone = "page",
  eyebrow,
  heading,
  intro,
  aside,
  align = "start",
  titleStyle = "default",
  empty = false,
  className = "",
  children,
}: {
  name: string;
  id?: string;
  tone?: SectionTone;
  eyebrow?: string | null;
  heading?: string | null;
  intro?: ReactNode;
  /** Phần bên phải tiêu đề (vd. liên kết «Xem tất cả»). */
  aside?: ReactNode;
  align?: "start" | "center";
  /** `ornament` = tiêu đề chữ hoa giữa hai vạch vàng, căn giữa (kiểu tiêu đề khối của mockup). */
  titleStyle?: "default" | "ornament";
  empty?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  if (empty) return null;
  const headingId = heading ? `${id ?? name}-title` : undefined;
  const dark = tone === "band";
  const ornament = titleStyle === "ornament";
  const centered = align === "center" || ornament;
  return (
    <section id={id} data-section={name} aria-labelledby={headingId} className={`${TONE[tone]} ${className}`}>
      <div className="container-page section-y">
        {(heading || eyebrow) && (
          <header
            className={`flex flex-wrap gap-x-8 gap-y-4 ${centered ? "flex-col items-center text-center" : "items-end justify-between"}`}
          >
            <div className={ornament ? "w-full" : "max-w-(--container-prose)"}>
              {eyebrow && (
                <p className={`text-eyebrow font-semibold uppercase ${dark ? "text-(--on-band-accent)" : "text-(--on-page-accent)"}`}>{eyebrow}</p>
              )}
              {heading && !ornament && (
                <h2 id={headingId} className={`mt-3 font-display text-h2 ${dark ? "text-(--on-band)" : "text-(--on-page-heading)"}`}>
                  {heading}
                </h2>
              )}
              {heading && ornament && (
                <h2
                  id={headingId}
                  className={`flex items-center justify-center gap-4 font-display text-h3 uppercase tracking-title sm:gap-6 ${
                    dark ? "text-(--on-band-accent)" : "text-(--on-page-heading)"
                  }`}
                >
                  <span aria-hidden="true" className="h-px w-8 shrink-0 bg-(--line-accent) sm:w-24 lg:w-40" />
                  <span className="min-w-0 [overflow-wrap:anywhere]">{heading}</span>
                  <span aria-hidden="true" className="h-px w-8 shrink-0 bg-(--line-accent) sm:w-24 lg:w-40" />
                </h2>
              )}
              {intro && (
                <div className={`mt-4 text-lead ${ornament ? "mx-auto max-w-(--container-prose)" : ""} ${dark ? "text-(--on-band-muted)" : "text-(--on-page-muted)"}`}>
                  {intro}
                </div>
              )}
            </div>
            {aside}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

import type { ReactNode } from "react";

/**
 * Khung khối nội dung (T3.7): `empty` → không render gì (không tiêu đề mồ côi); mỗi khối có data-section=<tên>
 * để e2e đọc thứ tự. Màu theo token ngữ nghĩa (đổi theo phương án pa1 / pa2 mà không đổi markup).
 */
export type SectionTone = "page" | "alt" | "band";

const TONE: Record<SectionTone, string> = {
  page: "",
  alt: "bg-(--surface-alt)",
  band: "surface-dark bg-(--surface-band) text-ivory-100",
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
  empty?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  if (empty) return null;
  const headingId = heading ? `${id ?? name}-title` : undefined;
  const dark = tone === "band";
  return (
    <section id={id} data-section={name} aria-labelledby={headingId} className={`${TONE[tone]} ${className}`}>
      <div className="container-page section-y">
        {(heading || eyebrow) && (
          <header
            className={`flex flex-wrap items-end justify-between gap-x-8 gap-y-4 ${align === "center" ? "flex-col items-center text-center" : ""}`}
          >
            <div className="max-w-(--container-prose)">
              {eyebrow && (
                <p className={`text-eyebrow font-semibold uppercase ${dark ? "text-gold-300" : "text-(--on-page-accent)"}`}>{eyebrow}</p>
              )}
              {heading && (
                <h2 id={headingId} className={`mt-3 font-display text-h2 ${dark ? "text-ivory-100" : "text-(--on-page-heading)"}`}>
                  {heading}
                </h2>
              )}
              {intro && <div className={`mt-4 text-lead ${dark ? "text-emerald-100" : "text-(--on-page-muted)"}`}>{intro}</div>}
            </div>
            {aside}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

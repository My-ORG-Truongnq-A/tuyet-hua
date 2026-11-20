import type { ReactNode } from "react";
import { Breadcrumb, type Crumb } from "@/components/layout/Breadcrumb";

/**
 * Đầu trang trong (phần chung): breadcrumb, eyebrow, H1, đoạn mở đầu, nút, ảnh bên phải.
 * Màu theo token --surface-hero / --on-hero → đổi theo phương án mà không đổi markup.
 * Chữ «rise» nhẹ (chỉ transform / opacity, tắt khi reduced-motion); ảnh (LCP) không hiệu ứng.
 */
export function PageHero({
  crumbs,
  crumbLabel,
  eyebrow,
  title,
  lead,
  actions,
  media,
  children,
}: {
  crumbs: Crumb[];
  crumbLabel: string;
  eyebrow?: ReactNode;
  title: string;
  lead?: ReactNode;
  actions?: ReactNode;
  media?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section data-section="hero" className="surface-hero bg-(--surface-hero) text-(--on-hero)">
      <div
        className={`container-page grid gap-10 pt-6 pb-14 lg:pt-12 lg:pb-20 ${media ? "lg:grid-cols-[1.1fr_0.9fr] lg:items-end" : ""}`}
      >
        <div>
          <Breadcrumb items={crumbs} label={crumbLabel} className="text-(--on-hero-muted)" />
          {eyebrow && <p className="mt-8 text-eyebrow font-semibold uppercase text-(--on-hero-accent)">{eyebrow}</p>}
          <h1 className={`${eyebrow ? "mt-3" : "mt-8"} font-display text-display [overflow-wrap:anywhere]`}>{title}</h1>
          <div className="animate-rise">
            {lead && <div className="mt-5 max-w-(--container-prose) text-lead text-(--on-hero-muted)">{lead}</div>}
            {actions && <div className="mt-8 flex flex-wrap items-center gap-4">{actions}</div>}
            {children}
          </div>
        </div>
        {media}
      </div>
    </section>
  );
}

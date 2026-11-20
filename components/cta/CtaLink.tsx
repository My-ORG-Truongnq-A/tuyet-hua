import type { ReactNode } from "react";
import type { ResolvedLink } from "@/lib/links";
import { Icon, ZaloMark } from "../ui/Icon";

/**
 * Một nguồn cho mọi nút / liên kết hành động (T3.4): luôn là thẻ <a> (zalo.me, tel:, nội bộ, ngoài) —
 * không <form>, không script. Vùng bấm ≥ 44px. Màu nút chính theo token --cta-* của phương án.
 */
const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-5 text-sm font-semibold uppercase tracking-wide transition-colors duration-200";

const VARIANT = {
  primary: `${BASE} bg-(--cta-bg) text-(--cta-fg) shadow-soft hover:bg-(--cta-bg-hover)`,
  secondary: `${BASE} border border-current hover:bg-current/10`,
} as const;

export function CtaLink({
  link,
  fallbackLabel,
  variant = "primary",
  className = "",
}: {
  link: ResolvedLink | null;
  fallbackLabel?: string | null;
  variant?: keyof typeof VARIANT;
  className?: string;
}) {
  const label = link?.label ?? fallbackLabel;
  if (!link || !label) return null;
  return (
    <a
      href={link.href}
      data-cta={link.kind === "zalo" ? "zalo" : link.kind === "phone" ? "call" : undefined}
      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${VARIANT[variant]} ${className}`}
    >
      {link.kind === "zalo" && <ZaloMark />}
      {link.kind === "phone" && <Icon name="phone" className="size-5" />}
      {label}
    </a>
  );
}

/** Liên kết chữ có mũi tên (trượt nhẹ khi hover — chỉ transform). */
export function TextLink({
  href,
  children,
  tone = "light",
  className = "",
}: {
  href: string;
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`group inline-flex min-h-11 items-center gap-2 text-sm font-semibold uppercase tracking-wide ${
        tone === "dark" ? "text-gold-300" : "text-emerald-800"
      } ${className}`}
    >
      {children}
      <Icon name="arrow" className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
    </a>
  );
}

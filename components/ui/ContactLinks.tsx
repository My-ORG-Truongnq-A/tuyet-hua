import { formatPhone, telHref, zaloHref } from "@/lib/contact";
import { Icon, ZaloMark } from "./Icon";

/**
 * Một nguồn cho mọi nút liên hệ (T3.4, YC-07). Số lấy từ siteSettings; thiếu số → không render.
 * Zalo là liên kết thường (zalo.me), không nhúng script.
 */
const BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-5 text-sm font-semibold uppercase tracking-wide transition-colors duration-200";

export function ZaloButton({ phone, label, className = "" }: { phone: string | null; label: string; className?: string }) {
  const href = zaloHref(phone);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cta="zalo"
      className={`${BUTTON} bg-(--cta-bg) text-(--cta-fg) shadow-soft hover:bg-(--cta-bg-hover) ${className}`}
    >
      <ZaloMark /> {label}
    </a>
  );
}

export function CallIconLink({ phone, label, className = "" }: { phone: string | null; label: (p: string) => string; className?: string }) {
  const href = telHref(phone);
  const display = formatPhone(phone);
  if (!href || !display) return null;
  return (
    <a
      href={href}
      aria-label={label(display)}
      data-cta="call"
      className={`grid size-11 place-items-center rounded-sm ring-1 ring-current ${className}`}
    >
      <Icon name="phone" className="size-5" />
    </a>
  );
}

export function PhoneText({ phone, className = "" }: { phone: string | null; className?: string }) {
  const href = telHref(phone);
  const display = formatPhone(phone);
  if (!href || !display) return null;
  return (
    <a href={href} data-cta="call" className={`inline-flex min-h-11 items-center gap-2 ${className}`}>
      <Icon name="phone" className="size-5" /> {display}
    </a>
  );
}

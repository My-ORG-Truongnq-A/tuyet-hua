import type { ReactNode } from "react";

/** Icon nét mảnh (stroke = currentColor), aria-hidden. Theo mockup (components/ui.tsx). */
const PATHS = {
  arrow: <path d="M4 12h15M14 6l6 6-6 6" />,
  phone: <path d="M5 3h4l2 5-3 2a12 12 0 006 6l2-3 5 2v4a2 2 0 01-2 2A18 18 0 013 5a2 2 0 012-2z" />,
  pin: (
    <>
      <path d="M12 22s7-6.5 7-12a7 7 0 00-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  menu: <path d="M3 7h18M3 12h18M3 17h18" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "size-6" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}

/** Biểu tượng Zalo đơn giản (chữ Z trong bong bóng) — không nhúng script Zalo (YC-07). */
export function ZaloMark({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    >
      <path d="M12 3c5 0 9 3.4 9 7.6s-4 7.6-9 7.6c-1 0-2-.1-2.9-.4L5 20l.8-3.6C4 15 3 13 3 10.6 3 6.4 7 3 12 3z" />
      <path d="M9 8.5h5l-5 5h5" strokeLinecap="round" />
    </svg>
  );
}

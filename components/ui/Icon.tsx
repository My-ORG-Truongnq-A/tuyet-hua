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
  /* Icon nét mảnh theo mockup (khối «Giá trị tôi mang đến», trụ cột hero, số liệu) */
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
      <path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4" />
    </>
  ),
  diamond: <path d="M6.5 4h11L21 9l-9 11L3 9zM3 9h18M9.5 4L8 9l4 11 4-11-1.5-5" />,
  handshake: (
    <path d="M2 11l4-4 3 1 3-2 3 1 3-1 4 4M2 11l3 3M22 11l-3 3M8 13l2.5 2.5a1.4 1.4 0 002-2L10 11l2-1.5 4.5 4.5a1.4 1.4 0 01-2 2M12.5 15.5l1 1a1.4 1.4 0 002-2M5 14l2.5 2.5a1.4 1.4 0 002-2" />
  ),
  scale: <path d="M12 3v17M7 20h10M4 6h16M12 4.5a1.5 1.5 0 100 .01M6 6l-3 7a3 3 0 006 0zM18 6l-3 7a3 3 0 006 0z" />,
  people: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M16 14.2c2.9.2 5 2.3 5 5.3" />
    </>
  ),
  chart: <path d="M3 21h18M5 17v-3M9.5 17v-6M14 17V8.5M18.5 17V5M4 11l5-4 4 2.5L20 3M16 3h4v4" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="1.5" />
      <path d="M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4" />
    </>
  ),
  building: <path d="M4 21V5l8-2v18M12 21V8l8 2.5V21M2 21h20M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2" />,
  quote: <path d="M10 7c-3 1-5 3.3-5 6.5V17h5v-5H7.2c.3-1.8 1.4-3 3.3-3.6zM19 7c-3 1-5 3.3-5 6.5V17h5v-5h-2.8c.3-1.8 1.4-3 3.3-3.6z" />,
} satisfies Record<string, ReactNode>;

/** Icon mặc định theo vị trí cho danh sách giá trị khi CMS không ghi `icon` (thứ tự icon như mockup). */
export const VALUE_ICONS = ["target", "diamond", "handshake", "scale", "people", "chart"] as const satisfies readonly IconName[];

export function valueIcon(name: string | null | undefined, index: number): IconName {
  return name && name in PATHS ? (name as IconName) : VALUE_ICONS[index % VALUE_ICONS.length]!;
}

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

/**
 * Header bảo mật (BM-01) — dùng trong next.config.ts `headers()`. KHÔNG import gì (next.config nạp trực tiếp).
 * Đặt trong next.config chứ không ở cấu hình nền tảng: `next start` của bản build local phải trả đúng header.
 */
export const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

/**
 * CSP cho site công khai (không áp cho /studio — Studio cần kết nối *.sanity.io).
 * Trang render tĩnh nên không dùng nonce; script inline của Next cần 'unsafe-inline'.
 * Không script bên thứ ba; tracking (GTM / GA4) chỉ mở nguồn khi bật trên production — `extra` lấy từ
 * trackingCspSources() trong lib/analytics.ts.
 */
export function contentSecurityPolicy({
  isDev,
  extra = {},
}: {
  isDev: boolean;
  extra?: { script?: string[]; connect?: string[]; img?: string[] };
}): string {
  const add = (list?: string[]) => (list?.length ? ` ${list.join(" ")}` : "");
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${add(extra.script)}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://cdn.sanity.io${add(extra.img)}`,
    "font-src 'self' data:",
    `connect-src 'self'${isDev ? " ws:" : ""}${add(extra.connect)}`,
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; ");
}

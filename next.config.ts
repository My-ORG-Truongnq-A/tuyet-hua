import type { NextConfig } from "next";
import { resolveTracking, trackingCspSources } from "./lib/analytics";
import { env } from "./lib/env";
import { indexingAllowed } from "./lib/indexing";
import { contentSecurityPolicy, securityHeaders } from "./lib/security-headers";

const canonicalHost = new URL(env.siteUrl).host;
const canonicalHostname = new URL(env.siteUrl).hostname;
const siteIndexable = indexingAllowed({
  isProductionDeploy: env.isProductionDeploy,
  allowIndexing: env.allowIndexing,
  canonicalHost,
});
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, (m) => `\\${m}`);
const NOINDEX = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: false,
  // Không để `next dev` tự ghi thêm vào AGENTS.md của repo.
  agentRules: false,
  // Hai root layout (vi / en) → 404 toàn cục qua app/global-not-found.tsx (KT-06).
  experimental: { globalNotFound: true },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
    // Ảnh seed (BP-05) đi qua bộ tối ưu của Next; chỉ đường dẫn này, không query.
    localPatterns: [{ pathname: "/seed-assets/**", search: "" }],
    qualities: [75],
  },
  async rewrites() {
    // Tiếng Anh chưa bật (SITE_LANGUAGES=vi, REQ-17): mọi /en/* trả 404 toàn cục.
    if (env.languages.includes("en")) return [];
    return {
      beforeFiles: [
        { source: "/en", destination: "/__khong-ton-tai" },
        { source: "/en/:path*", destination: "/__khong-ton-tai" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      // BM-01: mọi route.
      { source: "/:path*", headers: securityHeaders },
      // CSP cho site công khai; Studio (/studio) cần kết nối Sanity nên loại trừ.
      {
        source: "/:path((?!studio(?:/|$)).*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy({
              isDev: process.env.NODE_ENV === "development",
              // Chỉ mở host Google khi tracking thật sự được nhúng (production + có ID — TR-01).
              extra: trackingCspSources(resolveTracking(env)),
            }),
          },
        ],
      },
      // SEO-01 lớp 2: X-Robots-Tag. Được index thì vẫn chặn mọi host khác host chuẩn (alias, domain tạm).
      siteIndexable
        ? {
            source: "/:path*",
            missing: [{ type: "host" as const, value: escapeRegex(canonicalHostname) }],
            headers: NOINDEX,
          }
        : { source: "/:path*", headers: NOINDEX },
      { source: "/studio/:path*", headers: NOINDEX },
    ];
  },
};

export default nextConfig;

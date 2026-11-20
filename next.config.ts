import type { NextConfig } from "next";
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
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
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
            value: contentSecurityPolicy({ isDev: process.env.NODE_ENV === "development" }),
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

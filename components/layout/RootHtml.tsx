import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "@/app/fonts";
import { Analytics } from "@/components/seo/Analytics";
import { resolveSiteVerification } from "@/lib/analytics";
import { env, type Lang } from "@/lib/env";

/**
 * Metadata chung của hai root layout: meta xác minh Search Console khi có GOOGLE_SITE_VERIFICATION trên
 * production thật (TR-01). Metadata từng trang (buildMetadata) gộp lên trên.
 */
export function rootMetadata(): Metadata {
  const google = resolveSiteVerification(env);
  return {
    manifest: "/manifest.webmanifest",
    icons: { icon: [{ url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" }, { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }], apple: "/icons/apple-touch-icon.png" },
    ...(google ? { verification: { google } } : {}),
  };
}

/**
 * <html> / <body> cho hai root layout (vi / en — BP-01). Header / footer nằm ở layout (site) lồng bên trong,
 * để not-found.tsx của (site) render đủ HTML phía server (404 có header / footer — KT-06).
 * Tracking gắn ở đây (một chỗ — TR-01); /studio có root layout riêng nên không có tracking.
 */
export function RootHtml({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <html lang={lang} className={fontVariables}>
      <body className="flex min-h-dvh flex-col bg-(--surface-page) text-(--on-page)">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

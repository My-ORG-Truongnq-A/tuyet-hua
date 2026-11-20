import type { ReactNode } from "react";
import { fontVariables } from "@/app/fonts";
import type { Lang } from "@/lib/env";

/**
 * <html> / <body> cho hai root layout (vi / en — BP-01). Header / footer nằm ở layout (site) lồng bên trong,
 * để not-found.tsx của (site) render đủ HTML phía server (404 có header / footer — KT-06).
 */
export function RootHtml({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <html lang={lang} className={fontVariables}>
      <body className="flex min-h-dvh flex-col bg-(--surface-page) text-(--on-page)">{children}</body>
    </html>
  );
}

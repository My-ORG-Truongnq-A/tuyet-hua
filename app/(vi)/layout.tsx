import type { ReactNode } from "react";
import { RootHtml } from "@/components/layout/RootHtml";
import "../globals.css";

/** Root layout tiếng Việt (không tiền tố URL) — BP-01. */
export default function ViRootLayout({ children }: { children: ReactNode }) {
  return <RootHtml lang="vi">{children}</RootHtml>;
}

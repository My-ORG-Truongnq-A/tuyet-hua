import type { ReactNode } from "react";
import { RootHtml } from "@/components/layout/RootHtml";
import "../../globals.css";

/** Root layout tiếng Anh dưới /en — BP-01. Tiếng Anh tắt (SITE_LANGUAGES=vi) thì mọi trang /en trả 404. */
export default function EnRootLayout({ children }: { children: ReactNode }) {
  return <RootHtml lang="en">{children}</RootHtml>;
}

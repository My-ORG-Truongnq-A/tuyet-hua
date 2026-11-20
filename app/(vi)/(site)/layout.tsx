import type { ReactNode } from "react";
import { SiteChrome } from "@/components/layout/SiteChrome";

export default function ViSiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome lang="vi">{children}</SiteChrome>;
}

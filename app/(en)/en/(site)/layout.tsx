import type { ReactNode } from "react";
import { SiteChrome } from "@/components/layout/SiteChrome";

export default function EnSiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome lang="en">{children}</SiteChrome>;
}

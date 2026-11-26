import type { Metadata } from "next";
import type { Lang } from "@/lib/env";
import { UI } from "@/lib/ui-strings";

export const notFoundMetadata = (lang: Lang): Metadata => ({
  title: { absolute: UI[lang].notFound.title },
  robots: { index: false, follow: false },
});

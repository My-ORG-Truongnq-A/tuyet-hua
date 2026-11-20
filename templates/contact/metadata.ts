import type { Lang } from "@/lib/env";
import { staticPageMetadata } from "../shared/page-data";

export const contactMetadata = (lang: Lang) => staticPageMetadata({ type: "contactPage", key: "contact", lang, descKey: "contact" });

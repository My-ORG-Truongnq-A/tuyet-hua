import type { Lang } from "@/lib/env";
import { staticPageMetadata } from "../shared/page-data";

export const aboutMetadata = (lang: Lang) => staticPageMetadata({ type: "aboutPage", key: "about", lang, descKey: "about", ogType: "profile" });

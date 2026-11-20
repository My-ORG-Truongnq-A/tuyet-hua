import type { Lang } from "@/lib/env";
import { staticPageMetadata } from "../shared/page-data";

export const privacyMetadata = (lang: Lang) => staticPageMetadata({ type: "privacyPage", key: "privacy", lang, descKey: "privacy" });

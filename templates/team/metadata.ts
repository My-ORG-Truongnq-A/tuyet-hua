import type { Lang } from "@/lib/env";
import { staticPageMetadata } from "../shared/page-data";

export const teamMetadata = (lang: Lang) => staticPageMetadata({ type: "teamPage", key: "team", lang, descKey: "team" });

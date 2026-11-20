import type { Lang } from "@/lib/env";
import { staticPageMetadata } from "../shared/page-data";

export const projectsMetadata = (lang: Lang) => staticPageMetadata({ type: "projectsPage", key: "projects", lang, descKey: "projects" });

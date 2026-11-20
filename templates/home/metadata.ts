import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/content/site-settings";
import { env, type Lang } from "@/lib/env";
import { pathFor } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";

/** Metadata trang chủ: title tuyệt đối «Tên — tagline», hreflang chỉ khi ngôn ngữ kia đang bật. */
export async function homeMetadata(lang: Lang): Promise<Metadata> {
  const settings = await getSiteSettings(lang);
  const other: Lang = lang === "vi" ? "en" : "vi";
  const translations = env.languages.includes(other) ? { [other]: pathFor("home", other) } : {};
  return buildMetadata({
    lang,
    path: pathFor("home", lang),
    absoluteTitle: [settings.personName, settings.tagline].filter(Boolean).join(" — "),
    settings,
    translations,
    type: "profile",
  });
}

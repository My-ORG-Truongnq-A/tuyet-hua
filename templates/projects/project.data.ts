import type { Metadata } from "next";
import { cache } from "react";
import { getProjectBySlug, getProjects, getTranslations } from "@/lib/content/pages";
import { getSiteSettings } from "@/lib/content/site-settings";
import type { Figure, LinkValue, PageDocument } from "@/lib/content/types";
import { env, type Lang } from "@/lib/env";
import type { PortableValue } from "@/lib/portable-text";
import { pathFor } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";
import { UI } from "@/lib/ui-strings";
import { notFoundMetadata } from "../not-found/metadata";
import { ogImage, pageDescription } from "../shared/page-data";
import type { ProjectValueProposition } from "./ValueProposition";

/** project (content_model) sau lớp dữ liệu. */
export type Project = PageDocument & {
  title: string;
  slug?: { current?: string } | null;
  featured?: boolean | null;
  summary?: string | null;
  heroImage?: Figure | null;
  location?: string | null;
  developer?: string | null;
  productTypes?: string[] | null;
  legalStatus?: string | null;
  progress?: string | null;
  valueProposition?: ProjectValueProposition;
  personalExperience?: PortableValue;
  body?: PortableValue;
  gallery?: Figure[] | null;
  faqs?: { _key?: string; question?: string | null; answer?: PortableValue }[] | null;
  cta?: LinkValue | null;
};

/** Dự án theo slug; ngôn ngữ tắt / không có / bản nháp → null (trang trả 404). */
export const loadProject = cache(async (lang: Lang, slug: string): Promise<Project | null> => {
  if (!env.languages.includes(lang)) return null;
  return getProjectBySlug<Project>(lang, slug);
});

/** Đường dẫn bản dịch đang bật (hreflang, chuyển ngôn ngữ) — từ translation.metadata. */
export async function projectTranslations(id: string, lang: Lang): Promise<Partial<Record<Lang, string>>> {
  const refs = await getTranslations(id);
  const out: Partial<Record<Lang, string>> = {};
  for (const r of refs) {
    const l = r.language as Lang;
    if (l !== lang && env.languages.includes(l) && r.slug && r._type === "project") out[l] = pathFor("projectDetail", l, { slug: r.slug });
  }
  return out;
}

export async function projectStaticParams(lang: Lang) {
  if (!env.languages.includes(lang)) return [];
  return (await getProjects(lang)).map((p) => ({ slug: p.slug }));
}

export async function projectMetadata(lang: Lang, slug: string): Promise<Metadata> {
  const [project, settings] = await Promise.all([loadProject(lang, slug), getSiteSettings(lang)]);
  if (!project) return notFoundMetadata(lang);
  return buildMetadata({
    lang,
    path: pathFor("projectDetail", lang, { slug }),
    title: project.seo?.title || UI[lang].seo.projectTitle(project.title),
    description: pageDescription(lang, settings, "project", [project.seo?.description, project.summary], { title: project.title }),
    settings,
    translations: await projectTranslations(project._id, lang),
    image: ogImage([project.seo?.ogImage, project.heroImage?.pending ? null : project.heroImage?.image], settings, "projectDetail", lang),
    noindex: project.seo?.noindex === true,
  });
}

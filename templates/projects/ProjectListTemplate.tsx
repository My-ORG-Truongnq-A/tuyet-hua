import { notFound } from "next/navigation";
import { Section } from "@/components/content/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProjects } from "@/lib/content/pages";
import type { PageDocument } from "@/lib/content/types";
import type { Lang } from "@/lib/env";
import { graph, itemListNode, webPageNode } from "@/lib/json-ld";
import { pathFor } from "@/lib/routes";
import { SITE_URL } from "@/lib/site-url";
import { UI } from "@/lib/ui-strings";
import { ProjectItem } from "../shared/blocks";
import { PageHero } from "../shared/PageHero";
import { breadcrumbJsonLd, breadcrumbs, loadStaticPage } from "../shared/page-data";

type ProjectsPage = PageDocument & { intro?: string | null };

/**
 * Danh sách dự án (T4.10): mọi project đã publish theo ngôn ngữ, dự án trọng tâm đứng đầu. Thêm / ẩn dự án
 * trong CMS → danh sách đổi, không sửa code (REQ-02). JSON-LD CollectionPage + ItemList + BreadcrumbList.
 */
export async function ProjectListTemplate({ lang }: { lang: Lang }) {
  const data = await loadStaticPage<ProjectsPage>("projectsPage", lang);
  if (!data) notFound();
  const { page, settings, nav } = data;
  const projects = await getProjects(lang);
  const t = UI[lang];
  const path = pathFor("projects", lang);
  const title = page.title || t.sections.projects;
  const crumbs = breadcrumbs(lang, settings, nav, [{ target: "projects", key: "projects" }]);
  const items = projects.map((p) => ({ name: p.title, path: pathFor("projectDetail", lang, { slug: p.slug }) }));
  return (
    <>
      <JsonLd
        data={graph([
          webPageNode({
            siteUrl: SITE_URL,
            path,
            name: title,
            lang,
            type: "CollectionPage",
            description: page.intro,
            hasPart: items.length ? itemListNode(SITE_URL, items) : null,
          }),
          breadcrumbJsonLd(crumbs),
        ])}
      />
      <PageHero crumbs={crumbs} crumbLabel={t.breadcrumb} title={title} lead={page.intro} />
      <Section name="projectList">
        {projects.length ? (
          <ul className="grid gap-x-12 gap-y-16 md:grid-cols-2">
            {projects.map((p, i) => (
              <li key={p._id} className={i === 0 && p.featured ? "md:col-span-2" : ""}>
                <ProjectItem project={p} lang={lang} large={i === 0 && p.featured === true} headingLevel="h2" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lead text-(--on-page-muted)">{t.project.empty}</p>
        )}
      </Section>
    </>
  );
}

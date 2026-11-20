import { Section } from "@/components/content/Section";
import type { ProjectListItem } from "@/lib/content/types";
import type { Lang } from "@/lib/env";
import { pathFor } from "@/lib/routes";
import { UI } from "@/lib/ui-strings";
import { ProjectItem, TextLink } from "../../shared/blocks";
import type { HomePage } from "../home.data";

/**
 * Dự án đang triển khai (T4.5): projectList (dự án trọng tâm đứng đầu). Thêm / ẩn dự án trong CMS → khối đổi theo,
 * không sửa code (REQ-02). Dự án chỉ xuất hiện ở khối này trên trang chủ (REQ-01).
 */
export function Projects({ lang, section, projects }: { lang: Lang; section: HomePage["projectsSection"]; projects: ProjectListItem[] }) {
  const t = UI[lang];
  const [first, ...rest] = projects;
  return (
    <Section
      name="projects"
      heading={section?.heading ?? t.sections.projects}
      intro={section?.intro}
      empty={!first}
      aside={<TextLink href={pathFor("projects", lang)}>{section?.viewAllLabel ?? t.viewAll}</TextLink>}
    >
      {first && (
        <div className={`mt-12 grid gap-12 ${rest.length ? "lg:grid-cols-[1.4fr_1fr]" : ""}`}>
          <ProjectItem project={first} lang={lang} large />
          {rest.length > 0 && (
            <div className="grid content-start gap-12">
              {rest.map((p) => (
                <ProjectItem key={p._id} project={p} lang={lang} />
              ))}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

import { PendingLabel } from "@/components/content/PendingLabel";
import { Section } from "@/components/content/Section";
import { TextLink } from "@/components/cta/CtaLink";
import { Figure } from "@/components/media/Figure";
import { Icon } from "@/components/ui/Icon";
import type { ProjectListItem } from "@/lib/content/types";
import type { Lang } from "@/lib/env";
import { pathFor } from "@/lib/routes";
import { UI } from "@/lib/ui-strings";
import type { HomePage } from "../home.data";

/**
 * Dự án đang triển khai — theo mockup: dải emerald, tiêu đề vàng giữa hai vạch, mỗi dự án là thẻ ngang
 * (ảnh viền vàng mảnh bên trái, tên chữ hoa + nhãn «Dự án trọng tâm» + tóm tắt + «Xem chi tiết →» bên phải), 2 thẻ / hàng.
 * Danh sách từ CMS (thêm / ẩn dự án không sửa code — REQ-02); dự án chỉ xuất hiện ở khối này trên trang chủ (REQ-01).
 */
export function Projects({ lang, section, projects }: { lang: Lang; section: HomePage["projectsSection"]; projects: ProjectListItem[] }) {
  const t = UI[lang];
  return (
    <Section
      name="projects"
      tone="band"
      titleStyle="ornament"
      heading={section?.heading ?? t.sections.projects}
      intro={section?.intro}
      empty={!projects.length}
    >
      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-12">
        {projects.map((p) => (
          <ProjectRow key={p._id} project={p} lang={lang} />
        ))}
      </div>
      <p className="mt-10 text-center">
        <TextLink href={pathFor("projects", lang)} tone="dark">
          {section?.viewAllLabel ?? t.viewAll}
        </TextLink>
      </p>
    </Section>
  );
}

function ProjectRow({ project, lang }: { project: ProjectListItem; lang: Lang }) {
  const t = UI[lang];
  const href = pathFor("projectDetail", lang, { slug: project.slug });
  return (
    <article data-project={project.slug} className="group relative grid gap-5 sm:grid-cols-[1.25fr_1fr] sm:items-center sm:gap-6">
      <Figure
        figure={project.heroImage}
        lang={lang}
        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 50vw, 100vw"
        className="overflow-hidden rounded-(--radius-card) ring-1 ring-gold-500/70"
        imgClassName="aspect-[16/11] h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        placeholder={`${t.pending.image} — ${project.title}`}
        tone="dark"
        caption={false}
      />
      <div>
        <h3 className="font-display text-h3 uppercase tracking-wide text-ivory-100 [overflow-wrap:anywhere]">
          <a href={href} className="after:absolute after:inset-0 hover:underline hover:underline-offset-4">
            {project.title}
          </a>
        </h3>
        {project.featured && (
          <p className="mt-3">
            <span className="inline-block rounded-xs bg-gold-400 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-950">
              {t.project.featured}
            </span>
          </p>
        )}
        {project.summary ? (
          <p className="mt-3 text-sm text-emerald-100">{project.summary}</p>
        ) : (
          <p className="mt-3">
            <PendingLabel tone="dark">{t.pending.content}</PendingLabel>
          </p>
        )}
        <p aria-hidden="true" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold-300">
          {t.viewProject}
          <Icon name="arrow" className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </p>
      </div>
    </article>
  );
}

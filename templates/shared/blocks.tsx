import type { ReactNode } from "react";
import { PendingLabel } from "@/components/content/PendingLabel";
import { TextLink } from "@/components/cta/CtaLink";
import { Figure } from "@/components/media/Figure";
import { Icon, valueIcon } from "@/components/ui/Icon";
import type { HighlightStat, PostListItem, ProjectListItem } from "@/lib/content/types";
import type { Lang } from "@/lib/env";
import { pathFor } from "@/lib/routes";
import { formatDate, UI } from "@/lib/ui-strings";

/**
 * Khối hiển thị dùng chung giữa các template (phần chung — chưa chọn phương án ở G2): danh sách đánh số và
 * đường kẻ mảnh (ít thẻ / icon — YC-11). Phương án được chọn thay phần giao diện (uiSlot) mà không đổi dữ liệu.
 */
export type ValueItem = { _key?: string; title?: string | null; description?: string | null; icon?: string | null };

/** Danh sách giá trị đánh số 01, 02… (số sinh từ vị trí, không lưu trong CMS). */
export function ValueList({ items, tone = "light", columns = 3 }: { items: ValueItem[]; tone?: "light" | "dark"; columns?: 2 | 3 }) {
  const list = items.filter((i) => i.title?.trim());
  if (!list.length) return null;
  const dark = tone === "dark";
  return (
    <ol className={`mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : ""}`}>
      {list.map((v, i) => (
        <li key={v._key ?? i} className={`border-t pt-6 ${dark ? "border-(--line-accent)/60" : "border-(--on-page-heading)"}`}>
          <p aria-hidden="true" className={`font-display text-h3 ${dark ? "text-(--on-band-accent)" : "text-(--on-page-accent)"}`}>
            {String(i + 1).padStart(2, "0")}
          </p>
          <h3 className={`mt-2 font-display text-h3 ${dark ? "text-(--on-band)" : "text-(--on-page-heading)"}`}>{v.title}</h3>
          {v.description && <p className={`mt-3 ${dark ? "text-(--on-band-muted)" : "text-(--on-page-muted)"}`}>{v.description}</p>}
        </li>
      ))}
    </ol>
  );
}

/**
 * Danh sách giá trị kiểu mockup: cột căn giữa, icon nét mảnh, tiêu đề chữ hoa nhỏ, vạch ngăn dọc mảnh (desktop).
 * Icon = valueItem.icon hoặc mặc định theo vị trí (`icons` cho thứ tự riêng).
 */
export function IconValueList({ items, icons }: { items: ValueItem[]; icons?: readonly string[] }) {
  const list = items.filter((i) => i.title?.trim());
  if (!list.length) return null;
  const cols = ["", "", "lg:grid-cols-2", "lg:grid-cols-3", "lg:grid-cols-4", "lg:grid-cols-5"][list.length] ?? "lg:grid-cols-6";
  return (
    <ul className={`mt-10 grid gap-y-10 sm:grid-cols-2 ${list.length >= 5 ? "md:grid-cols-3" : ""} ${cols}`}>
      {list.map((v, i) => (
        <li key={v._key ?? i} className="flex flex-col items-center px-4 text-center lg:border-l lg:border-(--line-subtle) lg:first:border-l-0">
          <Icon name={valueIcon(v.icon ?? icons?.[i], i)} className="size-10 text-(--on-page-heading)" />
          <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-(--on-page-heading)">{v.title}</h3>
          {v.description && <p className="mt-2 max-w-64 text-sm leading-relaxed text-(--on-page-muted)">{v.description}</p>}
        </li>
      ))}
    </ul>
  );
}

/** Số liệu đã qua gate (T2.7): release chỉ còn số đã xác nhận; preview gắn nhãn «chờ xác nhận». */
export function StatList({ stats, lang, tone = "light" }: { stats: HighlightStat[] | null | undefined; lang: Lang; tone?: "light" | "dark" }) {
  const list = (stats ?? []).filter((s) => s.value?.trim() && s.label?.trim());
  if (!list.length) return null;
  const dark = tone === "dark";
  return (
    <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
      {list.map((s, i) => (
        <div key={s._key ?? i} className={`flex flex-col border-t pt-5 ${dark ? "border-(--line-band)" : "border-(--line-subtle)"}`}>
          <dt className={`text-sm ${dark ? "text-(--on-band-muted)" : "text-(--on-page-muted)"}`}>{s.label}</dt>
          <dd className={`order-first mt-1 font-display text-stat ${dark ? "text-(--on-band-accent)" : "text-(--on-page-heading)"}`}>{s.value}</dd>
          {s.pending && (
            <dd className="mt-2">
              <PendingLabel tone={tone}>{UI[lang].pending.confirm}</PendingLabel>
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}

/** Dải kêu gọi cuối trang trên nền band (token --surface-band). */
export function CtaBand({ name = "cta", title, body, children }: { name?: string; title: string; body?: string | null; children: ReactNode }) {
  return (
    <section data-section={name} className="surface-dark bg-(--surface-band) text-(--on-band)">
      <div className="container-page flex flex-wrap items-center justify-between gap-8 py-14">
        <div className="max-w-(--container-prose)">
          <h2 className="font-display text-h2">{title}</h2>
          {body && <p className="mt-2 text-(--on-band-muted)">{body}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-6">{children}</div>
      </div>
    </section>
  );
}

/** Thẻ dự án: ảnh (hoặc ô chờ ảnh ở preview), tên, tóm tắt, liên kết chi tiết. */
export function ProjectItem({ project, lang, large = false, headingLevel = "h3" }: { project: ProjectListItem; lang: Lang; large?: boolean; headingLevel?: "h2" | "h3" }) {
  const t = UI[lang];
  const href = pathFor("projectDetail", lang, { slug: project.slug });
  const Heading = headingLevel;
  return (
    <article className="group relative flex flex-col" data-project={project.slug}>
      <Figure
        figure={project.heroImage}
        lang={lang}
        sizes={large ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 40vw, 100vw"}
        className="overflow-hidden rounded-sm"
        imgClassName="aspect-[16/10] h-auto object-cover"
        placeholder={`${t.pending.image} — ${project.title}`}
        caption={false}
      />
      <div className="mt-5">
        {project.featured && <p className="text-eyebrow font-semibold uppercase text-(--on-page-accent)">{t.project.featured}</p>}
        <Heading className={`mt-2 font-display ${large ? "text-h2" : "text-h3"} text-(--on-page-heading)`}>
          <a href={href} className="after:absolute after:inset-0 hover:underline hover:underline-offset-4">
            {project.title}
          </a>
        </Heading>
        {project.summary ? (
          <p className="mt-3 max-w-(--container-prose) text-(--on-page-muted)">{project.summary}</p>
        ) : (
          <p className="mt-3">
            <PendingLabel>{t.pending.content}</PendingLabel>
          </p>
        )}
        <p className="mt-2">
          <span className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold uppercase tracking-wide text-(--on-page-link)" aria-hidden="true">
            {t.viewProject} →
          </span>
        </p>
      </div>
    </article>
  );
}

/** Mục bài viết dạng danh sách: ngày, tiêu đề, mô tả ngắn (ảnh bìa tuỳ chọn). */
export function PostItem({ post, lang, withImage = false, headingLevel = "h3" }: { post: PostListItem; lang: Lang; withImage?: boolean; headingLevel?: "h2" | "h3" }) {
  const href = pathFor("postDetail", lang, { slug: post.slug });
  const date = formatDate(post.publishedAt, lang);
  const Heading = headingLevel;
  return (
    <article className="relative grid gap-4 border-t border-(--line-subtle) py-6 sm:grid-cols-[10rem_1fr] sm:gap-8">
      <div>
        {date && (
          <time dateTime={post.publishedAt} className="text-sm text-(--on-page-muted)">
            {date}
          </time>
        )}
        {withImage && (
          <Figure
            figure={post.coverImage}
            lang={lang}
            sizes="(min-width: 640px) 10rem, 100vw"
            className="mt-3 overflow-hidden rounded-sm"
            imgClassName="aspect-[4/3] h-auto object-cover"
            caption={false}
          />
        )}
      </div>
      <div>
        <Heading className="font-display text-h3 text-(--on-page-heading)">
          <a href={href} className="after:absolute after:inset-0 hover:underline hover:underline-offset-4">
            {post.title}
          </a>
        </Heading>
        {post.excerpt && <p className="mt-2 max-w-(--container-prose) text-(--on-page-muted)">{post.excerpt}</p>}
      </div>
    </article>
  );
}

export { TextLink };

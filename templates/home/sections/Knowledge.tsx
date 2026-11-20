import { PendingLabel } from "@/components/content/PendingLabel";
import { Section } from "@/components/content/Section";
import type { PostListItem } from "@/lib/content/types";
import { env, type Lang } from "@/lib/env";
import { pathFor } from "@/lib/routes";
import { UI } from "@/lib/ui-strings";
import { PostItem, TextLink } from "../../shared/blocks";
import type { HomePage } from "../home.data";

/**
 * Kiến thức — bài mới nhất (T4.7): số bài = knowledgeSection.postsLimit. Chưa có bài: preview hiện nhãn
 * «chờ bài viết đầu tiên», release ẩn cả khối (R-05).
 */
export function Knowledge({ lang, section, posts }: { lang: Lang; section: HomePage["knowledgeSection"]; posts: PostListItem[] }) {
  const t = UI[lang];
  const empty = !posts.length && env.contentMode !== "preview";
  return (
    <Section
      name="knowledge"
      tone="alt"
      heading={section?.heading ?? t.sections.knowledge}
      empty={empty}
      aside={posts.length ? <TextLink href={pathFor("posts", lang)}>{section?.viewAllLabel ?? t.viewAll}</TextLink> : null}
    >
      {posts.length ? (
        <div className="mt-10 border-b border-(--line-subtle)">
          {posts.map((p) => (
            <PostItem key={p._id} post={p} lang={lang} />
          ))}
        </div>
      ) : (
        <p className="mt-6">
          <PendingLabel>{t.pending.firstPost}</PendingLabel>
        </p>
      )}
    </Section>
  );
}

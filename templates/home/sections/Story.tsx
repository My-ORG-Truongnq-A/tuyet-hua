import { PendingLabel } from "@/components/content/PendingLabel";
import { RichText } from "@/components/content/RichText";
import { Section } from "@/components/content/Section";
import { Figure } from "@/components/media/Figure";
import type { Lang } from "@/lib/env";
import { hasBlocks } from "@/lib/portable-text";
import { pathFor } from "@/lib/routes";
import { UI } from "@/lib/ui-strings";
import { StatList, TextLink } from "../../shared/blocks";
import type { HomePage } from "../home.data";

/**
 * Về tôi + brand story (T4.3): câu chuyện «Tôi cũng là khách hàng của chính mình» từ homePage.story.quote,
 * số liệu nổi bật qua gate (release ẩn số chưa xác nhận), liên kết → /gioi-thieu.
 */
export function Story({ lang, story }: { lang: Lang; story: HomePage["story"] }) {
  const t = UI[lang];
  const hasBody = hasBlocks(story?.body);
  const empty = !story?.quote && !hasBody && !story?.highlights?.length;
  return (
    <Section name="story" heading={story?.heading ?? t.sections.story} empty={empty}>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div>
          {story?.quote && (
            <blockquote className="border-l-2 border-(--line-accent) pl-5 font-display text-h2 italic text-(--on-page-heading)">
              “{story.quote}”
            </blockquote>
          )}
          <RichText value={story?.body} lang={lang} className="mt-6 text-lead" />
          {!hasBody && (
            <p className="mt-6">
              <PendingLabel>{t.pending.content}</PendingLabel>
            </p>
          )}
          <p className="mt-6">
            <TextLink href={pathFor("about", lang)}>{story?.aboutLinkLabel ?? t.homeAbout}</TextLink>
          </p>
        </div>
        <Figure
          figure={story?.image}
          lang={lang}
          sizes="(min-width: 1024px) 30vw, 100vw"
          className="overflow-hidden rounded-sm"
          imgClassName="aspect-[4/3] h-auto object-cover"
          placeholder={t.pending.image}
        />
      </div>
      <StatList stats={story?.highlights} lang={lang} />
    </Section>
  );
}

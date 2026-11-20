import { PendingLabel } from "@/components/content/PendingLabel";
import { RichText } from "@/components/content/RichText";
import { Section } from "@/components/content/Section";
import { Figure } from "@/components/media/Figure";
import type { Testimonial } from "@/lib/content/types";
import type { Lang } from "@/lib/env";
import { hasBlocks } from "@/lib/portable-text";
import { pathFor } from "@/lib/routes";
import { UI } from "@/lib/ui-strings";
import { StatList, TextLink } from "../../shared/blocks";
import type { HomePage } from "../home.data";
import { Testimonials } from "./Testimonials";

/**
 * Uy tín & đội ngũ (T4.6): vai trò leader, số liệu (qua gate), cảm nhận khách (đã đồng ý),
 * liên kết «Tham gia đội ngũ cùng Tuyết» → /dao-tao-doi-ngu (REQ-04 — liên kết, không form).
 */
export function Trust({ lang, section, testimonials }: { lang: Lang; section: HomePage["trustSection"]; testimonials: Testimonial[] }) {
  const t = UI[lang];
  const hasBody = hasBlocks(section?.body);
  const hasStats = Boolean(section?.stats?.length);
  return (
    <Section name="trust" heading={section?.heading ?? t.sections.trust}>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div>
          <RichText value={section?.body} lang={lang} className="text-lead" />
          {!hasBody && !hasStats && (
            <p>
              <PendingLabel>{t.pending.content}</PendingLabel>
            </p>
          )}
          <p className="mt-6">
            <TextLink href={pathFor("team", lang)}>{section?.teamLinkLabel ?? t.pages.team}</TextLink>
          </p>
        </div>
        <Figure
          figure={section?.image}
          lang={lang}
          sizes="(min-width: 1024px) 30vw, 100vw"
          className="overflow-hidden rounded-sm"
          imgClassName="aspect-[4/3] h-auto object-cover"
        />
      </div>
      <StatList stats={section?.stats} lang={lang} />
      <Testimonials lang={lang} heading={section?.testimonialsHeading} items={testimonials} />
    </Section>
  );
}

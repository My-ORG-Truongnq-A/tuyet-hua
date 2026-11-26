import { PendingLabel } from "@/components/content/PendingLabel";
import { RichText } from "@/components/content/RichText";
import { TextLink } from "@/components/cta/CtaLink";
import { Figure } from "@/components/media/Figure";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { SiteSettings } from "@/lib/content/site-settings";
import type { Lang } from "@/lib/env";
import { hasBlocks } from "@/lib/portable-text";
import { pathFor } from "@/lib/routes";
import { UI } from "@/lib/ui-strings";
import { StatList } from "../../shared/blocks";
import type { HomePage } from "../home.data";

/**
 * Về tôi + brand story theo mockup: 3 cột trên desktop —
 * (1) nhãn «Về tôi» + tên + danh sách thông tin có icon (chỉ từ siteSettings, không thêm dòng khách chưa duyệt);
 * (2) thẻ trích dẫn nền vàng nhạt «Tôi cũng là khách hàng của chính mình» + câu chuyện + tên ký cuối thẻ;
 * (3) ảnh câu chuyện (thiếu → ô chờ ảnh ở preview, ghi rõ ảnh cần).
 * Số liệu nổi bật (nếu có, qua gate) nằm dưới. Liên kết → /gioi-thieu.
 */
export function Story({ lang, story, settings }: { lang: Lang; story: HomePage["story"]; settings: SiteSettings }) {
  const t = UI[lang];
  const hasBody = hasBlocks(story?.body);
  const empty = !story?.quote && !hasBody && !story?.highlights?.length;
  if (empty) return null;
  // 5 dòng như mockup: chức danh | công ty (siteSettings.jobTitle) · lĩnh vực · trọng tâm (homePage.story) · khu vực — dòng trống tự ẩn
  const facts: { icon: IconName; text: string }[] = [
    ...(settings.jobTitle ?? "")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((text, i) => ({ icon: (i === 0 ? "people" : "building") as IconName, text })),
    ...(story?.expertise?.trim() ? [{ icon: "handshake" as IconName, text: story.expertise.trim() }] : []),
    ...(story?.focus?.trim() ? [{ icon: "target" as IconName, text: story.focus.trim() }] : []),
    ...(settings.area ? [{ icon: "pin" as IconName, text: settings.area }] : []),
  ];
  return (
    <section data-section="story" aria-labelledby="story-title" className="bg-ivory-50">
      <div className="container-page section-y grid gap-8 md:grid-cols-2 lg:grid-cols-[0.82fr_0.98fr_1.1fr] lg:items-stretch lg:gap-8">
        <div>
          <p className="text-eyebrow font-semibold uppercase text-(--on-page-accent)">{story?.heading ?? t.sections.story}</p>
          <h2 id="story-title" className="mt-3 font-display text-h2 text-(--on-page-heading) [overflow-wrap:anywhere]">
            {settings.personName}
          </h2>
          {facts.length > 0 && (
            <ul className="mt-5 grid gap-3 text-sm">
              {facts.map((f) => (
                <li key={f.text} className="flex items-start gap-3">
                  <Icon name={f.icon} className="mt-0.5 size-5 shrink-0 text-gold-700" />
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-6">
            <TextLink href={pathFor("about", lang)}>{story?.aboutLinkLabel ?? t.homeAbout}</TextLink>
          </p>
        </div>

        <figure className="flex flex-col rounded-(--radius-card) bg-(--surface-quote) p-6 shadow-soft ring-1 ring-gold-200 sm:p-7">
          <Icon name="quote" className="size-8 text-gold-700" />
          {story?.quote && (
            <blockquote className="mt-3 font-display text-h3 font-semibold text-(--on-page-heading)">{story.quote}.</blockquote>
          )}
          <RichText value={story?.body} lang={lang} className="mt-4 text-sm" />
          {!hasBody && (
            <p className="mt-4">
              <PendingLabel>{t.pending.content}</PendingLabel>
            </p>
          )}
          <figcaption className="mt-auto pt-6 text-right font-display text-h3 italic text-gold-700">{settings.personName}</figcaption>
        </figure>

        {/* Mockup: 2 ảnh xếp chồng (story.image + story.secondaryImage). Thiếu ảnh → ô chờ ghi rõ ảnh cần (chỉ preview). */}
        <div className="grid gap-3 md:col-span-2 md:grid-cols-2 lg:col-span-1 lg:grid-cols-1 lg:grid-rows-2">
          <Figure
            figure={story?.image}
            lang={lang}
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
            className="overflow-hidden rounded-(--radius-card)"
            imgClassName="aspect-[16/9] h-full object-cover lg:aspect-auto"
            placeholder={t.pending.storyImage}
          />
          <Figure
            figure={story?.secondaryImage}
            lang={lang}
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
            className="overflow-hidden rounded-(--radius-card)"
            imgClassName="aspect-[16/9] h-full object-cover lg:aspect-auto"
            placeholder={t.pending.storyImage2}
          />
        </div>
      </div>
      {Boolean(story?.highlights?.length) && (
        <div className="container-page pb-(--section-y)">
          <StatList stats={story?.highlights} lang={lang} />
        </div>
      )}
    </section>
  );
}

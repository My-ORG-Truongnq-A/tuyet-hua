import { PendingLabel } from "@/components/content/PendingLabel";
import { Icon } from "@/components/ui/Icon";
import type { Testimonial } from "@/lib/content/types";
import type { Lang } from "@/lib/env";
import { env } from "@/lib/env";
import { UI } from "@/lib/ui-strings";

/**
 * Cảm nhận khách hàng — theo mockup: tiêu đề chữ hoa giữa hai vạch vàng, 3 thẻ nền ngà sáng, dấu trích dẫn vàng,
 * chữ nghiêng, tên + mô tả ngắn. Chỉ bản có đồng ý hiển thị (GROQ lọc consentConfirmed — D-10). Hết bản → không render
 * (không dùng tên / lời khen minh hoạ của mockup).
 */
export function Testimonials({ lang, heading, items }: { lang: Lang; heading?: string | null; items: Testimonial[] }) {
  const list = items.filter((x) => x.quote?.trim() && x.authorName?.trim());
  if (!list.length) return env.contentMode === "preview" ? <PendingTestimonials lang={lang} heading={heading} /> : null;
  return (
    <div data-block="testimonials" className="bg-(--surface-alt)">
      <div className="container-page section-y">
        <h3 className="flex items-center justify-center gap-4 text-center font-display text-h3 uppercase tracking-title text-(--on-page-heading) sm:gap-6">
          <span aria-hidden="true" className="h-px w-8 shrink-0 bg-gold-500 sm:w-24 lg:w-40" />
          <span className="min-w-0">{heading ?? UI[lang].sections.testimonials}</span>
          <span aria-hidden="true" className="h-px w-8 shrink-0 bg-gold-500 sm:w-24 lg:w-40" />
        </h3>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {list.map((x, i) => (
            <li key={i} className="rounded-(--radius-card) bg-ivory-50 p-6 shadow-soft ring-1 ring-(--line-subtle)">
              <figure className="flex h-full flex-col">
                <Icon name="quote" className="size-6 text-gold-700" />
                <blockquote className="mt-3 text-sm italic text-(--on-page)">{x.quote}</blockquote>
                <figcaption className="mt-auto pt-5 text-sm">
                  <span className="block font-semibold text-(--on-page-heading)">{x.authorName}</span>
                  {x.authorDescriptor && <span className="block text-(--on-page-muted)">{x.authorDescriptor}</span>}
                  {x.photo?.pending && (
                    <span className="mt-2 block">
                      <PendingLabel>{UI[lang].pending.confirm}</PendingLabel>
                    </span>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Preview: 3 khung thẻ như mockup, chỉ có nhãn chờ — không tên / lời khen minh hoạ. Release không render. */
function PendingTestimonials({ lang, heading }: { lang: Lang; heading?: string | null }) {
  const t = UI[lang];
  return (
    <div data-block="testimonials" data-pending="" className="bg-(--surface-alt)">
      <div className="container-page section-y">
        <h3 className="flex items-center justify-center gap-4 text-center font-display text-h3 uppercase tracking-title text-(--on-page-heading) sm:gap-6">
          <span aria-hidden="true" className="h-px w-8 shrink-0 bg-gold-500 sm:w-24 lg:w-40" />
          <span className="min-w-0">{heading ?? t.sections.testimonials}</span>
          <span aria-hidden="true" className="h-px w-8 shrink-0 bg-gold-500 sm:w-24 lg:w-40" />
        </h3>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <li key={i} className={`rounded-(--radius-card) bg-ivory-50 p-6 ring-1 ring-(--line-subtle) ${i ? "max-md:hidden" : ""}`}>
              <Icon name="quote" className="size-6 text-gold-700" />
              <div aria-hidden="true" className="mt-4 grid gap-2">
                <span className="h-2 rounded-xs bg-ivory-200" />
                <span className="h-2 w-11/12 rounded-xs bg-ivory-200" />
                <span className="h-2 w-3/4 rounded-xs bg-ivory-200" />
              </div>
              <div className="mt-5 flex items-center gap-3">
                <span aria-hidden="true" className="size-10 shrink-0 rounded-full bg-ivory-200 ring-1 ring-stone-300" />
                <PendingLabel>{t.pending.testimonial}</PendingLabel>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

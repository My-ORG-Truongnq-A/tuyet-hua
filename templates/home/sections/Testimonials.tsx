import { PendingLabel } from "@/components/content/PendingLabel";
import type { Testimonial } from "@/lib/content/types";
import type { Lang } from "@/lib/env";
import { UI } from "@/lib/ui-strings";

/**
 * Cảm nhận khách hàng (T4.6): chỉ bản có đồng ý hiển thị (GROQ lọc consentConfirmed — D-10). Hết bản → không render.
 * Phần chung: các trích dẫn xếp dọc có đường kẻ; 3 thẻ (A) hay một trích dẫn lớn (B) do phương án quyết định.
 */
export function Testimonials({ lang, heading, items }: { lang: Lang; heading?: string | null; items: Testimonial[] }) {
  const list = items.filter((x) => x.quote?.trim() && x.authorName?.trim());
  if (!list.length) return null;
  return (
    <div data-block="testimonials" className="mt-16">
      <h3 className="font-display text-h3 text-(--on-page-heading)">{heading ?? UI[lang].sections.testimonials}</h3>
      <ul className="mt-6 grid gap-x-10 md:grid-cols-2">
        {list.map((x, i) => (
          <li key={i} className="border-t border-(--line-subtle) py-6">
            <figure>
              <blockquote className="font-display text-lead italic text-(--on-page)">“{x.quote}”</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold">{x.authorName}</span>
                {x.authorDescriptor && <span className="text-(--on-page-muted)"> · {x.authorDescriptor}</span>}
                {x.photo?.pending && (
                  <span className="ml-2">
                    <PendingLabel>{UI[lang].pending.confirm}</PendingLabel>
                  </span>
                )}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}

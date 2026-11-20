import { Section } from "@/components/content/Section";
import type { Lang } from "@/lib/env";
import { UI } from "@/lib/ui-strings";
import { ValueList } from "../../shared/blocks";
import type { HomePage } from "../home.data";

/**
 * Tại sao chọn tôi / Giá trị tôi mang đến (T4.4): valueItem từ homePage.whyMe.items; trống → khối ẩn.
 * Phần chung hiển thị danh sách đánh số; icon hay số do phương án quyết định (MI-08).
 */
export function WhyMe({ lang, whyMe }: { lang: Lang; whyMe: HomePage["whyMe"] }) {
  const items = (whyMe?.items ?? []).filter((i) => i.title?.trim());
  return (
    <Section name="whyMe" tone="alt" heading={whyMe?.heading ?? UI[lang].sections.whyMe} intro={whyMe?.intro} empty={!items.length}>
      <ValueList items={items} />
    </Section>
  );
}

import { Section } from "@/components/content/Section";
import type { Lang } from "@/lib/env";
import { UI } from "@/lib/ui-strings";
import { IconValueList } from "../../shared/blocks";
import type { HomePage } from "../home.data";

/**
 * Giá trị tôi mang đến / Tại sao chọn tôi — theo mockup: tiêu đề chữ hoa giữa hai vạch vàng, các cột căn giữa
 * ngăn bằng vạch mảnh, icon nét mảnh trên tiêu đề chữ hoa nhỏ + mô tả ngắn. Số cột theo số mục CMS (mockup 6, seed 3).
 * Trống → khối ẩn.
 */
export function WhyMe({ lang, whyMe }: { lang: Lang; whyMe: HomePage["whyMe"] }) {
  const items = (whyMe?.items ?? []).filter((i) => i.title?.trim());
  return (
    <Section
      name="whyMe"
      heading={whyMe?.heading ?? UI[lang].sections.whyMe}
      intro={whyMe?.intro}
      titleStyle="ornament"
      empty={!items.length}
      className="border-y border-(--line-subtle) bg-(--surface-page)"
    >
      <IconValueList items={items} />
    </Section>
  );
}

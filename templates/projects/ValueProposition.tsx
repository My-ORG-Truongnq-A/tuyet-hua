import { Section } from "@/components/content/Section";
import type { Lang } from "@/lib/env";
import { UI } from "@/lib/ui-strings";
import { IconValueList, type ValueItem } from "../shared/blocks";

export type ProjectValueProposition = { headline?: string | null; values?: ValueItem[] | null; keyMessage?: string | null } | null | undefined;

/**
 * «MỘT TÀI SẢN – BA GIÁ TRỊ» (T4.11, YC-15): headline + các giá trị + câu chốt từ project.valueProposition.
 * Trống (vd. Làng Vân) → khối ẩn. Không số liệu lợi suất / cam kết (YC-13).
 */
export function ValueProposition({ lang, value }: { lang: Lang; value: ProjectValueProposition }) {
  const values = (value?.values ?? []).filter((v) => v.title?.trim());
  return (
    <Section
      name="valueProposition"
      titleStyle="ornament"
      eyebrow={UI[lang].project.valueEyebrow}
      heading={value?.headline}
      empty={!value?.headline && !values.length}
    >
      {/* Tạo dòng tiền · An cư & nghỉ dưỡng · Giá trị dài hạn */}
      <IconValueList items={values} icons={["chart", "building", "diamond"]} />
      {value?.keyMessage && (
        <p className="mx-auto mt-14 max-w-(--container-prose) text-center font-display text-h3 italic text-(--on-page-heading)">
          {value.keyMessage}
        </p>
      )}
    </Section>
  );
}

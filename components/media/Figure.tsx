import type { Figure as FigureValue } from "@/lib/content/types";
import { resolveFigure } from "@/lib/image";
import type { Lang } from "@/lib/env";
import { UI } from "@/lib/ui-strings";
import { PendingLabel } from "../content/PendingLabel";
import { PendingImage } from "./PendingImage";
import { SiteImage } from "./SiteImage";

/**
 * Ảnh nội dung (T3.5): alt bắt buộc (thiếu → không render), kích thước thật / aspect-ratio (không CLS),
 * lazy-load trừ ảnh hero (`hero` → loading eager + fetchpriority high, KHÔNG hiệu ứng — ảnh LCP).
 * Ảnh chưa xác nhận quyền dùng chỉ còn ở bản xem trước và có nhãn; thiếu ảnh → ô giữ chỗ (preview) nếu có `placeholder`.
 */
export function Figure({
  figure,
  lang,
  sizes,
  hero = false,
  className = "",
  imgClassName = "",
  placeholder,
  tone = "light",
  caption = true,
}: {
  figure: FigureValue | null | undefined;
  lang: Lang;
  sizes: string;
  hero?: boolean;
  className?: string;
  imgClassName?: string;
  /** Ghi chú ô giữ chỗ khi chưa có ảnh (chỉ preview). */
  placeholder?: string;
  tone?: "light" | "dark";
  caption?: boolean;
}) {
  const img = resolveFigure(figure);
  if (!img) {
    return placeholder ? <PendingImage note={placeholder} tone={tone} className={`${className} ${imgClassName}`} /> : null;
  }
  return (
    <figure className={className}>
      <div className="relative">
        <SiteImage
          src={img.src}
          width={img.width}
          height={img.height}
          alt={img.alt}
          sizes={sizes}
          loading={hero ? "eager" : "lazy"}
          fetchPriority={hero ? "high" : "auto"}
          style={img.position ? { objectPosition: img.position } : undefined}
          className={`w-full ${imgClassName}`}
        />
        {img.pending && (
          <PendingLabel tone="dark" className="absolute top-2 left-2 bg-emerald-950/80">
            {UI[lang].pending.confirm}
          </PendingLabel>
        )}
      </div>
      {caption && img.caption && <figcaption className="mt-2 text-xs text-(--on-page-muted)">{img.caption}</figcaption>}
    </figure>
  );
}

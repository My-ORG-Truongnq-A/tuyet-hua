import type { Figure } from "./content/types";

/**
 * Ảnh (T3.5): chuẩn hoá figure CMS → dữ liệu cho next/image. Mọi ảnh cần alt (thiếu → không render),
 * có kích thước thật để không gây CLS. Ảnh Sanity đi qua CDN Sanity (loader), ảnh seed qua bộ tối ưu của Next.
 */
export type ResolvedImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string | null;
  /** Chưa xác nhận quyền dùng — chỉ có ở bản xem trước (gate T2.7). */
  pending: boolean;
  /** object-position theo hotspot CMS. */
  position: string | undefined;
};

type Hotspot = { x: number; y: number; width?: number; height?: number } | null | undefined;

export function objectPosition(hotspot: Hotspot): string | undefined {
  if (!hotspot || typeof hotspot.x !== "number" || typeof hotspot.y !== "number") return undefined;
  const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;
  return `${pct(hotspot.x)} ${pct(hotspot.y)}`;
}

export function resolveFigure(figure: Figure | null | undefined): ResolvedImage | null {
  const asset = figure?.image?.asset;
  const alt = figure?.alt?.trim();
  if (!asset?.url || !asset.width || !asset.height || !alt) return null;
  return {
    src: asset.url,
    width: asset.width,
    height: asset.height,
    alt,
    caption: figure?.caption?.trim() || null,
    pending: figure?.pending === true,
    position: objectPosition(figure?.image?.hotspot),
  };
}

export const isSanityCdn = (src: string) => src.startsWith("https://cdn.sanity.io/");

/** URL ảnh Sanity CDN theo bề rộng (loader next/image). */
export function sanityImageUrl(src: string, { width, quality = 75 }: { width: number; quality?: number }): string {
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}w=${width}&q=${quality}&auto=format&fit=max`;
}

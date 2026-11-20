"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";
import { isSanityCdn, sanityImageUrl } from "@/lib/image";

const sanityLoader: ImageLoader = ({ src, width, quality }) => sanityImageUrl(src, { width, quality });

/**
 * next/image cho mọi ảnh nội dung (T3.5): ảnh Sanity → loader CDN Sanity (không tốn quota tối ưu ảnh của host);
 * ảnh seed (/seed-assets/…) → bộ tối ưu mặc định của Next. Không hiệu ứng fade (ảnh LCP hiện ngay).
 */
export function SiteImage({ src, alt, ...props }: Omit<ImageProps, "src" | "loader"> & { src: string }) {
  return <Image src={src} alt={alt} loader={isSanityCdn(src) ? sanityLoader : undefined} {...props} />;
}

import type { ImageField } from "./content/types";
import type { Lang } from "./env";
import { isSanityCdn } from "./image";
import type { PageKey } from "./routes";

/**
 * Ảnh chia sẻ (SEO-14): JPEG 1200×630, có width / height / alt, trỏ tệp có thật.
 * - Trang tĩnh: thẻ soạn sẵn `/og/<thẻ>-<lang>.jpg` (sinh bằng `pnpm images:build`).
 * - Ảnh CMS (seo.ogImage, ảnh đại diện dự án, ảnh bìa bài): Sanity CDN crop theo hotspot; ảnh seed → bản crop sinh sẵn
 *   `/og/img/<tệp>.jpg` (cùng script). Hai nguồn đọc CÙNG trường ảnh, chỉ khác cách dựng URL (như loader next/image).
 */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** Thẻ soạn sẵn theo loại trang (trang chi tiết dùng thẻ của trang danh sách khi không có ảnh riêng). */
export const OG_CARD_BY_PAGE = {
  home: "home",
  about: "about",
  projects: "projects",
  projectDetail: "projects",
  team: "team",
  posts: "articles",
  postDetail: "articles",
  contact: "contact",
  privacy: "legal",
} as const satisfies Record<PageKey, string>;

export const OG_CARD_SLUGS = [...new Set(Object.values(OG_CARD_BY_PAGE))];

export type OgImage = { url: string; width: number; height: number; alt: string };

export function ogCard(page: PageKey, lang: Lang, alt: string): OgImage {
  return { url: `/og/${OG_CARD_BY_PAGE[page]}-${lang}.jpg`, width: OG_WIDTH, height: OG_HEIGHT, alt };
}

const SEED_PREFIX = "/seed-assets/";

/** Đường dẫn (trong public/) bản crop OG của một ảnh seed. */
export const seedOgPath = (file: string) => `/og/img/${file.replace(/\.\w+$/, "")}.jpg`;

const round = (n: number) => Math.round(n * 1000) / 1000;

/** Ảnh CMS → ảnh OG 1200×630 JPEG; không dựng được (thiếu url / nguồn lạ) → null. */
export function ogFromImage(image: ImageField | null | undefined, alt: string): OgImage | null {
  const url = image?.asset?.url;
  if (!url) return null;
  if (isSanityCdn(url)) {
    const h = image.hotspot;
    const fp = h && typeof h.x === "number" && typeof h.y === "number" ? `&fp-x=${round(h.x)}&fp-y=${round(h.y)}` : "";
    const sep = url.includes("?") ? "&" : "?";
    return { url: `${url}${sep}w=${OG_WIDTH}&h=${OG_HEIGHT}&fit=crop&crop=focalpoint${fp}&fm=jpg&q=80`, width: OG_WIDTH, height: OG_HEIGHT, alt };
  }
  if (url.startsWith(SEED_PREFIX)) return { url: seedOgPath(url.slice(SEED_PREFIX.length)), width: OG_WIDTH, height: OG_HEIGHT, alt };
  return null;
}

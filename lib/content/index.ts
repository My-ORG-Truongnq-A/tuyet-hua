import "server-only";
import { env, type SanitySource } from "../env";
import { applyContentGate } from "./gate";
import { attachImageAssets, collectImageRefs, stripInternal, type ImageAssetInfo } from "./post-process";
import { IMAGE_ASSETS_QUERY } from "./queries";
import { DEFAULT_SEED_FILE, querySeed } from "./source-seed";

/**
 * MỘT CỬA đọc nội dung (KT-01). Trang / component chỉ gọi các getter trong lib/content/*,
 * không gọi Sanity hay đọc seed trực tiếp.
 * - SANITY_SOURCE=sanity → Sanity CDN (cache tag). Lỗi → render seed + ghi log, không sập site.
 * - còn lại → groq-js trên seed, CÙNG truy vấn.
 */
export const contentSource: SanitySource = env.sanitySource;

type FetchOptions = { params?: Record<string, unknown>; tags: string[] };

/** Chạy một câu GROQ trên nguồn đang chọn — kết quả thô. */
export async function fetchContent<T>(query: string, { params = {}, tags }: FetchOptions): Promise<T> {
  if (contentSource === "sanity") {
    try {
      const { sanityFetch } = await import("./source-sanity");
      return await sanityFetch<T>(query, params, tags);
    } catch (error) {
      console.error(`[content] Sanity lỗi, dùng seed (tags: ${tags.join(", ")})`, error);
    }
  }
  return querySeed<T>(env.seedFile ?? DEFAULT_SEED_FILE, query, params);
}

/** Tag cache của asset ảnh (webhook làm mới khi đổi ảnh). */
export const IMAGE_ASSET_TAG = "sanity.imageAsset";

/**
 * Đọc nội dung cho trang: GROQ → bỏ trường nội bộ (D-02) → gắn url / kích thước ảnh → lọc theo
 * CONTENT_MODE (T2.7). Các bước sau truy vấn giống hệt cho seed và Sanity.
 */
export async function loadContent<T>(query: string, options: FetchOptions): Promise<T> {
  const clean = stripInternal(await fetchContent<T>(query, options));
  const ids = collectImageRefs(clean);
  const assets = ids.length
    ? ((await fetchContent<ImageAssetInfo[] | null>(IMAGE_ASSETS_QUERY, { params: { ids }, tags: [IMAGE_ASSET_TAG] })) ?? [])
    : [];
  return applyContentGate(attachImageAssets(clean, assets), env.contentMode);
}

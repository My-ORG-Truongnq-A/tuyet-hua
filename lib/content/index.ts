import "server-only";
import { env, type SanitySource } from "../env";
import { DEFAULT_SEED_FILE, querySeed } from "./source-seed";

/**
 * MỘT CỬA đọc nội dung (KT-01). Trang / component chỉ gọi các getter trong lib/content/*,
 * không gọi Sanity hay đọc seed trực tiếp.
 * - SANITY_SOURCE=sanity → Sanity CDN (cache tag). Lỗi → render seed + ghi log, không sập site.
 * - còn lại → groq-js trên seed, CÙNG truy vấn.
 */
export const contentSource: SanitySource = env.sanitySource;

type FetchOptions = { params?: Record<string, unknown>; tags: string[] };

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

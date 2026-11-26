import { createClient } from "next-sanity";
import { env } from "../env";

/**
 * Nguồn Sanity — chỉ import khi SANITY_SOURCE=sanity.
 * Đọc qua CDN, perspective published, cache có tag; làm mới bằng webhook /api/revalidate (bước sanity_schemas).
 * Không no-store, không revalidate < 3600 s (Sanity gói Free).
 */
const client = createClient({
  projectId: env.sanity.projectId,
  dataset: env.sanity.dataset,
  apiVersion: env.sanity.apiVersion,
  useCdn: true,
  perspective: "published",
});

export const REVALIDATE_SECONDS = 3600;

export function sanityFetch<T>(query: string, params: Record<string, unknown>, tags: string[]): Promise<T> {
  return client.fetch<T>(query, params, { next: { revalidate: REVALIDATE_SECONDS, tags } });
}

/**
 * Indexing guard (SEO-01). KHÔNG import gì để next.config.ts dùng được.
 * Chỉ index khi: production deploy + ALLOW_INDEXING=1 + host chuẩn không phải domain tạm + đúng host.
 * Không được index thì chặn hai lớp: robots.txt `Disallow: /` và header `X-Robots-Tag: noindex`.
 */
export type IndexingInput = {
  isProductionDeploy: boolean;
  allowIndexing: boolean;
  /** Host của SITE_URL (có thể kèm cổng). */
  canonicalHost: string;
  /** Host của request; bỏ trống khi đánh giá theo cấu hình (build time). */
  host?: string;
};

const TEMP_HOST = /(\.vercel\.app|^localhost|^127\.0\.0\.1|^\[::1\])(:\d+)?$/;

export function indexingAllowed({ isProductionDeploy, allowIndexing, canonicalHost, host }: IndexingInput): boolean {
  const canonical = canonicalHost.toLowerCase();
  if (!isProductionDeploy || !allowIndexing) return false;
  if (TEMP_HOST.test(canonical)) return false;
  return host === undefined || host.toLowerCase() === canonical;
}

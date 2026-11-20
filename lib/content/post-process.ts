/**
 * Hậu xử lý THUẦN áp dụng y hệt cho kết quả từ Sanity và từ seed (không phải nhánh riêng cho seed).
 */

/** Trường nội bộ không bao giờ ra tới trang (D-02). */
export const INTERNAL_FIELDS = new Set(["rightsNote", "sourceNote", "consentNote"]);

export function stripInternal<T>(value: T): T {
  if (Array.isArray(value)) return value.map(stripInternal) as T;
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([k]) => !INTERNAL_FIELDS.has(k))
      .map(([k, v]) => [k, stripInternal(v)]),
  ) as T;
}

export type ImageAssetInfo = {
  _id: string;
  url: string;
  width: number;
  height: number;
  lqip?: string | null;
};

const isImageRef = (v: unknown): v is { _ref: string } =>
  !!v && typeof v === "object" && typeof (v as { _ref?: unknown })._ref === "string" && (v as { _ref: string })._ref.startsWith("image-");

/** Mọi asset._ref ảnh trong kết quả (không trùng). */
export function collectImageRefs(value: unknown, out = new Set<string>()): string[] {
  if (Array.isArray(value)) value.forEach((v) => collectImageRefs(v, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === "asset" && isImageRef(v)) out.add(v._ref);
      else collectImageRefs(v, out);
    }
  }
  return [...out];
}

/** Gắn url + kích thước vào từng `asset` (giống `asset->` nhưng làm một lần cho cả kết quả). */
export function attachImageAssets<T>(value: T, assets: ImageAssetInfo[]): T {
  const byId = new Map(assets.map((a) => [a._id, a]));
  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(walk);
    if (!v || typeof v !== "object") return v;
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([k, child]) => {
        if (k === "asset" && isImageRef(child)) {
          const info = byId.get(child._ref);
          return [k, info ? { ...child, ...info } : child];
        }
        return [k, walk(child)];
      }),
    );
  };
  return walk(value) as T;
}

import { createHash } from "node:crypto";

/**
 * Asset của seed (ND-07, ND-10). Mỗi ảnh trong seed/sanity/assets/ có một mục trong seed/sanity/assets.json,
 * SINH bằng `pnpm seed:assets` (không sửa tay). _id asset dùng đúng công thức của Sanity
 * (`image-<sha1>-<w>x<h>-<ext>`) nên trùng _id thật sau khi import — truy vấn `asset->` cho cùng kết quả.
 */
export type SeedAsset = {
  /** Chuỗi tham chiếu trong documents.json — đúng cú pháp `sanity dataset import`. */
  _sanityAsset: string;
  assetId: string;
  file: string;
  sha1hash: string;
  width: number;
  height: number;
  extension: string;
  mimeType: string;
  size: number;
};

/** Thư mục ảnh seed, tương đối gốc repo. */
export const SEED_ASSET_DIR = "seed/sanity/assets";
/** URL công khai của ảnh seed (route app/seed-assets/[file]). */
export const SEED_ASSET_URL_PREFIX = "/seed-assets/";

const MIME: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

/** Đọc kích thước ảnh JPEG / PNG / WebP từ header — không giải mã ảnh, không thư viện ngoài. */
export function imageSize(buf: Buffer): { width: number; height: number; extension: string } {
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), extension: "png" };
  }
  if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8X") return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3), extension: "webp" };
    if (chunk === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff, extension: "webp" };
    if (chunk === "VP8L") {
      const bits = buf.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1, extension: "webp" };
    }
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) throw new Error("JPEG hỏng: sai marker");
      const marker = buf[offset + 1]!;
      const length = buf.readUInt16BE(offset + 2);
      // SOF0–SOF15 trừ DHT (C4), JPG (C8), DAC (CC).
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7), extension: "jpg" };
      }
      offset += 2 + length;
    }
    throw new Error("JPEG không có khung SOF");
  }
  throw new Error("Chỉ hỗ trợ ảnh JPEG, PNG, WebP");
}

export function seedAssetEntry(file: string, buf: Buffer): SeedAsset {
  const { width, height, extension } = imageSize(buf);
  const sha1hash = createHash("sha1").update(buf).digest("hex");
  return {
    _sanityAsset: `image@file://./${SEED_ASSET_DIR}/${file}`,
    assetId: `image-${sha1hash}-${width}x${height}-${extension}`,
    file,
    sha1hash,
    width,
    height,
    extension,
    mimeType: MIME[extension]!,
    size: buf.length,
  };
}

type Doc = { _id: string; _type: string; [key: string]: unknown };

/**
 * Làm đúng việc `sanity dataset import` làm với ảnh: `{ _sanityAsset }` → `{ asset: { _ref } }`, và thêm
 * document `sanity.imageAsset` cho từng ảnh được dùng (url /seed-assets/<tệp>, kích thước thật).
 * Thiếu mục trong assets.json → lỗi (seed:validate bắt trước khi build).
 */
export function materializeSeedAssets(docs: Doc[], assets: SeedAsset[]): Doc[] {
  const byRef = new Map(assets.map((a) => [a._sanityAsset, a]));
  const used = new Map<string, SeedAsset>();

  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(walk);
    if (!value || typeof value !== "object") return value;
    const obj = value as Record<string, unknown>;
    if (typeof obj._sanityAsset === "string") {
      const asset = byRef.get(obj._sanityAsset);
      if (!asset) throw new Error(`[seed] ảnh «${obj._sanityAsset}» chưa có trong assets.json — chạy pnpm seed:assets`);
      used.set(asset.assetId, asset);
      const { _sanityAsset: _ignored, ...rest } = obj;
      return { ...walkObject(rest), asset: { _type: "reference", _ref: asset.assetId } };
    }
    return walkObject(obj);
  };
  const walkObject = (obj: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, walk(v)]));

  const out = docs.map((d) => walk(d) as Doc);
  for (const a of used.values()) {
    out.push({
      _id: a.assetId,
      _type: "sanity.imageAsset",
      assetId: a.sha1hash,
      sha1hash: a.sha1hash,
      originalFilename: a.file,
      extension: a.extension,
      mimeType: a.mimeType,
      size: a.size,
      url: `${SEED_ASSET_URL_PREFIX}${a.file}`,
      path: `seed-assets/${a.file}`,
      metadata: {
        _type: "sanity.imageMetadata",
        dimensions: {
          _type: "sanity.imageDimensions",
          width: a.width,
          height: a.height,
          aspectRatio: a.width / a.height,
        },
      },
    });
  }
  return out;
}

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { imageSize, materializeSeedAssets, seedAssetEntry, type SeedAsset } from "./seed-assets";

const root = join(__dirname, "../..");
const png = (w: number, h: number) => {
  const b = Buffer.alloc(33);
  b.writeUInt32BE(0x89504e47, 0);
  b.writeUInt32BE(w, 16);
  b.writeUInt32BE(h, 20);
  return b;
};

describe("ảnh seed (BP-05)", () => {
  it("đọc kích thước JPEG thật của ảnh khách", () => {
    const buf = readFileSync(join(root, "seed/sanity/assets/portrait-navy.jpg"));
    expect(imageSize(buf)).toEqual({ width: 630, height: 945, extension: "jpg" });
  });

  it("đọc kích thước PNG; từ chối định dạng lạ", () => {
    expect(imageSize(png(1200, 630))).toEqual({ width: 1200, height: 630, extension: "png" });
    expect(() => imageSize(Buffer.from("GIF89a-------------------"))).toThrow(/JPEG, PNG, WebP/);
  });

  it("assetId theo công thức Sanity image-<sha1>-<w>x<h>-<ext>", () => {
    const e = seedAssetEntry("og.png", png(1200, 630));
    expect(e.assetId).toMatch(/^image-[a-f0-9]{40}-1200x630-png$/);
    expect(e._sanityAsset).toBe("image@file://./seed/sanity/assets/og.png");
    expect(e.mimeType).toBe("image/png");
  });

  it("assets.json khớp tệp ảnh (sinh bằng seed:assets, không sửa tay)", () => {
    const manifest = JSON.parse(readFileSync(join(root, "seed/sanity/assets.json"), "utf8")) as SeedAsset[];
    expect(manifest.length).toBeGreaterThan(0);
    for (const a of manifest) {
      expect(seedAssetEntry(a.file, readFileSync(join(root, "seed/sanity/assets", a.file)))).toEqual(a);
    }
  });

  it("_sanityAsset → asset._ref + document sanity.imageAsset (như sanity dataset import)", () => {
    const asset = seedAssetEntry("og.png", png(1200, 630));
    const docs = materializeSeedAssets(
      [{ _id: "x", _type: "homePage", hero: { image: { _type: "figure", alt: "Mô tả", image: { _type: "image", _sanityAsset: asset._sanityAsset, hotspot: { x: 0.5 } } } } }],
      [asset],
    );
    expect(docs[0]).toEqual({
      _id: "x",
      _type: "homePage",
      hero: { image: { _type: "figure", alt: "Mô tả", image: { _type: "image", hotspot: { x: 0.5 }, asset: { _type: "reference", _ref: asset.assetId } } } },
    });
    expect(docs[1]).toMatchObject({
      _id: asset.assetId,
      _type: "sanity.imageAsset",
      url: "/seed-assets/og.png",
      metadata: { dimensions: { width: 1200, height: 630 } },
    });
  });

  it("ảnh chưa có trong assets.json → lỗi rõ ràng", () => {
    expect(() =>
      materializeSeedAssets([{ _id: "x", _type: "t", img: { _sanityAsset: "image@file://./seed/sanity/assets/thieu.jpg" } }], []),
    ).toThrow(/thieu\.jpg/);
  });
});

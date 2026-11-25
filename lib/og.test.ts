import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { SeedAsset } from "./content/seed-assets";
import { OG_CARD_BY_PAGE, OG_CARD_SLUGS, OG_HEIGHT, OG_WIDTH, ogCard, ogFromImage, seedOgPath } from "./og";
import { ROUTES } from "./routes";

const root = process.cwd();

/** Kích thước JPEG từ marker SOF (không giải mã ảnh). */
function jpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let o = 2;
  while (o + 9 < buf.length) {
    const marker = buf[o + 1]!;
    const len = buf.readUInt16BE(o + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(o + 5), width: buf.readUInt16BE(o + 7) };
    }
    o += 2 + len;
  }
  return null;
}

describe("ảnh chia sẻ OG (SEO-14)", () => {
  it("mọi loại trang có thẻ OG soạn sẵn", () => {
    for (const key of Object.keys(ROUTES)) expect(OG_CARD_BY_PAGE[key as keyof typeof ROUTES]).toBeTruthy();
  });

  it("thẻ soạn sẵn: JPEG 1200×630, tệp có thật cho cả vi / en, kèm alt", () => {
    expect(ogCard("about", "vi", "Giới thiệu")).toEqual({ url: "/og/about-vi.jpg", width: OG_WIDTH, height: OG_HEIGHT, alt: "Giới thiệu" });
    for (const slug of OG_CARD_SLUGS) {
      for (const lang of ["vi", "en"] as const) {
        const file = join(root, "public", `og/${slug}-${lang}.jpg`);
        expect(existsSync(file), file).toBe(true);
        const buf = readFileSync(file);
        expect(jpegSize(buf)).toEqual({ width: OG_WIDTH, height: OG_HEIGHT });
        expect(buf.length).toBeLessThan(200_000);
      }
    }
    expect(ogCard("projectDetail", "en", "x").url).toBe("/og/projects-en.jpg");
  });

  it("ảnh Sanity CDN → crop 1200×630 JPEG theo hotspot", () => {
    const img = ogFromImage(
      { asset: { _ref: "image-a-2000x1000-png", url: "https://cdn.sanity.io/images/p/d/a-2000x1000.png", width: 2000, height: 1000 }, hotspot: { x: 0.25, y: 0.4, width: 1, height: 1 } },
      "Ảnh dự án",
    );
    expect(img).toEqual({
      url: "https://cdn.sanity.io/images/p/d/a-2000x1000.png?w=1200&h=630&fit=crop&crop=focalpoint&fp-x=0.25&fp-y=0.4&fm=jpg&q=80",
      width: 1200,
      height: 630,
      alt: "Ảnh dự án",
    });
  });

  it("ảnh seed → bản crop JPEG sinh sẵn (pnpm images:build); không phải ảnh / không url → null", () => {
    expect(ogFromImage({ asset: { _ref: "x", url: "/seed-assets/illus-lang-van.png", width: 1600, height: 1000 } }, "a")).toEqual({
      url: "/og/img/illus-lang-van.jpg",
      width: 1200,
      height: 630,
      alt: "a",
    });
    expect(ogFromImage({ asset: { _ref: "x", url: "https://example.com/a.jpg" } }, "a")).toBeNull();
    expect(ogFromImage(null, "a")).toBeNull();
  });

  it("mọi ảnh seed có bản crop OG JPEG 1200×630", () => {
    const assets = JSON.parse(readFileSync(join(root, "seed/sanity/assets.json"), "utf8")) as SeedAsset[];
    for (const a of assets) {
      const file = join(root, "public", seedOgPath(a.file));
      expect(existsSync(file), file).toBe(true);
      expect(jpegSize(readFileSync(file))).toEqual({ width: OG_WIDTH, height: OG_HEIGHT });
    }
  });
});

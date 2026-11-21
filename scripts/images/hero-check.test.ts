import { readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { heroImageWarnings, inspectImage } from "./hero-check";
import { bestWebp } from "./webp";

/** T6.6 — ảnh chân dung hero tách nền: kiểm kênh trong suốt + độ rộng (cảnh báo, không chặn — MI-06). */
const root = join(__dirname, "../..");

/** Ảnh RGBA w×h: viền trong suốt, giữa đục (giống chân dung tách nền). */
async function cutout(w: number, h: number) {
  const inner = await sharp({ create: { width: Math.round(w / 2), height: h, channels: 4, background: { r: 30, g: 60, b: 90, alpha: 1 } } })
    .png()
    .toBuffer();
  return sharp({ create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: inner, left: Math.round(w / 4), top: 0 }])
    .png()
    .toBuffer();
}
const opaque = (w: number, h: number, format: "png" | "jpeg") =>
  sharp({ create: { width: w, height: h, channels: 3, background: "#ffffff" } })[format]().toBuffer();

describe("inspectImage + heroImageWarnings", () => {
  it("PNG tách nền ≥ 1200 px → không cảnh báo", async () => {
    const info = await inspectImage(await cutout(1200, 1500));
    expect(info.hasAlpha).toBe(true);
    expect(info.transparentRatio).toBeGreaterThan(0.3);
    expect(heroImageWarnings(info)).toEqual([]);
  });

  it("ảnh nền trắng (JPG, hoặc PNG có kênh alpha nhưng đục hết) → cảnh báo trong suốt", async () => {
    expect(heroImageWarnings(await inspectImage(await opaque(1600, 2000, "jpeg"))).join()).toMatch(/trong suốt/);
    const solidRgba = await sharp(await opaque(1600, 2000, "png")).ensureAlpha().png().toBuffer();
    const info = await inspectImage(solidRgba);
    expect(info.hasAlpha).toBe(true);
    expect(heroImageWarnings(info).join()).toMatch(/trong suốt/);
  });

  it("rộng < 1200 px → cảnh báo độ phân giải", async () => {
    expect(heroImageWarnings(await inspectImage(await cutout(630, 945))).join()).toMatch(/1200/);
  });

  it("ảnh hero của seed thật: có kênh trong suốt; còn nhỏ (630 px) → chỉ cảnh báo độ rộng (MI-06)", async () => {
    const info = await inspectImage(readFileSync(join(root, "seed/sanity/assets/portrait-navy-cutout.png")));
    const warnings = heroImageWarnings(info);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/1200/);
  });
});

describe("bestWebp giữ kênh trong suốt", () => {
  it("PNG tách nền → WebP vẫn có alpha, viền vẫn trong suốt ở mọi kích thước", async () => {
    const src = await cutout(480, 600);
    for (const width of [240, 480]) {
      const out = await bestWebp(src, width);
      const info = await inspectImage(out.buf);
      expect(info.hasAlpha).toBe(true);
      expect(info.transparentRatio).toBeGreaterThan(0.3);
      expect(out.width).toBe(width);
    }
  }, 30_000);
});

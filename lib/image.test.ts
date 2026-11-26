import { describe, expect, it } from "vitest";
import { isSanityCdn, objectPosition, resolveFigure, sanityImageUrl } from "./image";

const asset = { _ref: "image-abc-630x788-jpg", url: "/seed-assets/portrait-navy.jpg", width: 630, height: 788 };

describe("lib/image (T3.5)", () => {
  it("resolveFigure: đủ url, kích thước, alt → ảnh; giữ cờ pending", () => {
    expect(resolveFigure({ image: { asset }, alt: "Chân dung", pending: true })).toEqual({
      src: "/seed-assets/portrait-navy.jpg",
      width: 630,
      height: 788,
      alt: "Chân dung",
      caption: null,
      pending: true,
      position: undefined,
    });
  });

  it("thiếu alt hoặc chưa có url → không render ảnh", () => {
    expect(resolveFigure({ image: { asset }, alt: "  " })).toBeNull();
    expect(resolveFigure({ image: { asset: { _ref: "image-x" } }, alt: "A" })).toBeNull();
    expect(resolveFigure(null)).toBeNull();
    expect(resolveFigure({ image: null, alt: "A" })).toBeNull();
  });

  it("hotspot → object-position theo phần trăm", () => {
    expect(objectPosition({ x: 0.5, y: 0.25, width: 1, height: 1 })).toBe("50% 25%");
    expect(objectPosition(null)).toBeUndefined();
    expect(resolveFigure({ image: { asset, hotspot: { x: 0.3, y: 0.1, width: 1, height: 1 } }, alt: "A" })?.position).toBe("30% 10%");
  });

  it("loader Sanity: thêm w, q, auto=format, giữ query sẵn có", () => {
    const src = "https://cdn.sanity.io/images/p/production/abc-630x788.jpg";
    expect(isSanityCdn(src)).toBe(true);
    expect(isSanityCdn("/seed-assets/a.jpg")).toBe(false);
    expect(sanityImageUrl(src, { width: 640 })).toBe(`${src}?w=640&q=75&auto=format&fit=max`);
    expect(sanityImageUrl(`${src}?rect=0,0,10,10`, { width: 320, quality: 60 })).toBe(
      `${src}?rect=0,0,10,10&w=320&q=60&auto=format&fit=max`,
    );
  });
});

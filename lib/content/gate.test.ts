import { describe, expect, it } from "vitest";
import { applyContentGate } from "./gate";

const fig = (approved: boolean | undefined, alt = "Mô tả ảnh") => ({ _type: "figure", alt, usageApproved: approved });

describe("applyContentGate (T2.7)", () => {
  const page = {
    _type: "teamPage",
    heroImage: fig(false),
    gallery: [fig(true, "Ảnh A"), fig(false, "Ảnh B"), { _type: "figure", alt: "Không cờ" }],
    stats: [
      { _type: "highlightStat", value: "N+", label: "x", confirmed: true },
      { _type: "highlightStat", value: "M+", label: "y", confirmed: false },
    ],
    achievements: [{ _type: "achievement", title: "t", confirmed: false }],
    logo: { image: {}, alt: "Logo", usageApproved: false },
  };

  it("release: bỏ ảnh / số liệu / thành tích chưa xác nhận (CM-07, CM-08)", () => {
    const out = applyContentGate(page, "release");
    expect(out.heroImage).toBeNull();
    expect(out.gallery.map((g) => g.alt)).toEqual(["Ảnh A"]);
    expect(out.stats.map((s) => s.value)).toEqual(["N+"]);
    expect(out.achievements).toEqual([]);
    expect(out.logo).toBeNull();
    expect(JSON.stringify(out)).not.toMatch(/"pending"/);
  });

  it("preview: giữ lại, gắn pending để hiện nhãn «chờ xác nhận»", () => {
    const out = applyContentGate(page, "preview") as typeof page & { heroImage: { pending?: boolean } };
    expect(out.heroImage).toMatchObject({ alt: "Mô tả ảnh", pending: true });
    expect(out.gallery).toHaveLength(3);
    expect(out.gallery[0]).not.toHaveProperty("pending");
    expect(out.gallery[2]).toMatchObject({ pending: true });
    expect(out.stats[1]).toMatchObject({ pending: true });
  });

  it("cảm nhận consentConfirmed ≠ true bị bỏ ở release", () => {
    const list = [
      { _type: "testimonial", authorName: "A", consentConfirmed: true },
      { _type: "testimonial", authorName: "B", consentConfirmed: false },
    ];
    expect(applyContentGate(list, "release").map((t) => t.authorName)).toEqual(["A"]);
  });

  it("giá trị gốc là ảnh chưa duyệt → null; giá trị thường giữ nguyên", () => {
    expect(applyContentGate(fig(false), "release")).toBeNull();
    expect(applyContentGate("chuỗi", "release")).toBe("chuỗi");
    expect(applyContentGate(null, "release")).toBeNull();
  });
});

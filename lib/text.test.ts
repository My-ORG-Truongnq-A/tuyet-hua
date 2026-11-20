import { describe, expect, it } from "vitest";
import { truncateWords } from "./text";

describe("lib/text truncateWords", () => {
  it("giữ nguyên khi ngắn, gộp khoảng trắng", () => {
    expect(truncateWords("  Một   câu  ngắn. ")).toBe("Một câu ngắn.");
    expect(truncateWords(null)).toBeNull();
    expect(truncateWords("   ")).toBeNull();
  });

  it("cắt theo ranh giới từ, ≤ max ký tự, có dấu …", () => {
    const long = "Thông tin dự án tại Hạ Long và góc nhìn tư vấn ".repeat(6);
    const out = truncateWords(long, 160)!;
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/\s…$/);
  });
});

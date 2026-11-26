import { describe, expect, it } from "vitest";
import { findBannedPhrases } from "./banned-phrases";
import { fillPattern, formatDate, UI } from "./ui-strings";

describe("lib/ui-strings", () => {
  it("fillPattern điền giá trị; thiếu giá trị → null", () => {
    expect(fillPattern("Của {personName} tại {area}.", { personName: "A", area: "B" })).toBe("Của A tại B.");
    expect(fillPattern("Của {personName} tại {area}.", { personName: "A", area: null })).toBeNull();
    expect(fillPattern(undefined, {})).toBeNull();
  });

  it("formatDate theo giờ Việt Nam; sai → null", () => {
    expect(formatDate("2026-10-01T20:00:00Z", "vi")).toBe("02/10/2026");
    expect(formatDate("x", "vi")).toBeNull();
    expect(formatDate(null, "vi")).toBeNull();
  });

  it("chữ giao diện không có cụm cấm REQ-13, không có số điện thoại", () => {
    const all = JSON.stringify(UI);
    expect(findBannedPhrases(all)).toEqual([]);
    expect(all).not.toMatch(/0\d{2,3}[ .]?\d{3}[ .]?\d{3}/);
  });
});

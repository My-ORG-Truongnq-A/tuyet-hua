import { describe, expect, it } from "vitest";
import { hasBlocks, toPlainText } from "./portable-text";

const block = (text: string, style = "normal") => ({
  _type: "block",
  style,
  children: [{ _type: "span", text }],
});

describe("lib/portable-text", () => {
  it("toPlainText nối đoạn, bỏ object không phải block", () => {
    expect(toPlainText([block("Một."), { _type: "figure" }, block("Hai.")])).toBe("Một.\n\nHai.");
    expect(toPlainText(null)).toBe("");
  });

  it("hasBlocks: mảng rỗng hoặc chỉ đoạn trắng → false", () => {
    expect(hasBlocks([])).toBe(false);
    expect(hasBlocks(null)).toBe(false);
    expect(hasBlocks([block("  ")])).toBe(false);
    expect(hasBlocks([block("A")])).toBe(true);
    expect(hasBlocks([{ _type: "figure" }])).toBe(true);
  });
});

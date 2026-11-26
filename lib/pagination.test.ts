import { describe, expect, it } from "vitest";
import { pageHref, resolvePage } from "./pagination";

describe("lib/pagination (T3.11)", () => {
  it("không có ?trang → trang 1; tổng 0 bài vẫn có 1 trang", () => {
    expect(resolvePage(undefined, 0, 9)).toEqual({ page: 1, totalPages: 1 });
    expect(resolvePage(undefined, 20, 9)).toEqual({ page: 1, totalPages: 3 });
  });

  it("?trang hợp lệ", () => {
    expect(resolvePage("3", 20, 9)).toEqual({ page: 3, totalPages: 3 });
    expect(resolvePage(["2"], 20, 9)).toEqual({ page: 2, totalPages: 3 });
  });

  it("vượt số trang, không phải số nguyên dương → null (404)", () => {
    for (const raw of ["4", "0", "-1", "abc", "1.5", "2x", "", " 2"]) expect(resolvePage(raw, 20, 9), raw).toBeNull();
  });

  it("pageHref: trang 1 không có tham số", () => {
    expect(pageHref("/bai-viet", 1)).toBe("/bai-viet");
    expect(pageHref("/bai-viet", 2)).toBe("/bai-viet?trang=2");
  });
});

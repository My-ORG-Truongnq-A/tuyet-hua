import { describe, expect, it } from "vitest";
import { pickLocale } from "./i18n";

describe("pickLocale (REQ-17 — không fallback sang ngôn ngữ khác)", () => {
  it("lấy đúng ngôn ngữ", () => {
    expect(pickLocale({ vi: "Xin chào", en: "Hello" }, "en")).toBe("Hello");
    expect(pickLocale({ vi: "Xin chào", en: "Hello" }, "vi")).toBe("Xin chào");
  });

  it("thiếu bản dịch → null, KHÔNG lấy chuỗi vi", () => {
    expect(pickLocale({ vi: "Xin chào", en: null }, "en")).toBeNull();
    expect(pickLocale({ vi: "Xin chào" }, "en")).toBeNull();
    expect(pickLocale({ vi: "  ", en: "x" }, "vi")).toBeNull();
  });

  it("giá trị rỗng / không phải object → null", () => {
    expect(pickLocale(undefined, "vi")).toBeNull();
    expect(pickLocale(null, "vi")).toBeNull();
  });

  it("chuỗi thường (trường không dịch) trả nguyên", () => {
    expect(pickLocale("0359 361 359", "en")).toBe("0359 361 359");
  });
});

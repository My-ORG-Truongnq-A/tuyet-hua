import { describe, expect, it } from "vitest";
import { navTargetPath, resolveLink } from "./links";

const ctx = { lang: "vi" as const, zaloPhone: "0359 361 359", phone: "0359 361 359" };

describe("lib/links (T3.4)", () => {
  it("zalo / phone lấy số từ siteSettings", () => {
    expect(resolveLink({ kind: "zalo", label: "Tư vấn" }, ctx)).toEqual({
      href: "https://zalo.me/0359361359",
      label: "Tư vấn",
      kind: "zalo",
      external: true,
    });
    expect(resolveLink({ kind: "phone", label: null }, ctx)?.href).toBe("tel:0359361359");
    expect(resolveLink({ kind: "zalo" }, { ...ctx, zaloPhone: null })).toBeNull();
  });

  it("internal tham chiếu singleton trang theo _id <type>-<lang> → đường dẫn đúng ngôn ngữ", () => {
    expect(resolveLink({ kind: "internal", label: "Dự án", internal: { _ref: "projectsPage-vi" } }, ctx)?.href).toBe("/du-an");
    expect(resolveLink({ kind: "internal", internal: { _ref: "aboutPage-en" } }, { ...ctx, lang: "en" })?.href).toBe("/en/about");
    // Không xác định được trang (vd. tham chiếu document chưa hỗ trợ) → không render nút hỏng
    expect(resolveLink({ kind: "internal", internal: { _ref: "abc123" } }, ctx)).toBeNull();
  });

  it("external chỉ nhận https; thiếu kind → null", () => {
    expect(resolveLink({ kind: "external", href: "https://example.com/a" }, ctx)).toMatchObject({ external: true });
    expect(resolveLink({ kind: "external", href: "javascript:alert(1)" }, ctx)).toBeNull();
    expect(resolveLink({ kind: "external", href: "http://example.com" }, ctx)).toBeNull();
    expect(resolveLink(null, ctx)).toBeNull();
  });

  it("navTargetPath: target menu CMS → route; target chưa có trang → null", () => {
    expect(navTargetPath("articles", "vi")).toBe("/bai-viet");
    expect(navTargetPath("team", "en")).toBe("/en/training-and-team");
    expect(navTargetPath("services", "vi")).toBeNull();
    expect(navTargetPath(null, "vi")).toBeNull();
  });
});

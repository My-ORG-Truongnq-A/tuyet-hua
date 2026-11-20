import { describe, expect, it } from "vitest";
import { buildNav, navLabel } from "./navigation";

const item = (target: string, vi: string | null, en: string | null = null, visible = true) => ({ target, label: { vi, en }, visible });

describe("lib/navigation (T3.1)", () => {
  it("bỏ mục ẩn, mục chưa có trang (services / partners), mục thiếu nhãn ngôn ngữ", () => {
    const nav = buildNav(
      [item("home", "Trang chủ"), item("about", "Giới thiệu", null, false), item("services", "Dịch vụ"), item("articles", "Bài viết"), item("team", null)],
      "vi",
    );
    expect(nav).toEqual([
      { target: "home", href: "/", label: "Trang chủ" },
      { target: "articles", href: "/bai-viet", label: "Bài viết" },
    ]);
  });

  it("không fallback sang tiếng Việt ở trang en", () => {
    expect(buildNav([item("about", "Giới thiệu", null), item("contact", "Liên hệ", "Contact")], "en")).toEqual([
      { target: "contact", href: "/en/contact", label: "Contact" },
    ]);
  });

  it("quá 7 mục → bỏ Trang chủ", () => {
    const many = ["home", "about", "projects", "team", "articles", "contact", "privacy", "about"].map((t, i) => item(t, `M${i}`));
    const nav = buildNav(many, "vi");
    expect(nav).toHaveLength(7);
    expect(nav.some((n) => n.target === "home")).toBe(false);
  });

  it("navLabel lấy nhãn menu theo target", () => {
    expect(navLabel([item("articles", "Bài viết", "Insights")], "articles", "en")).toBe("Insights");
    expect(navLabel([], "articles", "vi")).toBeNull();
  });
});

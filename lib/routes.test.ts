import { describe, expect, it } from "vitest";
import { alternatePath, matchPath, pathFor, ROUTES } from "./routes";

describe("lib/routes (T1.3)", () => {
  it("bảng route khớp danh sách trang của build_plan (vi không tiền tố, en dưới /en)", () => {
    expect(ROUTES).toEqual({
      home: { vi: "/", en: "/en" },
      about: { vi: "/gioi-thieu", en: "/en/about" },
      projects: { vi: "/du-an", en: "/en/projects" },
      projectDetail: { vi: "/du-an/:slug", en: "/en/projects/:slug" },
      team: { vi: "/dao-tao-doi-ngu", en: "/en/training-and-team" },
      posts: { vi: "/bai-viet", en: "/en/articles" },
      postDetail: { vi: "/bai-viet/:slug", en: "/en/articles/:slug" },
      contact: { vi: "/lien-he", en: "/en/contact" },
      privacy: { vi: "/chinh-sach-bao-mat", en: "/en/privacy-policy" },
    });
  });

  it("route chờ xác nhận (/dich-vu, /doi-tac) chưa có trong bảng", () => {
    const all = Object.values(ROUTES).flatMap((r) => [r.vi, r.en]);
    expect(all.some((p) => p.includes("dich-vu") || p.includes("doi-tac"))).toBe(false);
  });

  it("pathFor điền slug và mã hoá", () => {
    expect(pathFor("home", "vi")).toBe("/");
    expect(pathFor("about", "en")).toBe("/en/about");
    expect(pathFor("projectDetail", "vi", { slug: "ha-long-xanh" })).toBe("/du-an/ha-long-xanh");
    expect(() => pathFor("projectDetail", "vi")).toThrow(/slug/);
  });

  it("matchPath nhận diện trang + ngôn ngữ, bỏ / cuối", () => {
    expect(matchPath("/")).toEqual({ key: "home", lang: "vi", params: {} });
    expect(matchPath("/en")).toEqual({ key: "home", lang: "en", params: {} });
    expect(matchPath("/gioi-thieu/")).toEqual({ key: "about", lang: "vi", params: {} });
    expect(matchPath("/en/projects/ha-long-xanh")).toEqual({ key: "projectDetail", lang: "en", params: { slug: "ha-long-xanh" } });
    expect(matchPath("/khong-ton-tai")).toBeNull();
  });

  it("alternatePath: trang tĩnh đổi ngôn ngữ; trang có slug cần bản dịch nên trả null", () => {
    expect(alternatePath("/gioi-thieu", "en")).toBe("/en/about");
    expect(alternatePath("/en/contact", "vi")).toBe("/lien-he");
    expect(alternatePath("/du-an/ha-long-xanh", "en")).toBeNull();
    expect(alternatePath("/khong-ton-tai", "en")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import type { SiteSettings } from "./content/site-settings";
import { findBannedPhrases } from "./banned-phrases";
import { llmsTxt } from "./llms";

const settings: SiteSettings = {
  updatedAt: null,
  personName: "Hứa Thị Tuyết",
  jobTitle: "Giám đốc Kinh doanh",
  organization: null,
  tagline: "Thấu hiểu thị trường.",
  phone: "0359361359",
  zaloPhone: null,
  email: null,
  area: null,
  socials: [],
  seo: { titleTemplate: "%s", description: "Mô tả ngắn." },
};

describe("llms.txt (GEO-06, T5.3)", () => {
  it("theo định dạng llmstxt.org: H1, blockquote, danh sách link tuyệt đối", () => {
    const txt = llmsTxt({ settings, siteUrl: "https://tuyethua.vn", pages: [{ title: "Trang chủ", path: "/", description: "Giới thiệu chung" }] });
    expect(txt.startsWith("# Hứa Thị Tuyết\n")).toBe(true);
    expect(txt).toContain("> Mô tả ngắn.");
    expect(txt).toContain("- [Trang chủ](https://tuyethua.vn): Giới thiệu chung");
    expect(txt).toContain("0359 361 359");
  });

  it("trường trống bỏ dòng, không «undefined» / «null», không cụm cấm", () => {
    const txt = llmsTxt({ settings: { ...settings, seo: { titleTemplate: "%s", description: null }, jobTitle: null }, siteUrl: "https://tuyethua.vn", pages: [] });
    expect(txt).not.toMatch(/undefined|null/);
    expect(findBannedPhrases(txt)).toEqual([]);
  });
});

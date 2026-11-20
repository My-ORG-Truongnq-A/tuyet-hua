import { describe, expect, it } from "vitest";
import { sitemapIndexXml, urlsetXml } from "./sitemaps";

const SITE = "https://tuyethua.vn";

describe("sitemaps (SEO, T5.2)", () => {
  it("sitemap index liệt kê sitemap con bằng URL tuyệt đối", () => {
    const xml = sitemapIndexXml(SITE, ["pages"]);
    expect(xml).toContain("<sitemapindex");
    expect(xml).toContain("<loc>https://tuyethua.vn/sitemaps/pages.xml</loc>");
  });

  it("urlset: loc tuyệt đối, lastmod, escape ký tự XML", () => {
    const xml = urlsetXml(SITE, [{ path: "/", lastModified: "2026-11-20T00:00:00Z" }, { path: "/bai-viet/a&b" }]);
    expect(xml).toContain("<loc>https://tuyethua.vn</loc>");
    expect(xml).toContain("<lastmod>2026-11-20T00:00:00.000Z</lastmod>");
    expect(xml).toContain("a&amp;b");
    expect(xml).not.toContain("localhost");
  });

  it("có bản dịch → xhtml:link hreflang (kèm x-default); không có → không", () => {
    const xml = urlsetXml(SITE, [{ path: "/", alternates: { vi: "/", en: "/en" } }]);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="en" href="https://tuyethua.vn/en"/>');
    expect(xml).toContain('hreflang="x-default" href="https://tuyethua.vn"');
    const single = urlsetXml(SITE, [{ path: "/", alternates: { vi: "/" } }]);
    expect(single).not.toContain("<xhtml:link");
  });
});

import { describe, expect, it } from "vitest";
import { sitemapIndexItems, sitemapIndexXml, urlsetXml } from "./sitemaps";

const SITE = "https://tuyethua.vn";

describe("sitemaps (SEO, T5.2)", () => {
  it("sitemap index liệt kê sitemap con bằng URL tuyệt đối, kèm lastmod từng tệp", () => {
    const xml = sitemapIndexXml(SITE, [{ name: "pages", lastModified: "2026-11-20T00:00:00Z" }, { name: "projects" }]);
    expect(xml).toContain("<sitemapindex");
    expect(xml).toContain("<loc>https://tuyethua.vn/sitemaps/pages.xml</loc><lastmod>2026-11-20T00:00:00.000Z</lastmod>");
    expect(xml).toContain("<loc>https://tuyethua.vn/sitemaps/projects.xml</loc></sitemap>");
  });

  it("index bỏ sitemap con rỗng (SEO-06: danh mục rỗng), lastmod = mục mới nhất", () => {
    const items = sitemapIndexItems(
      [
        { name: "pages", entries: [{ path: "/", lastModified: "2026-11-20T00:00:00Z" }, { path: "/lien-he", lastModified: "2026-11-22T08:00:00Z" }] },
        { name: "projects", entries: [{ path: "/du-an/a" }] },
        { name: "posts", entries: [] },
      ],
      "2026-11-01T00:00:00Z",
    );
    expect(items).toEqual([
      { name: "pages", lastModified: "2026-11-22T08:00:00.000Z" },
      { name: "projects", lastModified: "2026-11-01T00:00:00Z" },
    ]);
  });

  it("index giữ sitemap con khi không đọc được nội dung (không làm rơi URL thật vì lỗi tạm)", () => {
    expect(sitemapIndexItems([{ name: "posts", entries: null }], null)).toEqual([{ name: "posts", lastModified: null }]);
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

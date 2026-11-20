import { describe, expect, it } from "vitest";
import { normalizeSiteSettings, type SiteSettings } from "./content/site-settings";
import {
  blogPostingNode,
  breadcrumbNode,
  faqPageNode,
  graph,
  itemListNode,
  personNode,
  placeNode,
  roleOnly,
  serializeJsonLd,
  webPageNode,
  websiteNode,
} from "./json-ld";

const SITE = "https://tuyethua.vn";
const settings: SiteSettings = {
  ...normalizeSiteSettings(null, "vi"),
  updatedAt: null,
  personName: "Hứa Thị Tuyết",
  jobTitle: "Giám đốc Kinh doanh",
  tagline: null,
  phone: "0359 361 359",
  zaloPhone: "0359 361 359",
  email: null,
  area: "Hạ Long – Quảng Ninh",
  socials: [{ platform: "facebook", url: "https://facebook.com/x" }],
  seo: { titleTemplate: "%s", description: "Mô tả.", ogImage: null },
};

describe("lib/json-ld (GEO-02, T5.1)", () => {
  it("Person có @id cố định, dữ liệu từ siteSettings, bỏ trường trống", () => {
    const p = personNode(settings, SITE);
    expect(p["@id"]).toBe("https://tuyethua.vn/#person");
    expect(p.name).toBe("Hứa Thị Tuyết");
    expect(p.telephone).toBe("+84359361359");
    expect(p.sameAs).toEqual(["https://facebook.com/x"]);
    expect(p).not.toHaveProperty("email");
    // Chưa xác nhận đơn vị công tác (MI-14) → không đưa worksFor
    expect(p).not.toHaveProperty("worksFor");
  });

  it("WebSite + WebPage tham chiếu Person bằng @id", () => {
    const w = websiteNode(settings, SITE, "vi");
    expect(w["@id"]).toBe("https://tuyethua.vn/#website");
    const page = webPageNode({ siteUrl: SITE, path: "/", name: "Trang chủ", lang: "vi" });
    expect(page.url).toBe("https://tuyethua.vn");
    expect(page.isPartOf).toEqual({ "@id": "https://tuyethua.vn/#website" });
  });

  it("BreadcrumbList URL tuyệt đối, đánh số từ 1", () => {
    const b = breadcrumbNode(SITE, [{ name: "Trang chủ", path: "/" }, { name: "Dự án", path: "/du-an" }]);
    expect(b.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://tuyethua.vn" },
      { "@type": "ListItem", position: 2, name: "Dự án", item: "https://tuyethua.vn/du-an" },
    ]);
  });

  it("graph + serialize: một @graph, escape </script>", () => {
    const g = graph([websiteNode(settings, SITE, "vi"), null]);
    expect(g["@context"]).toBe("https://schema.org");
    expect(g["@graph"]).toHaveLength(1);
    expect(serializeJsonLd({ a: "</script><b>" })).not.toContain("</script>");
  });

  it("jobTitle trong schema bỏ phần đơn vị sau « | » (chưa xác nhận — MI-14)", () => {
    expect(roleOnly("Giám đốc Kinh doanh – Khối TP55 | Trường Phát Group")).toBe("Giám đốc Kinh doanh – Khối TP55");
    expect(roleOnly("Chức danh")).toBe("Chức danh");
    expect(roleOnly(null)).toBeNull();
    const p = personNode({ ...settings, jobTitle: "Giám đốc | Trường Phát Group" }, SITE);
    expect(JSON.stringify(p)).not.toContain("Trường Phát");
  });

  it("ProfilePage / ContactPage có mainEntity → Person", () => {
    const page = webPageNode({ siteUrl: SITE, path: "/gioi-thieu", name: "Giới thiệu", lang: "vi", type: "ProfilePage", mainEntity: true });
    expect(page["@type"]).toBe("ProfilePage");
    expect(page.mainEntity).toEqual({ "@id": "https://tuyethua.vn/#person" });
  });

  it("ItemList: URL tuyệt đối theo thứ tự", () => {
    const l = itemListNode(SITE, [{ name: "A", path: "/du-an/a" }, { name: "B", path: "/du-an/b" }]);
    expect(l["@type"]).toBe("ItemList");
    expect(l.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "A", url: "https://tuyethua.vn/du-an/a" },
      { "@type": "ListItem", position: 2, name: "B", url: "https://tuyethua.vn/du-an/b" },
    ]);
  });

  it("Place: ảnh tuyệt đối, bỏ trường trống, không Offer / giá", () => {
    const p = placeNode({ siteUrl: SITE, path: "/du-an/x", name: "X", description: null, image: "/seed-assets/a.jpg", address: null });
    expect(p).toMatchObject({ "@type": "Place", name: "X", image: "https://tuyethua.vn/seed-assets/a.jpg", url: "https://tuyethua.vn/du-an/x" });
    expect(p).not.toHaveProperty("description");
    expect(JSON.stringify(p)).not.toMatch(/Offer|price/i);
  });

  it("BlogPosting: tác giả = Person @id, ngày ISO, ảnh tuyệt đối", () => {
    const a = blogPostingNode({
      siteUrl: SITE,
      path: "/bai-viet/a",
      headline: "Bài A",
      description: "Mô tả",
      datePublished: "2026-10-01T08:00:00Z",
      dateModified: "2026-10-02T08:00:00Z",
      image: "https://cdn.sanity.io/images/x.jpg",
      lang: "vi",
    });
    expect(a).toMatchObject({
      "@type": "BlogPosting",
      headline: "Bài A",
      author: { "@id": "https://tuyethua.vn/#person" },
      publisher: { "@id": "https://tuyethua.vn/#person" },
      image: "https://cdn.sanity.io/images/x.jpg",
      mainEntityOfPage: "https://tuyethua.vn/bai-viet/a",
      inLanguage: "vi",
    });
  });

  it("FAQPage chỉ khi có ≥ 1 câu hỏi có trả lời", () => {
    expect(faqPageNode([])).toBeNull();
    expect(faqPageNode([{ question: "Q?", answer: "" }])).toBeNull();
    const f = faqPageNode([{ question: "Q?", answer: "A." }]);
    expect(f?.mainEntity).toEqual([{ "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A." } }]);
  });
});

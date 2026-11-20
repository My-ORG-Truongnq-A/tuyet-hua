import { describe, expect, it } from "vitest";
import type { SiteSettings } from "./content/site-settings";
import { breadcrumbNode, graph, personNode, serializeJsonLd, webPageNode, websiteNode } from "./json-ld";

const SITE = "https://tuyethua.vn";
const settings: SiteSettings = {
  updatedAt: null,
  personName: "Hứa Thị Tuyết",
  jobTitle: "Giám đốc Kinh doanh",
  organization: "Công ty Mẫu",
  tagline: null,
  phone: "0359 361 359",
  zaloPhone: "0359 361 359",
  email: null,
  area: "Hạ Long – Quảng Ninh",
  socials: [{ platform: "facebook", url: "https://facebook.com/x" }],
  seo: { titleTemplate: "%s", description: "Mô tả." },
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
});

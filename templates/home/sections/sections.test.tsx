import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { normalizeSiteSettings } from "@/lib/content/site-settings";
import { Hero } from "./Hero";
import { Story } from "./Story";
import { Trust } from "./Trust";

/** T6.5: chữ phụ trang chủ đọc từ CMS (homePage), đổi seed → trang đổi theo; trống → dòng ẩn, không chữ cứng. */
const settings = {
  ...normalizeSiteSettings(null, "vi"),
  personName: "Nguyễn Văn Mẫu",
  tagline: "MỘT VẾ. HAI VẾ. BA VẾ.",
  jobTitle: "Chức danh mẫu | Công ty mẫu",
};
const quote = "Câu chuyện mẫu";

describe("Hero — dòng phụ dưới trụ cột (hero.pillarNotes)", () => {
  it("hiện đúng chữ CMS theo thứ tự vế", () => {
    const html = renderToStaticMarkup(<Hero lang="vi" settings={settings} hero={{ pillarNotes: ["Ghi chú A", "Ghi chú B"] }} />);
    expect(html.indexOf("Ghi chú A")).toBeGreaterThan(html.indexOf("Một vế"));
    expect(html.indexOf("Ghi chú B")).toBeGreaterThan(html.indexOf("Hai vế"));
  });

  it("trống → không có dòng phụ, không chữ cứng cũ", () => {
    const html = renderToStaticMarkup(<Hero lang="vi" settings={settings} hero={{}} />);
    expect(html).toContain("Ba vế");
    expect(html).not.toContain("Thị trường · pháp lý · tài chính");
    expect(html).not.toContain("text-xs text-(--on-hero-muted)");
  });
});

describe("Story — dòng Lĩnh vực / Tập trung (story.expertise, story.focus)", () => {
  it("hiện chữ CMS", () => {
    const html = renderToStaticMarkup(
      <Story lang="vi" settings={settings} story={{ quote, expertise: "Lĩnh vực mẫu", focus: "Trọng tâm mẫu" }} />,
    );
    expect(html).toContain("Lĩnh vực mẫu");
    expect(html).toContain("Trọng tâm mẫu");
  });

  it("trống → chỉ còn dòng từ Cài đặt chung", () => {
    const html = renderToStaticMarkup(<Story lang="vi" settings={settings} story={{ quote, expertise: "  " }} />);
    expect(html).toContain("Chức danh mẫu");
    expect(html).not.toContain("Tư vấn, phân phối bất động sản đầu tư");
    expect(html.match(/<li /g)?.length).toBe(2);
  });
});

describe("Trust — nhãn kỹ năng (trustSection.tags)", () => {
  it("số nhãn theo dữ liệu", () => {
    const tags = ["N1", "N2", "N3", "N4", "N5", "N6", "N7", "N8"];
    const html = renderToStaticMarkup(<Trust lang="vi" section={{ tags }} testimonials={[]} />);
    for (const tag of tags) expect(html).toContain(`</span>${tag}</li>`);
  });

  it("trống → không có hàng nhãn", () => {
    const html = renderToStaticMarkup(<Trust lang="vi" section={{ tags: [] }} testimonials={[]} />);
    expect(html).not.toContain("rotate-45 bg-gold-500");
    expect(html).not.toContain("Đào tạo thực chiến");
  });
});

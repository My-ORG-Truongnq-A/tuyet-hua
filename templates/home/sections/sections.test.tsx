import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { normalizeSiteSettings } from "@/lib/content/site-settings";
import { env } from "@/lib/env";
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

describe("Hero — ảnh chân dung LCP (T6.6)", () => {
  const mode = env.contentMode;
  afterEach(() => {
    (env as { contentMode: string }).contentMode = mode;
  });
  const portrait = {
    _type: "figure",
    alt: "Chân dung mẫu",
    image: { _type: "image", asset: { _ref: "image-x-630x945-png", url: "/seed-assets/portrait.png", width: 630, height: 945 } },
  };

  it("có ảnh: eager + fetchpriority high + width/height, không lớp hiệu ứng vào", () => {
    const html = renderToStaticMarkup(<Hero lang="vi" settings={settings} hero={{ image: portrait as never }} />);
    const img = html.match(/<img[^>]*alt="Chân dung mẫu"[^>]*>/)?.[0] ?? "";
    expect(img).toMatch(/loading="eager"/);
    expect(img).toMatch(/fetchPriority="high"/i);
    expect(img).toMatch(/width="630"/);
    expect(img).toMatch(/height="945"/);
    expect(img).not.toMatch(/animate-|opacity-0/);
  });

  it("release, ảnh chưa xác nhận (lớp dữ liệu đã bỏ) → không cột chân dung / quầng sáng; còn H1, tagline, CTA Zalo", () => {
    (env as { contentMode: string }).contentMode = "release";
    const html = renderToStaticMarkup(<Hero lang="vi" settings={{ ...settings, zaloPhone: "0359361359" }} hero={{ image: null }} />);
    expect(html).toContain('data-portrait="none"');
    expect(html).not.toContain("--gradient-halo");
    expect(html).not.toContain("data-pending");
    expect(html).toMatch(/<h1[^>]*>.*Nguyễn Văn Mẫu<\/h1>/s);
    expect(html).toContain("Ba vế");
    expect(html).toMatch(/href="https:\/\/zalo\.me\/0359361359"/);
  });

  it("preview, chưa có ảnh → giữ ô chờ ảnh để người duyệt thấy chỗ trống", () => {
    (env as { contentMode: string }).contentMode = "preview";
    const html = renderToStaticMarkup(<Hero lang="vi" settings={settings} hero={{ image: null }} />);
    expect(html).not.toContain('data-portrait="none"');
    expect(html).toContain("data-pending");
  });
});

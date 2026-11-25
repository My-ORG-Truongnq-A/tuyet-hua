import { describe, expect, it } from "vitest";
import { normalizeSiteSettings, type SiteSettings } from "./content/site-settings";
import { buildMetadataFor } from "./seo";

const settings: SiteSettings = {
  ...normalizeSiteSettings(null, "vi"),
  updatedAt: null,
  personName: "Hứa Thị Tuyết",
  jobTitle: "Chức danh",
  tagline: "Khẩu hiệu.",
  phone: "0359 361 359",
  zaloPhone: "0359 361 359",
  email: null,
  area: null,
  socials: [],
  seo: { titleTemplate: "%s | Hứa Thị Tuyết", description: "Mô tả mặc định.", ogImage: null },
};
const ctx = { siteUrl: "https://tuyethua.vn", indexable: true, languages: ["vi", "en"] as const };

describe("buildMetadataFor (T1.5, SEO)", () => {
  it("title ghép template; description mặc định khi trang không có", () => {
    const m = buildMetadataFor({ lang: "vi", path: "/gioi-thieu", title: "Giới thiệu", settings }, ctx);
    expect(m.title).toEqual({ absolute: "Giới thiệu | Hứa Thị Tuyết" });
    expect(m.description).toBe("Mô tả mặc định.");
  });

  it("trang chủ dùng title tuyệt đối", () => {
    const m = buildMetadataFor({ lang: "vi", path: "/", absoluteTitle: "Hứa Thị Tuyết — Khẩu hiệu.", settings }, ctx);
    expect(m.title).toEqual({ absolute: "Hứa Thị Tuyết — Khẩu hiệu." });
  });

  it("canonical, og:url tuyệt đối theo SITE_URL, không / cuối", () => {
    const m = buildMetadataFor({ lang: "vi", path: "/du-an/ha-long-xanh/", title: "X", settings }, ctx);
    expect(m.alternates?.canonical).toBe("https://tuyethua.vn/du-an/ha-long-xanh");
    expect((m.openGraph as { url?: string }).url).toBe("https://tuyethua.vn/du-an/ha-long-xanh");
    expect(m.metadataBase?.toString()).toBe("https://tuyethua.vn/");
  });

  it("ảnh OG tuyệt đối kèm width / height / alt (trống → title), có cả twitter:image (SEO-14)", () => {
    const image = { url: "/og/about-vi.jpg", width: 1200, height: 630, alt: "" };
    const m = buildMetadataFor({ lang: "vi", path: "/gioi-thieu", title: "Giới thiệu", settings, image }, ctx);
    const og = { url: "https://tuyethua.vn/og/about-vi.jpg", width: 1200, height: 630, alt: "Giới thiệu | Hứa Thị Tuyết" };
    expect((m.openGraph as { images?: unknown }).images).toEqual([og]);
    expect(m.twitter).toMatchObject({ card: "summary_large_image", images: [og] });
  });

  it("hreflang vi + en + x-default chỉ khi có bản dịch thật", () => {
    const both = buildMetadataFor({ lang: "vi", path: "/gioi-thieu", title: "X", settings, translations: { en: "/en/about" } }, ctx);
    expect(both.alternates?.languages).toEqual({
      vi: "https://tuyethua.vn/gioi-thieu",
      en: "https://tuyethua.vn/en/about",
      "x-default": "https://tuyethua.vn/gioi-thieu",
    });
    const viOnly = buildMetadataFor({ lang: "vi", path: "/gioi-thieu", title: "X", settings }, ctx);
    expect(viOnly.alternates?.languages).toEqual({ vi: "https://tuyethua.vn/gioi-thieu", "x-default": "https://tuyethua.vn/gioi-thieu" });
  });

  it("en chưa bật → không khai hreflang en dù có đường dẫn", () => {
    const m = buildMetadataFor(
      { lang: "vi", path: "/gioi-thieu", title: "X", settings, translations: { en: "/en/about" } },
      { ...ctx, languages: ["vi"] },
    );
    expect(Object.keys(m.alternates?.languages ?? {})).toEqual(["vi", "x-default"]);
  });

  it("không được index → robots noindex, nofollow; trang noindex riêng cũng vậy", () => {
    const off = buildMetadataFor({ lang: "vi", path: "/", title: "X", settings }, { ...ctx, indexable: false });
    expect(off.robots).toEqual({ index: false, follow: false });
    const page = buildMetadataFor({ lang: "vi", path: "/", title: "X", settings, noindex: true }, ctx);
    expect(page.robots).toEqual({ index: false, follow: false });
    const on = buildMetadataFor({ lang: "vi", path: "/", title: "X", settings }, ctx);
    expect(on.robots).toEqual({ index: true, follow: true });
  });

  it("og:locale theo ngôn ngữ", () => {
    const m = buildMetadataFor({ lang: "en", path: "/en", title: "X", settings }, ctx);
    expect((m.openGraph as { locale?: string }).locale).toBe("en_US");
  });
});

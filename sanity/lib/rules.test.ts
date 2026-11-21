import { evaluate, parse } from "groq-js";
import { describe, expect, it } from "vitest";
import {
  checkAlt,
  checkEmail,
  checkGa4Id,
  checkGtmId,
  checkHHmm,
  checkHeroCutout,
  checkHeroImageSize,
  checkHttpsUrl,
  checkMaxLength,
  checkMinImageSize,
  checkNavItems,
  checkOpeningHours,
  checkRedirects,
  checkRoleShares,
  checkSeoDescription,
  checkSeoTitle,
  checkSlug,
  checkVnPhone,
  checkYouTubeUrl,
  imageDimensionsFromRef,
  UNIQUE_SLUG_QUERY,
  uniqueSlugParams,
} from "./rules";

describe("luật validate thuần của schema", () => {
  it("alt ảnh 5–125 ký tự, không mở đầu bằng «ảnh» / «hình» (REQ-12)", () => {
    expect(checkAlt("Chân dung mặc vest xanh navy")).toBe(true);
    expect(checkAlt(undefined)).toBe(true);
    expect(checkAlt("abc")).toMatch(/ngắn/);
    expect(checkAlt("x".repeat(126))).toMatch(/125/);
    expect(checkAlt("Ảnh chân dung")).toMatch(/Không bắt đầu/);
    expect(checkAlt("hình đội ngũ")).toMatch(/Không bắt đầu/);
    expect(checkAlt("Hình thức đào tạo tại văn phòng")).toBe(true);
  });

  it("chỉ https", () => {
    expect(checkHttpsUrl("https://facebook.com/x")).toBe(true);
    expect(checkHttpsUrl("http://facebook.com/x")).toMatch(/https/);
    expect(checkHttpsUrl("không phải url")).toMatch(/không hợp lệ/);
  });

  it("số điện thoại VN 10 chữ số, bắt đầu bằng 0", () => {
    expect(checkVnPhone("0900 000 001")).toBe(true);
    expect(checkVnPhone("0900.000.001")).toBe(true);
    expect(checkVnPhone("900 000 001")).toMatch(/10 chữ số/);
    expect(checkVnPhone("+84 900 000 001")).toMatch(/Chỉ gồm/);
  });

  it("email, giờ HH:mm, giờ đóng sau giờ mở", () => {
    expect(checkEmail("ten@vi-du.vn")).toBe(true);
    expect(checkEmail("ten@")).toMatch(/không hợp lệ/);
    expect(checkHHmm("08:30")).toBe(true);
    expect(checkHHmm("8:30")).toMatch(/HH:mm/);
    expect(checkOpeningHours({ opens: "08:00", closes: "17:30" })).toBe(true);
    expect(checkOpeningHours({ opens: "18:00", closes: "08:00" })).toMatch(/sau giờ mở/);
  });

  it("slug không dấu", () => {
    expect(checkSlug({ current: "ha-long-xanh" })).toBe(true);
    expect(checkSlug({ current: "Hạ-Long" })).toMatch(/không dấu/);
    expect(checkSlug(undefined)).toBe(true);
  });

  it("độ dài SEO: title ≤ 60, description 70–160 (warning)", () => {
    expect(checkSeoTitle("x".repeat(60))).toBe(true);
    expect(checkSeoTitle("x".repeat(61))).toMatch(/60/);
    expect(checkSeoDescription("x".repeat(69))).toMatch(/ngắn/);
    expect(checkSeoDescription("x".repeat(120))).toBe(true);
    expect(checkSeoDescription("x".repeat(161))).toMatch(/dài/);
    expect(checkMaxLength(200)("x".repeat(201))).toMatch(/200/);
  });

  it("mã đo lường GTM / GA4", () => {
    expect(checkGtmId("GTM-ABC123")).toBe(true);
    expect(checkGtmId("G-ABC")).toMatch(/GTM/);
    expect(checkGa4Id("G-ABC123XYZ")).toBe(true);
    expect(checkGa4Id("UA-123")).toMatch(/GA4/);
  });

  it("embed chỉ YouTube", () => {
    expect(checkYouTubeUrl("https://www.youtube.com/watch?v=abc")).toBe(true);
    expect(checkYouTubeUrl("https://youtu.be/abc")).toBe(true);
    expect(checkYouTubeUrl("https://vimeo.com/1")).toMatch(/YouTube/);
  });

  it("định vị 60/40: tổng = 100, số nguyên", () => {
    expect(checkRoleShares([{ share: 60 }, { share: 40 }])).toBe(true);
    expect(checkRoleShares([{ share: 60 }, { share: 30 }])).toMatch(/90/);
    expect(checkRoleShares([{ share: 60.5 }, { share: 39.5 }])).toMatch(/số nguyên/);
  });

  it("menu tối đa 7 mục hiện, không trùng đích (REQ-29)", () => {
    const items = Array.from({ length: 8 }, (_, i) => ({ target: `t${i}`, visible: true }));
    expect(checkNavItems(items)).toMatch(/Tối đa 7/);
    expect(checkNavItems(items.map((it, i) => (i === 7 ? { ...it, visible: false } : it)))).toBe(true);
    expect(checkNavItems([{ target: "home" }, { target: "home" }])).toMatch(/một lần/);
  });

  it("redirect: from «/», không trùng, không tự trỏ, một bước nhảy (CM-12)", () => {
    expect(checkRedirects([{ from: "/du-an/cu", to: "/du-an/moi" }])).toBe(true);
    expect(checkRedirects([{ from: "/a", to: "https://vi-du.vn/b" }])).toBe(true);
    expect(checkRedirects([{ from: "du-an", to: "/b" }])).toMatch(/bắt đầu bằng «\/»/);
    expect(checkRedirects([{ from: "https://x.vn/a", to: "/b" }])).toMatch(/bắt đầu bằng «\/»/);
    expect(checkRedirects([{ from: "/a", to: "/b" }, { from: "/a", to: "/c" }])).toMatch(/hai lần/);
    expect(checkRedirects([{ from: "/a", to: "/a" }])).toMatch(/chính nó/);
    expect(checkRedirects([{ from: "/a", to: "/b" }, { from: "/b", to: "/c" }])).toMatch(/một bước/);
    expect(checkRedirects([{ from: "/a", to: "http://x.vn" }])).toMatch(/đích/);
  });

  it("kích thước ảnh đọc từ _ref của Sanity", () => {
    expect(imageDimensionsFromRef("image-abc123-1200x630-jpg")).toEqual({ width: 1200, height: 630 });
    expect(imageDimensionsFromRef("khong-dung")).toBeNull();
    const og = checkMinImageSize(1200, 630);
    expect(og({ asset: { _ref: "image-abc-1200x630-jpg" } })).toBe(true);
    expect(og({ asset: { _ref: "image-abc-800x600-png" } })).toMatch(/1200×630/);
    expect(og(undefined)).toBe(true);
    const favicon = checkMinImageSize(512, 512, { square: true });
    expect(favicon({ asset: { _ref: "image-abc-600x512-png" } })).toMatch(/vuông/);
    expect(checkHeroImageSize({ asset: { _ref: "image-abc-630x945-jpg" } })).toMatch(/2000/);
    expect(checkHeroImageSize({ asset: { _ref: "image-abc-1600x2400-jpg" } })).toBe(true);
  });

  it("ảnh hero tách nền (T6.6): JPG không có nền trong suốt hoặc rộng < 1200 px → cảnh báo", () => {
    expect(checkHeroCutout({ asset: { _ref: "image-abc-1600x2400-jpg" } })).toMatch(/trong suốt/);
    expect(checkHeroCutout({ asset: { _ref: "image-abc-630x945-png" } })).toMatch(/1200/);
    expect(checkHeroCutout({ asset: { _ref: "image-abc-1200x1800-png" } })).toBe(true);
    expect(checkHeroCutout({ asset: { _ref: "image-abc-1400x2000-webp" } })).toBe(true);
    expect(checkHeroCutout(undefined)).toBe(true);
  });
});

describe("slug duy nhất trong (type, language) — CM-06", () => {
  const dataset = [
    { _id: "project-a-vi", _type: "project", language: "vi", slug: { current: "ha-long-xanh" } },
    { _id: "project-a-en", _type: "project", language: "en", slug: { current: "ha-long-xanh" } },
    { _id: "post-x-vi", _type: "post", language: "vi", slug: { current: "trung" } },
  ];
  const isUnique = async (doc: { _id: string; _type: string; language?: string }, slug: string) => {
    const params = uniqueSlugParams(doc, slug);
    const value = await evaluate(parse(UNIQUE_SLUG_QUERY, { params }), { dataset, params });
    return value.get();
  };

  it("cùng loại + cùng ngôn ngữ → trùng", async () => {
    expect(await isUnique({ _id: "project-b-vi", _type: "project", language: "vi" }, "ha-long-xanh")).toBe(false);
  });

  it("khác ngôn ngữ hoặc khác loại → hợp lệ", async () => {
    expect(await isUnique({ _id: "project-c-en", _type: "project", language: "en" }, "trung")).toBe(true);
    expect(await isUnique({ _id: "project-b-vi", _type: "project", language: "vi" }, "trung")).toBe(true);
  });

  it("chính nó (bản nháp hoặc đã publish) không tính là trùng", async () => {
    expect(await isUnique({ _id: "drafts.project-a-vi", _type: "project", language: "vi" }, "ha-long-xanh")).toBe(true);
    expect(await isUnique({ _id: "project-a-vi", _type: "project", language: "vi" }, "ha-long-xanh")).toBe(true);
  });
});

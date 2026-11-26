import { describe, expect, it } from "vitest";
import { isValidSlug, slugify } from "./slug";

describe("slugify (T1.4) — tiếng Việt không dấu", () => {
  it("bỏ dấu, đ → d, chữ thường, gạch ngang", () => {
    expect(slugify("Hạ Long Xanh")).toBe("ha-long-xanh");
    expect(slugify("Làng Vân")).toBe("lang-van");
    expect(slugify("Đào tạo & Đội ngũ")).toBe("dao-tao-doi-ngu");
    expect(slugify("  Mua nhà: 5 điều cần biết!  ")).toBe("mua-nha-5-dieu-can-biet");
  });

  it("gộp ký tự lạ liên tiếp, bỏ gạch ở hai đầu", () => {
    expect(slugify("--Quý   khách -- ")).toBe("quy-khach");
    expect(slugify("Ưu đãi — Tháng 12")).toBe("uu-dai-thang-12");
  });

  it("chuỗi không có chữ / số → rỗng", () => {
    expect(slugify("!!!")).toBe("");
    expect(slugify("")).toBe("");
  });

  it("cắt tối đa 96 ký tự, không để gạch cuối", () => {
    const s = slugify("a ".repeat(80));
    expect(s.length).toBeLessThanOrEqual(96);
    expect(s.endsWith("-")).toBe(false);
  });
});

describe("isValidSlug", () => {
  it("chỉ nhận ^[a-z0-9]+(-[a-z0-9]+)*$", () => {
    expect(isValidSlug("ha-long-xanh")).toBe(true);
    expect(isValidSlug("du-an-2")).toBe(true);
    expect(isValidSlug("Ha-Long")).toBe(false);
    expect(isValidSlug("hạ-long")).toBe(false);
    expect(isValidSlug("a--b")).toBe(false);
    expect(isValidSlug("-a")).toBe(false);
    expect(isValidSlug("")).toBe(false);
  });
});

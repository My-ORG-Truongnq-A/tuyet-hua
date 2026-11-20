import { describe, expect, it } from "vitest";
import { absoluteUrlFor } from "./site-url";

const SITE = "https://tuyethua.vn";

describe("absoluteUrlFor (SEO-02)", () => {
  it("ghép path tương đối thành URL tuyệt đối, không / cuối", () => {
    expect(absoluteUrlFor(SITE, "/")).toBe("https://tuyethua.vn");
    expect(absoluteUrlFor(SITE, "")).toBe("https://tuyethua.vn");
    expect(absoluteUrlFor(SITE, "/du-an/ha-long-xanh/")).toBe("https://tuyethua.vn/du-an/ha-long-xanh");
    expect(absoluteUrlFor(SITE, "gioi-thieu")).toBe("https://tuyethua.vn/gioi-thieu");
  });

  it("giữ query / hash", () => {
    expect(absoluteUrlFor(SITE, "/bai-viet?trang=2")).toBe("https://tuyethua.vn/bai-viet?trang=2");
    expect(absoluteUrlFor(SITE, "/#lien-he")).toBe("https://tuyethua.vn/#lien-he");
  });

  it("URL tuyệt đối giữ nguyên (ảnh CDN)", () => {
    expect(absoluteUrlFor(SITE, "https://cdn.sanity.io/images/x.jpg")).toBe("https://cdn.sanity.io/images/x.jpg");
  });
});

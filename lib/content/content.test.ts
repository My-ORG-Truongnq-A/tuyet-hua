import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SITE_SETTINGS_QUERY } from "./queries";
import { publishedOnly, queryDocuments, type SanityDocument } from "./source-seed";
import { normalizeSiteSettings, type RawSiteSettings } from "./site-settings";

const fixture = JSON.parse(readFileSync(join(__dirname, "../../tests/fixtures/seed-min.json"), "utf8")) as SanityDocument[];
const realSeed = JSON.parse(readFileSync(join(__dirname, "../../seed/sanity/documents.json"), "utf8")) as SanityDocument[];

describe("nguồn seed (groq-js, KT-01)", () => {
  it("bỏ bản nháp drafts.* / versions.*", () => {
    const ids = publishedOnly([...fixture, { _id: "versions.r1.x", _type: "post" }]).map((d) => d._id);
    expect(ids).toEqual(["siteSettings"]);
  });

  it("chạy chính truy vấn GROQ của Sanity trên seed", async () => {
    const raw = await queryDocuments<RawSiteSettings | null>(publishedOnly(fixture), SITE_SETTINGS_QUERY);
    expect(raw?.personName).toBe("Nguyễn Văn Mẫu");
  });

  it("seed thật có siteSettings đọc được bằng cùng truy vấn", async () => {
    const raw = await queryDocuments<RawSiteSettings | null>(publishedOnly(realSeed), SITE_SETTINGS_QUERY);
    expect(raw?.personName).toBeTruthy();
    expect(raw?.phone).toBeTruthy();
  });
});

describe("normalizeSiteSettings (chuẩn hoá null tại cửa)", () => {
  it("chọn ngôn ngữ, không fallback", async () => {
    const raw = await queryDocuments<RawSiteSettings | null>(publishedOnly(fixture), SITE_SETTINGS_QUERY);
    const vi = normalizeSiteSettings(raw, "vi");
    expect(vi.jobTitle).toBe("Chức danh mẫu");
    expect(vi.seo.titleTemplate).toBe("%s | Nguyễn Văn Mẫu");
    const en = normalizeSiteSettings(raw, "en");
    expect(en.jobTitle).toBeNull();
    expect(en.tagline).toBe("Sample tagline.");
    expect(en.seo.description).toBeNull();
  });

  it("thiếu document → giá trị rỗng an toàn, không số điện thoại mặc định", () => {
    const s = normalizeSiteSettings(null, "vi");
    expect(s.personName).toBe("");
    expect(s.phone).toBeNull();
    expect(s.zaloPhone).toBeNull();
    expect(s.socials).toEqual([]);
    expect(s.seo.titleTemplate).toBe("%s");
  });

  it("zaloPhone thiếu thì dùng phone", () => {
    const s = normalizeSiteSettings({ personName: "A", phone: "0900 000 001" }, "vi");
    expect(s.zaloPhone).toBe("0900 000 001");
  });
});

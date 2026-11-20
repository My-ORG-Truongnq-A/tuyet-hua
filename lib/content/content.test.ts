import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { attachImageAssets, collectImageRefs, stripInternal, type ImageAssetInfo } from "./post-process";
import {
  CONTENT_MODEL_QUERIES,
  IMAGE_ASSETS_QUERY,
  NAVIGATION_QUERY,
  PAGE_QUERY,
  POST_BY_SLUG_QUERY,
  POST_COUNT_QUERY,
  POST_LIST_QUERY,
  PROJECT_BY_SLUG_QUERY,
  PROJECT_LIST_QUERY,
  REDIRECTS_QUERY,
  SITE_SETTINGS_QUERY,
  TESTIMONIALS_QUERY,
  TRANSLATIONS_QUERY,
} from "./queries";
import type { SeedAsset } from "./seed-assets";
import { normalizeSiteSettings, type RawSiteSettings } from "./site-settings";
import { prepareSeed, publishedOnly, queryDocuments, type SanityDocument } from "./source-seed";

const root = join(__dirname, "../..");
const read = <T>(p: string) => JSON.parse(readFileSync(join(root, p), "utf8")) as T;
const assets = read<SeedAsset[]>("seed/sanity/assets.json");
const full = prepareSeed(read<SanityDocument[]>("seed/fixtures/seed-full.json"), assets);
const real = prepareSeed(read<SanityDocument[]>("seed/sanity/documents.json"), assets);
const q = <T>(docs: SanityDocument[], query: string, params: Record<string, unknown> = {}) => queryDocuments<T>(docs, query, params);

describe("queries.ts (T2.6, KT-01)", () => {
  it("đúng 9 câu của content_model.groq_queries", () => {
    expect(Object.keys(CONTENT_MODEL_QUERIES).sort()).toEqual(
      ["page", "postBySlug", "postList", "projectBySlug", "projectList", "redirects", "settings", "testimonials", "translations"].sort(),
    );
  });

  it("projection không lấy trường nội bộ (D-02)", () => {
    for (const query of Object.values(CONTENT_MODEL_QUERIES)) expect(query).not.toMatch(/rightsNote|sourceNote|consentNote/);
  });
});

describe("nguồn seed: chạy CHÍNH truy vấn Sanity bằng groq-js (fixture seed-full)", () => {
  it("bỏ bản nháp drafts.* / versions.* (D-08)", () => {
    const ids = publishedOnly([
      { _id: "a", _type: "post" },
      { _id: "drafts.a", _type: "post" },
      { _id: "versions.r1.a", _type: "post" },
    ]).map((d) => d._id);
    expect(ids).toEqual(["a"]);
  });

  it("ảnh seed thành asset giống Sanity: asset-> có url /seed-assets và kích thước thật (BP-05)", async () => {
    const url = await q<{ url: string; w: number }>(full, `*[_id == "homePage-vi"][0].hero.image.image.asset->{ url, "w": metadata.dimensions.width }`);
    expect(url).toEqual({ url: "/seed-assets/portrait-navy.jpg", w: 630 });
  });

  it("settings", async () => {
    const s = await q<RawSiteSettings>(full, SITE_SETTINGS_QUERY);
    expect(s.personName).toBe("Nguyễn Văn Mẫu");
    expect(s.contact?.phone).toBe("0900 000 001");
    expect(s._updatedAt).toBeTruthy();
  });

  it("page theo _id <type>-<lang>", async () => {
    expect((await q<{ title: string }>(full, PAGE_QUERY, { type: "homePage", lang: "en" })).title).toBe("Home");
    expect(await q(full, PAGE_QUERY, { type: "aboutPage", lang: "en" })).toBeNull();
  });

  it("projectList: trọng tâm trước, rồi sortOrder; không có bản nháp (REQ-02)", async () => {
    const list = await q<{ slug: string; featured: boolean }[]>(full, PROJECT_LIST_QUERY, { lang: "vi" });
    expect(list.map((p) => p.slug)).toEqual(["du-an-mau-1", "du-an-mau-2", "du-an-mau-3"]);
    expect(list[0]!.featured).toBe(true);
  });

  it("projectBySlug: dự án thật 200, dự án chỉ có bản nháp → null (CM-05)", async () => {
    expect(await q(full, PROJECT_BY_SLUG_QUERY, { lang: "vi", slug: "du-an-mau-3" })).not.toBeNull();
    expect(await q(full, PROJECT_BY_SLUG_QUERY, { lang: "vi", slug: "du-an-nhap" })).toBeNull();
  });

  it("postList: mới nhất trước, bỏ bài hẹn giờ tương lai, phân trang", async () => {
    const page1 = await q<{ slug: string }[]>(full, POST_LIST_QUERY, { lang: "vi", start: 0, end: 2 });
    expect(page1.map((p) => p.slug)).toEqual(["bai-mau-3", "bai-mau-2"]);
    const page2 = await q<{ slug: string }[]>(full, POST_LIST_QUERY, { lang: "vi", start: 2, end: 4 });
    expect(page2.map((p) => p.slug)).toEqual(["bai-mau-1"]);
    expect(await q(full, POST_COUNT_QUERY, { lang: "vi" })).toBe(3);
    expect(await q(full, POST_BY_SLUG_QUERY, { lang: "vi", slug: "bai-mau-4" })).toBeNull();
  });

  it("testimonials: chỉ bản có đồng ý (D-10)", async () => {
    const list = await q<{ authorName: string }[]>(full, TESTIMONIALS_QUERY, { lang: "vi" });
    expect(list.map((t) => t.authorName)).toEqual(["Chị A."]);
  });

  it("translations: bản dịch qua translation.metadata", async () => {
    const list = await q<{ language: string; slug: string }[]>(full, TRANSLATIONS_QUERY, { id: "project-du-an-mau-1-vi" });
    expect(list).toEqual([
      { _type: "project", language: "vi", slug: "du-an-mau-1" },
      { _type: "project", language: "en", slug: "du-an-mau-1" },
    ]);
  });

  it("redirects + menu", async () => {
    expect(await q(full, REDIRECTS_QUERY)).toEqual([{ _key: "r1", _type: "redirect", from: "/du-an/ten-cu", to: "/du-an/du-an-mau-1", permanent: true }]);
    const nav = await q<{ header: { navItems: unknown[] }; footer: { legalItems: unknown[] } }>(full, NAVIGATION_QUERY);
    expect(nav.header.navItems).toHaveLength(6);
    expect(nav.footer.legalItems).toHaveLength(1);
  });

  it("seed thật: đủ trang vi, 2 dự án (Hạ Long Xanh trọng tâm), chưa có bài / cảm nhận", async () => {
    for (const type of ["homePage", "aboutPage", "projectsPage", "teamPage", "articlesPage", "contactPage", "privacyPage"]) {
      expect(await q(real, PAGE_QUERY, { type, lang: "vi" })).not.toBeNull();
    }
    const projects = await q<{ slug: string; featured: boolean }[]>(real, PROJECT_LIST_QUERY, { lang: "vi" });
    expect(projects.map((p) => p.slug)).toEqual(["ha-long-xanh", "lang-van"]);
    expect(projects[0]!.featured).toBe(true);
    expect(await q(real, POST_COUNT_QUERY, { lang: "vi" })).toBe(0);
    expect(await q(real, TESTIMONIALS_QUERY, { lang: "vi" })).toEqual([]);
  });
});

describe("hậu xử lý chung cho seed và Sanity", () => {
  it("bỏ trường nội bộ ở mọi độ sâu (D-02)", () => {
    expect(stripInternal({ a: { rightsNote: "x", alt: "y" }, b: [{ sourceNote: "z", value: 1 }], consentNote: "n" })).toEqual({
      a: { alt: "y" },
      b: [{ value: 1 }],
    });
  });

  it("gắn url + kích thước cho mọi asset._ref ảnh (truy vấn asset dùng chung)", async () => {
    const page = stripInternal(await q<Record<string, unknown>>(full, PAGE_QUERY, { type: "teamPage", lang: "vi" }));
    const ids = collectImageRefs(page);
    expect(ids).toHaveLength(2);
    const infos = await q<ImageAssetInfo[]>(full, IMAGE_ASSETS_QUERY, { ids });
    const out = attachImageAssets(page, infos) as { gallery: { image: { asset: ImageAssetInfo } }[] };
    expect(out.gallery[0]!.image.asset).toMatchObject({ url: "/seed-assets/team-office.jpg", width: 1260, height: 945 });
    expect(JSON.stringify(out)).not.toMatch(/rightsNote/);
  });
});

describe("normalizeSiteSettings (chuẩn hoá null tại cửa)", () => {
  it("chọn ngôn ngữ, không fallback (REQ-17)", async () => {
    const raw = await q<RawSiteSettings>(full, SITE_SETTINGS_QUERY);
    const vi = normalizeSiteSettings(raw, "vi");
    expect(vi.jobTitle).toBe("Chức danh mẫu");
    expect(vi.seo.titleTemplate).toBe("%s | Mẫu");
    expect(vi.zaloPhone).toBe("0900 000 002");
    expect(vi.openingHours).toHaveLength(1);
    expect(vi.postsPerPage).toBe(2);
    const empty = read<SanityDocument[]>("seed/fixtures/seed-empty.json");
    const en = normalizeSiteSettings((await q<RawSiteSettings>(empty, SITE_SETTINGS_QUERY)), "en");
    expect(en.jobTitle).toBeNull();
    expect(en.tagline).toBeNull();
    expect(en.ui.zaloCta).toBeNull();
  });

  it("thiếu document → giá trị rỗng an toàn, không số điện thoại mặc định", () => {
    const s = normalizeSiteSettings(null, "vi");
    expect(s.personName).toBe("");
    expect(s.phone).toBeNull();
    expect(s.zaloPhone).toBeNull();
    expect(s.socials).toEqual([]);
    expect(s.address).toBeNull();
    expect(s.seo.titleTemplate).toBe("%s");
  });

  it("zaloPhone trống thì dùng phone (seed thật đang như vậy)", async () => {
    const s = normalizeSiteSettings(await q<RawSiteSettings>(real, SITE_SETTINGS_QUERY), "vi");
    const doc = read<{ _id: string; contact: { phone: string } }[]>("seed/sanity/documents.json").find((d) => d._id === "siteSettings")!;
    expect(s.phone).toBe(doc.contact.phone);
    expect(s.zaloPhone).toBe(doc.contact.phone);
    // titleTemplate trống trong seed → mẫu seo_plan «%s | {brandName}»
    expect(s.seo.titleTemplate).toBe(`%s | ${s.brandName}`);
  });
});

describe("getter qua một cửa (SEED_FILE fixture, CONTENT_MODE)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  const load = async (mode: "preview" | "release") => {
    vi.stubEnv("SEED_FILE", "fixtures/seed-full.json");
    vi.stubEnv("CONTENT_MODE", mode);
    vi.resetModules();
    return import("./pages");
  };

  it("release: ảnh / số liệu chưa xác nhận bị bỏ, trường nội bộ không ra (CM-07, CM-08)", async () => {
    const { getPage, getProjects, getPosts } = await load("release");
    const team = (await getPage("teamPage", "vi")) as unknown as { gallery: { alt: string }[] };
    expect(team.gallery.map((g) => g.alt)).toEqual(["Đội ngũ tại văn phòng"]);
    const home = (await getPage("homePage", "vi")) as unknown as { story: { highlights: { value: string }[] } };
    expect(home.story.highlights.map((h) => h.value)).toEqual(["10+"]);
    expect(JSON.stringify(home)).not.toMatch(/sourceNote|rightsNote/);
    const projects = await getProjects("vi");
    expect(projects[0]!.heroImage?.image?.asset?.url).toBe("/seed-assets/talk-sale-event.jpg");
    const posts = await getPosts("vi", 2, 2);
    expect(posts).toMatchObject({ total: 3, items: [{ slug: "bai-mau-1" }] });
  });

  it("preview: giữ lại kèm cờ pending", async () => {
    const { getPage } = await load("preview");
    const team = (await getPage("teamPage", "vi")) as unknown as { gallery: { alt: string; pending?: boolean }[] };
    expect(team.gallery).toHaveLength(2);
    expect(team.gallery[1]).toMatchObject({ pending: true });
  });

  it("dữ liệu seed thật: logo chưa có, ảnh chân dung đang chờ xác nhận → release ẩn", async () => {
    vi.stubEnv("CONTENT_MODE", "release");
    vi.resetModules();
    const { getPage } = await import("./pages");
    const home = (await getPage("homePage", "vi")) as unknown as { hero: { image: unknown } };
    expect(home.hero.image).toBeNull();
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

/** Sitemap theo dữ liệu (T5.2) trên fixture — không gọi Sanity. */
describe("sitemap-entries (fixture seed-full)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  const load = async (languages = "vi") => {
    vi.stubEnv("SEED_FILE", "fixtures/seed-full.json");
    vi.stubEnv("SITE_LANGUAGES", languages);
    vi.resetModules();
    return import("./sitemap-entries");
  };

  it("dự án: mọi dự án đã publish, bỏ bản nháp drafts.*", async () => {
    const { projectEntries } = await load();
    const paths = (await projectEntries()).map((e) => e.path);
    expect(paths).toEqual(expect.arrayContaining(["/du-an/du-an-mau-1", "/du-an/du-an-mau-2", "/du-an/du-an-mau-3"]));
    expect(paths.some((p) => p.includes("nhap"))).toBe(false);
  });

  it("bài viết: bỏ bài hẹn giờ tương lai, không có ?trang", async () => {
    const { postEntries } = await load();
    const paths = (await postEntries()).map((e) => e.path);
    expect(paths).toHaveLength(3);
    expect(paths.every((p) => p.startsWith("/bai-viet/") && !p.includes("?"))).toBe(true);
  });

  it("bật en: dự án có bản dịch → alternates vi + en; trang tĩnh en chỉ khi có document en", async () => {
    const { projectEntries, pageEntries } = await load("vi,en");
    const p1 = (await projectEntries()).find((e) => e.path === "/du-an/du-an-mau-1");
    expect(p1?.alternates).toEqual({ vi: "/du-an/du-an-mau-1", en: "/en/projects/du-an-mau-1" });
    const pages = (await pageEntries()).map((e) => e.path);
    expect(pages).toContain("/en");
    expect(pages).not.toContain("/en/about");
    expect(pages).toEqual(expect.arrayContaining(["/", "/gioi-thieu", "/du-an", "/dao-tao-doi-ngu", "/bai-viet", "/lien-he", "/chinh-sach-bao-mat"]));
  });
});

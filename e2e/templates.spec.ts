import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/** Template trang trên bản build local đọc seed thật (P4, T5.1, T5.2, T5.5). */
const STATIC_PAGES = ["/", "/gioi-thieu", "/du-an", "/du-an/ha-long-xanh", "/du-an/lang-van", "/dao-tao-doi-ngu", "/bai-viet", "/lien-he", "/chinh-sach-bao-mat"];

/** Trang mà kế hoạch yêu cầu CTA Zalo trong nội dung (T4.2, T4.9, T4.11, T4.15). */
const CONTENT_CTA = ["/", "/gioi-thieu", "/du-an/ha-long-xanh", "/du-an/lang-van", "/lien-he"];

async function jsonLdTypes(page: Page): Promise<string[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(blocks).toHaveLength(1);
  const data = JSON.parse(blocks[0]!) as { "@graph": { "@type": string }[] };
  return data["@graph"].map((n) => n["@type"]);
}

test.describe("mọi trang công khai", () => {
  for (const path of STATIC_PAGES) {
    test(`${path}: 200, một H1, canonical tuyệt đối, một @graph JSON-LD, có Zalo, 0 form / input`, async ({ page, baseURL }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${baseURL}${path === "/" ? "" : path}`);
      expect((await jsonLdTypes(page)).length).toBeGreaterThan(0);
      // Zalo trong 1 lần bấm ở mọi trang (header / thanh mobile — REQ-07); trang có CTA nội dung thì nằm trong main
      await expect(page.locator('a[data-cta="zalo"]').first()).toHaveAttribute("href", /^https:\/\/zalo\.me\/\d+$/);
      if (CONTENT_CTA.includes(path)) await expect(page.locator('main a[data-cta="zalo"]').first()).toBeAttached();
      await expect(page.locator("form, input, textarea")).toHaveCount(0);
      await expect(page.locator(`footer a[href="/chinh-sach-bao-mat"]`)).toHaveCount(1);
    });
  }
});

test("trang chủ: thứ tự khối cố định, H1 = tên, tagline là đoạn văn, ảnh hero eager + fetchpriority high", async ({ page }) => {
  await page.goto("/");
  const order = await page.locator("main [data-section]").evaluateAll((els) => els.map((e) => e.getAttribute("data-section")));
  const expected = ["hero", "story", "whyMe", "projects", "trust", "knowledge", "services", "connect"].filter((s) => order.includes(s));
  expect(order).toEqual(expected);
  expect(order[0]).toBe("hero");
  expect(order.at(-1)).toBe("connect");
  await expect(page.locator("h1")).toHaveText("Hứa Thị Tuyết");
  await expect(page.locator('[data-section="hero"] p', { hasText: "THẤU HIỂU THỊ TRƯỜNG" })).toHaveCount(1);
  if (process.env.CONTENT_MODE === "release") {
    // Seed thật: chân dung chưa xác nhận quyền dùng → release bỏ cả cột ảnh, không khung trống; CTA Zalo vẫn ở hero (T6.6)
    await expect(page.locator('[data-section="hero"] [data-portrait="none"]')).toHaveCount(1);
    await expect(page.locator('[data-section="hero"] img, [data-section="hero"] [data-pending]')).toHaveCount(0);
    await expect(page.locator('[data-section="hero"] a[href^="https://zalo.me/"]')).not.toHaveCount(0);
  } else {
    const hero = page.locator('[data-section="hero"] img').first();
    await expect(hero).toHaveAttribute("loading", "eager");
    await expect(hero).toHaveAttribute("fetchpriority", "high");
  }
  // Dự án chỉ ở khối projects (REQ-01), liên kết tới trang chi tiết
  await expect(page.locator('[data-section="projects"] a[href="/du-an/ha-long-xanh"]')).toHaveCount(1);
  await expect(page.locator('main a[href^="/du-an/"]:not([data-section="projects"] a)')).toHaveCount(0);
  expect(await jsonLdTypes(page)).toEqual(expect.arrayContaining(["WebSite", "Person"]));
});

test("chi tiết dự án Hạ Long Xanh: «Một tài sản – Ba giá trị», breadcrumb, Place không Offer", async ({ page }) => {
  await page.goto("/du-an/ha-long-xanh");
  await expect(page.locator("h1")).toHaveText("Hạ Long Xanh");
  await expect(page.locator('[data-section="valueProposition"] h2')).toHaveText("MỘT TÀI SẢN – BA GIÁ TRỊ");
  await expect(page.locator('[data-section="valueProposition"] li')).toHaveCount(3);
  await expect(page.getByText("Vừa ở. Vừa khai thác. Vừa tích lũy giá trị.").first()).toBeVisible();
  await expect(page.locator('nav[aria-label="Đường dẫn"] a[href="/du-an"]')).toHaveCount(1);
  const types = await jsonLdTypes(page);
  expect(types).toEqual(expect.arrayContaining(["WebPage", "Place", "BreadcrumbList"]));
  expect(await page.locator('script[type="application/ld+json"]').textContent()).not.toMatch(/Offer|price|Trường Phát/);
});

test("Làng Vân chưa có thông điệp → khối giá trị ẩn (REQ-15)", async ({ page }) => {
  await page.goto("/du-an/lang-van");
  await expect(page.locator('[data-section="valueProposition"]')).toHaveCount(0);
});

test("Giới thiệu: ProfilePage, «Thông tin nhanh» dưới H1, định vị 60 / 40", async ({ page }) => {
  await page.goto("/gioi-thieu");
  expect(await jsonLdTypes(page)).toEqual(expect.arrayContaining(["ProfilePage", "Person", "BreadcrumbList"]));
  await expect(page.locator('[data-block="quick-facts"]')).toContainText("Hạ Long – Quảng Ninh");
  await expect(page.locator('[data-section="positioning"]')).toContainText("60%");
});

test("404: slug dự án / bài không có, ?trang sai → HTTP 404; ?trang sai hiện giao diện 404 có header / footer, nút Zalo", async ({ page, request }) => {
  for (const url of ["/du-an/khong-ton-tai", "/bai-viet/khong-ton-tai", "/bai-viet?trang=2", "/bai-viet?trang=abc"]) {
    expect((await request.get(url)).status(), url).toBe(404);
  }
  // Next 16 + hai root layout: HTML server của notFound() trong trang là khung lỗi, giao diện 404 hiện sau hydrate
  // (chỉ còn ở ?trang sai — ghi ở docs/standards/00-du-an.md, mục Lệch chuẩn).
  const res = await page.goto("/bai-viet?trang=99");
  expect(res?.status()).toBe(404);
  await expect(page.locator("#nf-title")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
  await expect(page.locator('main a[data-cta="zalo"]')).toHaveCount(1);
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
});

test("sitemap tách loại: dự án có URL tuyệt đối, không có ?trang", async ({ request, baseURL }) => {
  const index = await (await request.get("/sitemap.xml")).text();
  for (const n of ["pages", "projects", "posts"]) expect(index).toContain(`${baseURL}/sitemaps/${n}.xml`);
  const projects = await (await request.get("/sitemaps/projects.xml")).text();
  expect(projects).toContain(`<loc>${baseURL}/du-an/ha-long-xanh</loc>`);
  const pages = await (await request.get("/sitemaps/pages.xml")).text();
  expect(pages).toContain(`<loc>${baseURL}/gioi-thieu</loc>`);
  expect(pages).not.toContain("trang=");
});

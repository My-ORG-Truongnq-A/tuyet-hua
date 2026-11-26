import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/**
 * Tracking trên bản build local (T5.6, 10-tracking.md). Bản này không có VERCEL_ENV=production / ID
 * → 0 script đo lường; lớp dataLayer first-party vẫn chạy nên kiểm được sự kiện click + UTM first-touch
 * mà không gửi gì ra ngoài (guardNetwork chặn script ngoài origin).
 */

type DlEvent = Record<string, unknown>;

/** Chặn điều hướng thật của zalo.me / tel: / mailto: (listener bubble ở document chạy SAU listener capture đo click). */
async function stubContactNavigation(page: Page) {
  await page.addInitScript(() => {
    document.addEventListener("click", (e) => {
      const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (a && /^(tel:|mailto:|https:\/\/zalo\.me)/.test(a.getAttribute("href") ?? "")) e.preventDefault();
    });
  });
}

async function ready(page: Page) {
  await page.waitForFunction(() => Array.isArray((window as Window & { dataLayer?: unknown[] }).dataLayer));
}

const contactEvents = (page: Page) =>
  page.evaluate(() =>
    ((window as Window & { dataLayer?: DlEvent[] }).dataLayer ?? []).filter(
      (e): e is DlEvent => typeof e === "object" && e !== null && typeof (e as DlEvent).event === "string" && String((e as DlEvent).event).startsWith("click_"),
    ),
  );

test.describe("không ID / không production → không nhúng tracking", () => {
  for (const path of ["/", "/du-an/ha-long-xanh", "/lien-he", "/khong-ton-tai"]) {
    test(`${path}: 0 script Google, CSP không mở host Google, không meta xác minh`, async ({ page }) => {
      const res = await page.goto(path);
      const html = await res!.text();
      expect(html).not.toMatch(/googletagmanager|google-analytics|gtag\/js|GTM-/);
      await expect(page.locator("#th-tag")).toHaveCount(0);
      await expect(page.locator('meta[name="google-site-verification"]')).toHaveCount(0);
      expect(res!.headers()["content-security-policy"]).not.toMatch(/google/);
    });
  }
});

test.describe("dataLayer cho nút liên hệ (TR-03)", () => {
  test.beforeEach(async ({ page }) => stubContactNavigation(page));

  test("bấm Zalo → đúng một click_zalo, link_location theo vùng, không PII", async ({ page }, info) => {
    await page.goto("/");
    await ready(page);
    const mobile = info.project.name === "mobile";
    const zalo = page.locator(mobile ? '[data-track-area="mobile_bar"] a[data-cta="zalo"]' : 'header a[data-cta="zalo"]:visible').first();
    await zalo.click();
    const events = await contactEvents(page);
    expect(events).toEqual([{ event: "click_zalo", link_location: mobile ? "mobile_bar" : "header", page_path: "/" }]);
    expect(JSON.stringify(events)).not.toMatch(/\d{9,}|zalo\.me|tel:/);
  });

  test("bấm số điện thoại ở footer → click_phone; trong khối nội dung → tên khối", async ({ page }) => {
    await page.goto("/lien-he");
    await ready(page);
    await page.locator('footer a[href^="tel:"]').first().dispatchEvent("click");
    await page.locator('main a[href^="tel:"]').first().dispatchEvent("click");
    const events = await contactEvents(page);
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({ event: "click_phone", link_location: "footer", page_path: "/lien-he" });
    expect(events[1]?.event).toBe("click_phone");
    expect(events[1]?.link_location).not.toBe("footer");
  });

  test("liên kết nội bộ không đẩy sự kiện liên hệ", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    await page.locator('footer a[href="/chinh-sach-bao-mat"]').dispatchEvent("click");
    await page.waitForURL("**/chinh-sach-bao-mat");
    expect(await contactEvents(page)).toEqual([]);
  });
});

test("UTM first-touch: lưu bộ UTM đầu tiên, lần sau không ghi đè, gắn vào sự kiện click", async ({ page }) => {
  await stubContactNavigation(page);
  await page.goto("/?utm_source=facebook&utm_medium=social&utm_campaign=ha-long-xanh");
  await ready(page);
  await page.goto("/lien-he?utm_source=google&utm_medium=cpc");
  await ready(page);

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("th_first_touch") ?? "null") as Record<string, unknown> | null);
  expect(stored).toMatchObject({ utm_source: "facebook", utm_medium: "social", utm_campaign: "ha-long-xanh", landing_page: "/" });
  expect(stored).not.toHaveProperty("gclid");

  await page.locator('footer a[href^="tel:"]').first().dispatchEvent("click");
  expect(await contactEvents(page)).toEqual([
    { event: "click_phone", link_location: "footer", page_path: "/lien-he", utm_source: "facebook", utm_medium: "social", utm_campaign: "ha-long-xanh" },
  ]);
});

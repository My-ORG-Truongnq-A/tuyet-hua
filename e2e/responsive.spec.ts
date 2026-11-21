import { expect, test } from "./fixtures";

/**
 * T6.3 / REQ-22: không tràn ngang ở 320 / 360 / 390 / 768 / 1440 cho mọi template (vi + en), kể cả 404.
 * Chạy một lần ở project desktop (tự đặt viewport) — project mobile bỏ qua để không lặp.
 */
const PAGES = [
  "/",
  "/gioi-thieu",
  "/du-an",
  "/du-an/ha-long-xanh",
  "/du-an/lang-van",
  "/dao-tao-doi-ngu",
  "/bai-viet",
  "/lien-he",
  "/chinh-sach-bao-mat",
  "/khong-co-trang-nay",
  "/en",
  "/en/projects",
  "/en/projects/ha-long-xanh",
  "/en/training-and-team",
  "/en/contact",
];
const WIDTHS = [320, 360, 390, 768, 1440];

test.describe("không tràn ngang", () => {
  test.skip(({ isMobile }) => isMobile, "chạy một lần ở desktop");
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.goto(path);
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${path} @ ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }
});

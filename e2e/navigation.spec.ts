import { expect, test } from "./fixtures";

/** Header / menu mobile / footer (T3.1–T3.3). */
test("menu từ CMS: trang hiện tại có aria-current, tên ở header không phải H1", async ({ page, isMobile }) => {
  test.skip(isMobile, "menu chữ chỉ hiện từ xl");
  await page.goto("/gioi-thieu");
  const nav = page.locator('header nav[aria-label="Menu chính"]').first();
  await expect(nav.locator('a[aria-current="page"]')).toHaveAttribute("href", "/gioi-thieu");
  await expect(nav.locator('a[href="/"]')).not.toHaveAttribute("aria-current", "page");
  await expect(page.locator("header h1")).toHaveCount(0);
});

test("menu mobile toàn màn hình: mở bằng nút, Esc đóng, focus về nút mở", async ({ page, isMobile }) => {
  test.skip(!isMobile, "chỉ mobile");
  await page.goto("/");
  const open = page.getByRole("button", { name: "Mở menu" });
  await open.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('a[href="/du-an"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(open).toBeFocused();
});

test("mobile: thanh Zalo + Gọi cố định, footer có padding đáy để không bị che", async ({ page, isMobile }) => {
  test.skip(!isMobile, "chỉ mobile");
  await page.goto("/lien-he");
  const bar = page.locator('div.fixed a[data-cta="zalo"]');
  await expect(bar).toBeInViewport();
  await expect(page.locator('div.fixed a[data-cta="call"]')).toHaveAttribute("href", /^tel:0\d+$/);
});

test("footer: năm hiện tại, liên hệ từ siteSettings, link chính sách", async ({ page }) => {
  await page.goto("/du-an");
  const footer = page.locator("footer");
  await expect(footer).toContainText(`© ${new Date().getFullYear()}`);
  await expect(footer.locator('a[href^="tel:"]')).toHaveCount(1);
  await expect(footer.locator('a[href="/chinh-sach-bao-mat"]')).toHaveCount(1);
});

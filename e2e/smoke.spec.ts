import { expect, test } from "./fixtures";

test("trang chủ: 200, html lang=vi, một H1 = tên, CTA Zalo trong màn đầu, font tự host", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (r) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) external.push(r.url());
  });
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText(/\S/);
  const zalo = page.locator('a[data-cta="zalo"]:visible').first();
  await expect(zalo).toHaveAttribute("href", /^https:\/\/zalo\.me\/\d+$/);
  await expect(zalo).toBeInViewport();
  expect(external).toEqual([]);
});

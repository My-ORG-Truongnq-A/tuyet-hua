import { expect, test } from "./fixtures";

test("trang chủ trả 200 và có html lang=vi", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(page.locator("h1")).toHaveCount(1);
});

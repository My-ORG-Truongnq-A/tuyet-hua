import { expect, test } from "./fixtures";

/** Lớp dữ liệu trên bản build local đọc seed (KT-01, KT-02, BP-05). */
test.describe("lớp dữ liệu (seed)", () => {
  test("ảnh seed phục vụ tĩnh; tệp ngoài assets.json → 404", async ({ request }) => {
    const ok = await request.get("/seed-assets/portrait-navy.jpg");
    expect(ok.status()).toBe(200);
    expect(ok.headers()["content-type"]).toBe("image/jpeg");
    expect((await ok.body()).length).toBeGreaterThan(1000);
    expect((await request.get("/seed-assets/khong-co.jpg")).status()).toBe(404);
  });

  test("webhook revalidate: chưa cấu hình secret → 500, không làm mới gì", async ({ request }) => {
    const res = await request.post("/api/revalidate", { data: { _id: "siteSettings", _type: "siteSettings" } });
    expect(res.status()).toBe(500);
  });

  test("Studio chưa bật CMS khi không có project Sanity", async ({ page }) => {
    await page.goto("/studio");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Chưa bật CMS");
  });
});

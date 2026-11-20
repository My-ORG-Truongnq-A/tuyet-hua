import { expect, test } from "@playwright/test";

/** Kiểm bằng HTTP trên bản build production local (seed, ALLOW_INDEXING=0). */
test.describe("indexing guard (SEO-01) + header bảo mật (BM-01)", () => {
  test("trang công khai: noindex hai lớp + đủ header bảo mật, không X-Powered-By", async ({ request }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);
    const h = res.headers();
    expect(h["x-robots-tag"]).toContain("noindex");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["x-frame-options"]).toBe("SAMEORIGIN");
    expect(h["permissions-policy"]).toContain("camera=()");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'self'");
    expect(h["x-powered-by"]).toBeUndefined();
    const html = await res.text();
    expect(html).toMatch(/<meta name="robots" content="noindex, nofollow"/);
    expect(html).toContain('<link rel="canonical"');
    expect(html).toContain("application/ld+json");
  });

  test("robots.txt chặn toàn bộ khi chưa cho index", async ({ request }) => {
    const txt = await (await request.get("/robots.txt")).text();
    expect(txt).toMatch(/User-Agent: \*\s+Disallow: \/\s/);
    expect(txt).toContain("Disallow: /studio");
  });

  test("sitemap / llms.txt có X-Robots-Tag noindex và URL tuyệt đối", async ({ request, baseURL }) => {
    for (const path of ["/sitemap.xml", "/sitemaps/pages.xml", "/llms.txt"]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      expect(res.headers()["x-robots-tag"], path).toContain("noindex");
    }
    expect(await (await request.get("/sitemaps/pages.xml")).text()).toContain(`<loc>${baseURL}</loc>`);
  });

  test("URL không tồn tại → 404 có HTML đầy đủ (KT-06); /en/* 404 khi tiếng Anh tắt", async ({ request }) => {
    // Slug dự án / bài ngoài danh sách build (dynamicParams = false) cũng đi qua global-not-found.
    for (const path of ["/khong-ton-tai", "/du-an/khong-co", "/bai-viet/khong-co", "/en", "/en/about"]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(404);
      const html = await res.text();
      expect(html, path).toContain('id="nf-title"');
      expect(html, path).toContain("<footer");
    }
  });

  test("URL có / cuối → 308 về bản không / (một bước)", async ({ request }) => {
    const res = await request.get("/gioi-thieu/", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toBe("/gioi-thieu");
  });

  test("/studio: báo chưa bật CMS, noindex", async ({ request }) => {
    const res = await request.get("/studio");
    expect(res.status()).toBe(200);
    expect(res.headers()["x-robots-tag"]).toContain("noindex");
    expect(await res.text()).toContain("Chưa bật CMS");
  });
});

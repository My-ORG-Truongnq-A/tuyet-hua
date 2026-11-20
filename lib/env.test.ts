import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("không đặt biến nào → giá trị an toàn: noindex, seed, chỉ vi, preview, localhost", () => {
    const env = parseEnv({});
    expect(env.allowIndexing).toBe(false);
    expect(env.sanitySource).toBe("seed");
    expect(env.languages).toEqual(["vi"]);
    expect(env.contentMode).toBe("preview");
    expect(env.leadsDryRun).toBe(true);
    expect(env.siteUrl).toBe("http://localhost:3000");
  });

  it("ALLOW_INDEXING chỉ bật khi đúng chuỗi «1»", () => {
    expect(parseEnv({ ALLOW_INDEXING: "1" }).allowIndexing).toBe(true);
    for (const v of ["true", "yes", "0", "", " 1"]) expect(parseEnv({ ALLOW_INDEXING: v }).allowIndexing).toBe(false);
  });

  it("NEXT_PUBLIC_SITE_URL bỏ / cuối và path", () => {
    expect(parseEnv({ NEXT_PUBLIC_SITE_URL: "https://example.vn/" }).siteUrl).toBe("https://example.vn");
    expect(parseEnv({ NEXT_PUBLIC_SITE_URL: "https://www.example.vn/abc/" }).siteUrl).toBe("https://www.example.vn");
  });

  it("NEXT_PUBLIC_SITE_URL sai định dạng → lỗi", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_SITE_URL: "example.vn" })).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("production deploy (VERCEL_ENV=production) thiếu NEXT_PUBLIC_SITE_URL → lỗi, không fallback (KT-11)", () => {
    expect(() => parseEnv({ VERCEL_ENV: "production" })).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("thiếu NEXT_PUBLIC_SITE_URL ở bản local → localhost theo PORT", () => {
    expect(parseEnv({ PORT: "3210" }).siteUrl).toBe("http://localhost:3210");
  });

  it("SANITY_SOURCE=sanity mà thiếu NEXT_PUBLIC_SANITY_PROJECT_ID → lỗi rõ ràng", () => {
    expect(() => parseEnv({ SANITY_SOURCE: "sanity" })).toThrow(/NEXT_PUBLIC_SANITY_PROJECT_ID/);
  });

  it("chưa đặt SANITY_SOURCE: có project id → sanity, không có → seed", () => {
    expect(parseEnv({ NEXT_PUBLIC_SANITY_PROJECT_ID: "abc123" }).sanitySource).toBe("sanity");
    expect(parseEnv({ SANITY_SOURCE: "seed", NEXT_PUBLIC_SANITY_PROJECT_ID: "abc123" }).sanitySource).toBe("seed");
  });

  it("Sanity: dataset mặc định production, apiVersion có mặc định", () => {
    const env = parseEnv({ NEXT_PUBLIC_SANITY_PROJECT_ID: "abc123" });
    expect(env.sanity.projectId).toBe("abc123");
    expect(env.sanity.dataset).toBe("production");
    expect(env.sanity.apiVersion).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("SANITY_SOURCE lạ → lỗi", () => {
    expect(() => parseEnv({ SANITY_SOURCE: "cms" })).toThrow(/SANITY_SOURCE/);
  });

  it("SITE_LANGUAGES luôn có vi, chỉ nhận vi / en", () => {
    expect(parseEnv({ SITE_LANGUAGES: "vi,en" }).languages).toEqual(["vi", "en"]);
    expect(parseEnv({ SITE_LANGUAGES: "en, vi" }).languages).toEqual(["vi", "en"]);
    expect(parseEnv({ SITE_LANGUAGES: "en" }).languages).toEqual(["vi", "en"]);
    expect(() => parseEnv({ SITE_LANGUAGES: "vi,fr" })).toThrow(/SITE_LANGUAGES/);
  });

  it("CONTENT_MODE chỉ preview | release", () => {
    expect(parseEnv({ CONTENT_MODE: "release" }).contentMode).toBe("release");
    expect(() => parseEnv({ CONTENT_MODE: "live" })).toThrow(/CONTENT_MODE/);
  });

  it("isProductionDeploy: ưu tiên VERCEL_ENV, không có thì NODE_ENV", () => {
    expect(parseEnv({ VERCEL_ENV: "preview", NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://a.vn" }).isProductionDeploy).toBe(false);
    expect(parseEnv({ VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://a.vn" }).isProductionDeploy).toBe(true);
    expect(parseEnv({ NODE_ENV: "production" }).isProductionDeploy).toBe(true);
    expect(parseEnv({ NODE_ENV: "development" }).isProductionDeploy).toBe(false);
  });

  it("id tracking trống → undefined (không nhúng script)", () => {
    const env = parseEnv({ NEXT_PUBLIC_GTM_ID: "", NEXT_PUBLIC_GA_ID: "  " });
    expect(env.tracking.gtmId).toBeUndefined();
    expect(env.tracking.gaId).toBeUndefined();
  });

  it("LEADS_DRY_RUN chỉ tắt khi đúng «0»", () => {
    expect(parseEnv({ LEADS_DRY_RUN: "0" }).leadsDryRun).toBe(false);
    expect(parseEnv({ LEADS_DRY_RUN: "false" }).leadsDryRun).toBe(true);
  });
});

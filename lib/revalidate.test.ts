import { afterEach, describe, expect, it, vi } from "vitest";
import { documentTypes } from "../sanity/schemaTypes";
import { CONTENT_TYPES, planRevalidation } from "./revalidate";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn() }));

describe("planRevalidation (KT-02)", () => {
  it("CONTENT_TYPES khớp đúng các type document trong schema", () => {
    expect([...CONTENT_TYPES].sort()).toEqual(documentTypes.map((t) => t.name).sort());
  });

  it("bỏ qua bản nháp, asset, lead, loại lạ", () => {
    expect(planRevalidation({ _id: "drafts.project-a-vi", _type: "project" })).toMatchObject({ action: "skip" });
    expect(planRevalidation({ _id: "image-x", _type: "sanity.imageAsset" })).toMatchObject({ action: "skip" });
    expect(planRevalidation({ _id: "lead-x", _type: "lead" })).toMatchObject({ action: "skip" });
    expect(planRevalidation({ _id: "x", _type: "khongco" })).toMatchObject({ action: "skip" });
    expect(planRevalidation(null)).toMatchObject({ action: "skip" });
  });

  it("dự án: tag theo loại + danh sách, chi tiết, trang chủ đúng ngôn ngữ", () => {
    expect(planRevalidation({ _id: "p", _type: "project", language: "vi", slug: "ha-long-xanh" })).toEqual({
      action: "revalidate",
      tags: ["project"],
      paths: ["/du-an", "/", "/du-an/ha-long-xanh"],
    });
    expect(planRevalidation({ _id: "p", _type: "post", language: "en", slug: "a" })).toEqual({
      action: "revalidate",
      tags: ["post"],
      paths: ["/en/articles", "/en", "/en/articles/a"],
    });
  });

  it("trang tĩnh: path của trang; siteSettings chỉ tag (không một tag chung cho cả site)", () => {
    expect(planRevalidation({ _id: "teamPage-vi", _type: "teamPage", language: "vi" })).toEqual({
      action: "revalidate",
      tags: ["teamPage"],
      paths: ["/dao-tao-doi-ngu"],
    });
    expect(planRevalidation({ _id: "siteSettings", _type: "siteSettings" })).toEqual({ action: "revalidate", tags: ["siteSettings"], paths: [] });
    expect(planRevalidation({ _id: "translation-metadata-x", _type: "translation.metadata" })).toMatchObject({ tags: ["translation.metadata"] });
  });
});

describe("route /api/revalidate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  const post = async (headers: Record<string, string> = {}) => {
    const { POST } = await import("../app/api/revalidate/route");
    const { NextRequest } = await import("next/server");
    return POST(new NextRequest("http://localhost/api/revalidate", { method: "POST", body: "{}", headers }));
  };

  it("thiếu secret → 500 (không bỏ qua kiểm chữ ký)", async () => {
    vi.stubEnv("SANITY_REVALIDATE_SECRET", "");
    vi.resetModules();
    expect((await post()).status).toBe(500);
  });

  it("có secret nhưng không chữ ký / chữ ký sai → 401", async () => {
    vi.stubEnv("SANITY_REVALIDATE_SECRET", "bi-mat-thu");
    vi.resetModules();
    expect((await post()).status).toBe(401);
    expect((await post({ "sanity-webhook-signature": "t=1,v1=sai" })).status).toBe(401);
  });
});

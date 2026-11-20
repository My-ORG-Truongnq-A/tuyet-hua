import { describe, expect, it } from "vitest";
import { indexingAllowed } from "./indexing";

const base = { isProductionDeploy: true, allowIndexing: true, canonicalHost: "tuyethua.vn" };

describe("indexingAllowed (SEO-01)", () => {
  it("production + cờ bật + đúng host → index", () => {
    expect(indexingAllowed(base)).toBe(true);
    expect(indexingAllowed({ ...base, host: "tuyethua.vn" })).toBe(true);
  });

  it("cờ tắt → không index", () => {
    expect(indexingAllowed({ ...base, allowIndexing: false })).toBe(false);
  });

  it("không phải production → không index", () => {
    expect(indexingAllowed({ ...base, isProductionDeploy: false })).toBe(false);
  });

  it("host khác host chuẩn (www, alias) → không index", () => {
    expect(indexingAllowed({ ...base, host: "www.tuyethua.vn" })).toBe(false);
    expect(indexingAllowed({ ...base, host: "tuyet-hua.vercel.app" })).toBe(false);
  });

  it("host chuẩn là *.vercel.app (domain tạm, Q-25) → luôn noindex kể cả khi cờ bật nhầm", () => {
    expect(indexingAllowed({ ...base, canonicalHost: "tuyet-hua.vercel.app" })).toBe(false);
    expect(indexingAllowed({ ...base, canonicalHost: "tuyet-hua.vercel.app", host: "tuyet-hua.vercel.app" })).toBe(false);
  });

  it("localhost / 127.0.0.1 → không index", () => {
    expect(indexingAllowed({ ...base, canonicalHost: "localhost:3000" })).toBe(false);
    expect(indexingAllowed({ ...base, canonicalHost: "127.0.0.1:3210" })).toBe(false);
  });

  it("host có cổng / chữ hoa vẫn so khớp đúng", () => {
    expect(indexingAllowed({ ...base, host: "TuyetHua.vn" })).toBe(true);
  });
});

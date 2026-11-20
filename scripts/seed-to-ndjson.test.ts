import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { toNdjson } from "./ndjson";

describe("seed:ndjson (T2.9)", () => {
  const docs = JSON.parse(readFileSync(join(__dirname, "../seed/sanity/documents.json"), "utf8")) as unknown[];

  it("số dòng NDJSON = số document; mỗi dòng parse lại đúng document", () => {
    const lines = toNdjson(docs).trimEnd().split("\n");
    expect(lines).toHaveLength(docs.length);
    expect(lines.map((l) => JSON.parse(l))).toEqual(docs);
  });

  it("giữ nguyên cú pháp ảnh image@file://", () => {
    expect(toNdjson(docs)).toContain('"_sanityAsset":"image@file://./seed/sanity/assets/portrait-navy.jpg"');
  });

  it("từ chối dữ liệu không phải mảng; mảng rỗng → chuỗi rỗng", () => {
    expect(() => toNdjson({})).toThrow(/mảng/);
    expect(toNdjson([])).toBe("");
  });
});

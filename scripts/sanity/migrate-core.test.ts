import { describe, expect, it } from "vitest";
import {
  chunk,
  docHash,
  emptyManifest,
  imageAssetIds,
  planDocs,
  planPatch,
  toWritable,
  worstCaseRequests,
  type Doc,
  type Remote,
} from "./migrate-core";

const doc = (over: Record<string, unknown> = {}): Doc => ({ _id: "homePage-vi", _type: "homePage", title: "A", ...over });
const remoteOf = (...docs: (Doc & { _rev?: string })[]): Remote => new Map(docs.map((d) => [d._id, d]));

describe("planDocs", () => {
  it("chưa có trên Sanity → create", () => {
    expect(planDocs([doc()], remoteOf(), emptyManifest(), false)[0]!.action).toBe("create");
  });
  it("nội dung giống (bỏ _rev, _updatedAt) → unchanged, không tốn lần ghi", () => {
    const r = remoteOf({ ...doc(), _rev: "r1", _updatedAt: "2026-01-01T00:00:00Z" });
    expect(planDocs([doc()], r, emptyManifest(), false)[0]!.action).toBe("unchanged");
  });
  it("rev khớp lần ghi trước → replace", () => {
    const m = emptyManifest();
    m.docs["homePage-vi"] = { rev: "r1", hash: "x" };
    const r = remoteOf({ ...doc({ title: "Sửa" }), _rev: "r1" });
    expect(planDocs([doc()], r, m, false)[0]!.action).toBe("replace");
  });
  it("sửa trong Studio (rev khác) → manual, không ghi đè; --force thì replace", () => {
    const m = emptyManifest();
    m.docs["homePage-vi"] = { rev: "r1", hash: "x" };
    const r = remoteOf({ ...doc({ title: "Studio" }), _rev: "r2" });
    expect(planDocs([doc()], r, m, false)[0]!.action).toBe("manual");
    expect(planDocs([doc()], r, m, true)[0]!.action).toBe("replace");
  });
  it("đã có nhưng không có manifest → manual (không biết có bị sửa hay không)", () => {
    const r = remoteOf({ ...doc({ title: "Khác" }), _rev: "r9" });
    expect(planDocs([doc()], r, emptyManifest(), false)[0]!.action).toBe("manual");
  });
});

describe("đếm request", () => {
  it("1 truy vấn + ảnh chưa cache + số lô", () => {
    expect(worstCaseRequests({ docCount: 12, uncachedAssets: 4 })).toBe(6);
    expect(worstCaseRequests({ docCount: 120, uncachedAssets: 0 })).toBe(4);
  });
  it("chunk chia lô", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe("tiện ích", () => {
  it("docHash bỏ trường hệ thống và không phụ thuộc thứ tự khoá", () => {
    expect(docHash({ _id: "a", _type: "t", x: 1, y: 2, _rev: "z" })).toBe(docHash({ y: 2, x: 1, _type: "t", _id: "a" }));
  });
  it("toWritable bỏ _createdAt / _updatedAt", () => {
    expect(toWritable({ ...doc(), _createdAt: "x", _updatedAt: "y" })).toEqual(doc());
  });
  it("imageAssetIds gom _ref ảnh lồng nhau", () => {
    const d = doc({ hero: { image: { _type: "image", asset: { _type: "reference", _ref: "image-abc-1x1-jpg" } } } });
    expect([...imageAssetIds([d])]).toEqual(["image-abc-1x1-jpg"]);
  });
});

describe("planPatch (khoá _rev)", () => {
  const patch = { name: "t", docIds: ["homePage-vi"], build: (c: Doc) => (c.title === "B" ? null : { set: { title: "B" } }) };
  it("tạo thao tác kèm rev hiện tại", () => {
    const r = remoteOf({ ...doc(), _rev: "r1" });
    expect(planPatch(patch, r).ops).toEqual([{ id: "homePage-vi", rev: "r1", set: { title: "B" } }]);
  });
  it("rev đã đổi so với kỳ vọng → xung đột, không có thao tác", () => {
    const r = remoteOf({ ...doc(), _rev: "r2" });
    const out = planPatch(patch, r, { "homePage-vi": "r1" });
    expect(out.ops).toEqual([]);
    expect(out.conflicts[0]).toContain("_rev đã đổi");
  });
  it("tài liệu đã đúng → không làm gì (idempotent)", () => {
    expect(planPatch(patch, remoteOf({ ...doc({ title: "B" }), _rev: "r1" })).ops).toEqual([]);
  });
});

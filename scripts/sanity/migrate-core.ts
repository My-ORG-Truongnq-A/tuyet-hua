/**
 * Phần thuần (không mạng, không tệp) của sanity:migrate — lập kế hoạch ghi, đếm request, so nội dung.
 * Luật: id tất định từ seed; không ghi đè tài liệu đã sửa ngoài import (trừ --force); ghi theo lô một transaction.
 */
import { createHash } from "node:crypto";

export type Doc = { _id: string; _type: string; [key: string]: unknown };
export type SeedAssetLite = { assetId: string; sha1hash: string; file: string };
export type Manifest = {
  version: 1;
  /** sha1 ảnh → assetId đã tải (cache, không tải lại). */
  assets: Record<string, string>;
  /** _id → { rev, hash } của lần ghi gần nhất do script này thực hiện. */
  docs: Record<string, { rev?: string; hash: string }>;
};
export type Remote = Map<string, Doc & { _rev?: string }>;

/** Số tài liệu mỗi transaction (gói Free: ít request, vẫn dưới giới hạn kích thước mutation). */
export const BATCH_SIZE = 50;

export const emptyManifest = (): Manifest => ({ version: 1, assets: {}, docs: {} });

const VOLATILE = new Set(["_rev", "_createdAt", "_updatedAt", "_originalId", "_system"]);

/** Bản dùng để so sánh / ghi: bỏ trường hệ thống do Sanity quản. */
export function normalizeDoc<T extends Doc>(doc: T): T {
  const strip = (v: unknown, top: boolean): unknown => {
    if (Array.isArray(v)) return v.map((x) => strip(x, false));
    if (!v || typeof v !== "object") return v;
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>)
        .filter(([k]) => !(top && VOLATILE.has(k)))
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([k, x]) => [k, strip(x, false)]),
    );
  };
  return strip(doc, true) as T;
}

export const docHash = (doc: Doc) => createHash("sha256").update(JSON.stringify(normalizeDoc(doc))).digest("hex");

export const imageAssetIds = (docs: Doc[]): Set<string> => {
  const ids = new Set<string>();
  const walk = (v: unknown) => {
    if (Array.isArray(v)) return v.forEach(walk);
    if (!v || typeof v !== "object") return;
    const o = v as Record<string, unknown>;
    const ref = (o.asset as { _ref?: unknown } | undefined)?._ref;
    if (o._type === "image" && typeof ref === "string") ids.add(ref);
    Object.values(o).forEach(walk);
  };
  docs.forEach(walk);
  return ids;
}

export type Action = "create" | "replace" | "unchanged" | "manual";
export type PlanItem = { id: string; type: string; action: Action; reason?: string };

export function planDocs(docs: Doc[], remote: Remote, manifest: Manifest, force: boolean): PlanItem[] {
  return docs.map((doc) => {
    const base = { id: doc._id, type: doc._type };
    const current = remote.get(doc._id);
    if (!current) return { ...base, action: "create" as const };
    if (docHash(current) === docHash(doc)) return { ...base, action: "unchanged" as const };
    const known = manifest.docs[doc._id];
    if (force) return { ...base, action: "replace" as const, reason: "--force" };
    if (known?.rev && known.rev === current._rev) return { ...base, action: "replace" as const };
    return {
      ...base,
      action: "manual" as const,
      reason: known ? "đã đổi ngoài import (rev khác lần ghi trước)" : "đã có trên Sanity, không có dấu vết import — xem tay",
    };
  });
}

/** Cận trên request của --apply: 1 truy vấn đọc + mỗi ảnh chưa cache 1 lần tải + số lô ghi (+ lô patch). */
export function worstCaseRequests(opts: { docCount: number; uncachedAssets: number; patchDocCount?: number }) {
  const writeBatches = Math.ceil((opts.docCount + (opts.patchDocCount ?? 0)) / BATCH_SIZE);
  return 1 + opts.uncachedAssets + writeBatches;
}

export const chunk = <T>(items: T[], size = BATCH_SIZE): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));

/** Tài liệu ghi lên Sanity: không có _createdAt / _updatedAt (Sanity tự đặt). */
export const toWritable = (doc: Doc): Doc => {
  const { _createdAt, _updatedAt, _rev, ...rest } = doc;
  void _createdAt; void _updatedAt; void _rev;
  return rest as Doc;
};

/** Patch theo vòng feedback: khoá _rev (ifRevisionID); tài liệu đã đổi → dừng, báo xung đột. */
export type PatchModule = {
  /** vd. "2026-11-25-r1" — tên tệp patch-<id>.ts */
  name: string;
  docIds: string[];
  /** Trả các trường cần set theo tài liệu hiện tại; trả null nếu tài liệu đã đúng (idempotent). */
  build: (current: Doc) => { set?: Record<string, unknown>; unset?: string[] } | null;
};

export function planPatch(patch: PatchModule, remote: Remote, expectedRevs: Record<string, string> = {}) {
  const conflicts: string[] = [];
  const ops: { id: string; rev: string; set?: Record<string, unknown>; unset?: string[] }[] = [];
  for (const id of patch.docIds) {
    const current = remote.get(id);
    if (!current?._rev) {
      conflicts.push(`${id}: không có trên Sanity`);
      continue;
    }
    if (expectedRevs[id] && expectedRevs[id] !== current._rev) {
      conflicts.push(`${id}: _rev đã đổi (${expectedRevs[id]} → ${current._rev})`);
      continue;
    }
    const change = patch.build(current);
    if (change) ops.push({ id, rev: current._rev, ...change });
  }
  return { ops, conflicts };
}

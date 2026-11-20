import type { ContentMode } from "../env";

/**
 * Lọc nội dung chưa xác nhận theo CONTENT_MODE (T2.7 — REQ-21, REQ-12, REQ-28; CM-07, CM-08):
 * - release: BỎ ảnh usageApproved ≠ true, số liệu / thành tích confirmed ≠ true, cảm nhận consentConfirmed ≠ true.
 * - preview: GIỮ nhưng gắn `pending: true` để UI hiện nhãn «chờ xác nhận».
 * Mảng mất hết phần tử → mảng rỗng, khối tự ẩn. Hàm thuần, áp dụng như nhau cho seed và Sanity.
 */
const FLAG_BY_TYPE: Record<string, "usageApproved" | "confirmed" | "consentConfirmed"> = {
  figure: "usageApproved",
  highlightStat: "confirmed",
  achievement: "confirmed",
  testimonial: "consentConfirmed",
};
const FLAGS = ["usageApproved", "confirmed", "consentConfirmed"] as const;

/** Cờ xác nhận của object (theo _type, hoặc theo khoá cờ khi projection bỏ _type). */
function gateFlag(obj: Record<string, unknown>): (typeof FLAGS)[number] | null {
  const byType = typeof obj._type === "string" ? FLAG_BY_TYPE[obj._type] : undefined;
  if (byType) return byType;
  return FLAGS.find((f) => f in obj) ?? null;
}

const REMOVED = Symbol("removed");

function walk(value: unknown, mode: ContentMode): unknown {
  if (Array.isArray(value)) {
    return value.map((v) => walk(v, mode)).filter((v) => v !== REMOVED);
  }
  if (!value || typeof value !== "object") return value;
  const obj = value as Record<string, unknown>;
  const flag = gateFlag(obj);
  if (flag && obj[flag] !== true) {
    if (mode === "release") return REMOVED;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const next = walk(v, mode);
    out[k] = next === REMOVED ? null : next;
  }
  if (flag && obj[flag] !== true) out.pending = true;
  return out;
}

export function applyContentGate<T>(value: T, mode: ContentMode): T {
  const out = walk(value, mode);
  return (out === REMOVED ? null : out) as T;
}

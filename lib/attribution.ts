import { UTM_KEYS, type UtmKey } from "./analytics";

/**
 * UTM first-touch (10-tracking.md, LD-05 phần không form). Ghi bộ utm_* ĐẦU TIÊN người dùng mang tới,
 * lưu localStorage của trình duyệt (không gửi lên server), hết hạn sau 30 ngày; trong hạn không ghi đè.
 * Không lưu click ID (gclid / fbclid…: GA4 / GTM tự đọc từ URL), không lưu query của trang đích,
 * referrer chỉ giữ host. Giá trị giống email / số điện thoại bị bỏ (TR-05: không PII).
 */

export const FIRST_TOUCH_KEY = "th_first_touch";
export const FIRST_TOUCH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type FirstTouch = Partial<Record<UtmKey, string>> & {
  landing_page: string;
  referrer_host?: string;
  ts: number;
};

const MAX_LEN = 100;

function cleanValue(raw: string | null): string | undefined {
  const v = raw?.trim();
  if (!v) return undefined;
  if (v.includes("@")) return undefined;
  if (/\d{9,}/.test(v.replace(/[\s.\-()+]/g, ""))) return undefined;
  return v.slice(0, MAX_LEN);
}

export function parseFirstTouch(input: { search: string; pathname: string; referrer: string; now: number }): FirstTouch | null {
  const params = new URLSearchParams(input.search);
  const utm: Partial<Record<UtmKey, string>> = {};
  for (const k of UTM_KEYS) {
    const v = cleanValue(params.get(k));
    if (v) utm[k] = v;
  }
  if (Object.keys(utm).length === 0) return null;

  const record: FirstTouch = { ...utm, landing_page: input.pathname || "/", ts: input.now };
  try {
    if (input.referrer) record.referrer_host = new URL(input.referrer).hostname;
  } catch {
    // referrer sai định dạng → bỏ qua
  }
  return record;
}

function readStored(stored: string | null): FirstTouch | null {
  if (!stored) return null;
  try {
    const v = JSON.parse(stored) as unknown;
    if (v && typeof v === "object" && typeof (v as FirstTouch).ts === "number") return v as FirstTouch;
  } catch {
    // hỏng → coi như chưa có
  }
  return null;
}

/** Quyết định bản first-touch hiệu lực và có cần ghi lại storage không (write + record null = xoá). */
export function resolveFirstTouch(
  stored: string | null,
  current: FirstTouch | null,
  now: number,
): { record: FirstTouch | null; write: boolean } {
  const prev = readStored(stored);
  if (prev && now - prev.ts <= FIRST_TOUCH_TTL_MS) return { record: prev, write: false };
  if (current) return { record: current, write: true };
  return { record: null, write: stored !== null };
}

export function utmOnly(record: FirstTouch | null): Partial<Record<UtmKey, string>> {
  const out: Partial<Record<UtmKey, string>> = {};
  if (!record) return out;
  for (const k of UTM_KEYS) {
    const v = record[k];
    if (typeof v === "string" && v) out[k] = v;
  }
  return out;
}

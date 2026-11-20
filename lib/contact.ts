/**
 * Liên hệ — một nguồn cho mọi nút Zalo / gọi (T1.8, YC-07). Số lấy từ siteSettings;
 * không có số mặc định trong code: thiếu số → null và nút tự ẩn.
 * Zalo là liên kết thường, không nhúng script.
 */

/** Chuẩn hoá về dạng nội địa 0xxxxxxxxx; sai → null. */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("84") && digits.length === 11) digits = `0${digits.slice(2)}`;
  return /^0\d{8,10}$/.test(digits) ? digits : null;
}

export function zaloHref(phone: string | null | undefined): string | null {
  const n = normalizePhone(phone);
  return n ? `https://zalo.me/${n}` : null;
}

export function telHref(phone: string | null | undefined): string | null {
  const n = normalizePhone(phone);
  return n ? `tel:${n}` : null;
}

/** +84… cho JSON-LD. */
export function e164(phone: string | null | undefined): string | null {
  const n = normalizePhone(phone);
  return n ? `+84${n.slice(1)}` : null;
}

export function formatPhone(phone: string | null | undefined): string | null {
  const n = normalizePhone(phone);
  if (!n) return null;
  return n.length === 10 ? `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7)}` : n;
}

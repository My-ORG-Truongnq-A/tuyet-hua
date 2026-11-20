/**
 * Cụm từ cấm trong nội dung (YC-13 / REQ-13): không cam kết lợi nhuận, không tự nhận «chuyên gia hàng đầu».
 * Dùng chung cho test nội dung seed / CMS, metadata, llms.txt.
 */
export const BANNED_PHRASES = [
  "chuyên gia hàng đầu",
  "cam kết lợi nhuận",
  "lợi nhuận cam kết",
  "lợi nhuận đảm bảo",
  "đảm bảo lợi nhuận",
  "bảo đảm lợi nhuận",
  "cam kết sinh lời",
  "chắc chắn sinh lời",
  "lãi suất cam kết",
] as const;

export function findBannedPhrases(text: string): string[] {
  const t = text.normalize("NFC").toLowerCase();
  return BANNED_PHRASES.filter((p) => t.includes(p));
}

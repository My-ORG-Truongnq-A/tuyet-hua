/**
 * Kiểm ảnh chân dung hero tách nền (T6.6, MI-06) — dùng bởi seed:validate. Chỉ CẢNH BÁO, không chặn build:
 * ảnh nền trắng sẽ lộ khối trắng trên hero emerald; ảnh hẹp hơn 1200 px mềm trên màn hình nét.
 */
import sharp from "sharp";

export const HERO_MIN_WIDTH = 1200;
/** Tỉ lệ điểm ảnh trong suốt tối thiểu để coi là đã tách nền (chân dung thường > 30 %). */
export const HERO_MIN_TRANSPARENT = 0.05;

export type ImageInfo = { width: number; height: number; hasAlpha: boolean; transparentRatio: number };

export async function inspectImage(buf: Buffer): Promise<ImageInfo> {
  const meta = await sharp(buf).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const hasAlpha = meta.hasAlpha === true;
  if (!hasAlpha) return { width, height, hasAlpha, transparentRatio: 0 };
  const alpha = await sharp(buf).resize({ width: Math.min(width, 240) }).ensureAlpha().extractChannel(3).raw().toBuffer();
  let clear = 0;
  for (const a of alpha) if (a < 16) clear++;
  return { width, height, hasAlpha, transparentRatio: alpha.length ? clear / alpha.length : 0 };
}

export function heroImageWarnings(info: ImageInfo): string[] {
  const out: string[] = [];
  if (!info.hasAlpha || info.transparentRatio < HERO_MIN_TRANSPARENT) {
    out.push("ảnh không có nền trong suốt — cần chân dung đã tách nền (PNG / WebP)");
  }
  if (info.width < HERO_MIN_WIDTH) out.push(`ảnh rộng ${info.width} px, nên ≥ ${HERO_MIN_WIDTH} px (MI-06)`);
  return out;
}

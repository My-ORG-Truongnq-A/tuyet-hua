/**
 * Chọn WebP nhỏ nhất đạt SSIM >= 0.98 (dùng bởi images:build). Tách khỏi build-images.ts để test được.
 * Ảnh có kênh trong suốt (chân dung tách nền — T6.6) giữ alpha ở mọi kích thước; SSIM đo trên ảnh đã lót nền xám
 * để vùng trong suốt không làm lệch phép đo.
 */
import sharp from "sharp";

export const SSIM_MIN = 0.98;

/** SSIM trung bình theo khối 8x8 trên ảnh xám (xấp xỉ, đủ để chọn ngưỡng chất lượng). */
export function ssim(a: Uint8Array, b: Uint8Array, w: number, h: number): number {
  const c1 = 6.5025, c2 = 58.5225;
  const A = (k: number): number => a[k] as number, B = (k: number): number => b[k] as number;
  let sum = 0, n = 0;
  for (let y = 0; y + 8 <= h; y += 4) for (let x = 0; x + 8 <= w; x += 4) {
    let ma = 0, mb = 0;
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const k = (y + j) * w + x + i; ma += A(k); mb += B(k); }
    ma /= 64; mb /= 64;
    let va = 0, vb = 0, cv = 0;
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const k = (y + j) * w + x + i; va += (A(k) - ma) ** 2; vb += (B(k) - mb) ** 2; cv += (A(k) - ma) * (B(k) - mb); }
    va /= 63; vb /= 63; cv /= 63;
    sum += ((2 * ma * mb + c1) * (2 * cv + c2)) / ((ma * ma + mb * mb + c1) * (va + vb + c2)); n++;
  }
  return n ? sum / n : 1;
}

const gray = async (input: Buffer) => {
  const { data, info } = await sharp(input).flatten({ background: "#808080" }).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
};

export async function bestWebp(original: Buffer, width: number) {
  const hasAlpha = (await sharp(original).metadata()).hasAlpha === true;
  const base = await sharp(original).resize({ width, withoutEnlargement: true }).toBuffer();
  const ref = await gray(base);
  const encode = (quality: number) => sharp(base).webp({ quality, alphaQuality: 100, effort: 6 }).toBuffer();
  let lo = 40, hi = 95, best: { q: number; buf: Buffer; s: number } | null = null;
  while (lo <= hi) {
    const q = (lo + hi) >> 1;
    const buf = await encode(q);
    const g = await gray(buf);
    const s = ssim(ref.data, g.data, ref.w, ref.h);
    if (s >= SSIM_MIN) { best = { q, buf, s }; hi = q - 1; } else lo = q + 1;
  }
  if (!best) best = { q: 95, buf: await encode(95), s: 0 };
  if (hasAlpha && !(await sharp(best.buf).metadata()).hasAlpha) throw new Error("[images] WebP mất kênh trong suốt của ảnh gốc");
  return { ...best, width: ref.w, height: ref.h };
}

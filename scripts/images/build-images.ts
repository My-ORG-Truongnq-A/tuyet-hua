/**
 * Tối ưu ảnh + ảnh OG + icon/manifest. Không gọi mạng; ảnh gốc trong seed/sanity/assets/ giữ nguyên byte.
 *   pnpm images:build          — sinh public/images, public/og, public/icons + seed/sanity/image-map.json
 *   pnpm images:build --dry    — chỉ in kế hoạch, không ghi
 * Chọn chất lượng WebP thấp nhất có SSIM >= 0.98 (so với bản gốc cùng kích thước, trên độ xám).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const dry = process.argv.includes("--dry");
const SRC = join(root, "seed/sanity/assets");
const WIDTHS = [480, 768, 1200, 1600];
const SSIM_MIN = 0.98;
const INK = "#123F35";
const GOLD = "#C2A061";
const IVORY = "#FAF7F0";

/** SSIM trung bình theo khối 8x8 trên ảnh xám (xấp xỉ, đủ để chọn ngưỡng chất lượng). */
function ssim(a: Uint8Array, b: Uint8Array, w: number, h: number): number {
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
  const { data, info } = await sharp(input).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
};

async function bestWebp(original: Buffer, width: number) {
  const base = await sharp(original).resize({ width, withoutEnlargement: true }).toBuffer();
  const ref = await gray(base);
  let lo = 40, hi = 95, best: { q: number; buf: Buffer; s: number } | null = null;
  while (lo <= hi) {
    const q = (lo + hi) >> 1;
    const buf = await sharp(base).webp({ quality: q, effort: 6 }).toBuffer();
    const g = await gray(buf);
    const s = ssim(ref.data, g.data, ref.w, ref.h);
    if (s >= SSIM_MIN) { best = { q, buf, s }; hi = q - 1; } else lo = q + 1;
  }
  if (!best) { const buf = await sharp(base).webp({ quality: 95 }).toBuffer(); best = { q: 95, buf, s: 0 }; }
  return { ...best, width: ref.w, height: ref.h };
}

const OG_PAGES: { slug: string; vi: string; en: string; photo: string }[] = [
  { slug: "default", vi: "Hứa Thị Tuyết", en: "Hứa Thị Tuyết", photo: "portrait-navy.jpg" },
  { slug: "home", vi: "Hứa Thị Tuyết — Tư vấn bất động sản", en: "Hứa Thị Tuyết — Real estate advisor", photo: "portrait-navy.jpg" },
  { slug: "about", vi: "Giới thiệu", en: "About", photo: "talk-sale-event.jpg" },
  { slug: "projects", vi: "Dự án", en: "Projects", photo: "team-office.jpg" },
  { slug: "team", vi: "Đào tạo đội ngũ", en: "Team training", photo: "team-office.jpg" },
  { slug: "articles", vi: "Bài viết", en: "Articles", photo: "event-cake.jpg" },
  { slug: "contact", vi: "Liên hệ", en: "Contact", photo: "portrait-navy.jpg" },
  { slug: "legal", vi: "Chính sách bảo mật", en: "Privacy policy", photo: "portrait-navy.jpg" },
];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

async function og(p: (typeof OG_PAGES)[number], lang: "vi" | "en") {
  const photo = await sharp(join(SRC, p.photo)).resize(480, 630, { fit: "cover", position: "attention" }).toBuffer();
  const title = esc(lang === "vi" ? p.vi : p.en);
  const svg = Buffer.from(`<svg width="720" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="720" height="630" fill="${INK}"/><rect x="56" y="64" width="64" height="4" fill="${GOLD}"/><text x="56" y="300" font-family="Georgia,serif" font-size="52" fill="${IVORY}" font-weight="700">${title}</text><text x="56" y="560" font-family="Arial,sans-serif" font-size="26" fill="${GOLD}">Hứa Thị Tuyết</text></svg>`);
  return sharp({ create: { width: 1200, height: 630, channels: 3, background: INK } })
    .composite([{ input: svg, left: 0, top: 0 }, { input: photo, left: 720, top: 0 }])
    .webp({ quality: 82 }).toBuffer();
}

async function main() {
  const map: Record<string, unknown> = {};
  const files = ["event-cake.jpg", "portrait-navy.jpg", "portrait-navy-cutout.png", "talk-sale-event.jpg", "team-office.jpg"];
  const out = (d: string) => { if (!dry) mkdirSync(join(root, d), { recursive: true }); return join(root, d); };
  for (const f of files) {
    const original = readFileSync(join(SRC, f));
    const meta = await sharp(original).metadata();
    const stem = f.replace(/\.\w+$/, "");
    const variants: unknown[] = [];
    for (const w of WIDTHS.filter((x) => x < (meta.width ?? 0)).concat([meta.width ?? 0])) {
      const r = await bestWebp(original, w);
      const name = `${stem}-${r.width}.webp`;
      if (!dry) writeFileSync(join(out("public/images"), name), r.buf);
      variants.push({ file: `/images/${name}`, width: r.width, height: r.height, quality: r.q, ssim: +r.s.toFixed(4), bytes: r.buf.length });
    }
    map[f] = { original: `seed/sanity/assets/${f}`, originalBytes: original.length, source: "client_photos", variants };
  }
  const ogMap: Record<string, string> = {};
  for (const lang of ["vi", "en"] as const) for (const p of OG_PAGES) {
    const name = `${p.slug}-${lang}.webp`;
    const buf = await og(p, lang);
    if (!dry) writeFileSync(join(out("public/og"), name), buf);
    ogMap[`${p.slug}:${lang}`] = `/og/${name}`;
  }
  // Icon: CHƯA có logo gốc của khách (xem brief) → ô màu thương hiệu trơn, không vẽ monogram. NEEDS_INPUT: logo gốc.
  const sq = (n: number) => sharp({ create: { width: n, height: n, channels: 3, background: INK } })
    .composite([{ input: Buffer.from(`<svg width="${n}" height="${n}" xmlns="http://www.w3.org/2000/svg"><rect x="${n * 0.3}" y="${n * 0.72}" width="${n * 0.4}" height="${n * 0.06}" fill="${GOLD}"/></svg>`) }]).png().toBuffer();
  for (const [n, name] of [[32, "favicon-32.png"], [180, "apple-touch-icon.png"], [192, "icon-192.png"], [512, "icon-512.png"]] as const)
    if (!dry) writeFileSync(join(out("public/icons"), name), await sq(n));
  const manifest = {
    name: "Hứa Thị Tuyết", short_name: "Tuyết Hứa", lang: "vi", start_url: "/", display: "browser",
    background_color: IVORY, theme_color: INK,
    icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
  if (!dry) {
    writeFileSync(join(root, "public/manifest.webmanifest"), `${JSON.stringify(manifest, null, 2)}\n`);
    writeFileSync(join(root, "seed/sanity/image-map.json"), `${JSON.stringify({ strategy: "client_photos", ssimMin: SSIM_MIN, images: map, og: ogMap, logo: "NEEDS_INPUT" }, null, 2)}\n`);
  }
  console.log(JSON.stringify({ dry, images: map, og: Object.keys(ogMap).length }, null, 1).slice(0, 3000));
}
main();

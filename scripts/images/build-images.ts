/**
 * Tối ưu ảnh + ảnh OG + icon/manifest. Không gọi mạng; ảnh gốc trong seed/sanity/assets/ giữ nguyên byte.
 *   pnpm images:build          — sinh public/images, public/og, public/icons + seed/sanity/image-map.json
 *   pnpm images:build --dry    — chỉ in kế hoạch, không ghi
 *   pnpm images:build --og     — chỉ sinh lại ảnh OG (public/og), giữ biến thể WebP đã có
 * Chọn chất lượng WebP thấp nhất có SSIM >= 0.98 (scripts/images/webp.ts); ảnh tách nền giữ kênh trong suốt (T6.6).
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp, { type OverlayOptions, type Sharp } from "sharp";
import { DERIVED_ASSETS } from "../../lib/content/seed-assets";
import { OG_CARD_SLUGS, OG_HEIGHT, OG_WIDTH, seedOgPath } from "../../lib/og";
import { bestWebp, SSIM_MIN } from "./webp";

const root = process.cwd();
const dry = process.argv.includes("--dry");
/** Chỉ sinh ảnh OG (thẻ + crop), giữ nguyên biến thể WebP đã có trong image-map.json. */
const ogOnly = process.argv.includes("--og");
const SRC = join(root, "seed/sanity/assets");
const WIDTHS = [480, 768, 1200, 1600];
const INK = "#123F35";
const GOLD = "#C2A061";
const IVORY = "#FAF7F0";

/**
 * Thẻ OG soạn sẵn cho trang tĩnh (SEO-14: JPEG 1200×630), slug khớp OG_CARD_SLUGS của lib/og.ts.
 * Chỉ ghép ảnh đã được phép dùng (ảnh tự do / minh hoạ): ảnh khách còn chờ xác nhận quyền dùng (MI-07, MI-14) nên
 * không đưa vào thẻ — tệp tĩnh không đi qua cổng nội dung. Khách xác nhận xong thì thêm `photo` cho thẻ tương ứng.
 */
const OG_PAGES: { slug: (typeof OG_CARD_SLUGS)[number]; vi: string; en: string; photo?: string }[] = [
  { slug: "home", vi: "Hứa Thị Tuyết — Tư vấn bất động sản", en: "Hứa Thị Tuyết — Real estate advisor" },
  { slug: "about", vi: "Giới thiệu", en: "About" },
  { slug: "projects", vi: "Dự án", en: "Projects", photo: "stock-ha-long-bay-above.jpg" },
  { slug: "team", vi: "Đào tạo & Đội ngũ", en: "Training & Team" },
  { slug: "articles", vi: "Bài viết", en: "Articles" },
  { slug: "contact", vi: "Liên hệ", en: "Contact" },
  { slug: "legal", vi: "Chính sách bảo mật", en: "Privacy policy" },
];

/** Nguồn ảnh theo tiền tố tên tệp: stock-* = ảnh tự do (Wikimedia, CC BY 4.0), illus-* = minh hoạ tự dựng, còn lại = ảnh khách. */
const sourceOf = (f: string) => (f.startsWith("stock-") ? "free_stock_cc_by_4" : f.startsWith("illus-") ? "illustration" : "client_photos");

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const jpeg = (img: Sharp) => img.flatten({ background: INK }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();

async function og(p: (typeof OG_PAGES)[number], lang: "vi" | "en") {
  if (p.photo && sourceOf(p.photo) === "client_photos") throw new Error(`[og] ${p.slug}: ảnh khách «${p.photo}» chưa xác nhận quyền dùng`);
  const textW = p.photo ? 720 : OG_WIDTH;
  const [main, sub] = (lang === "vi" ? p.vi : p.en).split(" — ").map(esc);
  const frame = p.photo ? "" : `<rect x="28" y="28" width="${OG_WIDTH - 56}" height="${OG_HEIGHT - 56}" fill="none" stroke="${GOLD}" stroke-opacity="0.45" stroke-width="2"/>`;
  const svg = Buffer.from(
    `<svg width="${textW}" height="${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg"><rect width="${textW}" height="${OG_HEIGHT}" fill="${INK}"/>${frame}` +
      `<rect x="72" y="84" width="64" height="4" fill="${GOLD}"/>` +
      `<text x="72" y="${sub ? 290 : 320}" font-family="Times New Roman,serif" font-size="64" fill="${IVORY}" font-weight="700">${main}</text>` +
      (sub ? `<text x="72" y="360" font-family="Times New Roman,serif" font-size="38" fill="${IVORY}" fill-opacity="0.85">${sub}</text>` : "") +
      `<text x="72" y="540" font-family="Arial,sans-serif" font-size="28" fill="${GOLD}">Hứa Thị Tuyết</text></svg>`,
  );
  const layers: OverlayOptions[] = [{ input: svg, left: 0, top: 0 }];
  if (p.photo) {
    const photo = await sharp(join(SRC, p.photo)).resize(OG_WIDTH - textW, OG_HEIGHT, { fit: "cover", position: "attention" }).toBuffer();
    layers.push({ input: photo, left: textW, top: 0 });
  }
  return jpeg(sharp({ create: { width: OG_WIDTH, height: OG_HEIGHT, channels: 3, background: INK } }).composite(layers));
}

/** Bản crop OG của ảnh seed (lib/og.ts → seedOgPath): dùng khi ảnh dự án / bài làm ảnh chia sẻ. */
const ogCrop = (original: Buffer) => jpeg(sharp(original).resize(OG_WIDTH, OG_HEIGHT, { fit: "cover", position: "attention" }));

async function main() {
  const mapFile = join(root, "seed/sanity/image-map.json");
  const prev = (ogOnly ? JSON.parse(readFileSync(mapFile, "utf8")).images : {}) as Record<string, { variants: unknown[] }>;
  const map: Record<string, unknown> = {};
  const files = readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  const out = (d: string) => { if (!dry) mkdirSync(join(root, d), { recursive: true }); return join(root, d); };
  // public/og chỉ chứa tệp sinh từ script này → xoá sạch để không còn ảnh cũ (đổi định dạng / bỏ ảnh seed).
  if (!dry) rmSync(join(root, "public/og"), { recursive: true, force: true });
  for (const f of files) {
    const original = readFileSync(join(SRC, f));
    const meta = await sharp(original).metadata();
    const stem = f.replace(/\.\w+$/, "");
    if (!dry) writeFileSync(join(out("public/og/img"), seedOgPath(f).split("/").pop()!), await ogCrop(original));
    const variants: unknown[] = ogOnly ? (prev[f]?.variants ?? []) : [];
    if (ogOnly && !prev[f]) throw new Error(`[images] ${f} chưa có biến thể WebP — chạy pnpm images:build (không --og)`);
    for (const w of ogOnly ? [] : WIDTHS.filter((x) => x < (meta.width ?? 0)).concat([meta.width ?? 0])) {
      const r = await bestWebp(original, w);
      const name = `${stem}-${r.width}.webp`;
      if (!dry) writeFileSync(join(out("public/images"), name), r.buf);
      variants.push({ file: `/images/${name}`, width: r.width, height: r.height, quality: r.q, ssim: +r.s.toFixed(4), bytes: r.buf.length });
    }
    const derivedFrom = DERIVED_ASSETS[f];
    map[f] = {
      original: `seed/sanity/assets/${f}`,
      originalBytes: original.length,
      source: sourceOf(f),
      ...(derivedFrom ? { derivedFrom: `seed/sanity/assets/${derivedFrom}`, hasAlpha: meta.hasAlpha === true } : {}),
      variants,
    };
  }
  const ogMap: Record<string, string> = {};
  const missing = OG_CARD_SLUGS.filter((s) => !OG_PAGES.some((p) => p.slug === s));
  if (missing.length) throw new Error(`[og] thiếu thẻ OG cho: ${missing.join(", ")}`);
  for (const lang of ["vi", "en"] as const) for (const p of OG_PAGES) {
    const name = `${p.slug}-${lang}.jpg`;
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
    writeFileSync(mapFile, `${JSON.stringify({ strategy: "client_photos + free_stock + illustration", ssimMin: SSIM_MIN, images: map, og: ogMap, logo: "NEEDS_INPUT" }, null, 2)}\n`);
  }
  console.log(JSON.stringify({ dry, images: map, og: Object.keys(ogMap).length }, null, 1).slice(0, 3000));
}
main();

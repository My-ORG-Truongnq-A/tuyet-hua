/**
 * Ảnh minh hoạ vector (KHÔNG phải ảnh thật) cho chỗ khách chưa có ảnh — hiện chỉ dự án Làng Vân.
 * Màu lấy từ styles/tokens.css (emerald / ngà / champagne). Không gọi mạng; ghi PNG vào seed/sanity/assets/.
 *   pnpm images:illustrations
 * Figure dùng ảnh này phải ghi rõ «Ảnh minh hoạ» ở caption / credit (không giả ảnh dự án).
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const W = 1600;
const H = 1000;

/** Làng Vân: núi xếp lớp, mây (Vân) trôi ngang, mặt nước, mặt trời champagne — phong cách hoạ tiết hero. */
const LANG_VAN = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b2c26"/><stop offset="0.55" stop-color="#1d5a4c"/><stop offset="1" stop-color="#3f7f6c"/>
    </linearGradient>
    <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#f6ecd2"/><stop offset="0.6" stop-color="#e3cf9f"/><stop offset="1" stop-color="#d4b97e" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2f6f5e"/><stop offset="1" stop-color="#0f3a32"/>
    </linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="1120" cy="330" r="230" fill="url(#sun)" opacity="0.9"/>
  <circle cx="1120" cy="330" r="96" fill="#f3e6c4"/>
  <path d="M0 560 L140 430 L260 500 L420 330 L560 470 L700 380 L860 520 L1000 410 L1160 520 L1320 400 L1480 500 L1600 440 L1600 700 L0 700Z" fill="#5d8f7f" opacity="0.55"/>
  <path d="M0 640 L180 470 L330 590 L520 420 L690 600 L880 470 L1060 620 L1240 500 L1420 630 L1600 520 L1600 760 L0 760Z" fill="#2f6655"/>
  <path d="M0 720 L220 560 L400 690 L610 540 L800 700 L1010 580 L1210 720 L1400 610 L1600 700 L1600 800 L0 800Z" fill="#164a3e"/>
  <g fill="#f2ede2" filter="url(#soft)">
    <ellipse cx="300" cy="560" rx="260" ry="34" opacity="0.55"/>
    <ellipse cx="820" cy="610" rx="320" ry="30" opacity="0.45"/>
    <ellipse cx="1380" cy="560" rx="240" ry="28" opacity="0.5"/>
  </g>
  <rect y="780" width="${W}" height="${H - 780}" fill="url(#water)"/>
  <g stroke="#e3cf9f" stroke-width="3" stroke-linecap="round" opacity="0.6">
    <path d="M980 830 H1260"/><path d="M1040 870 H1200"/><path d="M1080 905 H1160"/>
    <path d="M200 850 H420"/><path d="M600 930 H760"/>
  </g>
  <path d="M0 980 C 400 900, 1200 900, 1600 960" stroke="#d4b97e" stroke-width="4" fill="none" opacity="0.8"/>
</svg>`;

async function main() {
  const out = join(process.cwd(), "seed/sanity/assets/illus-lang-van.png");
  writeFileSync(out, await sharp(Buffer.from(LANG_VAN)).removeAlpha().png({ compressionLevel: 9 }).toBuffer());
  console.log(`[images:illustrations] ghi ${out}`);
}
main();

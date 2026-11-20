# 05 · Hiệu năng & Core Web Vitals (`HN`)

**Ngưỡng** (field, phân vị 75, đo riêng mobile và desktop): **LCP ≤ 2,5 s · INP ≤ 200 ms · CLS ≤ 0,1** ([web] web.dev; INP đã thay FID).

**Cổng chặn** (lab, Lighthouse mobile, trung vị 3 lượt, chế độ chặn tracking; mặc định chờ chốt ở Q-62):
- Performance ≥ 85; CLS ≤ 0,1; TBT ≤ 200 ms; Accessibility / Best Practices / SEO ≥ 95.
- LCP ≤ 2,5 s khi đo bằng devtools throttling hoặc mạng 4G thật. Chế độ simulated có sàn ~3,5 s với Next (`P1`), nên số simulated chỉ ghi lại, không dùng để chặn.

**Mục tiêu** (không chặn): Performance ≥ 90, LCP ≤ 2,0 s, CLS ≤ 0,05. Sau go-live theo dõi field CWV p75.

Số đo thật đã đạt ở các repo:
- `P8`: điểm hiệu năng mobile 76 → 96, JS trang chủ 528 → 238 KB.
- `P1`: LCP 4G thật 6,5 → 2,3 s, trang chủ 5,1 → 1,2 MB.
- `P2`: trang chủ 9,4 → 0,9 MB.
- `P3`: LCP 24 → 4 s.

<a id="hn-01"></a>
### HN-01 · Đo đúng cách trước khi kết luận — PHẢI
- Luôn đo cùng một bộ trang: trang chủ, 1 dịch vụ / sản phẩm, 1 bài viết, liên hệ.
- Đo trên **build production** (`next build && next start` hoặc URL production), không đo trên `dev`. Preview noindex làm điểm SEO tụt (69), nên không dùng điểm SEO của preview.
- Mỗi trang đo **3 lượt, lấy trung vị**. Ghi cả chế độ simulated lẫn devtools throttling, ghi điều kiện đo. Thêm 1 lượt đo trên mạng thật.
- Site có tracking thì đo **hai chế độ**: có tracking và chặn tracking.
- Thay đổi hiệu năng nào cũng ghi số trước / sau (vào commit hoặc `perf-report/`). Giữ dữ liệu thô `summary.json`.
- Lighthouse chạy bằng lệnh cố định có ghim phiên bản. PageSpeed Insights ẩn danh có quota 0.
- Field (CrUX / Search Console) là chuẩn; Lighthouse chỉ là lab. KHÔNG dùng điểm Lighthouse làm KPI duy nhất.
- **Nguồn:**
  - `P1 c654df7` → `55db131`: bật / tắt `inlineCss` 3 lần vì đổi cách đo.
  - `P1 7dbe9c0`.
  - `P2 2bd1610`: mobile 83 → 46 khi có tracking.
  - `P8` `perf-report/`.
  - `P3 0f7736d`.

<a id="hn-02"></a>
### HN-02 · Phần tử LCP hiển thị từ HTML đầu tiên — PHẢI
- Mỗi template xác định **đúng một** ứng viên LCP (ảnh hero hoặc H1).
- **Ảnh LCP:**
  - `preload` + `fetchPriority="high"` + `loading="eager"`;
  - Next 16: `priority` đã deprecated và chỉ còn nghĩa preload, nên phải tự thêm `fetchPriority`;
  - ảnh còn lại dùng `fetchPriority="low"`.
- KHÔNG đặt `opacity: 0`, `clipPath`, `yPercent`, `data-reveal`, `data-aos` hay `whileInView` lên phần tử LCP hoặc tổ tiên của nó.
  - Hiệu ứng vào cho hero chỉ là CSS thuần (ken-burns, fade ngắn không ẩn hoàn toàn).
  - framer-motion `whileInView` bake `opacity: 0` vào SSR; iOS Safari không bắn IntersectionObserver nên trang trắng.
- Ảnh dưới màn hình đầu: tải khi tới gần viewport (IntersectionObserver ~200 px) hoặc sau sự kiện `load` (`AfterLoad`). Giữ nguyên kích thước hộp để không gây CLS.
- Slide 2…n của carousel tải sau `load`.
- **Kiểm:** e2e lấy node LCP (`PerformanceObserver`) xác nhận hiển thị ngay, không lazy.
- **Nguồn:**
  - `P5 7e19ff1`: LCP trễ ~3 s vì JS wipe.
  - `P6 KT-12`.
  - `P2 P2`, `P7`, `2bd1610`.
  - `P1 9f80126`: render delay 2,8 s.
  - `P1 90d77fe`: LCP 5,1 → 2,8 s.
  - `P3 ee781ef`: trang trắng iOS.
  - `P8 8785ffb`.

<a id="hn-03"></a>
### HN-03 · Ảnh: loader thẳng CDN, `sizes` đúng khung thật — PHẢI
- Ảnh Sanity đi **thẳng CDN Sanity một lần** qua loader tuỳ biến (`images.loader: "custom"`), không qua `/_next/image`. Encode 3 lần sẽ làm ảnh mờ.
  - Tham số: `?w=min(width, masterWidth)&q=80–90&fit=max&auto=format`.
  - Lưu ý: CDN Sanity luôn encode lại; muốn giữ nguyên byte thì dùng URL file gốc.
- Ảnh local: `next/image` với `images.formats: ["image/avif", "image/webp"]`, `remotePatterns` chỉ gồm CDN thật đang dùng.
- **`sizes` bắt buộc** (prop required trong component `Photo` / `Img`), tính theo **khung thật kể cả phần crop của `object-fit: cover`**.
  - Không có `sizes="260vw"` hay `sizes="594px"` cho ảnh hiện 1400 px.
  - **Kiểm:** byte ảnh tải về ≥ min(khung × DPR, master).
- Hero dùng art direction: `<picture>` + `getImageProps`; điện thoại dọc tải bản crop giữa. Component dùng loader phải là client component.
- Khung ảnh có `width` / `height` hoặc `aspect-ratio`, nên 0 CLS. Logo khai đúng tỉ lệ thật.
- Ảnh nền trang trí: lossy, có bản `-sm` cho mobile, nạp trễ. Icon / logo lossless.
- Đổi nội dung ảnh thì **đổi tên file**: ảnh tối ưu bị cache 31 ngày, không purge được.
- **Nguồn:**
  - `P2 0c6922d`, `3b71b89`, `0650da5`, `10fdbae`: ảnh mờ, sửa 4 vòng.
  - `P2 c1fb1d4`: 148 → 81 KB.
  - `P7 1ac0c05`.
  - `P1 adb900d`: 470 → 62 KB.
  - `P3 0f7736d`: ảnh 3.956 → 50 KB.
  - `P5 7e19ff1` (logo).

<a id="hn-04"></a>
### HN-04 · Font tiếng Việt — PHẢI
- Self-host woff2 (`next/font/local` hoặc `next/font/google` với `subsets: ["latin", "vietnamese"]`), `font-display: swap`.
- **Chỉ nạp weight thực dùng**, tối đa 2 họ font.
- Preload tối đa 4 face (thường 2: chữ thân + tiêu đề của màn hình đầu); font khác `preload: false`. Preload 10–16 file là lỗi đã gặp.
- Subset đúng bộ ký tự dùng thật (`scripts/subset-fonts.py`). `next/font/google` có thể tách `ă đ ơ ư` sang `latin-ext` thành nhiều file.
- Dấu câu “ ” – … thiếu glyph thì thêm `@font-face` với `unicode-range` mượn glyph.
- **KHÔNG** `font-weight` > 700 với font hệ thống: Windows vẽ Arial Black không có glyph Ế / Ư / Ợ. Đặt `b, strong { font-weight: 700 }`.
- Font hệ thống là lựa chọn nhanh nhất, nhưng là quyết định thiết kế cần khách đồng ý.
- **Nguồn:**
  - `P1 92bd63c`: 15 file 166 KB → 5 file 112 KB.
  - `P1 bda2bf8`: font 114 KB kéo LCP 3 → 5 s.
  - `P1 eed254f`, `d8dd223`: lỗi Arial Black 2 lần.
  - `P7 2f95dfa`.
  - `P6 WEB-11`: 16 font preload.
  - `P2 c1fb1d4`.
  - `P3` `layout.tsx`.

<a id="hn-05"></a>
### HN-05 · Script bên thứ ba nạp trễ — PHẢI
- GTM / gtag / Meta Pixel / pixel OpenAI / chat widget / Clarity: **dựng hàng đợi ngay** (`dataLayer`, `fbq.queue`…), **nạp thư viện ở tương tác đầu** (`pointerdown`, `keydown`, `touchstart`, `scroll`; `once`, `passive`) hoặc sau ~3,5–5 s idle.
  - Tối thiểu dùng `next/script strategy="lazyOnload"`.
  - Ngoại lệ: URL có click ID quảng cáo thì nạp SDK ngay.
- **Facade cho embed nặng:**
  - YouTube: thumbnail + nút, bấm mới nạp `youtube-nocookie`;
  - Google Maps: placeholder, chỉ gắn iframe khi gần viewport;
  - tour 360 / TikTok: chỉ khi gần viewport.
- KHÔNG nạp gtag hai lần. GA4 cạnh GTM thì dùng data layer riêng (`l=gaLayer`), vì nạp hai lần thừa ~177 KB.
- Tác vụ CPU nặng (captcha proof-of-work) chạy khi tương tác đầu, không chạy lúc page load.
- **Nguồn:**
  - `P2 2bd1610`: Webvisor TBT 4 s; Kuula ~3 MB.
  - `P8 8785ffb`: map ~500 KB.
  - `P3` `defer-third-party.ts`.
  - `P1` `LiteYouTube`, `MapEmbed`.
  - `P1 adb900d`.
  - `P4 03e93f0`.

<a id="hn-06"></a>
### HN-06 · Motion nhẹ, không thư viện nặng mặc định — PHẢI
- **Mặc định KHÔNG** dùng framer-motion / GSAP / Lenis.
  - Reveal bằng **IntersectionObserver + CSS transition** (`RevealObserver`), chỉ animate `transform` / `opacity`.
  - Không ẩn phần tử đang trong viewport lúc tải. Không JS hoặc `prefers-reduced-motion` thì vẫn hiển thị.
- Cần thư viện motion (khách duyệt hướng giao diện có motion phức tạp):
  - chỉ nạp ở trang cần, chỉ nạp ở desktop;
  - tắt Lenis trên touch và khi `prefers-reduced-motion`;
  - ghi lý do vào `00-du-an.md`.
- Không có page loader chạy lại mỗi lần điều hướng client.
- `content-visibility` / `inlineCss`: chỉ giữ nếu đo có lợi ([HN-01](#hn-01)).
- **Nguồn:**
  - `P8 ebae3f7`: gỡ 3 thư viện, JS −55 %, bài viết Perf 69 → 100.
  - `P8 408108b`, `cd131ba`.
  - `P7 2f95dfa`.
  - `P5`: GSAP + Lenis + framer + Embla, điểm hiệu năng mobile 77.

<a id="hn-07"></a>
### HN-07 · JS và HTML gọn — NÊN
- Validate nặng (zod) ở client nạp lười khi người dùng chạm form; server vẫn validate lại.
- Trang chủ không render cả catalog (giới hạn ~8 mục mỗi nhóm). Tắt `prefetch` cho link ít bấm.
- SVG logo lớn tách file có cache, không nhúng inline lặp lại.
- Server Component có `<img>` thường được React phát preload hint. Link prefetch tới trang nặng sẽ kéo ảnh của trang đó; kiểm bằng tab Network.
- Bootstrap / thư viện CSS cả bộ: chỉ khi bắt buộc khớp pixel với site cũ.
- **Nguồn:**
  - `P8 408108b`: tắt prefetch, giới hạn 8 mục.
  - `P8 8785ffb`, `ebae3f7`: HTML 150 → 55 KB.
  - `P3 0f7736d`.
  - `P2`: Bootstrap 270 KB, ~75 % thừa.

<a id="hn-08"></a>
### HN-08 · Cache header — PHẢI
- Asset có hash: `public, max-age=31536000, immutable`.
- File trong `public/` không hash: khớp theo **đuôi file**, không theo thư mục (khớp thư mục sẽ cache nhầm cả HTML). Đặt `max-age=2592000, stale-while-revalidate=86400`.
- Trang danh mục động theo query: `Vercel-CDN-Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`.
- `/studio`: `no-store`.
- **Nguồn:** `P1 92bd63c`; `P2 0c6922d`; `P3` `next.config.ts`; `P8 8785ffb`.

# 11 · Bảo mật & pháp lý (`BM`)

> **Lưu ý về pháp lý:** phần pháp lý Việt Nam dựa trên bản tin / tóm tắt (EY, PwC, Thư viện pháp luật), tra ngày 16/11/2026. Chưa đối chiếu nguyên văn điều khoản. Mẫu văn bản chính sách và câu đồng ý **phải được luật sư hoặc người phụ trách pháp lý của khách duyệt** trước go-live.

<a id="bm-01"></a>
### BM-01 · Header bảo mật mặc định — PHẢI
- `next.config.ts` `headers()` áp cho mọi route:

| Header | Giá trị |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `SAMEORIGIN`, kèm CSP `frame-ancestors 'self'` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()`; bỏ `payment=()` khi site có thanh toán trực tuyến |

- `poweredByHeader: false`.
- HSTS để Vercel tự thêm. Thêm `includeSubDomains` / `preload` chỉ sau khi rà mọi subdomain.
- **KHÔNG đặt header / redirect trong `vercel.json`** — đặt trong `next.config` (`headers()` / `redirects()`): `next start` (bản build local mà QA + G5 của DigiForge đo) không đọc `vercel.json`, nên đặt ở đó thì bản local và production lệch nhau (Q-118). Header do nền tảng tự thêm (HSTS) đo sau phát hành.
- **Header ở site chính đè header của origin được rewrite.** Rule header phải loại trừ đường rewrite. Ví dụ với rewrite `/tool/*` của `P3`: `source: "/:path((?!tool(?:/|$)).*)"`; thay `tool` bằng đường rewrite của dự án.
- **Kiểm:** `curl -sI` URL công khai sau deploy; test khoá cấu hình header.
- **Nguồn:**
  - `P1` / `P2` `SECURITY_HEADERS`.
  - `P3 fcb2386`: trước đó chỉ có HSTS, ai cũng nhúng được.
  - `P3 b05cf65`: CSP của `/tool/*` bị đè 2 tháng.
  - `P6 KT-18`; `P5`, `P7`, `P8`: không có header.

<a id="bm-02"></a>
### BM-02 · CSP — NÊN (Report-Only trước, thật sau go-live)
- Danh sách host phải chốt trước: GTM / GA4, pixel, CDN Sanity, widget chat, YouTube, Maps, CRM.
- **Host GA4 phải đủ:** `www.googletagmanager.com`, `*.google-analytics.com`, `*.analytics.google.com`, `*.google.com`, `*.google.com.vn` (Google Signals), `*.g.doubleclick.net`.
  - Lưu ý: `*.analytics.google.com` **không** khớp `analytics.google.com` hay `www.google.com`.
- Có `object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'`. Tránh `unsafe-inline`; dùng nonce / hash khi được.
- Bắt đầu bằng `Content-Security-Policy-Report-Only`, theo dõi lỗi console, rồi mới bật thật. Có test khoá chuỗi CSP.
- Studio có CSP riêng hoặc được loại trừ.
- **Nguồn:**
  - `P4 47db426`, `39bc0b1`: CSP chặn mọi hit GA4.
  - `P4 eeb36e4`.
  - `P4` `vercel-config.test.ts`.
  - `P2` B5; `P1`: chưa có CSP.

<a id="bm-03"></a>
### BM-03 · Secret và deploy — PHẢI
- Secret chỉ ở env của Vercel. Token ghi (Sanity write, SMTP) chỉ dùng ở server.
- `.env*` được ignore ([KT-09](01-kien-truc.md#kt-09)); `.env.example` chỉ chứa placeholder.
- KHÔNG có webhook / API key trong source. Lộ thì **rotate ngay**.
- Deploy chỉ từ git, qua CI. KHÔNG `vercel --prod` upload thư mục làm việc.
- Trong CI: ghim phiên bản CLI; thiếu token thì **fail**, không bỏ qua mà vẫn xanh.
- **Nguồn:**
  - `P7 077a14d`: `.codex` chứa API key bị upload.
  - `P1 06d76bd`.
  - `P3 023ca6d`: webhook Slack trong source.
  - `P4`: workflow bỏ qua khi thiếu token.

<a id="bm-04"></a>
### BM-04 · Webhook, cron, API công khai — PHẢI
- **Webhook revalidate:** kiểm chữ ký; thiếu secret thì trả 500 ([KT-02](01-kien-truc.md#kt-02)).
- **Route cron:** kiểm `Authorization: Bearer $CRON_SECRET`; khai `maxDuration`, có ngân sách thời gian.
- **API công khai:** kiểm `Origin` / `Referer` theo allowlist (`=== h || endsWith("." + h)`, không có `localhost` ở production); honeypot; CAPTCHA dùng một lần; quota theo IP và toàn cục; trả `Retry-After` kèm 503.
- **Escape đầu ra:**
  - JSON-LD: escape `<` ([GEO-02](03-geo.md#geo-02));
  - mail HTML: `escapeHtml` mọi giá trị;
  - CSV xuất: trung hoà công thức.
- **Nguồn:** `P1`, `P2`, `P7` `api/revalidate`; `P8`, `P4` cron; `P4` `api/_origin.ts`; `P1` `lead-csv.ts`.

<a id="bm-05"></a>
### BM-05 · Dependency có lỗ hổng — PHẢI
- Trước go-live và mỗi tháng: `pnpm audit --prod`, không còn critical / high chưa xử lý.
- **Xử lý critical / high:**
  - **có bản vá** → PHẢI nâng (cập nhật phụ thuộc / `pnpm.overrides`); không có ngoại lệ;
  - **CHƯA có bản vá** (`patched_versions` là `<0.0.0` / `<0.0.0-0` / rỗng) → chỉ được chấp nhận qua **ngoại lệ có người duyệt ở DigiForge** (admin, trang dự án): đúng mã GHSA + tên gói + lý do + hạn xem lại ≤ 90 ngày, có audit log. Check vẫn báo (major) nhưng không chặn. Thu hồi trước khi duyệt G6 / bắt đầu deploy → kết quả bảo mật đã đạt được kiểm lại; hết hạn / advisory đã có bản vá → lần chạy check sau chặn.
- **Lỗ hổng chỉ nằm trong công cụ phát triển → KHÔNG chặn, chỉ ghi chú** (Q-104, chốt 18/11/2026; áp mọi dự án, không cần ngoại lệ, xét trước ngoại lệ). Điều kiện xét trên `pnpm-lock.yaml` (nguồn `pnpm audit` đọc), KHÔNG trên đường `paths` của audit (pnpm chỉ ghi một đường mỗi bản cài — gói vẫn tới được từ production có thể mang đường qua công cụ): MỌI bản cài của gói lỗi (`<gói>@<phiên bản của finding>`) KHÔNG tới được từ `dependencies` + `optionalDependencies` của repo sau khi bỏ:
  - **công cụ dòng lệnh** trong danh sách cố định của chuẩn này (bỏ cả nút đó; khớp đúng tên gói, không khớp chuỗi con — `@sanity/client` không phải `@sanity/cli`). Danh sách: `@sanity/cli`. Thêm gói = sửa danh sách này trước, rồi mới sửa check;
  - **peer TUỲ CHỌN được giải bằng devDependency**: cạnh `p → X` mà `X` nằm trong `devDependencies` gốc, KHÔNG nằm trong `dependencies` / `optionalDependencies` gốc, là `peerDependencies` của `p` VÀ `peerDependenciesMeta[X].optional: true`. Vd. `next-sanity > @sanity/client > get-it > vitest`: `vitest` là peer tuỳ chọn của `get-it`, `--prod` vẫn kéo vào. Peer BẮT BUỘC (vd. `react` / `styled-components` đặt ở devDependencies mà là peer của `sanity` / `next-sanity`) → KHÔNG miễn: gói cần nó lúc chạy.
- **Chốt an toàn** của mục trên:
  - gói lỗi (bản cài từ `node_modules` mà audit báo) xuất hiện trong bản build (`.next/server/**/*.js`, `.next/static/**/*.js`, `sources` của source map, trace `.next/**/*.nft.json`: đường `node_modules/<gói>/`, `require("<gói>")`, tên chunk turbopack `<băm>_<gói>_…`) → vẫn chặn. Bản sao do gói khác tự đóng gói (vd. `next/dist/compiled/picomatch/` của Next.js) không phải gói audit báo — không tính, chỉ ghi chú "theo dõi qua nâng Next" ([KT-07](01-kien-truc.md#kt-07));
  - bản build không xác nhận được → vẫn chặn: không có `next build` (`.next/BUILD_ID` + `.next/server`); `distDir` tuỳ chỉnh; không có dấu bản build `.digiauto/build-stamp.json` (bước build của DigiForge ghi: commit, cây sạch, `BUILD_ID` + thời điểm ghi) hoặc cây có thay đổi chưa commit / `BUILD_ID` (nội dung hoặc thời điểm ghi) khác hoặc đổi trong lúc quét; chunk JS dưới `.next/server` không có source map, bản build webpack, symlink / junction trong `.next/server` / `.next/static`; quá lớn để quét hết;
  - **commit của bản build khác commit preview** → chỉ tin khi preview là TỔ TIÊN của commit bản build và mọi tệp đổi giữa hai commit đều **trung tính với bản build** (vd. bước nội dung commit seed + script ở máy, không đẩy): `seed/**`, `docs/**`, `scripts/**`, `.digiauto/**`; `*.md`, `*.txt`, `*.csv`; ảnh / font (`png jpg jpeg webp avif gif svg ico woff woff2`); `*.json` TRỪ `package.json`, `tsconfig*.json`, `vercel.json`, `components.json`, `*.config.json` và mọi `.json` dưới `app/`, `src/`, `lib/`, `components/` (có thể bị import). Mọi tệp khác (mã `ts/tsx/js/mjs/css`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc`, `next.config.*`, `.env*`…) hoặc preview không phải tổ tiên → vẫn chặn, cần đẩy lại preview. Thêm mục = sửa danh sách này trước, rồi mới sửa check;
  - không đọc được `pnpm-lock.yaml` (thiếu / không phải v9 / ngoài tập con đọc được — khoá trùng, nhiều document…), repo workspace (lockfile có importer khác `.`), phụ thuộc `link:` trên đường production (gói cục bộ — phụ thuộc của nó không nằm trong lockfile), hoặc audit không cho phiên bản cài → không coi là công cụ phát triển (message nói lý do);
  - một bản cài tới được từ production → xử lý như lỗ hổng thường (có bản vá thì nâng; chưa có thì ngoại lệ có người duyệt).
- **Giới hạn của chốt bản build:** chunk client `.next/static` không có source map (mặc định) và đặt tên băm — chốt bản build gần như chỉ thấy phía server (source map server, trace `.nft.json`); gói bị gộp vào bundle trình duyệt chỉ lộ qua chuỗi `"<gói>"` / `node_modules/<gói>/` trong mã. Lớp an toàn chính là phân loại tầm với trên lockfile; chốt bản build là lớp phụ.
- KHÔNG dùng danh sách bỏ qua trong repo (`pnpm.auditConfig.ignoreCves` / `ignoreGhsas`, `auditConfig` của `pnpm-workspace.yaml`, `npmAuditIgnoreAdvisories` của `.yarnrc.yml`): agent sửa repo tự thêm được để qua cổng. Check coi là major và vẫn tính các lỗ hổng bị ẩn.
- Next.js ghim bản vá mới nhất ([KT-07](01-kien-truc.md#kt-07)).
- **Nguồn:** `P2 83c154f`, `f2ca8c8`; `P7 807ba2a`.

<a id="bm-06"></a>
### BM-06 · Trang pháp lý và thông tin doanh nghiệp — PHẢI
- **Footer có:**
  - tên pháp lý, MST, địa chỉ, hotline, email (từ `siteSettings`);
  - link **Chính sách quyền riêng tư** (`/chinh-sach-bao-mat`) và **Điều khoản sử dụng**;
  - khi có bán hàng / dịch vụ: thêm chính sách đổi trả / bảo hành / thanh toán / giao nhận.
- Nền tảng quảng cáo / mạng xã hội đối chiếu pháp nhân trên site (LinkedIn, Meta, TikTok). Nên có thêm nhãn tiếng Anh "Privacy Policy · Terms of Service" và trang `/data-deletion` nếu dùng Meta login / app.
- Văn bản pháp lý mô tả **tính năng có thật**. Thêm bên thứ ba thì tăng version. KHÔNG tự thêm điều khoản khách chưa cung cấp (để `missing_info`).
- **Nguồn:**
  - `P3 8a84ab7`: LinkedIn từ chối xác minh.
  - `P3 7f5db9e`: TikTok từ chối.
  - `P7`: không có trang pháp lý nào.
  - `P6 KT-19`.
  - `P8 a3c8ca6`: `/chinh-sach` có `TODO`.

<a id="bm-07"></a>
### BM-07 · Dữ liệu cá nhân: Luật 91/2025 + NĐ 356/2025 — PHẢI
- Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 và Nghị định 356/2025/NĐ-CP **có hiệu lực từ 01/01/2026, thay NĐ 13/2023** ([web], độ chắc chắn cao). Chi tiết về cách xin đồng ý và thời hạn xử lý: độ chắc chắn trung bình. Mức phạt theo NĐ 330/2026: chưa đọc nguyên văn, độ chắc chắn thấp. Phần chi tiết cần người phụ trách pháp lý xác nhận.
- **Form lead PHẢI có:**
  1. Ô đồng ý **không tích sẵn**, tách riêng với ô đồng ý nhận marketing (nếu có).
  2. Câu nêu mục đích, loại dữ liệu, bên nhận / xử lý (vd. CRM), thời hạn lưu, quyền (rút đồng ý, xoá). Link chính sách đặt ngay cạnh form.
  3. **Lưu bằng chứng đồng ý** theo lead: thời điểm, nội dung câu, version (hash của câu + chính sách), URL chính sách.
  4. Chỉ thu trường cần thiết.
- **Quy trình nội bộ:** có quy trình rút đồng ý / xoá dữ liệu; phản hồi trong 2 ngày làm việc (chi tiết cần đối chiếu văn bản).
- **Dữ liệu nhạy cảm** (sức khoẻ, tình trạng da…): KHÔNG thu qua form chung khi chưa có cơ sở pháp lý và biện pháp bảo vệ. Site y tế: form chỉ hỏi nhu cầu chung.
- **Tracking quảng cáo:** chỉ chạy khi đã có đồng ý ([TR-05](10-tracking.md#tr-05)). NÊN có banner cookie / tracking có lựa chọn.
- **Nguồn:**
  - `P1 c34ed07`: câu đồng ý có version.
  - `P2` TASKS #12, `P6 KT-19`, `P5`: chưa có ô đồng ý.
  - `P3 096553c` (chính sách theo Luật 91 + NĐ 356).
  - [web] Luật 91/2025, NĐ 356/2025.

<a id="bm-08"></a>
### BM-08 · Quảng cáo ngành đặc thù — PHẢI
- **Y tế / thẩm mỹ có can thiệp / dược / thực phẩm chức năng:**
  - Hỏi khách giấy phép hoạt động và **giấy xác nhận nội dung quảng cáo** (Sở Y tế) trước khi đăng nội dung quảng cáo (cam kết kết quả, ảnh trước–sau, so sánh, khuyến mại).
  - Lưu số và ngày giấy xác nhận trong CMS, hiển thị ở chân bài.
- **KHÔNG** cam kết tuyệt đối: "100% hiệu quả", "an toàn tuyệt đối", "vĩnh viễn", "không đau", "FDA" khi không có chứng cứ.
- Ảnh minh hoạ tách khỏi ca thực tế; ca thực tế ghi mốc thời gian, cách đo và có quyền dùng ảnh.
- Hồ sơ bác sĩ có họ tên đầy đủ và chứng chỉ kiểm chứng được.
- **Ngành có điều kiện khác** (xuất khẩu lao động, du học, tài chính): hiển thị số giấy phép thật. KHÔNG hứa kết quả (visa, lợi nhuận).
- **Nguồn:**
  - `P6 c720e6f`, review.md P1 / P2.
  - `P1 789144c` ("no visa promise").
  - [web] Luật Quảng cáo / NĐ 181 (độ chắc chắn trung bình–thấp, cần hỏi luật sư).

<a id="bm-09"></a>
### BM-09 · Website bán hàng trực tuyến — PHẢI hỏi trước
- Luật Thương mại điện tử 122/2025/QH15 + NĐ 248/2026 có hiệu lực **01/07/2026** ([web]).
- **Site có giỏ hàng / đặt hàng / thanh toán trực tuyến:**
  - phải làm **thủ tục thông báo** trước khi vận hành;
  - hiển thị thông tin đã thông báo;
  - có điều khoản giao dịch và chính sách đổi trả / bảo mật / thanh toán / vận chuyển.
- **Site chỉ giới thiệu + form liên hệ:** theo nguồn thứ cấp thì không thuộc diện thông báo, nhưng vẫn cần thông tin doanh nghiệp + chính sách quyền riêng tư.
- Cơ quan tiếp nhận thông báo chưa xác minh nguyên văn. Ghi vào checklist "cần luật sư xác nhận".
- **Nguồn:** [web] Luật TMĐT 2025, NĐ 248/2026 (nguồn thứ cấp về phạm vi).

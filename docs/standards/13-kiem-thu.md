# 13 · Kiểm thử & QA (`QA`)

Lỗi SEO / lead ở các repo cũ hầu hết do **người audit tay** phát hiện, sau khi khách đã chịu thiệt. Vì vậy mỗi chuẩn ở bộ này phải kiểm được bằng test hoặc script.

Các mức kiểm theo thứ tự rẻ đến đắt:
1. unit;
2. e2e trên build production;
3. quét toàn sitemap;
4. chụp ảnh 5 viewport;
5. Lighthouse / axe;
6. review độc lập.

**Đo ở đâu (DigiForge v8, Q-118):**
- **Trước G5 — bản build local:** DigiForge build production đúng commit (`next build` + `next start` trên `127.0.0.1`, env không token, `LEADS_DRY_RUN=1`, `SANITY_SOURCE=seed`) rồi chạy e2e ([QA-02](#qa-02), build seed riêng), SEO kỹ thuật, URL cũ, form, security trên chính bản đó. G5 duyệt bản build local này.
- **Chỉ có nghĩa trên hosting** (https, http → https, HSTS và header do nền tảng đặt, tối ưu ảnh / ISR của Vercel): trên bản local chỉ ghi `info` "đo lại sau phát hành", không chặn; đo thật trên production sau khi phát hành bản demo (DigiForge: bước security trên hosting `launch.security_hosting` — [QA-04](#qa-04)), kết quả vào báo cáo audit.
- **Sau phát hành — bản demo production:** Lighthouse, responsive, axe, so hình ([QA-05](#qa-05), [QA-06](#qa-06)).

<a id="qa-01"></a>
### QA-01 · Bộ unit tối thiểu — PHẢI
Viết bằng Vitest, chạy trong job CI `ci`:
- **Builder và schema:** `pageMetadata` và từng builder JSON-LD theo loại trang; `serializeJsonLd` escape `<`.
- **Index và URL:** `robotsFor(env, host)` ([SEO-01](02-seo.md#seo-01)); sitemap lọc noindex / canonical / ngưỡng tag, có escape; map URL cũ (gồm phân trang, `.html`).
- **Revalidate:** `CONTENT_TYPES` khớp schema, bỏ qua lead / draft / asset.
- **Lead:** schema zod (SĐT VN, ngày theo giờ VN ở mốc 23:30 / 06:30, enum); thứ tự xử lý và idempotent; honeypot im lặng; rate limit chỉ đếm lượt hợp lệ.
- **Studio và nội dung:** GROQ parse được và chạy được trên seed qua `groq-js` (cùng truy vấn với Sanity — [KT-01](01-kien-truc.md#kt-01)); cấu trúc Studio có ID ASCII; mọi block Portable Text có renderer; slug / tag khớp key.
- **Repo:** rào repo ([KT-08](01-kien-truc.md#kt-08)); ảnh / logo / OG được tham chiếu đều tồn tại và đúng kích thước.
- **GEO:** nội dung `llms.txt` chứa đủ dữ kiện, không có HTML.
- **Tracking:** sự kiện chỉ bắn sau `ok`, không bắn đúp.
- Mỗi lỗi sau go-live đi kèm một test tái hiện.
- **Nguồn:**
  - `P1` 345 test (`tests/unit/*`, mỗi lỗi sau go-live có test).
  - `P2` `tests/lib/*`.
  - `P5` `tests/lib/*` (`local-images.test.ts`).
  - `P4` test SEO / `vercel.json`.
  - `P7`: không có test nào.

<a id="qa-02"></a>
### QA-02 · E2E Playwright trên build production — PHẢI
- Chạy trên build production (không chạy `dev`): check build trước (`pnpm build`); `webServer` của Playwright CHỈ chạy `next start` (không build lại — build lại trong lượt test làm bản build khác bản đã ghi dấu, `check.security` không xác nhận được gói lỗi có lên website không, BM-05 / Q-104). Cổng ngẫu nhiên (`E2E_PORT`) và xác minh đúng server. Bật `LEADS_DRY_RUN=1`.
- Dùng 2 project: **desktop 1440×900** và **mobile** (Pixel 7 hoặc iPhone 13). Thêm **WebKit** cho các luồng chính, vì Safari iOS là nơi lỗi nhiều nhất.
- **Kiểm SEO theo từng loại trang** bằng parser thật (`JSON.parse`, DOMParser, cheerio), không dùng regex:
  - đúng 1 H1;
  - title ≤ 60 ký tự, description 120–160;
  - canonical tuyệt đối = URL cuối, `og:url` = canonical;
  - `og:image` là JPEG 1200×630 trả 200;
  - `lang` đúng; có link RSS (nếu có blog);
  - mọi JSON-LD parse được và đủ `@type` của loại trang.
- **Kiểm luồng:**
  - URL cũ mẫu 301 một hop tới trang 200 không noindex;
  - slug sai trả 404 thật; `sitemap.xml`, `robots.txt` (và `llms.txt` nếu có) trả 200;
  - menu mobile, dialog, lightbox dùng được bằng bàn phím (focus trap, Esc);
  - form: gửi rỗng thì báo lỗi đúng ô; lỗi vẫn giữ dữ liệu; thành công thì bắn `generate_lead` (chặn host analytics);
  - CTA trỏ đích có thật (`#bao-gia`); cờ tính năng tắt thì route / menu / sitemap đồng bộ;
  - axe: 0 lỗi serious / critical ([TC-07](08-tiep-can.md#tc-07));
  - ngân sách trang chủ: LCP < 2,5 s; bytes < 1,3 MB mobile / 2 MB desktop.
- Chống treo: timeout cứng, đóng browser trong `finally`, selector không mơ hồ.
- **Nguồn:**
  - `P2` `tests/e2e/{seo,site,motion}.spec.ts`: kiểm 837 URL cũ, ngân sách trang chủ.
  - `P1` `tests/e2e/site.spec.ts` (`seoBasics`).
  - `P5` / `P8` `routes.spec.ts`.

<a id="qa-03"></a>
### QA-03 · Quét toàn sitemap và URL cũ — PHẢI
- `scripts/seo-audit.mjs <origin>` đọc toàn sitemap, kiểm từng URL:
  - status, title / description trùng hoặc thiếu, số H1, canonical tự chính nó;
  - JSON-LD parse được; ảnh thiếu alt; link nội bộ hỏng; trang mồ côi;
  - hreflang hai chiều; không có `localhost`.
  - **Fail khi sitemap rỗng hoặc lỗi**, có `--min-urls`. Có `--preview` để bỏ kiểm noindex.
- `scripts/check-urls.mts` kiểm URL cũ với **kỳ vọng sinh từ dữ liệu**: 200 trực tiếp, hoặc đúng mã + đúng đích một hop. Exit 1 khi lệch.
- Mọi URL trong sitemap / canonical / `og:image` / JSON-LD trả 200 **không qua redirect**.
- Chạy trên bản build local đúng commit trước G5 (Q-118 — bỏ phần kiểm https / redirect của hosting, ghi "đo lại sau phát hành") và trên production sau khi phát hành bản demo (Q-106). Có throttle, vì firewall có thể chặn 403.
- Quét đi qua site (CDN của Vercel), không gọi API Sanity trực tiếp, để không tốn quota gói Free (bất biến 10; `P1 de6650d` từng lỗi 402).
- **Nguồn:** `P1 66f1efd`, `f39f3c0` (`check-urls` 3.417/3.417); `P2` `seo-audit.mjs` (534 URL); `P6` (script audit quét sitemap).

<a id="qa-04"></a>
### QA-04 · Kiểm sau deploy theo URL thật — PHẢI
- Đây là chỗ đo các mục chỉ có nghĩa trên hosting mà QA trên bản build local bỏ qua: https, http → https, HSTS, header do nền tảng đặt (DigiForge v8: bước `launch.security_hosting`, sau kiểm sau phát hành).
- Dùng `curl -sI` kiểm: host phụ 301 / 308, header bảo mật + `X-Robots-Tag`, CSP (cả đường rewrite).
- `og:*` kiểm bằng UA `facebookexternalhit` / Zalo. Hash asset live trùng với bản build.
- Ảnh: 0 ảnh 404, 0 ảnh vỡ (`naturalWidth == 0`).
- GA4 có hit.
- Ghi các lệnh kiểm vào README của repo.
- **Nguồn:** `P4` README; `P7` (hash asset, UA Zalo); `P5 f4bad19`, `P8 9a5489c` (ảnh 404).

<a id="qa-05"></a>
### QA-05 · Chụp và kiểm 5 viewport — PHẢI
- Script `scripts/qa/screenshot.mjs <origin>` đọc sitemap, chụp full-page ở **360, 390, 768, 1366, 1920**.
  - Thêm màn ≥ 2560 và màn thực tế của khách khi biết.
  - Cuộn hết trang (dùng scroll tức thì, không smooth) để lazy / reveal hiện ra.
- Ghi `findings.json` gồm:
  - tràn ngang (`scrollWidth − innerWidth > 0`);
  - vùng chạm < 24 px (lỗi) hoặc < 44 px (cảnh báo) trên mobile, miễn link trong đoạn văn;
  - ảnh vỡ; số H1 ≠ 1; lỗi console; response ≥ 400.
- Ảnh hero chụp 375 / 1440 / 1920 cho mỗi vòng sửa hero ([GD-01](07-giao-dien.md#gd-01)).
- Chế độ `--all` chụp mọi sản phẩm cho bản cuối; có throttle, chỉ đọc trang qua site (không gọi API Sanity).
- **Nguồn:** `P8` `perf-report/screenshot.mjs` (165 lượt trang × viewport); `P1` `scripts/v2/shot.mjs`; `P2 86064de` (banner hở ở 2542 px).

<a id="qa-06"></a>
### QA-06 · Hiệu năng và a11y có báo cáo trước / sau — PHẢI
- Đo theo [HN-01](05-hieu-nang.md#hn-01): 4 trang × mobile / desktop × 3 lượt.
- Báo cáo gồm bảng Perf / A11y / BP / SEO / LCP / CLS / TBT / JS KB / ảnh KB / tổng KB, kèm dữ liệu thô `summary.json` và điều kiện đo.
- Đo trên bản demo production, phát hành ngay sau G5 (Q-92 để người xem website sớm; Q-106; v8: cùng stage phát hành). Chưa đạt **cổng chặn** ở [05-hieu-nang.md](05-hieu-nang.md) thì **không Release, không bàn giao**, đưa người quyết (sửa qua yêu cầu thay đổi → G5 → phát hành lại bản demo → đo lại). Chưa đạt mục tiêu thì ghi vào báo cáo, không chặn.
- **Nguồn:** `P8` `perf-report/REPORT.md`; `P1` `report-evidence.mjs`.

<a id="qa-07"></a>
### QA-07 · Review và nghiệm thu độc lập — PHẢI
- Người / agent khác người code review **trước khi gửi khách**. Ở các repo cũ, mỗi vòng review như vậy tìm ra 3–9 lỗi thật.
- Nghiệm thu theo [CHECKLIST.md](CHECKLIST.md), từng mục ghi đạt / chờ / lỗi kèm bằng chứng. Báo cáo phân biệt **đã quan sát / suy luận / chưa biết**.
- Yêu cầu của khách ghi thành REQ-ID (`MUST` / `NEEDS_INPUT`), mỗi REQ có bằng chứng.
- Chấm UI độc lập theo [GD-07](07-giao-dien.md#gd-07).
- Audit lưu bằng chứng (HTML, `results.json`) theo ngày, **commit vào repo** và giao người phụ trách.
- **Nguồn:**
  - `P1`: 6–8 vòng review ngoài; spec feedback REQ-ID.
  - `P6` `checklist/`: 36 việc không ai nhận.
  - `P7` spec nghiệm thu.

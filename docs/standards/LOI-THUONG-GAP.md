# Lỗi thường gặp

Bảng này chỉ ghi các lỗi **lặp lại ở ít nhất hai repo**, hoặc lặp nhiều vòng trong cùng một repo. Mỗi lỗi kèm luật phòng, cách bắt tự động và repo nguồn.

Gặp lỗi mới lặp lại thì thêm dòng vào bảng và thêm luật tương ứng.

| # | Lỗi | Repo / bằng chứng | Luật phòng | Bắt tự động |
|---|---|---|---|---|
| 1 | Canonical / sitemap / OG trỏ host bị redirect, `localhost` hoặc `vercel.app` | `P6 KT-01` (56/56 URL), `P7 4386cea`, `P8`, `P5 af94273`, `P3 90b559c` | [SEO-02](02-seo.md#seo-02), [SEO-03](02-seo.md#seo-03) | Quét sitemap: mọi URL 200 trực tiếp; grep `localhost` |
| 2 | Preview / alias bị index; bật index mà quên redeploy | `P1 f70116e`, `P2` TASKS #17, `P7` | [SEO-01](02-seo.md#seo-01), [GL-03](12-go-live.md#gl-03) | Unit `robotsFor`; `curl -sI` sau deploy |
| 3 | Form báo thành công nhưng lead không đi đâu | `P7` (13 ngày), `P1 c34ed07`, `P2 885d182`, `P3 1ec73f4` | [LD-01](09-lead.md#ld-01), [LD-02](09-lead.md#ld-02) | Unit: thiếu env thì `ok: false`; form thật trước go-live |
| 4 | `generate_lead` thiếu, bắn sai lúc hoặc đếm đúp | `P1 801acd1`, `P2 1609a65`, `P7`, `P6 KT-10` | [TR-02](10-tracking.md#tr-02) | Test sự kiện chỉ sau `ok` |
| 5 | Phần tử LCP bị reveal JS / lazy / opacity 0 | `P5 7e19ff1`, `P6 KT-12`, `P2 P7`, `P1 9f80126`, `P3 ee781ef` | [HN-02](05-hieu-nang.md#hn-02) | E2E node LCP hiển thị ngay |
| 6 | Thư viện motion nặng (GSAP / Lenis / framer) làm chậm hoặc trắng trang | `P8 ebae3f7` (76 → 96), `P7 2f95dfa`, `P5` (77), `P3 ee781ef` | [HN-06](05-hieu-nang.md#hn-06), [GD-04](07-giao-dien.md#gd-04) | Ngân sách JS trong e2e |
| 7 | Ảnh mờ (encode nhiều lần, `sizes` sai) hoặc quá nặng | `P2` (4 vòng), `P7 1ac0c05`, `P1 adb900d`, `P3 0f7736d` | [HN-03](05-hieu-nang.md#hn-03), [ND-06](04-noi-dung-cms.md#nd-06) | Byte ảnh ≥ khung × DPR; ngân sách bytes |
| 8 | Font preload thừa / quá nhiều weight / vỡ dấu tiếng Việt | `P1 92bd63c`, `eed254f`, `d8dd223`, `P7 2f95dfa`, `P6 WEB-11`, `P3 93a117d` | [HN-04](05-hieu-nang.md#hn-04), [GD-03](07-giao-dien.md#gd-03) | Đếm `<link rel=preload as=font>` ≤ 4 |
| 9 | Script bên thứ ba kéo tụt điểm mobile | `P2 2bd1610` (83 → 46), `P8 8785ffb`, `P1 adb900d` (gtag × 2) | [HN-05](05-hieu-nang.md#hn-05) | Đo hai chế độ có / chặn tracking |
| 10 | URL cũ 404 / redirect nhiều bước / redirect về trang noindex | `P1 76c57f8`, `69380ce`, `P2 83c154f`, `P6 WEB-03`, `P7` | [SEO-09](02-seo.md#seo-09) | `check-urls` kỳ vọng sinh từ dữ liệu |
| 11 | `noindex` mâu thuẫn với robots `Disallow` / sitemap | `P8 d3f8343`, `c576268`, `P2 S7`, `P6 WEB-05` | [SEO-07](02-seo.md#seo-07), [SEO-18](02-seo.md#seo-18) | Test: không URL noindex nào trong sitemap / Disallow |
| 12 | Sitemap đóng băng, `lastmod = now`, thiếu nguồn, không escape `&` | `P3 90b559c`, `a8f6fe9`, `P2 83c154f`, `P6 KT-04` | [SEO-06](02-seo.md#seo-06), [KT-03](01-kien-truc.md#kt-03) | Parse XML thật; so số URL với dữ liệu |
| 13 | Metadata trang ghi đè layout (mất RSS, `og:url` ≠ canonical), canonical ở layout | `P1 36a3b0d`, `P2 83c154f`, `P3 73d826b` | [SEO-04](02-seo.md#seo-04) | E2E `og:url === canonical`, có 1 link RSS |
| 14 | NAP / dữ kiện doanh nghiệp hard-code lệch CMS, tên thương hiệu không thống nhất | `P2` `ADDRESS`, `P1` `knowsAbout`, `P6 KT-21`, `P8 ebae3f7` | [GEO-03](03-geo.md#geo-03) | Grep dữ kiện hard-code; test JSON-LD đọc `siteSettings` |
| 15 | Số liệu / rating / claim bịa, `llms.txt` viết tay sai | `P8 ebae3f7`, `P5 45bc50c`, `P6 c720e6f`, `P3 90b559c` (giá sai ~5 lần) | [GEO-04](03-geo.md#geo-04), [ND-05](04-noi-dung-cms.md#nd-05), [GEO-06](03-geo.md#geo-06) | Bảng claim; test `llms.txt` theo nguồn |
| 16 | Liên kết nội bộ yếu: "bài liên quan" = N bài mới nhất | `P1 36a3b0d` (1.894 trang mồ côi), `P3 a8f6fe9` (3/50) | [SEO-11](02-seo.md#seo-11) | Quét trang mồ côi |
| 17 | Drawer mobile bị cắt trong header có `backdrop-filter` | `8eea717` (`P5` / `P6` / `P8`), `P1 3cf05a9` | [MB-04](06-mobile.md#mb-04) | E2E chiều cao drawer |
| 18 | iOS Safari vỡ: hydration #418, ES2022, IntersectionObserver | `P3 02274f5`, `9a8c6eb`, `cecfbca`, `ee781ef` | [MB-01](06-mobile.md#mb-01) | E2E chạy WebKit |
| 19 | Ngày form tính theo UTC / đóng băng lúc build | `P6 KT-09`, `P5` (chép lại), `P8` | [LD-06](09-lead.md#ld-06) | Unit mốc 23:30 / 06:30 |
| 20 | Rate limit `Map` trong bộ nhớ (vô hiệu trên serverless) | `P6 KT-17`, `P5`, `P8`, `P2`, `P1` | [LD-04](09-lead.md#ld-04) | Review: cấm `new Map()` trong `rate-limit` |
| 21 | Honeypot nhận focus / React 19 reset form làm mất dữ liệu | `P1 c21e74a`, `P2 83c154f` | [LD-03](09-lead.md#ld-03), [LD-04](09-lead.md#ld-04) | E2E tab order; e2e lỗi vẫn giữ dữ liệu |
| 22 | Không header bảo mật; CSP chặn GA4 hoặc bị rewrite đè | `P6 KT-18`, `P5`, `P7`, `P8`, `P4 47db426`, `P3 b05cf65` | [BM-01](11-bao-mat-phap-ly.md#bm-01), [BM-02](11-bao-mat-phap-ly.md#bm-02) | Test khoá header; `curl -sI` |
| 23 | Không ô đồng ý / trang chính sách cho form thu SĐT | `P2` TASKS #12, `P6 KT-19`, `P5`, `P7` | [BM-06](11-bao-mat-phap-ly.md#bm-06), [BM-07](11-bao-mat-phap-ly.md#bm-07) | E2E form có checkbox không tích sẵn |
| 24 | Dấu vết khách cũ trong repo (key widget, README, route, `.env.example`) | `P5` (key của `P6`), `P8` (3 khách), `P2 686042f` | [KT-08](01-kien-truc.md#kt-08) | Test rào repo |
| 25 | `.gitignore` / `.vercelignore` chặn ảnh; deploy CLI lộ secret | `P5 f4bad19`, `P8 9a5489c`, `P7 077a14d`, `P1 06d76bd` | [KT-09](01-kien-truc.md#kt-09), [BM-03](11-bao-mat-phap-ly.md#bm-03) | Quét 0 ảnh 404 |
| 26 | Giao diện / hero / palette / motion sửa nhiều vòng vì chưa chốt | `P1` (UI 3 lần), `P7` (hero 4–6), `P6` (5 palette), `P2` (motion 5) | [GD-01](07-giao-dien.md#gd-01) | Gate G2 có mockup + ảnh |
| 27 | Route nháp / mockup / cấu hình thử lên production | `P6 KT-02`, `P5 52266ef`, `P8 d31b294` | [KT-10](01-kien-truc.md#kt-10) | Sitemap / route list so với danh sách được duyệt |
| 28 | Không có test SEO / CI. Lỗi chỉ lộ khi audit tay | `P7`, `P6`, `P3`, `P2`, `P1` (không CI) | [QA-01](13-kiem-thu.md#qa-01), [GL-06](12-go-live.md#gl-06) | Job `ci` là required check |
| 29 | ID Studio có dấu làm Studio hỏng; block CMS không có renderer | `P1 03e8eb3`, `P3 edfb412`, `P2 f049f68` | [ND-01](04-noi-dung-cms.md#nd-01), [ND-04](04-noi-dung-cms.md#nd-04) | Unit cấu trúc Studio; render từng block |
| 30 | Đổi tên trường CMS không backfill; cache / memo làm bài mới 404 | `P8 7cadb78`, `P1 d2dab70`, `a45cf3c` | [ND-07](04-noi-dung-cms.md#nd-07), [KT-02](01-kien-truc.md#kt-02) | E2E "publish → URL mới 200" |

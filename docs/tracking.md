# Tracking — website Hứa Thị Tuyết

Theo `docs/standards/10-tracking.md` (TR-01…TR-07). Website **không có form lead** (`features.leadForm = no`):
không có `generate_lead`, không server action / API nhận dữ liệu người dùng, không nối CRM / Gmail.

## 1. Nạp mã đo lường (TR-01, HN-05)

| Hạng mục | Cách làm |
|---|---|
| Nguồn ID | Chỉ env: `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA_ID`, `GOOGLE_SITE_VERIFICATION`. Không có ID mặc định trong code |
| Cổng bật | `VERCEL_ENV === "production"` **và** ID đúng định dạng (`GTM-…`, `G-…`). Bản build local, bản demo, preview: không nhúng gì |
| Một đường nạp | Có GTM → **GTM-only** (GA4 cấu hình trong container, bỏ qua `NEXT_PUBLIC_GA_ID`). Không có GTM mà có GA4 → gtag trực tiếp |
| Chỗ nhúng | `components/seo/Analytics.tsx`, gắn một lần trong `components/layout/RootHtml.tsx` (mọi trang vi / en / 404). `/studio` có root layout riêng → không tracking |
| Nạp trễ | Dựng `dataLayer` + Consent Mode ngay; nạp `gtm.js` / `gtag/js` ở tương tác đầu (`pointerdown`, `keydown`, `touchstart`, `scroll`) hoặc sau 4 s; URL có `gclid` / `gbraid` / `wbraid` / `fbclid` / `msclkid` / `ttclid` → nạp ngay (`lib/tracking-bootstrap.ts`) |
| Consent Mode v2 | Mặc định `ad_storage`, `ad_user_data`, `ad_personalization` = `denied`; `analytics_storage` = `granted`. Chưa có CMP → không pixel quảng cáo / remarketing (TR-05) |
| Page view SPA | GA4 Enhanced Measurement «Page changes based on browser history events» (bật mặc định) / trigger History Change trong GTM |
| CSP | Chỉ khi tracking bật mới thêm `https://www.googletagmanager.com` (script), `*.google-analytics.com`, `*.analytics.google.com`, `*.googletagmanager.com` (connect / img) — `lib/analytics.ts › trackingCspSources`. Thêm tag bên thứ ba khác trong GTM → phải bổ sung host ở đó và cập nhật Chính sách bảo mật |
| Search Console | `GOOGLE_SITE_VERIFICATION` → `<meta name="google-site-verification">` (cùng cổng production) |
| Đổi ID | Phải redeploy (GL-03) — ID được đọc lúc build |

Bỏ thẻ `<noscript>` iframe của GTM: CSP không mở `frame-src` cho Google; lượng truy cập không JavaScript không đáng kể.

## 2. Bảng sự kiện (TR-03)

Đo bằng **một listener ở `document`** (pha capture) trong `components/seo/ContactTracker.tsx`, phân loại theo `href`
(`lib/analytics.ts › classifyContactHref`). Thêm nút mới đúng định dạng `zalo.me` / `tel:` / `mailto:` thì tự được đo.

| Sự kiện | Khi nào | Tham số (không PII) |
|---|---|---|
| `click_zalo` | Bấm liên kết `https://zalo.me/…` | `link_location`, `page_path`, `utm_*` (first-touch, nếu có) |
| `click_phone` | Bấm `tel:` | `link_location`, `page_path`, `utm_*` |
| `click_email` | Bấm `mailto:` | `link_location`, `page_path`, `utm_*` |
| `click_messenger` | Bấm `m.me` / messenger.com (chưa có trên site; dựng sẵn) | như trên |
| `click_directions` | Bấm link Google Maps (chưa có trên site; dựng sẵn) | như trên |

Không có `generate_lead` (không form), không có `cta_click` (CTA chính của site là Zalo / gọi — đã đo bằng `click_zalo` / `click_phone`).

**`link_location`** theo thứ tự: `data-track-area` › tên khối (`data-section`, rồi `id` của `<section>`) › `aria-label` của liên kết › `other`.

| `data-track-area` / khối | Vị trí |
|---|---|
| `header` | Nút Zalo trên thanh đầu trang (desktop / tablet) |
| `mobile_menu` | Menu mobile toàn màn hình |
| `mobile_bar` | Thanh Zalo / Gọi cố định đáy màn hình mobile |
| `footer` | Chân trang |
| `hero`, `story`, `projects`, `trust`, `connect`… | Khối nội dung trang chủ / trang con (`data-section`) |

**`page_path`**: `location.pathname`, đã bỏ query và hash.

TR-04: Zalo mở tab mới, `tel:` / `mailto:` không rời trang → không mất sự kiện, không cần `event_callback`.

## 3. UTM first-touch

`lib/attribution.ts` + `ContactTracker`:

- Lần đầu URL có `utm_source` / `utm_medium` / `utm_campaign` / `utm_term` / `utm_content` → lưu vào `localStorage` key `th_first_touch` cùng `landing_page` (chỉ path) và `referrer_host` (chỉ host). Không gửi lên server.
- Trong 30 ngày **không ghi đè** bởi UTM sau; hết hạn → bộ UTM kế tiếp thành first-touch mới.
- Không lưu click ID (GA4 / GTM tự đọc từ URL); giá trị giống email / số điện thoại bị bỏ; mỗi giá trị tối đa 100 ký tự.
- Mỗi lần tải trang: đẩy `{ first_touch: { utm_*, landing_page, referrer_host } }` (không có `event`) vào `dataLayer`; sự kiện click kèm `utm_*` first-touch.

**Chính sách bảo mật** (MI-16) cần nêu: site dùng Google Analytics / Tag Manager (khi bật) và lưu nguồn truy cập đầu tiên (UTM) trong bộ nhớ trình duyệt 30 ngày.

## 4. Cấu hình GA4 / GTM sau khi có ID (G6)

1. GTM: Admin → Import Container → `docs/gtm-container-import.json` → **Merge** (Rename conflicting). Sửa biến hằng `GA4 Measurement ID` thành mã G- thật.
2. Tag Assistant Preview kiểm `click_zalo`, `click_phone` trước khi Publish; ghi version để rollback.
3. GA4: đánh dấu Key event `click_zalo`, `click_phone`. Tạo custom dimension (scope Event): `link_location`, `utm_source`, `utm_medium`, `utm_campaign`. Chờ 24–48 giờ.
4. Không dùng GTM thì đặt `NEXT_PUBLIC_GA_ID`: `ContactTracker` gửi thêm `gtag("event", click_*, …)` (chỉ ở chế độ này; GTM-only không gọi gtag để tránh đếm đúp). Đánh dấu Key event / custom dimension như bước 3.
5. Bàn giao: dữ liệu GA4 trễ 24–48 giờ; «First user source» khác «Session source».

## 5. Kiểm (TR-07)

- Unit: `lib/analytics.test.ts`, `lib/attribution.test.ts`, `lib/tracking-bootstrap.test.ts`, `components/seo/analytics.test.tsx`.
- e2e trên bản build local: `e2e/analytics.spec.ts` (0 script đo lường, dataLayer click, UTM first-touch). `e2e/fixtures.ts` đánh trượt mọi script ngoài origin → QA headless không bắn sự kiện vào GA thật.
- Sau Release áp cấu hình: GA4 Realtime / DebugView thấy `click_zalo` / `click_phone`; không có quyền Admin thì kiểm request `g/collect`.

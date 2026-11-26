# Hồ sơ dự án: Hứa Thị Tuyết

> Mẫu điền cho **từng website**. Agent đọc tệp này đầu tiên.
> Ô nào chưa có thông tin thì ghi `missing_info`, kèm người cần hỏi. KHÔNG tự điền ([ND-05](04-noi-dung-cms.md#nd-05)).
> Nguồn: `facts.json`, brief `note/yeu-cau-du-an.md`, `requirements.json` (YC-01…YC-16), `mockup.json`, `build_plan.json` — điền ngày 20/11/2026, cập nhật 21/11/2026 (mockup vòng 4, token lần 3).

## 1. Doanh nghiệp (nguồn cho `siteSettings`, [GEO-03](03-geo.md#geo-03))

| Trường | Giá trị | Nguồn / người xác nhận |
|---|---|---|
| Tên thương hiệu (một tên dùng mọi nơi) | Hứa Thị Tuyết (thương hiệu cá nhân; dự án BĐS chỉ là sản phẩm — YC-01) | brief |
| Tên pháp lý · MST · năm thành lập | Không áp dụng (cá nhân). Đơn vị công tác: Trường Phát Group — chưa đưa vào JSON-LD tới khi khách xác nhận (MI-14) | brief · người vận hành |
| Ngành · loại schema | Bất động sản — tư vấn, phân phối BĐS đầu tư / dòng tiền / nghỉ dưỡng. Schema: `Person` + `WebSite` + `WebPage` / `ProfilePage` (không `LocalBusiness` — không có cơ sở kinh doanh) | brief, build_plan T5.1 |
| Cơ sở (địa chỉ đầy đủ · link Google Maps · giờ mở cửa) | `missing_info` — chỉ có khu vực hoạt động «Hạ Long – Quảng Ninh» | hỏi khách qua người vận hành |
| Hotline chính (một số) · số phụ | 0359 361 359 (Zalo + gọi) · không có số phụ | brief / facts |
| Zalo (số / OA) · Fanpage · YouTube · LinkedIn · Google Business Profile | Zalo 0359 361 359 (liên kết `zalo.me`, không nhúng script — YC-07) · mạng xã hội khác: `missing_info` | brief |
| Giấy phép / chứng nhận (có số) | `missing_info` (chứng chỉ hành nghề môi giới nếu có) | hỏi khách |
| Logo master (file gốc) · màu thương hiệu | Logo: `missing_info` (MI-05) → wordmark chữ Playfair Display. Màu: Emerald / ngà – xám sáng / champagne (YC-10); mã hex là đề xuất, chờ duyệt (MI-24) | mockup.json, design_tokens.json |
| Email | `missing_info` (MI-10) | hỏi khách |

## 2. Website

| Trường | Giá trị |
|---|---|
| Loại: mới / migration (URL site cũ) | Mới (`new_design`), không có site cũ |
| Mục tiêu chính: lead / gọi / đặt lịch / báo giá / bán hàng | Thương hiệu cá nhân (`goal: brand`); liên hệ qua Zalo / gọi |
| Ngôn ngữ: `vi` / `vi + en` ([SEO-16](02-seo.md#seo-16)) | facts: `vi + en`; brief: «Tiếng Việt» → **chờ xác nhận (MI-01)**. Khung đã có routing vi (không tiền tố) + en (`/en`); `SITE_LANGUAGES` mặc định `vi` → `/en/*` trả 404 cho tới khi bật |
| Host chính: `<slug>.vercel.app` (phase này) / domain riêng; apex hay www ([SEO-02](02-seo.md#seo-02)) | `*.vercel.app` (facts `domain.mode = vercel`); domain riêng `missing_info` (MI-18) |
| Index: theo Q-25 (domain tạm noindex); domain riêng thì quyết định riêng | Không index (facts `launch.allowIndexing = no`); `ALLOW_INDEXING` chỉ bật bằng `1` và vẫn bị chặn trên `*.vercel.app` |
| Crawler AI: cho bot tìm kiếm + bot người dùng hỏi; bot huấn luyện cho / chặn ([GEO-01](03-geo.md#geo-01)) | Cho cả ba nhóm (mặc định — khách chưa yêu cầu chặn); chỉ có hiệu lực khi được index |
| Nguồn nội dung production: Sanity (có Studio) / seed trong repo (không Studio) ([KT-01](01-kien-truc.md#kt-01), [ND-10](04-noi-dung-cms.md#nd-10)) | YC-06 cần CMS, nhưng facts `connect.sanity = off` → hiện chạy **seed**; Studio `/studio` báo «chưa bật CMS» tới khi có project Sanity (sau G5) |
| Có giỏ hàng / thanh toán trực tuyến? ([BM-09](11-bao-mat-phap-ly.md#bm-09)) | Không |
| Ngành có điều kiện quảng cáo (y tế, thẩm mỹ, dược, tài chính, XKLĐ)? Giấy xác nhận? ([BM-08](11-bao-mat-phap-ly.md#bm-08)) | Không thuộc nhóm có điều kiện; vẫn cấm cam kết lợi nhuận / «chuyên gia hàng đầu» (YC-13 — `lib/banned-phrases.ts`) |
| Trang sản phẩm / chi tiết: index hay không ([SEO-18](02-seo.md#seo-18)) | Trang chi tiết dự án index (khi site được index) |

## 3. Thiết kế (chốt ở G2, [GD-01](07-giao-dien.md#gd-01))

| Trường | Giá trị |
|---|---|
| Độ trung thành: giữ nguyên / làm mới / thiết kế lại | Thiết kế mới theo mockup khách (`design.source = mockup`) |
| Mockup đã duyệt (link, ngày, người duyệt) | Mockup vòng 4 (21/11/2026, `mockup.json`, dựng thẳng trong code — commit T6.1): A «Bám mockup — hero emerald, chân dung tách nền bên phải» (pa1, đề xuất), B «Hero ngà, chân dung trái; khối dưới hero giống A» (pa2). Token: `design_tokens.json` lần 3 → `styles/tokens.css` (`:root` = pa1, `data-variant="pa2"` = B, `.surface-dark` ép nút champagne trên dải tối). **G2 chưa ghi phương án được chọn (Q-58)** — chưa gỡ lớp phương án nào (T6.2 chờ) |
| Phạm vi motion: không / nhẹ (mặc định) / nhiều | Nhẹ (`subtle`): chữ hero «rise», hover 200ms; chỉ opacity / transform; tắt khi reduced-motion |
| Font (≤ 2 họ, đủ glyph Việt) | Playfair Display (tiêu đề) + Be Vietnam Pro (thân), next/font tự host, subset vietnamese + latin |
| Chiến lược ảnh: ảnh khách / AI / stock / kết hợp | Kết hợp: ảnh khách (`client_photos`, bộ 105 ảnh gửi 21/11/2026 — đã chọn 12, xem `seed/sanity/image-map.json`) + ảnh tự do `stock-*` (Wikimedia Commons, CC BY 4.0, có ghi nguồn ở chú thích) + minh hoạ vector tự dựng `illus-*` (`pnpm images:illustrations`) cho chỗ khách chưa có ảnh. Ảnh trong mockup khách là AI → không dùng. Chân dung gốc 1707×2560 đã có (MI-06 xong). Chưa dùng: banner vinh danh / doanh số (chờ xác nhận thành tích, YC-13), ảnh chuyển khoản / phiếu đặt cọc (dữ liệu tài chính cá nhân), ảnh có dấu «Meta AI». Còn chờ xác nhận quyền dùng ảnh có người khác / logo (MI-07, MI-14) |

## 4. Lead & tracking

| Trường | Giá trị |
|---|---|
| Có form lead? `LEAD_DESTINATION` | Không có form (facts `leadForm = no`); liên hệ qua Zalo / gọi. `LEAD_DESTINATION=digiagent_crm` giữ theo facts, không dùng |
| Form key CRM · `allowed_domains` đã thêm host? ([LD-02](09-lead.md#ld-02)) | Không áp dụng |
| Email nhận lead (nếu Gmail) | Không áp dụng |
| Các form: tên · trường · đích CTA | Không có form. CTA chính: Zalo 0359 361 359 xuyên suốt site (YC-07) |
| GTM / GA4 / Search Console / pixel (để trống được, Q-15) | `missing_info` (MI-16) — để trống, không nhúng script. Code dựng sẵn: ID từ env `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_GA_ID` / `GOOGLE_SITE_VERIFICATION`, chỉ bật khi `VERCEL_ENV=production` (sau G6); GTM-only; dataLayer `click_zalo` / `click_phone` / `click_email` + UTM first-touch — xem `docs/tracking.md`. Không pixel quảng cáo |
| Chat widget key (của chính dự án) | Không dùng |
| Câu đồng ý + link chính sách (người duyệt pháp lý) ([BM-07](11-bao-mat-phap-ly.md#bm-07)) | Không thu dữ liệu qua form; nội dung trang Chính sách bảo mật `missing_info` (MI-16) |

## 5. Migration (nếu có)

| Trường | Giá trị |
|---|---|
| Nguồn kiểm kê URL: sitemap cũ / GSC / Wayback / backlink ([SEO-09](02-seo.md#seo-09)) | Không áp dụng (site mới). Chỉ chuẩn hoá `/` cuối → 308 (trailingSlash: false) |
| Số URL cũ · tệp map redirect | 0 |
| Tag / trigger tracking cũ đã kiểm kê ([TR-02](10-tracking.md#tr-02)) | Không áp dụng |
| DNS: NS có thẩm quyền · MX / SPF đã chép ([GL-01](12-go-live.md#gl-01)) | `missing_info` — chỉ cần khi có domain riêng (MI-18) |

## 6. Cần khách xác nhận

| # | Câu hỏi / dữ liệu thiếu | Hỏi ai | Trạng thái |
|---|---|---|---|
| 1 | Chọn phương án giao diện A (pa1) hay B (pa2), kèm mức icon / thẻ (G2, Q-58, MI-08) | Người vận hành / khách | Chờ |
| 2 | Có làm bản tiếng Anh không, ai dịch (MI-01) | Khách | Chờ |
| 3 | Logo gốc (MI-05); duyệt mã màu đề xuất (MI-24) | Khách | Chờ |
| 4 | ~~Chân dung độ phân giải cao (MI-06)~~ đã có (21/11/2026); quyền dùng ảnh có người khác, ghim BNI, logo Trường Phát (MI-07, MI-14); ảnh thật dự án Hạ Long Xanh / Làng Vân (đang dùng ảnh minh hoạ) | Khách | Chờ (MI-06 xong) |
| 5 | Tiểu sử, số liệu thành tích, feedback có đồng ý đăng tên, nội dung + ảnh dự án Hạ Long Xanh / Làng Vân, bài viết đầu tiên (MI-04, MI-13, MI-22) | Khách | Chờ |
| 6 | Email liên hệ (MI-10); mạng xã hội; khu vực / địa chỉ hiển thị | Khách | Chờ |
| 7 | Dịch vụ là khối hay trang riêng; có trang Đối tác không (MI-03) | Khách | Chờ |
| 8 | Mã GA4 / GTM / Search Console; nội dung chính sách bảo mật (MI-16) | Khách | Chờ |
| 9 | Tên miền chính, www / non-www (MI-18); email mời vào Sanity (MI-17) | Khách | Chờ |

## 7. Lệch chuẩn (đã duyệt)

Mỗi lần làm khác luật **NÊN** hoặc **PHẢI** đều ghi vào đây. Luật **PHẢI** chỉ được lệch khi người vận hành duyệt.

| Mã luật | Làm khác thế nào | Lý do | Người duyệt · ngày |
|---|---|---|---|
| KT-04 (NÊN) | Không dùng `src/`; thư mục gốc `app/ components/ lib/ templates/ sanity/ seed/` | Theo cấu trúc trong build_plan đã duyệt cùng G2 | Chờ duyệt |
| KT-06 (PHẢI — cách làm, không nới luật) | 404 cho URL không khớp dùng `app/global-not-found.tsx` (cờ `experimental.globalNotFound`) thay vì catch-all `[...rest]` + `notFound()` | Hai root layout (vi / en): `notFound()` trong page chỉ render 404 phía client (HTML rỗng) trên Next 16.4.6; global-not-found trả 404 kèm HTML đầy đủ. Trang có slug ở bước sau nên dùng `generateStaticParams` + `dynamicParams = false` | Chờ duyệt |
| Kế hoạch T1.7 | CSP tĩnh trong `next.config.ts` (`script-src 'self' 'unsafe-inline'`), không nonce | Nonce buộc mọi trang render động, trái KT-02 (trang tĩnh); site không có script bên thứ ba | Chờ duyệt |
| Kế hoạch BP-02 | Tên biến theo chuẩn KT-11: `NEXT_PUBLIC_SITE_URL`, `SANITY_SOURCE`, `ALLOW_INDEXING=1` (thay cho `SITE_URL`, `CONTENT_SOURCE`, `ALLOW_INDEXING=true` trong build_plan); giữ `CONTENT_MODE`, `SITE_LANGUAGES`, `SEED_FILE` | Khớp handler DigiForge và luật SEO-01 | Chờ duyệt |
| Kế hoạch meta.stack | Next.js 16.4.6 thay vì 15.5 | Chuẩn yêu cầu Next 16 (KT-07) | Chờ duyệt |
| BP-03 | `/studio` trả 200 với thông báo «Chưa bật CMS» (noindex) thay vì 404 khi chưa có project Sanity | Theo chỉ dẫn bước dựng khung | Chờ duyệt |
| design_tokens pa1 `focus-ring` | Vòng focus trên nền sáng dùng emerald-700, trên nền tối gold-300 (thay gold-400) | gold-400 trên ngà chỉ ~1,9:1, dưới 3:1 của WCAG 1.4.11 | Chờ duyệt |
| KT-06 (PHẢI — phần còn lại) | `?trang=N` sai / vượt số trang ở `/bai-viet`: HTTP 404 + noindex đúng, nhưng HTML server là khung lỗi; giao diện 404 (header / footer, Zalo) hiện sau hydrate | Next 16.4.6 với hai root layout: `notFound()` trong trang không được boundary not-found bắt khi SSR (đã thử not-found ở `(site)` và ở root layout, catch-all — đều ra `__next_error__`). Chi tiết dự án / bài dùng `dynamicParams = false` nên slug lạ vẫn ra 404 HTML đầy đủ. Thêm dự án / bài trong CMS cần build lại (deploy hook sau G5) | Chờ duyệt |
| seo_plan metadataDefaults | `siteSettings.seoDefaults.titleTemplate` trống → code dùng mẫu seo_plan «%s \| {brandName}» (trước đây: chỉ tiêu đề) | Đúng titlePattern từng template trong seo_plan; CMS điền mẫu thì CMS thắng | Chờ duyệt |
| REQ-28 / MI-14 | JSON-LD `jobTitle` bỏ phần đơn vị sau « \| » (vd. «… \| Trường Phát Group»); phần hiển thị giữ nguyên văn CMS | Tên tổ chức chưa được xác nhận cho JSON-LD | Chờ duyệt |
| Kế hoạch T2.5 | Fixture test ở `seed/fixtures/` (thay `tests/fixtures/`), chọn bằng `SEED_FILE=fixtures/seed-full.json` | Loader seed chỉ đọc trong `seed/` (giới hạn phạm vi đọc tệp / trace) | Chờ duyệt |
| content_model.groq_queries | Giữ 9 câu; thêm `_updatedAt` cho settings / projectList / postList (lastmod sitemap) và 3 câu hạ tầng (menu, đếm bài, thông tin ảnh). Ảnh gắn url / kích thước bằng MỘT truy vấn asset chung sau truy vấn chính, thay vì `asset->` trong từng projection | Câu `page` trả cả document nên không deref ảnh trong GROQ được; cách này giống hệt cho seed và Sanity | Chờ duyệt |
| content_model.i18n | Plugin document-internationalization chỉ áp cho `project`, `post`, `testimonial`; trang tĩnh mở bản vi / en theo `_id` cố định `<type>-<lang>` trong structure | Plugin tạo bản dịch với `_id` ngẫu nhiên, trái D-05 | Chờ duyệt |
| Kế hoạch T2.7 | Câu `testimonials` (content_model) lọc `consentConfirmed == true` ở mọi chế độ → bản xem trước cũng không hiện cảm nhận chưa đồng ý | Theo đúng câu GROQ đã duyệt; chặt hơn là an toàn (D-10) | Chờ duyệt |
| Kế hoạch T5.6 | ID đo lường đọc từ env (`NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA_ID`, `GOOGLE_SITE_VERIFICATION`) thay vì `siteSettings.integrations` trong CMS | TR-01 (ID chỉ từ env, đổi ID phải redeploy) + chỉ dẫn bước tracking; ID nhập ở thẻ Cấu hình dự án, env đặt ở lần áp cấu hình sau G6 | Chờ duyệt |
| Kế hoạch T5.6 (MI-16) | Đã dựng dataLayer cho nút Zalo / gọi (`click_zalo`, `click_phone`) trước khi khách trả lời MI-16 | Theo chỉ dẫn bước tracking. Sự kiện chỉ nằm trong bộ nhớ trình duyệt, không gửi đi đâu cho tới khi có ID trên production; không PII | Chờ duyệt |
| LD-05 (PHẢI — phần nguồn truy cập) | UTM **first-touch** (bộ utm_* đầu tiên, 30 ngày, không ghi đè) lưu `localStorage` key `th_first_touch` thay vì cookie «last non-direct»; không lưu click ID | Site không có form lead nên LD-05 không áp trọn; người vận hành yêu cầu first-touch. `localStorage` không gửi lên server theo mỗi request; click ID để GA4 / GTM tự đọc từ URL | Chờ duyệt |
| Kế hoạch T1.7 (CSP) | Khi tracking bật (production + ID) CSP thêm `https://www.googletagmanager.com` (script), `*.google-analytics.com`, `*.analytics.google.com`, `*.googletagmanager.com` (connect / img); không bật thì CSP giữ nguyên, không host ngoài | Cần cho GTM / GA4; tính lúc build từ cùng hàm `resolveTracking` với chỗ nhúng | Chờ duyệt |
| Ảnh hero (client_photos) | Hero dùng `portrait-navy-cutout.png` (1280×1920), bản tách nền (alpha) làm từ `portrait-navy.jpg` (bản gốc 1707×2560 khách gửi 21/11/2026) bằng flood-fill nền trắng. Ảnh gốc giữ nguyên byte; bản tách nền chỉ là bản phái sinh | Mockup đặt chân dung trực tiếp trên nền emerald, không khung | Chờ duyệt |
| Chiến lược ảnh (client_photos) | Thêm ảnh tự do `stock-ha-long-bay-*.jpg` (Wikimedia Commons, Vyacheslav Argenberg, CC BY 4.0) cho ảnh đại diện Hạ Long Xanh và ô ảnh thứ hai khối «Về tôi»; minh hoạ vector `illus-lang-van.png` cho Làng Vân. Chú thích ghi rõ «minh hoạ, không phải ảnh dự án» + nguồn; hai loại này bật `usageApproved` (giấy phép cho phép), ảnh khách vẫn chờ MI-07 | Khách chưa có ảnh dự án thật; người vận hành cho phép «tạo hoặc lấy ảnh mẫu tự do» (22/11/2026). Thay khi có ảnh thật | Chờ duyệt |

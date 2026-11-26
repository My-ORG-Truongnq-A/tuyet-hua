# 10 · Tracking & analytics (`TR`)

DigiForge chỉ nhận ID (GTM / GA4 / Search Console) do người vận hành nhập (Q-15); để trống thì không nhúng gì.

ID nhập ở thẻ **Cấu hình dự án** của DigiForge, lúc tạo dự án hoặc bất cứ lúc nào (Q-118; v7: bước Release — Q-106), nhưng chỉ bật trên production ở lần áp cấu hình sau G6:
- bản build local và bản demo chưa qua G6 không nhúng tracking — kể cả khi ID đã được nhập sớm (lúc phát hành bản demo DigiForge không đọc ID mới, chỉ áp lại cấu hình đã áp ở lần gần nhất sau G6); code vẫn dựng sẵn chỗ nhúng, đọc ID từ env;
- ở Release (sau G6) và mỗi lần lưu lại ID sau đó, `vercel.go_live` đặt env theo ID đã nhập rồi deploy lại ([GL-03](12-go-live.md#gl-03)); env đã đặt mà nay không còn giá trị thì bị gỡ;
- `check.release` đối chiếu trên production: có GTM ID thì HTML hoặc bundle JS cùng origin chứa ID đó; có GA4 ID mà không có GTM thì HTML hoặc bundle JS cùng origin chứa GA4 ID; có mã Search Console thì HTML có thẻ `google-site-verification` đúng giá trị.

Mục tiêu tracking:
- đo đúng lead và click liên hệ;
- không đếm trùng;
- không làm chậm trang;
- không gửi dữ liệu cá nhân.

<a id="tr-01"></a>
### TR-01 · Một đường nạp, ID từ env, chỉ ở production thật — PHẢI
- Chọn **một** cách nạp: **GTM-only** (GA4 và các pixel cấu hình trong container; mặc định) hoặc gtag trực tiếp. KHÔNG chạy cả hai.
- ID chỉ lấy từ env (`NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_OPENAI_PIXEL_ID`…). Env trống thì không nhúng.
- KHÔNG fallback ID thật trong code hay README.
- Cổng production dùng `VERCEL_ENV === "production"`, không dùng `NODE_ENV`: preview của Vercel cũng là `NODE_ENV=production` nên sẽ bắn dữ liệu rác.
- Không nhúng tracking trong `/studio`.
- Đổi ID thì phải redeploy ([GL-03](12-go-live.md#gl-03)).
- Nạp trễ theo [HN-05](05-hieu-nang.md#hn-05).
- **Nguồn:**
  - `P8`: `GA_ID ?? "<id thật>"`.
  - `P3`: ID cứng + cổng `NODE_ENV`.
  - `P6`: `GoogleAnalytics gaId` cứng, không có event.
  - `P7` `docs/tracking.md`.

<a id="tr-02"></a>
### TR-02 · `generate_lead` chỉ khi lead đã giao — PHẢI
- `generate_lead` được đẩy vào `dataLayer` (hoặc `gtag`) **chỉ khi server trả `ok`** và có lead.
- Tham số: `form_name` / `form_type`, `page_path`. Không có PII.
- Chống đếm đúp: cờ theo `requestId`. Effect không bắn lại khi remount.
- **Ngoại lệ có điều kiện** — chế độ demo ([LD-01](09-lead.md#ld-01), chỉ khi `isDryRun` đúng): lead không được giao nhưng form vẫn đẩy `generate_lead` sau phản hồi `ok` để QA kiểm được luồng (`check.forms` trên bản build local). Vì vậy production còn ở chế độ demo mà đã có ID tracking thì lượt gửi thử vẫn vào GA4: chưa đánh dấu chuyển đổi / chưa nối Ads khi đích lead chưa cấu hình.
- Chuyển đổi Ads lấy từ cùng sự kiện này. KHÔNG nhập `generate_lead` từ GA4 sang Ads làm chuyển đổi chính khi Ads đã có tag riêng (đếm trùng).
- Trước khi chuyển từ site cũ: kiểm kê trigger GTM phụ thuộc DOM / URL cũ (popup, `/thank-you/`) và sửa trong workspace riêng. Ghi lại version để rollback.
- **Nguồn:**
  - `P1 801acd1`: v2 quên `generate_lead`.
  - `P2 1609a65`: Ads mất chuyển đổi sau go-live; `docs/gtm/`.
  - `P5 ade70e8`; `P8` `use-lead-event.ts`; `P3 d88892b`.

<a id="tr-03"></a>
### TR-03 · Bảng sự kiện chuẩn — PHẢI
- Chốt bảng "nút → sự kiện → tham số" **trước khi code**, ghi vào `docs/tracking.md` của repo. Tên dùng chung mọi site:

| Sự kiện | Khi nào | Tham số (không PII) |
|---|---|---|
| `generate_lead` | Server xác nhận đã giao lead | `form_name`, `form_type`, `page_path` |
| `click_phone` | Bấm `tel:` | `link_location`, `page_path` |
| `click_zalo` | Bấm `zalo.me` | `link_location`, `page_path` |
| `click_messenger` / `click_fanpage` | Bấm `m.me` / fanpage | `link_location` |
| `click_email` | Bấm `mailto:` | `link_location` |
| `click_directions` | Bấm link bản đồ | `link_location` |
| `cta_click` | Bấm CTA chính (báo giá / đặt lịch / dùng thử) | `cta_location`, `cta_text` |
| `view_item` / `view_item_list` | Xem sản phẩm / danh sách (site sản phẩm) | `item_id`, `item_category` |

- Click liên hệ đo bằng **một listener ở `document`** (pha capture), phân loại theo `href`. `link_location` lấy theo thứ tự: `data-track-area` › id section › `aria-label`. Thêm nút mới đúng định dạng thì tự được đo.
- KHÔNG dùng tên lệch (`click_call` thay `click_phone`).
- KHÔNG gửi tham số tự đặt trùng nghĩa với tham số chuẩn GA4 (`link_url` tự đặt).
- Key event: `generate_lead`, `click_phone`, `click_zalo`. Tạo custom dimension (scope Event) cho `form_type`, `link_location`, `cta_location`, `utm_*`; chờ 24–48 giờ.
- Giao kèm file import GTM (`exportFormatVersion: 2`, Merge): tag Google, trigger Custom Event regex `^(generate_lead|click_.+|cta_click)$`, biến Data Layer.
- **Nguồn:** `P7` `lib/analytics.ts`, `ContactClickTracker.tsx`, `docs/gtm-container-import.json`; `P5` `docs/gtm-container-*.json`; `P8`: tên lệch; `P3 22443e1`.

<a id="tr-04"></a>
### TR-04 · Không mất sự kiện khi điều hướng — PHẢI
- Bấm CTA rồi điều hướng cùng tab khi gtag chưa tải xong:
  - giữ điều hướng, bắn sự kiện kèm `event_callback`, chờ tối đa 3 s rồi mới đi;
  - huỷ chờ khi có `popstate` / `pagehide` / click khác.
- SPA:
  - page view theo `pathname + search`;
  - Meta Pixel đặt `disablePushState = true`, `allowDuplicatePageViews = true`, gọi `ensureFbq()` trước PageView, có `<noscript>`.
- Fragment chứa bí mật (`#token`) phải **cắt khỏi `page_location`** gửi đi.
- **Test theo hành vi:** đổi query, Back / Forward, hash, bấm giữa chừng, mạng chậm, gtag bị chặn.
- **Nguồn:** `P3 f79bbe4`, `22443e1`, `d88892b`; `P4 995f299` + test.

<a id="tr-05"></a>
### TR-05 · Consent và quyền riêng tư — PHẢI
- **Pixel quảng cáo / remarketing** (Meta, TikTok, Google Ads remarketing, OpenAI) **chỉ chạy khi người dùng đồng ý**, theo Luật 91/2025 + NĐ 356/2025, hiệu lực 01/01/2026 ([BM-07](11-bao-mat-phap-ly.md#bm-07)). Khi chưa có CMP thì để Pause.
  - Consent Mode v2 của Google: NÊN cài, mặc định `denied`. Không bắt buộc theo luật VN; bắt buộc nếu có traffic EEA / UK.
- KHÔNG gửi PII vào analytics: tên, SĐT, email, tình trạng sức khoẻ, nội dung người dùng gõ, URL đích của link người dùng tạo.
  - Dùng "bucket" thay số thô khi cần.
- KHÔNG chạy pixel có **automatic advanced matching** trên trang có ô nhập dữ liệu cá nhân của người khác. Tính năng này băm rồi gửi email / SĐT trong ô nhập.
- Chính sách quyền riêng tư PHẢI **khớp script thực sự được nạp**. Thêm bên thứ ba thì tăng version chính sách.
- **Nguồn:**
  - `P2` TASKS #11, #12: Pixel Pause chờ consent.
  - `P4 eeb36e4`: tắt pixel ở trang QR.
  - `P6 WEB-14` (PII trong GA4), `P6 WEB-13` / `KT-19` (chưa có consent).
  - `P3 5023a35`, `8a0fd2f`.
  - `P4`: copy "chỉ dùng GA" lệch với pixel.
  - [web] Luật 91/2025, Consent Mode.

<a id="tr-06"></a>
### TR-06 · Pixel quảng cáo khi khách chạy ads — TUỲ CHỌN
- **Meta Pixel:** qua GTM hoặc component riêng theo [TR-04](#tr-04). Thêm Conversions API khi chạy nhiều; dedupe bằng `event_id`.
- **Pixel ChatGPT Ads (OpenAI):** mở ở Việt Nam từ 23/09/2026 ([web]).
  - `init` + `page_viewed` thủ công.
  - Sự kiện GA4 chuyển thành `custom` cùng tên (1–64 ký tự `[a-z0-9_-]`).
  - Nạp SDK ngay khi URL có `oppref`.
  - Thêm host vào CSP.
- Mọi pixel đi qua cùng lớp `dataLayer` với `event_id` dùng chung, và qua consent.
- **Nguồn:** `P3 4aad503`, `src/lib/openai-pixel.ts` + test; `P4 eeb36e4`.

<a id="tr-07"></a>
### TR-07 · Kiểm tracking — PHẢI
- Trước Publish GTM: Tag Assistant Preview.
- Sau khi Release áp cấu hình (khi có GTM / GA4): gửi form thật, thấy `generate_lead` ở GA4 Realtime / DebugView. Không có quyền Admin thì kiểm request `g/collect`.
- QA headless PHẢI chặn host analytics (host-resolver về 127.0.0.1), nếu không sự kiện test lọt vào GA thật.
- Bàn giao ghi rõ: dữ liệu GA4 trễ 24–48 giờ; "First-user source" khác "Session source".
- **Nguồn:** `P1` audit 8.3; `P2` TASKS #13; `P3` (tài liệu 12/11).

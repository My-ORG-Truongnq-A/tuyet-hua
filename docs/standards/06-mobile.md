# 06 · Mobile & responsive (`MB`)

Phần lớn khách và lead đến từ điện thoại. Google index theo bản mobile, nên nội dung, heading, structured data và meta PHẢI tương đương desktop ([web] mobile-first indexing). Thiết kế bắt đầu từ 360–390 px.

<a id="mb-01"></a>
### MB-01 · Viewport và cấu hình iOS — PHẢI
- `export const viewport = { width: "device-width", initialScale: 1, themeColor }`.
- KHÔNG khoá zoom (`user-scalable=no`, `maximum-scale=1`).
- Trang có form hoặc chat: NÊN `interactiveWidget: "resizes-content"`.
- `formatDetection: { telephone: false, address: false, email: false }`.
  - Lý do: Safari tự bọc chuỗi số (MST, SĐT) thành link `tel:` và gây hydration lỗi #418.
- `browserslist`: `iOS >= 14, Safari >= 14`. Thiếu khai báo này, ES2022 không được transpile và nút chết trên iPhone.
- `-webkit-text-size-adjust: 100%`.
- Input có `font-size` ≥ 16 px để iOS không tự zoom khi focus.
- **Nguồn:**
  - `P3 02274f5` (#418).
  - `P3 9a8c6eb`: nút chết trên iPhone 13 Pro.
  - `P3 cecfbca`.
  - `P2` `layout.tsx`.

<a id="mb-02"></a>
### MB-02 · Không tràn ngang ở 280–2560 px — PHẢI
- `html, body { overflow-x: clip }`, nhưng vẫn phải sửa nguồn gây tràn: `min-width` của hero, ảnh, bảng, chip dài.
- Dữ liệu dài hoặc rác từ CMS (tên chuyên mục, chip) không làm vỡ layout.
  - Chip / filter dài thì xếp **một hàng cuộn ngang** (snap đúng mép, fade mép phải), hoặc wrap.
  - Validation giới hạn độ dài tên chuyên mục.
- Bảng trong bài cũ đặt trong khung cuộn ngang.
- **Kiểm** ([QA-05](13-kiem-thu.md#qa-05)): `scrollWidth === innerWidth` ở mọi viewport của ma trận.
- **Nguồn:**
  - `P1 2547c63`: chip chuyên mục tràn mobile.
  - `P3 fb0bb4e`: hero `min-width`.
  - `P2`: e2e "chips stay on one swipeable row".
  - `P8 8785ffb`.

<a id="mb-03"></a>
### MB-03 · Thanh liên hệ cố định đáy trên mobile — PHẢI
- Dưới `md`, thanh cố định gồm 2–3 nút: **Gọi** (`tel:`) · **Zalo** (`https://zalo.me/<số hoặc OA>`) · **CTA chính** (Nhận báo giá / Đặt lịch / Tư vấn).
  - Nhãn nằm trên một dòng, `min-height` ≥ 46 px.
  - Mỗi nút bắn event ([TR-03](10-tracking.md#tr-03)).
- Có `padding-bottom: env(safe-area-inset-bottom)`.
- `body` / footer chừa đáy bằng chiều cao thanh + safe-area, để không che nội dung cuối.
- Desktop: bong bóng hoặc dock ở góc, có nút về đầu trang (chỉ hiện khi đã cuộn).
- Chat widget / popup / nút nổi **không chồng nhau**: tối đa 2 lớp nổi cùng một cạnh.
  - Ưu tiên tuỳ chọn vị trí của widget.
  - Chỉ khi widget không có tuỳ chọn mới vá offset trong Shadow DOM (`MutationObserver`). Cách này mong manh, phải có test.
- Gọi nhiều số thì mở bộ chọn số (đóng bằng Esc hoặc chạm ngoài).
- Nút nổi tự ẩn khi chồng lên hero có logo trong ảnh.
- **Nguồn:**
  - `P1` `Contact.tsx`, `ad1fed0`, `55ca853`.
  - `P8` `StickyCTA`, `ChatWidgetOffset`.
  - `P5` `StickyCTA`.
  - `P7` `FloatingContacts`.
  - `P2` audit U8: CTA duy nhất là bong bóng phải bấm mới mở.

<a id="mb-04"></a>
### MB-04 · Drawer / menu mobile — PHẢI
- Render qua **portal ra `document.body`**. Header có `backdrop-filter` / `transform` trở thành containing block, làm `position: fixed` bị cắt.
- Chiều cao `100dvh`. Khoá cuộn `body` khi mở.
- Đóng khi bấm link, kể cả link chỉ đổi query (`?category=`). Bám theo `pathname` sẽ không bắt được trường hợp này.
- Khi đóng: `inert`, không chỉ `aria-hidden`. Focus trap, Esc đóng, trả focus về nút mở ([TC-03](08-tiep-can.md#tc-03)).
- Portal chỉ render sau `useEffect`: dùng `typeof window` sẽ gây hydration mismatch.
- **Nguồn:**
  - `[Chung] 8eea717`: `P5` / `P6` / `P8` cùng gặp.
  - `P1 3cf05a9` (e2e chiều cao drawer > 600 px).
  - `P8 07305bb`.
  - `P5 7e19ff1` (`inert`).
  - `P3 cecfbca`.

<a id="mb-05"></a>
### MB-05 · Vùng chạm — PHẢI ≥ 24 px, NÊN ≥ 44 px
- **PHẢI** tối thiểu **24×24 px** (WCAG 2.2 AA 2.5.8).
- **NÊN ≥ 44×44 px** (Apple HIG / WCAG 2.5.5 AAA) cho: nút CTA, menu / đóng, icon mạng xã hội, phân trang, sắp xếp, mũi tên và chấm carousel, nút chia sẻ, breadcrumb.
- Khoảng cách giữa các vùng chạm ≥ 8 px.
- Miễn trừ: link nằm trong đoạn văn.
- Icon 16 px bọc trong vùng 24–44 px.
- **Nguồn:** `P8 8785ffb` ("44px tap targets"); `P2 2bd1610`; `P2` U12: chấm slider 8×8, nút đóng 25 px; [web] WCAG 2.2.

<a id="mb-06"></a>
### MB-06 · Thiết kế mobile riêng, không thu nhỏ desktop — NÊN
- Hero: cắt ảnh giữ chủ thể / slogan, dùng art direction ([HN-03](05-hieu-nang.md#hn-03)).
  - Hero có logo / chữ trong ảnh thì có safe-zone cho cột chữ.
  - Dưới breakpoint hiện nguyên ảnh dưới nội dung, không crop mất logo.
- "Xem tất cả" là nút full-width đặt dưới carousel.
- Carousel lộ một phần item kế tiếp, bỏ hàng 20+ chấm.
- Tắt overlay hover trên màn cảm ứng: dùng `@media (hover: hover)`, vì overlay bị dính sau khi chạm.
- Footer dạng accordion. Marquee logo thay bằng lưới tĩnh.
- KHÔNG dùng `scroll-snap: mandatory` cho cả trang (cuộn bị khựng). KHÔNG dùng Lenis trên mobile.
- `100dvh` / `svh` (có fallback `vh`) cho khối full-height. Không dùng `100vh`.
- Header trên hero tối: không blur ở first paint.
- **Nguồn:**
  - `P2 1363d94`: trang chủ mobile "loạn".
  - `P7 b6a5de7`…`dc39c00`: hero 4 vòng.
  - `P5 ed8f41f`, `e8c61dc`.
  - `P3 f71cf78`.

<a id="mb-07"></a>
### MB-07 · Bảng thông số trên mobile là thẻ — PHẢI (site B2B / sản phẩm)
- Dưới `md`: mỗi biến thể là một thẻ `<dl>` (`grid-cols-[auto_minmax(0,1fr)]`). Từ `md`: `<table>` có `<caption>` và `th scope`.
- KHÔNG bắt người dùng kéo ngang mới thấy cột quan trọng.
- **Nguồn:** `P7 2f95dfa` `SpecTable.tsx`.

<a id="mb-08"></a>
### MB-08 · Bàn phím ảo không che form — NÊN
- Khi input được focus, thanh cố định ẩn đi hoặc dịch lên (`visualViewport` / `focusin`). Thông báo lỗi vẫn nhìn thấy.
- Kiểm tay trên iPhone Safari và Android Chrome.
- **Nguồn:** `P1` audit 5.5 (đã yêu cầu nhưng chưa làm).

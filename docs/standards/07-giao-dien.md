# 07 · Giao diện hiện đại (`GD`)

Mục tiêu:
- Giao diện có bản sắc, nhanh, nhất quán.
- Đổi palette hay cỡ chữ không phải sửa từng component.
- Không sửa đi sửa lại vì chưa chốt hướng.

<a id="gd-01"></a>
### GD-01 · Chốt hướng giao diện và mockup TRƯỚC khi code — PHẢI
- Trước khi code, khách chốt (gate G2):
  - **độ trung thành:** giữ nguyên site cũ (parity 1:1) / làm mới / thiết kế lại;
  - **phạm vi motion:** không / nhẹ / nhiều, áp ở trang nào;
  - **palette, typography;**
  - **mockup** 1440 + 390 px cho trang chủ và 1–2 template.
- Thay đổi lớn đưa 2–3 phương án. Không để AI tự chọn "vì được bảo làm xong không hỏi".
- Thay đổi thị giác lớn (hero, logo) đưa người duyệt trên **bản build local / bản xem thử** (DigiForge v8 — trước G5; sau phát hành: preview của PR) kèm ảnh 375 / 1440 / 1920. Duyệt rồi mới merge.
- "Chép UI cũ" thì chép cả hành vi JS (animation khi cuộn, số đếm), không chỉ HTML / CSS.
- **Nguồn:**
  - `P1`: UI làm 3 lần trong 4 ngày (`35034b5` → `7fb2e9f`), hero 5 vòng.
  - `P7`: hero 4–6 vòng.
  - `P6`: 5 palette trong 3 ngày (`65f42c4`…`6624081`).
  - `P2`: motion làm lại 5 vòng.
  - `P1 24a5076`.

<a id="gd-02"></a>
### GD-02 · Một tệp token là nguồn duy nhất — PHẢI
- Tệp `styles/tokens.css` (Tailwind v4 `@theme`, hoặc `:root` cho CSS Modules) gồm:
  - **màu:** `--color-brand`, `--color-brand-ink` (đậm, dùng cho chữ trên nền trắng), `--color-accent`, `--color-ink`, `--color-muted`, `--color-surface`, `--color-line`, `--color-danger`, `--color-success`;
  - **chữ:** thang 8–10 bậc dùng `clamp()`, có line-height / weight / tracking;
  - **hình khối:** `--radius-*`, `--shadow-*`;
  - **bố cục:** `--container-site`, `--header-h`, `--gutter`.
- Component chỉ dùng token. KHÔNG có hex rải rác, KHÔNG có ~30 cỡ chữ lẻ đo từng pixel từ ảnh.
- Ghi **mục tiêu tương phản** ngay trong comment token. Tối thiểu theo [TC-04](08-tiep-can.md#tc-04): chữ thường ≥ 4,5:1, kể cả chữ muted và chữ trắng trên accent. Các site cũ đặt heading / body cao hơn nhiều (`P5` ~17:1 / ~10:1).
- Đổi palette chỉ đổi **giá trị**, giữ nguyên **tên biến**.
- Tailwind v4:
  - KHÔNG sinh class nội suy (`bg-${x}`); dùng map class đầy đủ;
  - biến `@theme` dùng trong arbitrary value phải bọc `var()`;
  - giới hạn `@source` (`source(none)` + `@source "../"`) để không quét Studio.
- Dark mode: TUỲ CHỌN. Có thì đặt token riêng cho chữ phụ và kiểm tương phản lại.
- **Nguồn:**
  - `P7` `tokens.css` (cảnh báo ~30 cỡ chữ).
  - `P5` / `P8` `theme.css` (ghi contrast target).
  - `P1` `styles/v2/base.css`.
  - `[Chung] 7b17224`.
  - `P4` `tokens.css`.

<a id="gd-03"></a>
### GD-03 · Typography tiếng Việt — PHẢI
- Font có **đủ glyph tiếng Việt**: kiểm bằng chuỗi "Ầ Ẩ Ẫ Ậ Ế Ể Ễ Ệ Ố Ồ Ổ Ỗ Ộ Ớ Ờ Ở Ỡ Ợ Ứ Ừ Ử Ữ Ự đ".
- Tối đa 2 họ font (tiêu đề + thân), cộng mono nếu cần. Thân bài ≥ 16 px.
- Heading `text-wrap: balance`, đoạn `text-wrap: pretty`, để không mồ côi một chữ.
- Hiệu ứng `clip` trên chữ phải mở rộng vùng clip, để dấu trên chữ hoa (Ấ, Ữ) không bị cắt khi line-height chặt.
- `scroll-padding-top` = chiều cao header (đã thu gọn) cho anchor.
- Chữ trên nền trắng dùng sắc độ đậm của brand, không dùng màu mảng (một màu xanh lá sáng từng chỉ đạt ~2,6:1).
- **Nguồn:**
  - `P5 c85142b` ("uncut Vietnamese diacritics").
  - `P3 93a117d`: font mặc định vỡ dấu.
  - `P1` REQ-77; `P1` audit 5.2.

<a id="gd-04"></a>
### GD-04 · Motion có quy chuẩn — PHẢI
- Một bộ easing / duration / stagger dùng chung (`lib/motion.ts` hoặc biến CSS).
- **Reveal:**
  - ≤ 0,45 s, dịch 16 px;
  - kích hoạt khi còn cách đáy viewport ~25 % (không phải `-12%`, vì cuộn nhanh sẽ gặp khoảng trắng);
  - chỉ `opacity` / `transform`.
- KHÔNG reveal phần tử LCP ([HN-02](05-hieu-nang.md#hn-02)).
- Reveal treo vào class `html.js`:
  - đặt bằng script inline ES5 trong `<head>` trước first paint;
  - có đường lui: 3 s sau `load` mà JS chưa chạy thì gỡ `js`;
  - KHÔNG dùng `@media (scripting)` (chỉ từ Chrome 120) hay `:has()` để điều khiển reveal.
- `prefers-reduced-motion: reduce`: bỏ travel / zoom / parallax / smooth scroll, giữ fade rất ngắn.
  - Lưu ý: tắt hẳn mọi chuyển động có thể khiến khách tưởng site "không có animation", vì nhiều máy Windows / Android bật cờ này mặc định. Đây vẫn là yêu cầu WCAG, không bỏ.
- KHÔNG animate tổ tiên của phần tử có `mix-blend-mode`: blend bị cô lập trong lúc animate.
- KHÔNG scale / parallax ảnh vượt kích thước master. Chỉ zoom ngắn rồi trả về cỡ gốc.
- Hover-only chỉ áp trên thiết bị có hover.
- **Nguồn:**
  - `P7 2f95dfa`: 0,7 s → 0,45 s, 24 → 16 px, `-12%` → `25%`, "màn hình trắng".
  - `P2 7a9634e`, `26b336f`, `c02837d`, `da4ecd8`.
  - `P5` `choreography.ts`.

<a id="gd-05"></a>
### GD-05 · Bộ component tối thiểu — NÊN
- `Button` / `ButtonLink`, `SectionHeading` (eyebrow + title, nhận `as`), `Photo` (bắt buộc `sizes`), `Logo`, `PageHeader` (crumbs + hero), `Breadcrumbs`, `Faq` (`<details>` hoặc accordion có `aria-expanded`), `SpecTable`, `Card` (sản phẩm / bài / dự án), `ConsultBanner` / khối CTA cuối trang, `ContactRow`, `StickyCTA`, `Dialog` (`<dialog>` + focus trap), `Lightbox`, `Carousel` (scroll-snap + nút ≥ 44 px), `Pagination`, `JsonLd`, `LeadForm`.
- Mỗi section nhận dữ liệu từ cửa nội dung ([KT-01](01-kien-truc.md#kt-01)), không hard-code chữ.
- **Hero chỉ một CTA chính.** Mọi trang (trừ trang có form) kết thúc bằng khối liên hệ.
- Menu dropdown nằm sẵn trong HTML để crawler đọc được.
- **Nguồn:** `P7` `src/factory/components/*`; `P1` `components/v2/*`; `P5 1fb1df4`; `P3 8efaae0`.

<a id="gd-06"></a>
### GD-06 · Logo và tài sản thương hiệu — PHẢI
- Logo hiện **nguyên ảnh**: chỉ đặt chiều cao hoặc chiều rộng, không crop, không ghép chữ HTML vào.
- Một file master suy ra mọi favicon / icon / ảnh chia sẻ.
- Logo nằm trong link thì `alt` mô tả cả đích ("Logo <brand> — về trang chủ").
- Badge / logo đối tác và credit nhà phát triển chỉ đặt khi khách đồng ý.
- Brand DNA của khách lập thành tài liệu (bảng tài sản ảnh, bảng claim, kế hoạch duyệt) trước khi code.
- **Nguồn:** `P7 1d2243d`, `4bb585f`, `2f95dfa`; `P5 1430885` (`brand-dna-asset-inventory.md`); `P8 5f8281a`.

<a id="gd-07"></a>
### GD-07 · Vòng duyệt UI có ảnh — PHẢI
- Mỗi lần sửa UI: chụp desktop 1440 + mobile 390 (thêm 375 / 1920 với hero) → liệt kê các quyết định đã tự đưa ra → người duyệt xem ảnh.
- "Build thành công" không phải nghiệm thu.
- Chấm UI độc lập: người chấm không viết code và không đọc báo cáo của người làm (CLAUDE.md của DigiForge).
- **Nguồn:**
  - `P3`: popup chỉ lộ lỗi khi nhìn tận mắt.
  - `P7` spec nghiệm thu: AI báo "xong 10 slide", reviewer tìm thêm 12 lỗi.

# 08 · Accessibility (`TC`)

Chuẩn nền: **WCAG 2.2 AA** ([web] vẫn là Recommendation hiện hành; WCAG 3 mới là bản nháp, không dùng làm tiêu chí).

Mục tiêu:
- Lighthouse Accessibility ≥ 95 trên mọi template (`P2` đạt 98, `P8` 100);
- axe: 0 lỗi serious / critical.

<a id="tc-01"></a>
### TC-01 · Khung trang — PHẢI
- `<html lang="vi">`, hoặc theo ngôn ngữ của layout.
- Skip link "Bỏ qua, tới nội dung chính" ngay đầu `<body>`, trỏ tới `<main id="main" tabIndex={-1}>`.
- Landmark: `header`, `nav aria-label`, `main`, `footer`.
- `aria-current="page"` cho mục menu đang mở.
- `:focus-visible` rõ toàn site (outline 2–3 px màu brand, offset 2–3 px), kể cả khi CSS cũ có `outline: none`.
- Ảnh / SVG trang trí: `aria-hidden` hoặc `alt=""`.
- **Nguồn:** `P2 83c154f`; `P1` `SiteShell`; `P7` `layout.tsx`; `P4` `ToolPage.astro`; `P5` / `P6`: không có skip link.

<a id="tc-02"></a>
### TC-02 · Form tiếp cận được — PHẢI
- Mỗi ô có `<label htmlFor>` hiển thị. Placeholder không thay label.
- `autoComplete` đúng: `name`, `tel`, `email`, `organization`, `address-level1`.
- `type="tel"` + `inputMode="tel"`, `type="email"` + `inputMode="email"`.
- **Lỗi:**
  - ô sai có `aria-invalid` + `aria-describedby` trỏ tới dòng lỗi;
  - **focus vào ô lỗi đầu tiên**;
  - thông báo chung dùng `role="status"`; lỗi chặn gửi dùng `role="alert"`.
- Honeypot có `aria-hidden` + `tabIndex={-1}` + `autoComplete="off"`, KHÔNG nhận focus ([LD-04](09-lead.md#ld-04)).
- Input file không `display: none`: dùng visually-hidden + viền `:focus-within` cho label.
- Modal thành công không tự đóng; để người dùng tự đóng (`P2` từng tự đóng sau 2,2 s, screen reader chưa kịp đọc).
- **Nguồn:** `P1` `LeadForm.tsx`; `P2` `useLead.tsx`, U3, U14; `P7` `forms/shared.tsx`; `P5` thiếu `aria-describedby`.

<a id="tc-03"></a>
### TC-03 · Dialog, drawer, lightbox, accordion — PHẢI
- Dialog / drawer / lightbox:
  - **focus trap**, khi mở thì focus vào phần tử đầu;
  - **Esc đóng** và **trả focus** về nút đã mở;
  - khi đóng có `inert`.
- Nút icon có tên truy cập (`aria-label` "Đóng menu", "Gọi hotline", "Chat Zalo").
- Accordion / FAQ:
  - nút có `aria-expanded` + `aria-controls`;
  - vùng nội dung `role="region"` + `aria-labelledby`;
  - nội dung render sẵn, ẩn bằng `hidden`.
- **Kiểm:** e2e mở / đóng bằng bàn phím cho menu, dialog form, lightbox.
- **Nguồn:** `P2` `useFocusTrap.ts` + e2e; `P1` e2e drawer; `P5 7e19ff1`; `P3` `Accordion.tsx`.

<a id="tc-04"></a>
### TC-04 · Tương phản và màu — PHẢI
- Chữ thường ≥ 4,5:1, chữ lớn và thành phần UI ≥ 3:1.
- Kiểm cả trạng thái active / hover, badge, link footer.
- Không truyền thông tin chỉ bằng màu.
- **Nguồn:** `P2 U12`: màu vàng nhấn trên nền trắng chỉ ~2,5:1; `P8 8785ffb`: badge, link footer; `P1` audit 5.2.

<a id="tc-05"></a>
### TC-05 · Chuyển động và tự chạy — PHẢI
- Slider / marquee tự chạy có nút dừng (WCAG 2.2.2).
- Hiệu ứng tôn trọng `prefers-reduced-motion` ([GD-04](07-giao-dien.md#gd-04)).
- **Nguồn:** `P2`: slider tự chạy không có nút dừng.

<a id="tc-06"></a>
### TC-06 · Cấu trúc nội dung — PHẢI
- Heading đúng thứ bậc. Mỗi section có `aria-labelledby` trỏ tới heading của nó.
- Component nhận prop `headingLevel` / `as`.
- Bảng dữ liệu có `<caption>` (có thể `sr-only`) và `th scope`.
- Link có chữ mô tả đích, không dùng "Xem thêm" lặp lại mà không có ngữ cảnh.
- **Nguồn:** `P7` `san-pham/page.tsx`, `SpecTable`; `P2 2bd1610`.

<a id="tc-07"></a>
### TC-07 · Kiểm tự động — PHẢI
- e2e chạy `@axe-core/playwright` trên mỗi template, ở cả desktop lẫn mobile. Chặn khi có lỗi serious / critical.
- Lighthouse Accessibility ghi vào báo cáo hiệu năng ([HN-01](05-hieu-nang.md#hn-01)).
- **Nguồn:** `P1` audit 5 (đã yêu cầu nhưng chưa làm; a11y chỉ 92–94); `P3` / `P5` / `P6`: không có axe.

# FIXTURE — không dùng cho nội dung thật

Tệp ở đây chỉ phục vụ test / e2e (T2.5), chọn bằng `SEED_FILE=fixtures/seed-full.json` hoặc `fixtures/seed-empty.json`.
Nội dung thật của website nằm ở `seed/sanity/documents.json`.

- `seed-full.json`: dự án thứ 3, 1 bản nháp `drafts.*`, 4 bài (1 bài hẹn giờ tương lai, `postsPerPage = 2`),
  cảm nhận có / chưa có đồng ý, số liệu đã / chưa xác nhận, ảnh đã xác nhận quyền dùng, bản `en` cho trang chủ
  và một dự án (kèm `translation.metadata`), số điện thoại khác seed thật, một chuyển hướng.
- `seed-empty.json`: chỉ trường bắt buộc — kiểm khối tự ẩn.
- Sinh lại ảnh dùng chung: `pnpm seed:assets` (bảng `seed/sanity/assets.json`).

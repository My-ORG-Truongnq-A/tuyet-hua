# Hồ sơ dự án: <Tên khách>

> Mẫu điền cho **từng website**. Chép vào `docs/standards/00-du-an.md` của repo khách, rồi điền trước khi code.
> Agent đọc tệp này đầu tiên.
> Ô nào chưa có thông tin thì ghi `missing_info`, kèm người cần hỏi. KHÔNG tự điền ([ND-05](04-noi-dung-cms.md#nd-05)).

## 1. Doanh nghiệp (nguồn cho `siteSettings`, [GEO-03](03-geo.md#geo-03))

| Trường | Giá trị | Nguồn / người xác nhận |
|---|---|---|
| Tên thương hiệu (một tên dùng mọi nơi) | | |
| Tên pháp lý · MST · năm thành lập | | |
| Ngành · loại schema (`LocalBusiness` / `MedicalClinic` / `RealEstateAgent`…) | | |
| Cơ sở (địa chỉ đầy đủ · link Google Maps · giờ mở cửa) | | |
| Hotline chính (một số) · số phụ | | |
| Zalo (số / OA) · Fanpage · YouTube · LinkedIn · Google Business Profile | | |
| Giấy phép / chứng nhận (có số) | | |
| Logo master (file gốc) · màu thương hiệu | | |

## 2. Website

| Trường | Giá trị |
|---|---|
| Loại: mới / migration (URL site cũ) | |
| Mục tiêu chính: lead / gọi / đặt lịch / báo giá / bán hàng | |
| Ngôn ngữ: `vi` / `vi + en` ([SEO-16](02-seo.md#seo-16)) | |
| Host chính: `<slug>.vercel.app` (phase này) / domain riêng; apex hay www ([SEO-02](02-seo.md#seo-02)) | |
| Index: theo Q-25 (domain tạm noindex); domain riêng thì quyết định riêng | |
| Crawler AI: cho bot tìm kiếm + bot người dùng hỏi; bot huấn luyện cho / chặn ([GEO-01](03-geo.md#geo-01)) | |
| Nguồn nội dung production: Sanity (có Studio) / seed trong repo (không Studio) ([KT-01](01-kien-truc.md#kt-01), [ND-10](04-noi-dung-cms.md#nd-10)) | |
| Có giỏ hàng / thanh toán trực tuyến? ([BM-09](11-bao-mat-phap-ly.md#bm-09)) | |
| Ngành có điều kiện quảng cáo (y tế, thẩm mỹ, dược, tài chính, XKLĐ)? Giấy xác nhận? ([BM-08](11-bao-mat-phap-ly.md#bm-08)) | |
| Trang sản phẩm / chi tiết: index hay không ([SEO-18](02-seo.md#seo-18)) | |

## 3. Thiết kế (chốt ở G2, [GD-01](07-giao-dien.md#gd-01))

| Trường | Giá trị |
|---|---|
| Độ trung thành: giữ nguyên / làm mới / thiết kế lại | |
| Mockup đã duyệt (link, ngày, người duyệt) | |
| Phạm vi motion: không / nhẹ (mặc định) / nhiều (ghi lý do nếu dùng GSAP / Lenis, [HN-06](05-hieu-nang.md#hn-06)) | |
| Font (≤ 2 họ, đủ glyph Việt) | |
| Chiến lược ảnh: ảnh khách / AI / stock / kết hợp | |

## 4. Lead & tracking

| Trường | Giá trị |
|---|---|
| Có form lead? `LEAD_DESTINATION`: `digiagent_crm` / `sanity_gmail` (chưa có khoá đích → form chế độ demo ở mọi bản, [LD-01](09-lead.md#ld-01)) | |
| Form key CRM · `allowed_domains` đã thêm host? ([LD-02](09-lead.md#ld-02)) | |
| Email nhận lead (nếu Gmail) | |
| Các form: tên · trường · đích CTA | |
| GTM / GA4 / Search Console / pixel (để trống được, Q-15) | |
| Chat widget key (của chính dự án) | |
| Câu đồng ý + link chính sách (người duyệt pháp lý) ([BM-07](11-bao-mat-phap-ly.md#bm-07)) | |

## 5. Migration (nếu có)

| Trường | Giá trị |
|---|---|
| Nguồn kiểm kê URL: sitemap cũ / GSC / Wayback / backlink ([SEO-09](02-seo.md#seo-09)) | |
| Số URL cũ · tệp map redirect | |
| Tag / trigger tracking cũ đã kiểm kê ([TR-02](10-tracking.md#tr-02)) | |
| DNS: NS có thẩm quyền · MX / SPF đã chép ([GL-01](12-go-live.md#gl-01)) | |

## 6. Cần khách xác nhận

| # | Câu hỏi / dữ liệu thiếu | Hỏi ai | Trạng thái |
|---|---|---|---|
| 1 | | | |

## 7. Lệch chuẩn (đã duyệt)

Mỗi lần làm khác luật **NÊN** hoặc **PHẢI** đều ghi vào đây. Luật **PHẢI** chỉ được lệch khi người vận hành duyệt.

| Mã luật | Làm khác thế nào | Lý do | Người duyệt · ngày |
|---|---|---|---|
| | | | |

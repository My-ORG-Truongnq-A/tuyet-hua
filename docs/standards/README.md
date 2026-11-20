# Chuẩn website marketing (template tài liệu)

Bộ tài liệu này là **template của DigiForge cho website marketing** trong phase hiện tại. Phase này không dùng template repo `web-starter` (OPEN-QUESTIONS Q-12b, Q-61). Agent dựng mỗi website theo các luật ở đây. Người duyệt dùng [CHECKLIST.md](CHECKLIST.md) để nghiệm thu.

**Phạm vi:** website giới thiệu doanh nghiệp, dịch vụ, B2B, landing page và blog. Website có lead form, chạy SEO, cần được trích dẫn trên tìm kiếm AI (GEO), phần lớn khách vào từ điện thoại. Website bán hàng có giỏ hàng / thanh toán trực tuyến thì cần thêm luật thương mại điện tử: xem [BM-09](11-bao-mat-phap-ly.md#bm-09).

**Stack mặc định:**
- Next.js 16 (App Router), React 19, TypeScript.
- Sanity (gói Free) làm CMS — **tuỳ chọn theo dự án** (DigiForge v8, Q-118): không bật thì nội dung chạy từ seed trong repo, cùng truy vấn GROQ ([KT-01](01-kien-truc.md#kt-01), [ND-10](04-noi-dung-cms.md#nd-10)). Tailwind v4 hoặc CSS Modules dùng chung một tệp token.
- Deploy trên Vercel, dùng pnpm. Lập trình + kiểm thử chạy trên máy (repo git local, bản build production local); GitHub + Vercel chỉ cần từ lúc phát hành (sau G5).

Luật nào gắn với stack đều ghi rõ. Phần nguyên tắc vẫn đúng với stack khác.

## Nguồn

Mỗi luật rút từ **lỗi thật hoặc cách làm đã đo được** trong 8 website DigiForge đã làm (đọc code + lịch sử git ngày 16/11/2026). Mỗi luật có thêm phần đối chiếu với chuẩn hiện hành, tra trên web cùng ngày.

| Mã | Loại site |
|---|---|
| `P1` | Dịch vụ, nhiều bài viết, song ngữ, nhiều URL cũ phải giữ |
| `P2` | Bất động sản, dựng lại 1:1 từ hệ cũ |
| `P3` | Site công ty + blog |
| `P4` | Trang công cụ miễn phí (Astro) |
| `P5` | B2B sản xuất |
| `P6` | Y tế / thẩm mỹ (có bản audit) |
| `P7` | B2B nhà sản xuất |
| `P8` | Cửa hàng + dịch vụ, vài trăm sản phẩm |

Mã `P1`…`P8` là mã nội bộ, không trỏ tới khách cụ thể; bảng ánh xạ để ở `_nguon-noi-bo.md` (chỉ có trong repo DigiForge, không chép sang repo khách).

**Cách ghi nguồn:**
- `P1 36a3b0d` là commit trong repo `P1`.
- `P6 KT-01` là mục audit.
- `[web]` là chuẩn hiện hành tra ngày 16/11/2026, nguồn chính thức ghi ở [nguon-chuan-hien-hanh.md](nguon-chuan-hien-hanh.md).

## Mức của luật

| Mức | Nghĩa |
|---|---|
| **PHẢI** | Bắt buộc. Không đạt thì không qua nghiệm thu, không go-live |
| **KHÔNG** | Cấm. Mỗi luật cấm đều từng gây sự cố thật |
| **NÊN** | Mặc định. Muốn làm khác thì ghi lý do vào `docs/standards/00-du-an.md` của dự án |
| **TUỲ CHỌN** | Làm khi dự án cần |

Mỗi luật có mã (vd. `SEO-04`). Kết quả check, báo cáo QA và review đều trích theo mã này.

## Mục lục

| Tệp | Mã | Nội dung |
|---|---|---|
| [00-du-an.md](00-du-an.md) | — | **Mẫu điền cho từng dự án**: doanh nghiệp, NAP, domain, ngôn ngữ, đích lead, tracking, quyết định lệch chuẩn |
| [01-kien-truc.md](01-kien-truc.md) | `KT` | Cấu trúc repo, một cửa dữ liệu, cache + revalidate, env, repo sạch |
| [02-seo.md](02-seo.md) | `SEO` | Index theo host, canonical, metadata, sitemap, robots, URL cũ, heading, liên kết nội bộ |
| [03-geo.md](03-geo.md) | `GEO` | Tìm kiếm AI: crawler AI, thực thể + JSON-LD, nội dung dễ trích dẫn, `llms.txt`, đo trích dẫn |
| [04-noi-dung-cms.md](04-noi-dung-cms.md) | `ND` | Schema Sanity, trường SEO, ảnh + alt, claim có nguồn, migrate an toàn, seed là nguồn nội dung |
| [05-hieu-nang.md](05-hieu-nang.md) | `HN` | Core Web Vitals, ảnh LCP, font tiếng Việt, script bên thứ ba, motion nhẹ, cách đo |
| [06-mobile.md](06-mobile.md) | `MB` | Viewport, thanh CTA đáy, drawer, vùng chạm, iOS Safari, bảng trên mobile |
| [07-giao-dien.md](07-giao-dien.md) | `GD` | Token thiết kế, typography tiếng Việt, motion, hero, chốt hướng trước khi code |
| [08-tiep-can.md](08-tiep-can.md) | `TC` | Accessibility WCAG 2.2 AA |
| [09-lead.md](09-lead.md) | `LD` | Form lead: lưu trước báo sau, chống spam, nguồn lead, CTA, Zalo / hotline |
| [10-tracking.md](10-tracking.md) | `TR` | GTM / GA4, bảng sự kiện chuẩn, consent, pixel quảng cáo |
| [11-bao-mat-phap-ly.md](11-bao-mat-phap-ly.md) | `BM` | Header bảo mật, secret, webhook, dữ liệu cá nhân (Luật 91/2025), TMĐT, quảng cáo y tế |
| [12-go-live.md](12-go-live.md) | `GL` | Domain / DNS, env production, Search Console, theo dõi sau go-live, bàn giao |
| [13-kiem-thu.md](13-kiem-thu.md) | `QA` | Bộ test tối thiểu, e2e SEO, quét sitemap, 5 viewport, Lighthouse, review độc lập |
| [CHECKLIST.md](CHECKLIST.md) | — | Nghiệm thu theo mốc: G2 (thiết kế + kế hoạch), trước G5 (bản build local — Q-118), bản demo sau G5 (audit đo bằng công cụ — Q-92), Release / go-live chính thức (G6 — Q-106), sau go-live |
| [LOI-THUONG-GAP.md](LOI-THUONG-GAP.md) | — | Lỗi lặp lại ở nhiều repo, kèm luật phòng |
| [nguon-chuan-hien-hanh.md](nguon-chuan-hien-hanh.md) | — | Chuẩn bên ngoài đã xác minh (Google, OpenAI, Anthropic, W3C, luật VN), kèm độ chắc chắn |

## Cách dùng

**Agent dựng site:**
1. Bước `workspace.init_repo` (đầu stage Lập trình, repo git local — DigiForge v8) tự chép bộ tài liệu vào `docs/standards/` trên nhánh làm việc và commit (không ghi đè `00-du-an.md` đã điền); `AGENTS.md` / `CLAUDE.md` của repo trỏ tới đây. Sau G5 repo mới lên GitHub; bước nối repo (`workspace.checkout`) không chép lại bộ chuẩn.
2. Trước mỗi bước, đọc tệp tương ứng: dựng khung → `01`, `07`; schema → `04`; trang → `02`, `03`, `05`, `06`, `08`; form → `09`, `10`, `11`.
3. Không tự nới luật **PHẢI**. Gặp mâu thuẫn với yêu cầu của khách thì ghi vào mục "Lệch chuẩn" của `00-du-an.md`, kèm người quyết.

**Người duyệt:**
- Dùng `CHECKLIST.md` theo mốc.
- Mục nào chưa đạt thì trích mã luật.

**Cập nhật bộ chuẩn:**
- Gặp lỗi mới lặp lại ở site thứ hai thì thêm luật, kèm mã nguồn (repo + commit) và cách kiểm.
- Luật không còn đúng (vd. Google bỏ một rich result) thì sửa và ghi ngày vào `nguon-chuan-hien-hanh.md`.
- Lỗi cấp template sửa ở đây trước. Sau đó rà các site đang chạy còn mang lỗi cũ.

## Mười điều quan trọng nhất

Mỗi điều đều từng gây sự cố thật ở ít nhất hai repo:

1. **Một hằng `SITE_URL` = host cuối trả 200**, dùng cho canonical / OG / sitemap / JSON-LD / `llms.txt` ([SEO-02](02-seo.md#seo-02)). Lỗi này xảy ra ở `P6`, `P7`, `P8`, `P5`.
2. **Chỉ index khi production + cờ bật + đúng host, chặn bằng hai lớp** ([SEO-01](02-seo.md#seo-01)). Gặp ở `P1`, `P2`, `P7`.
3. **Lead lưu xong mới báo thành công. `generate_lead` chỉ bắn sau khi đã lưu** ([LD-01](09-lead.md#ld-01)). `P7` mất lead 13 ngày; `P1`, `P2` cũng gặp.
4. **Phần tử LCP hiển thị ngay từ HTML đầu tiên**: không fade / reveal / lazy ([HN-02](05-hieu-nang.md#hn-02)). Gặp ở `P5`, `P6`, `P2`, `P1`.
5. **Không framer-motion / GSAP / Lenis mặc định.** Reveal bằng IntersectionObserver + CSS ([HN-06](05-hieu-nang.md#hn-06)). `P8` gỡ đi thì điểm hiệu năng tăng từ 76 lên 96.
6. **URL cũ 301 một bước tới trang 200**, map từ dữ liệu đầy đủ, kiểm bằng script ([SEO-09](02-seo.md#seo-09)). Gặp ở `P1`, `P2`, `P6`, `P7`.
7. **NAP / dữ kiện doanh nghiệp một nguồn trong CMS.** Không hard-code, không bịa ([GEO-03](03-geo.md#geo-03), [ND-05](04-noi-dung-cms.md#nd-05)). Gặp ở `P1`, `P2`, `P8`, `P7`, `P5`.
8. **Ảnh: master gốc, `sizes` đúng khung thật, ảnh CMS đi thẳng CDN một lần** ([HN-03](05-hieu-nang.md#hn-03)). `P2` sửa 4 vòng, `P7`, `P1` cũng gặp.
9. **Chốt hướng giao diện + mockup trước khi code** ([GD-01](07-giao-dien.md#gd-01)). Hero của `P7` sửa 4–6 vòng, `P1` làm lại UI 3 lần, `P6` đổi 5 palette.
10. **Đổi env `NEXT_PUBLIC_*` / `ALLOW_INDEXING` phải redeploy, rồi kiểm HTML thật** ([GL-03](12-go-live.md#gl-03)). Gặp ở `P2`, `P1`, `P5`.

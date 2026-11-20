# 03 · GEO, tìm kiếm AI (`GEO`)

Mục tiêu: site được ChatGPT / Perplexity / Claude / Gemini / Google AI Overviews đọc được, hiểu đúng thực thể và trích dẫn đúng.

**Sự thật cần nhớ** (tra ngày 16/11/2026, xem [nguon-chuan-hien-hanh.md](nguon-chuan-hien-hanh.md)):
- **AI Overviews / AI Mode không cần markup đặc biệt.** Trang chỉ cần được index và đủ điều kiện hiển thị snippet. `nosnippet` / `max-snippet` thấp sẽ loại trang khỏi AI Overviews.
- **Google bỏ FAQ rich result từ 07/05/2026.** HowTo bỏ từ 2023. Markup `FAQPage` / `HowTo` vẫn hợp lệ nhưng không còn hiện mở rộng trên Google.
- **`llms.txt` không phải yếu tố xếp hạng.** Google nói không dùng. OpenAI / Perplexity chưa công bố đọc.
- **Hiện trên ChatGPT search / Perplexity / Claude** cần cho phép `OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot`. Chặn bot huấn luyện là quyết định riêng, không làm mất hiển thị.

<a id="geo-01"></a>
### GEO-01 · `robots.txt` khai tường minh crawler AI theo mục đích — PHẢI
- `app/robots.ts` có hằng `AI_CRAWLERS`, chia ba nhóm, mỗi dòng ghi chú mục đích:

| Nhóm | Bot | Mặc định |
|---|---|---|
| **Tìm kiếm** | `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Bingbot` | Cho phép |
| **Người dùng hỏi** | `ChatGPT-User`, `Claude-User`, `Perplexity-User`; `OAI-AdsBot` khi chạy ChatGPT Ads | Cho phép |
| **Huấn luyện** | `GPTBot`, `ClaudeBot`, `CCBot`; token `Google-Extended`, `Applebot-Extended`, `Meta-ExternalAgent` | Cho phép, trừ khi khách yêu cầu chặn (ghi vào `00-du-an.md`) |

- Khối riêng PHẢI lặp lại `disallow` của `*` (`/studio`, `/api/`).
- Ở preview, mọi nhóm bị chặn theo [SEO-01](02-seo.md#seo-01).
- Không dùng token cũ (`Claude-Web`, `anthropic-ai`).
- Không chặn theo IP.
- `Perplexity-User` / `ChatGPT-User` có thể bỏ qua robots. Muốn chặn thật thì phải dùng WAF.
- **Nguồn:** `P1`, `P2`, `P8` `AI_CRAWLERS`; `P8 ebae3f7` ("Cần bạn xác nhận lựa chọn này"); [web] tài liệu crawler của OpenAI / Anthropic / Perplexity.

<a id="geo-02"></a>
### GEO-02 · Một `@graph` JSON-LD mỗi trang, nối bằng `@id` — PHẢI
- **Node cấp site** (in một lần ở layout):
  - `Organization` (`@id` `${SITE_URL}/#organization`), cùng loại hẹp theo ngành nếu có: `LocalBusiness`, `RealEstateAgent`, `MedicalClinic`, `EmploymentAgency`, `ComputerStore`… Nhà sản xuất dùng `LocalBusiness`, vì schema.org không có `Manufacturer`.
  - `WebSite` (`#website`).
- **Node cấp trang**, tham chiếu node site bằng `{ "@id" }` qua `publisher` / `author` / `provider` / `manufacturer` / `seller`:
  - `WebPage` (`ItemPage` / `CollectionPage` / `AboutPage` / `ContactPage`), `BreadcrumbList`;
  - theo loại trang: `Article` / `BlogPosting` / `NewsArticle`, `Service`, `Product` + `Offer`, `Event`, `JobPosting`, `ItemList`, `FAQPage`, `VideoObject`.
- **Serialize an toàn:** `JSON.stringify(data).replace(/</g, "\\u003c")` (helper `serializeJsonLd`). KHÔNG `JSON.stringify` thẳng vào `dangerouslySetInnerHTML`.
- **Ngày giờ** có múi giờ `+07:00`.
- **Hết hạn:** `JobPosting` chỉ xuất khi còn hạn; `Event` parse đúng ngày.
- **KHÔNG dùng:**
  - `SearchAction` khi ô tìm kiếm không thật sự đọc `?q=` (Google bỏ sitelinks search box từ 11/2024);
  - type không tồn tại trong schema.org (vd. `ComputerRepairService`);
  - thuộc tính hard-code sai ngữ cảnh (vd. `bodyLocation: "Face"` cho mọi dịch vụ).
- **Kiểm:**
  - e2e: mọi `<script type="application/ld+json">` parse được, mỗi loại trang có đủ `@type`;
  - mọi URL ảnh / logo trong schema trả 200 với `Content-Type: image/*`.
- **Nguồn:**
  - `P2` `lib/seo.tsx` (`@graph` + e2e).
  - `P5 af94273`, `3f66d3b`.
  - `P8 ebae3f7`.
  - `P6 KT-05`, `KT-06`, `47d7139`.
  - `P3` `SearchAction` giả.

<a id="geo-03"></a>
### GEO-03 · Thực thể và NAP một nguồn, khớp mọi nơi — PHẢI
- Mọi dữ kiện doanh nghiệp nằm trong singleton `siteSettings` của CMS. Hằng trong code chỉ dùng cho site không có CMS.
  - Dữ kiện gồm: tên thương hiệu, tên pháp lý, MST, năm thành lập, địa chỉ từng cơ sở, toạ độ / link bản đồ, giờ mở cửa, hotline (E.164 trong schema), email, Zalo, `sameAs` (fanpage, Zalo OA, YouTube, LinkedIn, Google Business Profile), giấy phép (có số).
- Cùng nguồn này hiển thị bằng **HTML text** ở footer / trang liên hệ, và đổ vào JSON-LD, `llms.txt`, email thông báo.
- **Một tên** dùng cho `site.name`, `og:site_name`, manifest, schema.
- NAP khớp từng chữ với Google Business Profile.
- KHÔNG hard-code địa chỉ / SĐT / `knowsAbout` / tên người sáng lập trong `lib/seo.ts`.
- Giờ mở cửa: parse từ chuỗi; dòng không đọc được thì bỏ, KHÔNG đoán.
- Mỗi cơ sở một `LocalBusiness` có `address`, `geo`, `hasMap`, `openingHoursSpecification`. `url` của cơ sở là trang thật, không phải anchor.
- **Kiểm:** `grep` code không còn dữ kiện công ty hard-code; test JSON-LD lấy dữ kiện từ `siteSettings` mẫu.
- **Nguồn:**
  - `P2`: `ADDRESS` hard-code lệch CMS, 55 thân bài còn địa chỉ cũ.
  - `P1 36a3b0d`.
  - `P6 KT-20`, `KT-21`: ba tên thương hiệu khác nhau.
  - `P3 8a84ab7`: LinkedIn từ chối xác minh vì thiếu pháp nhân.
  - `P7` `organizationJsonLd`.

<a id="geo-04"></a>
### GEO-04 · Chỉ dữ liệu thật trong schema và nội dung — KHÔNG bịa
- KHÔNG `aggregateRating` / `review` khi không có số liệu thật có nguồn.
- KHÔNG `offers` khi giá là "Liên hệ" (`parsePriceVnd` trả `null`).
- KHÔNG `Person` tác giả ảo. Không có hồ sơ thật thì `author` là `Organization`.
- KHÔNG đánh dấu nội dung không hiển thị trên trang.
- FAQ trong schema PHẢI hiển thị trên trang và khớp **từng câu** (render sẵn trong HTML, có thể ẩn bằng `hidden`). `faqNode` trả `null` khi rỗng.
- KHÔNG sinh FAQ tự động na ná nhau từ bảng thông số làm nội dung chính: dễ thành thin / duplicate.
- **Nguồn:**
  - `P8 ebae3f7`: bỏ rating 4.9/1000 lượt bịa.
  - `P5 af94273`: đổi `Person` thành `Organization`.
  - `P2 S9`: FAQPage rỗng gây lỗi GSC.
  - `P3 8efaae0`.
  - `P4`: HowTo / FAQ trên mọi trang mà không đồng bộ nội dung.

<a id="geo-05"></a>
### GEO-05 · Nội dung dễ trích dẫn (answer-first) — PHẢI cho trang trụ cột, NÊN cho bài
- **Mở trang:** đoạn trả lời trực tiếp 40–80 từ ngay dưới H1, kèm khối **"Thông tin nhanh"** (cặp nhãn–giá trị: giá từ, thời gian, khu vực, đối tượng…).
- **Cấu trúc:**
  - H2 / H3 dạng câu hỏi người dùng thật;
  - câu trả lời tự đủ nghĩa (lặp tên thực thể, không bắt đầu bằng "Nó / Thuộc…");
  - bảng ≤ 4 cột;
  - mục "Câu hỏi thường gặp" (H2 + H3 từng câu).
- **Dữ kiện quan trọng** (giá, thông số, điều kiện, hạn, lương) PHẢI là text HTML, không chỉ nằm trong ảnh / poster.
- **Ngày:** "Cập nhật: <time datetime>" hiển thị, khớp `dateModified` = thời điểm sửa thật.
- **Nguồn:** trích nguồn chính (văn bản luật, tài liệu hãng). Không có số liệu thì viết định tính.
- **E-E-A-T:** bài cần người đứng tên thật. Ngành y tế / tài chính / pháp lý có người duyệt (`reviewedBy`) + trang tác giả có chứng chỉ kiểm chứng được.
- **Nguồn:**
  - `P1` audit §2 (khối "Thông tin nhanh", đoạn trả lời 40–80 từ).
  - `P4` `src/seo.ts` (`facts`, `sources`, `citation`).
  - `P2` `projectFaq`.
  - `P6` review.md (E-E-A-T y tế).
  - [web] Google "AI features and your website".

<a id="geo-06"></a>
### GEO-06 · `llms.txt` sinh từ cùng nguồn dữ liệu — NÊN
- `app/llms.txt/route.ts` (`force-static` hoặc `revalidate = 3600`, `text/plain; charset=utf-8`), theo định dạng llmstxt.org:
  - `# Tên`, `> tóm tắt`;
  - "Thông tin xác thực" (tên pháp lý, MST, giấy phép **chỉ khi có số**, địa chỉ, hotline, giờ);
  - các mục `## Dịch vụ` / `## Sản phẩm` / `## Bài viết` dạng `[tiêu đề](url): ghi chú`;
  - link sitemap / RSS.
- Sinh từ **cùng nguồn** với trang, dùng chung hàm tóm tắt với meta / JSON-LD. KHÔNG viết tay (đã sai giá ~5 lần).
- `llms-full.txt` là TUỲ CHỌN.
- Có test nội dung: chứa đủ dữ kiện, không lẫn HTML, không có mục rỗng ("0 bài").
- KHÔNG coi có `llms.txt` là tiêu chí đạt GEO. KHÔNG hứa với khách là nó tăng hiển thị.
- **Nguồn:**
  - `P3 90b559c`: llms.txt viết tay báo giá cũ và ghi "English" khi `/en` còn 404.
  - `P4 77192b2` + test.
  - `P1` `lib/llms.ts`, `P2` S16, `P8 a3c8ca6`.
  - [web] Google không dùng llms.txt.

<a id="geo-07"></a>
### GEO-07 · Một tệp "facts" nguồn khi định vị hay đổi — NÊN
- Dữ kiện hay đổi (giá, gói, số liệu, định vị) nằm ở **một nơi**: CMS hoặc `content/facts.ts`, hoặc lấy từ API sản phẩm với `revalidate` + bản chụp dự phòng.
- Trang, JSON-LD, `llms.txt`, OG, menu cùng đọc từ đó.
- Dữ liệu hay đổi NÊN có bản Markdown (`/pricing.md`) ghi ngày cập nhật và trỏ tới trang sống.
- **Nguồn:** `P3 68ef642`, `007eccd`, `70e3493`, `24dec5a`: định vị đổi 4 lần, lần nào cũng sót chỗ; `P3` `src/lib/pricing.ts`.

<a id="geo-08"></a>
### GEO-08 · Đo hiển thị trên AI hằng tháng — NÊN
- Bộ 5–10 câu hỏi cố định theo ngành và địa phương, hỏi ChatGPT / Perplexity / Gemini / Google AI Overviews mỗi tháng. Ghi có được nhắc / trích dẫn không, kèm nguồn được trích.
- Phân biệt **Observed / Inferred / Unknown** trong báo cáo. "AI không nhắc" khi chưa lấy được dữ liệu là Unknown, không phải lỗi.
- Bing Webmaster có báo cáo AI Performance (preview).
- KHÔNG hứa con số cụ thể.
- **Nguồn:** `P1` audit §2; `P2` TASKS #21; `P6` review.md (phản biện báo cáo 59/100).

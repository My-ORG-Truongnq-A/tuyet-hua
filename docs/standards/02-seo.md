# 02 · SEO kỹ thuật (`SEO`)

Mục tiêu: Google index đúng một bản của mỗi trang, trên đúng host. Không mất thứ hạng của URL cũ. Mỗi trang có metadata chuẩn. Kiểm được bằng test, không dựa vào audit tay.

<a id="seo-01"></a>
### SEO-01 · Chỉ index khi production + cờ bật + đúng host, chặn hai lớp — PHẢI
- `lib/indexing.ts` không import gì, để `next.config.ts` dùng được:
  ```ts
  const isProd = env.VERCEL_ENV ? env.VERCEL_ENV === "production" : env.NODE_ENV === "production";
  export const indexingAllowed = (host?: string) =>
    isProd && env.ALLOW_INDEXING === "1" && !canonicalHost.endsWith(".vercel.app") &&
    (!host || host === canonicalHost);
  ```
- Không được index thì chặn **hai lớp**:
  1. `app/robots.ts` trả `Disallow: /`;
  2. header `X-Robots-Tag: noindex` (`next.config.ts` `headers()`, kèm điều kiện `missing: [{ type: "host", value: canonicalHost }]`).
- Alias `*.vercel.app` của production cũng PHẢI noindex, hoặc 308 về domain chính ([SEO-03](#seo-03)).
- Domain tạm (`*.vercel.app`, preview) luôn noindex, kể cả khi cờ bị bật nhầm (Q-25): hàm trên chặn mọi host chính là `*.vercel.app`.
- **Kiểm:** unit test `robotsFor(env, host)`; sau deploy chạy `curl -sI` cả preview lẫn production.
- **Nguồn:**
  - `P1 f70116e`: alias vercel.app của production suýt bị index.
  - `P2` TASKS #17: `*.vercel.app` bị index.
  - `P7`: robots luôn `allow`.
  - `P8` `app/robots.ts`.

<a id="seo-02"></a>
### SEO-02 · Một hằng `SITE_URL` = host cuối trả 200 — PHẢI
- `lib/site-url.ts` export `SITE_URL` (bỏ `/` cuối) và `absoluteUrl(path)`.
- Đây là nguồn **duy nhất** cho `metadataBase`, canonical, `og:url`, `og:image`, sitemap, robots `Sitemap:`, JSON-LD, `llms.txt`, RSS.
- KHÔNG đọc `process.env.NEXT_PUBLIC_SITE_URL` ở chỗ khác.
- KHÔNG dùng `VERCEL_PROJECT_PRODUCTION_URL`: Vercel chọn domain ngắn nhất.
- Host trong `SITE_URL` PHẢI là host cuối của chuỗi redirect. Nếu apex 308 sang www thì `SITE_URL` là www, và ngược lại.
- **Kiểm:** mọi URL trong sitemap, canonical, `og:image` và ảnh JSON-LD trả **200 trực tiếp**, không qua redirect; HTML production không có chữ `localhost` ([QA-03](13-kiem-thu.md#qa-03)).
- **Nguồn:**
  - `P6 KT-01`: 56/56 URL sitemap trỏ vào URL bị 308.
  - `P7 4386cea`: preview Facebook / Zalo hỏng trên 3 domain.
  - `P8`: fallback localhost.
  - `P5 af94273`.

<a id="seo-03"></a>
### SEO-03 · Một host chuẩn, host phụ 301/308 một bước — PHẢI
- Chọn apex hoặc www làm host chính; host còn lại 308 về host chính.
- Đặt redirect ở **cả hai tầng**: Vercel Domains và `redirects()` trong code (`has: [{ type: "host" }]`). Domain phụ cũng 308 về host chính.
- http → https.
- Link nội bộ trong nội dung CMS chỉ dùng host chính.
- Ghi chú: `permanent: true` của Next là **308**. Muốn đúng 301 thì dùng `statusCode: 301`.
- **Nguồn:**
  - `P3 90b559c`: www trả 200 trùng nội dung, Google index song song.
  - `P3 134cc01`.
  - `P5 af94273`: redirect host vercel.app.
  - `P7`.

<a id="seo-04"></a>
### SEO-04 · Một builder metadata cho mọi route — PHẢI
- `lib/seo.ts` có `pageMetadata({ title, description, path, image, type, noindex, article })`. Builder trả đủ:
  - canonical tuyệt đối theo [SEO-02](#seo-02), là tương đối + `metadataBase`;
  - `openGraph` với `url` = canonical, `type`, `locale`, `siteName`, ảnh;
  - `twitter: summary_large_image`;
  - `alternates.types` (RSS) và hreflang khi có bản dịch thật.
- **Next chỉ merge nông.** `alternates` / `openGraph` của trang **ghi đè cả object** của layout, nên builder PHẢI lặp lại link RSS và các trường dùng chung.
- KHÔNG hard-code canonical ở layout: mọi trang sẽ trỏ về trang chủ.
- **Title:**
  - ≤ 60 ký tự kể cả hậu tố thương hiệu; dài quá thì bỏ hậu tố, dùng `{ absolute }`.
  - Trang chủ dùng `title: { absolute }`, vì `title.template` không áp cho page cùng segment.
- **Description:**
  - 120–160 ký tự, cắt ở ranh giới từ (`describeText` / `clip`), không trùng giữa các trang.
  - Mô tả rác (< 70 ký tự, "Siêu hot hiện nay", `????`) thì thay bằng công thức.
- **Nguồn:**
  - `P3 73d826b`: canonical ở layout làm mọi trang trỏ về home.
  - `P3 90b559c`: 38/46 trang thiếu canonical.
  - `P1 36a3b0d`, `P2 83c154f`: mất link RSS, `og:url` khác canonical.
  - `P6 KT-07`, `KT-08`.
  - `P5 7e19ff1`.

<a id="seo-05"></a>
### SEO-05 · Canonical đúng cho mọi trang index được — PHẢI
- Mỗi trang index được có canonical là chính nó, kể cả trang chủ và trang động.
- **Bài repost / trùng nội dung:** canonical về bản gốc, để ngoài sitemap. KHÔNG thêm `noindex` cùng canonical trỏ trang khác ([SEO-08](#seo-08)).
- **Hai trang cùng ý định tìm kiếm:** chọn một trang chính, trang còn lại 301 về đó hoặc tách intent.
- Trang lọc / sắp xếp / tìm kiếm áp [SEO-08](#seo-08).
- **Nguồn:**
  - `P6 WEB-02`: 21 trang thiếu canonical.
  - `P6 KT-14`: hai trang tự cạnh tranh.
  - `P1 36a3b0d`.
  - `P2` `duplicateOf`.

<a id="seo-06"></a>
### SEO-06 · Sitemap sinh từ dữ liệu, chỉ URL canonical index được — PHẢI
- `app/sitemap.ts` sinh từ CMS + route tĩnh, gộp mọi nguồn, dedupe theo path.
- **Không có trong sitemap:** URL `noindex`, repost, tag dưới ngưỡng, danh mục rỗng, route bị cờ tính năng tắt, route nháp.
- **`lastModified`:**
  - lấy ngày sửa thật (`coalesce(updatedAt, _updatedAt)`); trang danh sách lấy ngày của bài mới nhất;
  - trang tĩnh không có ngày đáng tin thì **bỏ trống**;
  - KHÔNG dùng `new Date()`: Google sẽ bỏ qua lastmod của cả file.
- Escape `& < >` trong `<loc>` / `<image:loc>`: URL ảnh Sanity có `?w=…&fit=…`, Next không escape. URL tiếng Việt dùng `encodeURI`.
- Site trên ~5.000 URL: dùng sitemap index, tách tệp theo loại.
- `priority` / `changeFrequency` không cần, Google bỏ qua.
- **Kiểm:** parse sitemap bằng XML parser thật (không regex); mọi URL trả 200; không URL nào `noindex`.
- **Nguồn:**
  - `P2 83c154f`: 577 URL ảnh làm sitemap không well-formed.
  - `P3 a8f6fe9`: lastmod = now, bài "Discovered – not indexed".
  - `P6 KT-04`.
  - `P8 ebae3f7`.
  - `P1` `lib/sitemaps.ts`.

<a id="seo-07"></a>
### SEO-07 · `robots.txt` chặn đúng chỗ, không chặn trang noindex — PHẢI
- Chỉ `Disallow: /studio` và `/api/`, khai `Sitemap:` từ `SITE_URL`.
- KHÔNG `Disallow` URL đang `noindex` (trang tìm kiếm, tag mỏng, chi tiết sản phẩm noindex). Bot không vào được thì không đọc được `noindex`.
- Khối riêng cho crawler AI ([GEO-01](03-geo.md#geo-01)) **không kế thừa** `*`. Có `disallow` cho `*` thì phải lặp lại trong từng khối.
- Studio: `robots: { index: false, follow: false, nocache: true }`, `referrer: "same-origin"`, `Cache-Control: no-store`.
- **Nguồn:**
  - `P8 d3f8343` → `c576268`: chặn rồi phải mở lại sau 5 phút.
  - `P2 S7`.
  - `P6 WEB-05`.
  - `P7` `studio/layout.tsx`.

<a id="seo-08"></a>
### SEO-08 · Trang mỏng / lọc / tìm kiếm: `noindex, follow` — PHẢI
- **Index:** URL chỉ có `category` (và `page`); canonical tự chính nó.
- **Phân trang:** `?page=N` hoặc `/trang-N/` canonical về chính nó, title có "Trang N", link phân trang là `<a href>` thật.
- **`noindex, follow`, canonical tự chính nó (hoặc bỏ canonical):** mọi tham số khác (`q`, `sort`, `brand`, `price`…).
- Mỗi URL chọn **một** cơ chế: trùng nội dung thì canonical về bản gốc; mỏng / lọc thì `noindex, follow`. KHÔNG ghép `noindex` với canonical trỏ trang khác, vì hai tín hiệu mâu thuẫn. `P8` và `P2` có ghép; luật này chọn cách gọn hơn (suy luận từ hướng dẫn chung của Google, chưa xác minh trong đợt tra 16/11).
- **Tag / taxonomy:** dưới ngưỡng (vd. < 2 bài) thì `noindex` và ngoài sitemap. Dùng **một hằng ngưỡng** chung cho `generateMetadata` và `sitemap.ts`.
- Trang 0 kết quả nói rõ là không có kết quả, đề nghị xoá lọc và mời liên hệ.
- **Nguồn:**
  - `P8 ebae3f7`.
  - `P5 af94273` (`MIN_POSTS_TO_INDEX_TAG`).
  - `P6 KT-13`: 16 trang tag mỏng.
  - `P2`.
  - `P1 c21e74a`.

<a id="seo-09"></a>
### SEO-09 · URL cũ: giữ hoặc 301 một bước tới trang 200 — PHẢI
- **Kiểm kê trước khi dựng** (nhánh migration): sitemap cũ, mọi trang phân trang, Search Console, Wayback, backlink, ảnh cũ có traffic, URL quản trị nhân viên còn gõ.
- **Giữ nguyên** slug và dấu `/` cuối nếu được (`trailingSlash`). Không slugify lại slug cũ.
- URL không giữ được thì 301/308 **đúng một bước** tới trang **200, không `noindex`**.
- Không có đích tương ứng thì đi ngược danh mục cha tới danh mục còn bài. KHÔNG đổ hàng loạt về trang chủ.
- Đổi URL hoặc slug thì thêm redirect **trong cùng commit**. Ẩn tạm thì 307, kèm ngày xem lại.
- Redirect khai trong `next.config` (`redirects()`) hoặc từ dữ liệu `redirect` của CMS / seed — KHÔNG trong `vercel.json`: `next start` (bản build local DigiForge đo trước G5) không đọc `vercel.json`, URL cũ sẽ lệch giữa bản local và production ([BM-01](11-bao-mat-phap-ly.md#bm-01)).
- Trang bị gỡ thì 308 tới trang gần nhất.
- **Kiểm:** script `check-urls` với **kỳ vọng sinh từ dữ liệu**: mã đúng, đích đúng, một hop, exit 1 khi lệch ([QA-03](13-kiem-thu.md#qa-03)).
- **Nguồn:**
  - `P1 76c57f8`, `878444b`, `69380ce`, `d1a172a`: thiếu `page-N`, `.html`, đường dẫn admin; `check-urls` đạt 3.417/3.417.
  - `P2 83c154f`: 110 URL redirect về danh mục noindex.
  - `P6 WEB-03`: URL có thứ hạng bị 404.
  - `P7`: không có map WordPress.

<a id="seo-10"></a>
### SEO-10 · Mỗi trang đúng một `<h1>`, không chờ JS — PHẢI
- Component tiêu đề dùng chung nhận prop `as`.
- Trang danh mục / tag / liên hệ cũng có H1 thật.
- H1 KHÔNG bị ẩn chờ JS reveal ([HN-02](05-hieu-nang.md#hn-02)).
- Heading đúng thứ bậc. Muốn giữ CSS cũ mà nhảy cấp thì giữ tag và thêm `aria-level`.
- **Nguồn:**
  - `P6 WEB-06`.
  - `P5 af94273` (`SectionHeader as="h1"`).
  - `P8 ebae3f7`: H1 trang chủ bị ẩn chờ JS.
  - `P3 90b559c`: trang có 2 H1.

<a id="seo-11"></a>
### SEO-11 · Liên kết nội bộ có chủ đích — PHẢI
- "Bài liên quan" là bài **cùng chủ đề / lân cận cùng chuyên mục** (một nửa mới hơn, một nửa cũ hơn), hoặc tính theo độ giống nội dung. KHÔNG lấy N bài mới nhất.
- Trang chủ link tới các bài mới và trang trụ cột. Mỗi bài có ít nhất 1 link tới dịch vụ hoặc chuyên mục cha.
- Breadcrumb hiển thị là `<a href>` thật, kèm `BreadcrumbList` cùng `@id`.
- Mọi `<a>` có `href` thật trước khi JS chạy.
- Link tới trang tìm kiếm động / tag dùng `rel="nofollow"`. Link không có đích thì không dùng `<a>`.
- Link chết trong nội dung cũ (`.html` cũ, host staging) thì gỡ link hoặc map sang trang cùng chủ đề.
- Link sinh từ khoá dữ liệu (tag) PHẢI qua hàm kiểm slug, có test "mọi key = slug".
- **Nguồn:**
  - `P1 36a3b0d`: 1.894/2.327 trang mồ côi; sau khi sửa còn 8.
  - `P3 a8f6fe9`: chỉ 3/50 bài có link vào, sau khi sửa 45/50.
  - `P6 KT-03`: tag `"seo-rỗ"` 404 vẫn nằm trong sitemap.
  - `P4 9e24daa`.

<a id="seo-12"></a>
### SEO-12 · 404 thật, tiếng Việt, có đường đi tiếp — PHẢI
- Trả mã 404, đặt `robots: { index: false }`.
- Có header/footer, ô tìm kiếm hoặc link tới trang chính, và hotline.
- Slug sai trả 404 thật. Với `cacheComponents`, `notFound()` stream có thể trả 200, nên PHẢI có test cho trường hợp này.
- **Nguồn:** `P6 KT-15`; `P5`; `P7` `not-found.tsx`; tài liệu 12/11 §3.

<a id="seo-13"></a>
### SEO-13 · Slug tiếng Việt — PHẢI
- Sinh bằng `slugifyVi`: bỏ dấu NFD, `đ` → `d`, kebab-case, ≤ 96 ký tự, từ khoá chính đứng đầu.
- Route tiếng Việt: `/san-pham`, `/dich-vu`, `/tin-tuc`, `/lien-he`, `/bao-gia`, `/ve-chung-toi`.
- KHÔNG dùng slug máy (`batteries-1-pin-…`).
- Studio cảnh báo khi đổi slug của trang đã đăng. Đổi slug thì thêm 301.
- **Nguồn:** `P1` / `P2` / `P3` `slugifyVi`; `P8`, `P6`: slug lệch nội dung.

<a id="seo-14"></a>
### SEO-14 · Ảnh chia sẻ (OG) — PHẢI
- JPEG (không WebP), 1200×630, có `width` / `height` / `alt`, cỡ ~75–150 KB.
- Ảnh từ Sanity crop theo hotspot: `?w=1200&h=630&fit=crop&crop=focalpoint&fm=jpg&q=80`.
- Mỗi loại trang có ảnh riêng: bài lấy ảnh bìa, trang tĩnh lấy ảnh soạn sẵn.
- Ảnh trỏ file có thật trả 200 không qua redirect. Xoá route sinh ảnh thì sửa mọi tham chiếu.
- Kiểm bằng UA `facebookexternalhit` và Zalo trên từng domain. Facebook cache, cần "Scrape Again".
- **Nguồn:**
  - `P7 4386cea`, `P2 83c154f`: Zalo / LinkedIn không đọc WebP ổn định.
  - `P5 3f66d3b`.
  - `P6 47d7139`: xoá `opengraph-image` nhưng JSON-LD vẫn trỏ.

<a id="seo-15"></a>
### SEO-15 · Favicon và manifest một bộ — PHẢI
- `app/favicon.ico` vuông chứa 16/32/48 (≈ 3 KB, không phải 182 KB); `icon.png`, `apple-icon.png` 180; manifest 192/512.
- Khai **một lần** theo file convention, không lặp trong `metadata.icons`.
- `theme-color` khai trong `viewport`.
- Đổi logo thì đổi **tên file** (ảnh tối ưu bị cache 31 ngày).
- **Nguồn:** `P2 17025a0`: favicon 44×46 + thẻ trùng nên Google không đổi; `P1 92bd63c`; `P3 70e3493`.

<a id="seo-16"></a>
### SEO-16 · Đa ngôn ngữ (khi có) — PHẢI
- `vi` không tiền tố, `en` dưới `/en`.
- `<html lang>` theo layout; mỗi ngôn ngữ một root layout (`app/(site)`, `app/(en)/en`).
- `hreflang` **chỉ cho bản dịch thật**: hai chiều + `x-default`, lấy từ một bảng route nguồn.
- KHÔNG gắn `lang="en"` cho nội dung tiếng Việt đặt dưới `/en/`. KHÔNG ghi "có tiếng Anh" (trong `llms.txt`) khi `/en` còn 404.
- Slug mỗi ngôn ngữ theo từ khoá của ngôn ngữ đó.
- Site một ngôn ngữ: `lang="vi"`, `og:locale vi_VN`, `inLanguage: "vi-VN"`, không thêm hreflang.
- **Nguồn:** `P4` `ToolPage.astro`; `P1` (B20 anti-pattern); `P3 90b559c`.

<a id="seo-17"></a>
### SEO-17 · Search Console, Bing, IndexNow — PHẢI khi có domain riêng được index
- Chỉ áp khi site chạy trên domain riêng và đã bật index. Phase này website chạy trên `*.vercel.app` noindex (Q-25), nên chưa cần nộp sitemap.
- **PHẢI:** xác minh Google Search Console bằng **domain property** (TXT DNS), hoặc `metadata.verification` / file `google*.html`, rồi nộp sitemap. Tệp / meta xác minh **không xoá** khi refactor, nếu không sẽ mất owner.
- **NÊN:** Bing Webmaster Tools (nền của Copilot) + file key IndexNow (có lợi cho Bing / Yandex / Naver; Google không dùng).
- Đổi canonical hoặc domain thì nộp lại sitemap, xoá sitemap cũ.
- Cốc Cốc chiếm ~6 % desktop ([web] Statcounter 06/2026), không phải kênh chính.
- **Nguồn:** `P1 6810495`, `d1a172a`; `P5 3398af6`; `P3 045d850`; `P4 e73780b`; [web] Statcounter, IndexNow.

<a id="seo-18"></a>
### SEO-18 · Trang chi tiết bán hàng: quyết định index nhất quán — NÊN
- Quyết định index hay không cho trang sản phẩm theo mục tiêu kinh doanh, ghi vào `00-du-an.md`.
- **Đã noindex** thì: không phát `Product` JSON-LD, để ngoài sitemap, KHÔNG `Disallow`.
- **Giữ index** thì có `Product` + `Offer` khi giá là số thật.
- Site B2B ít SKU có thể gộp sản phẩm về `/san-pham`, trang con cũ 301. Đổi lại sẽ mất trang riêng cho từng sản phẩm, cần ghi rõ.
- **Nguồn:** `P8 d3f8343`: noindex 222 trang nhưng vẫn phát Product, sitemap đổi 3 lần; `P7 38cf3be`.

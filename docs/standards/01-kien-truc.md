# 01 · Kiến trúc & repo (`KT`)

Mục tiêu: site tĩnh nhanh, đọc nội dung qua một cửa duy nhất, chạy được cả khi không có CMS. Repo không mang dấu vết khách khác.

<a id="kt-01"></a>
### KT-01 · Một cửa đọc nội dung, cùng truy vấn GROQ cho seed và Sanity — PHẢI
- Mọi trang và component đọc nội dung qua **một module server-only** (vd. `lib/content.ts` / `getContent()`), trả kiểu dữ liệu chung.
- **Hai nguồn, CÙNG truy vấn GROQ** (DigiForge v8, Q-118):
  - `SANITY_SOURCE=sanity` → client Sanity (CDN + cache tag, [KT-02](#kt-02));
  - `SANITY_SOURCE=seed`, hoặc chưa có `NEXT_PUBLIC_SANITY_PROJECT_ID` → chạy **chính truy vấn đó** bằng `groq-js` trên `seed/sanity/documents.json` (+ `assets.json` cho ảnh — [ND-07](04-noi-dung-cms.md#nd-07)).
  - KHÔNG viết nhánh truy vấn / hàm map riêng cho seed: đọc seed phải ra đúng dữ liệu như đọc Sanity, để QA và G5 trên seed còn đúng khi production đọc Sanity.
- **Seed là chế độ chạy THẬT**, không chỉ cho dev / test: bản xem thử local, QA, G4 / G5 đều chạy trên seed; dự án không bật Sanity thì production cũng đọc seed (không có Studio, khách sửa nội dung qua yêu cầu thay đổi trên DigiForge).
- Chế độ `sanity` mà Sanity lỗi thì render seed và ghi log, **không sập site**.
- Chuẩn hoá giá trị null ngay tại cửa (`?? []`, giá trị mặc định), không để từng trang tự xử lý.
- Cửa báo nguồn đang dùng (`sanity` / `seed`). Seed dự phòng KHÔNG được che việc CMS chưa nối **khi dự án bật Sanity**: production phải đọc đúng nguồn DigiForge đặt (`SANITY_SOURCE`), và [GL-02](12-go-live.md#gl-02) chặn go-live khi lệch.
- Truy vấn GROQ có test chạy trên seed ([QA-01](13-kiem-thu.md#qa-01)), không gọi Sanity.
- **Nguồn:**
  - `P1 c654bea`, `de6650d`: 4.500 request mỗi lần build làm build lỗi 402.
  - `P7` `src/factory/content/index.ts`.
  - `P8 3e692dd`, `ededad5`: trang chi tiết crash vì `rating` null.
  - `P7`: seed che việc chưa nối CMS.
  - DigiForge Q-118 (19/11/2026): Thiết kế + Lập trình chạy local, Sanity tuỳ chọn.

<a id="kt-02"></a>
### KT-02 · Trang nội dung tĩnh, cache có tag, webhook revalidate — PHẢI
- **Trang tĩnh:**
  - Route nội dung render tĩnh: `generateStaticParams` + `revalidate`, hoặc `cacheComponents` + `"use cache"` + `cacheTag` + `cacheLife("hours")` làm lưới an toàn.
  - Thiếu `generateStaticParams` thì `revalidate` vô tác dụng (TTFB 0,75–1,2 s thay vì ~0,13 s).
  - KHÔNG đọc `searchParams` / `cookies` / `headers` trong route `[slug]`: cả nghìn trang sẽ thành động.
- **Webhook revalidate** (`app/api/revalidate/route.ts`):
  - Kiểm chữ ký (`parseBody` + secret); thiếu secret thì trả 500, không bỏ qua.
  - Bỏ qua draft, asset và loại `lead`.
  - `revalidateTag(tag, "max")` theo **loại** nội dung + `revalidatePath` đúng path vừa publish. Không dùng một tag chung cho cả site.
- **Đồng bộ loại nội dung:** danh sách `CONTENT_TYPES` của webhook PHẢI khớp schema. Thêm loại mới thì sửa cả hai, và có test.
- KHÔNG memo dữ liệu CMS ở cấp module suốt đời process.
- **Nguồn:**
  - `P1 d2dab70`: bài mới publish trả 404 do memo.
  - `P1 a45cf3c`: `_type` lệch nên bài 404 suốt 3 ngày.
  - `P1 cca6013`.
  - `P3 70e3493`.
  - `P2`: một tag chung làm mới cả 1.850 trang.

<a id="kt-03"></a>
### KT-03 · Route tự sinh có `revalidate` — PHẢI
- `sitemap.ts`, `robots.ts`, `llms.txt`, `rss.xml` nào đọc CMS đều PHẢI có thời hạn làm mới; nếu không, route bị đóng băng lúc build:
  - không bật `cacheComponents`: `export const revalidate = 3600`;
  - bật `cacheComponents`: segment config `revalidate` không dùng được, thay bằng `"use cache"` + `cacheLife("hours")` + `cacheTag` để webhook làm mới.
- Bao lời gọi CMS trong try/catch để build không chết.
- **Nguồn:** `P3 90b559c`: 8 bài mới không vào sitemap.

<a id="kt-04"></a>
### KT-04 · Cấu trúc thư mục — NÊN
```
src/app/(site)/…           route mỏng: layout có header/footer/JSON-LD/tracking
src/app/studio/[[...tool]] Studio: root layout riêng, không GTM, không widget, noindex
src/app/{robots,sitemap,manifest}.ts, src/app/{llms.txt,rss.xml}/route.ts
src/app/api/revalidate/route.ts
src/<site>/{components,content,lib,actions,styles}
src/sanity/{schemaTypes,structure.ts,lib}
scripts/ (migrate, patch, audit, QA)   tests/{unit,e2e}   docs/standards/ (bộ này)
```
- Nội dung cố định của code ở `content/*.ts`. Nội dung khách sửa nằm ở Sanity.
- Giá trị bố cục (class Tailwind, hằng layout) KHÔNG đưa vào schema CMS.
- **Nguồn:** `P7 077a14d`, `P5` / `P8` `AGENTS.md` (playbook "chuyển section hard-code sang Sanity").

<a id="kt-05"></a>
### KT-05 · `page.tsx` chỉ export những gì Next cho phép — PHẢI
- Chỉ export `default`, `generateMetadata`, `generateStaticParams` và config.
- Hàm phụ đặt trong `lib/`. Export hàm phụ từ page làm `next build --webpack` fail type check.
- **Nguồn:** `P2 83c154f`.

<a id="kt-06"></a>
### KT-06 · Có `error.tsx` và `not-found.tsx` có thương hiệu — PHẢI
- `app/(site)/error.tsx` có nút "Thử lại" và hotline.
- `not-found.tsx` tiếng Việt, có header/footer và link về các trang chính (xem [SEO-12](02-seo.md#seo-12)).
- Nhiều root layout thì dùng route catch-all `[...rest]` gọi `notFound()`.
- **Nguồn:** `P2 83c154f`; `P6 KT-15`; `P5` không có `not-found`.

<a id="kt-07"></a>
### KT-07 · Phiên bản và dependency — PHẢI
- Next.js 16.x, ghim minor. **Nâng ngay khi có advisory** (từng có RCE ở Image Optimization).
- Trước go-live, `pnpm audit --prod` không còn critical.
- Một package manager, một lockfile được commit, không để hai lockfile song song.
- Không cài thư viện chỉ để dùng một hàm.
- Đọc `node_modules/next/dist/docs/` trước khi dùng API Next 16. API đã đổi, ví dụ: `priority` của `next/image`, `proxy.ts` thay `middleware.ts`.
- **Nguồn:**
  - `P2 83c154f`, `f2ca8c8`: `next@16.2.6` có 17 advisory.
  - `P7 807ba2a`.
  - `P8 2aa8483` và `P5`: hai lockfile.
  - [web] bản vá bảo mật Next hằng tháng.

<a id="kt-08"></a>
### KT-08 · Repo sạch, không dấu vết khách khác — PHẢI
- Khởi tạo repo mới, **không clone repo của khách trước**.
- Không còn trong repo:
  - README / `.agents/*` / spec / plan / comment / tên route / component (`home-<khách cũ>`, `home-v1`) của site khác;
  - key chat widget, ID tracking, email trong `.env.example`.
- Test rào (`tests/repo.test.ts`):
  - không có tên khách cũ;
  - `.vercel/project.json` không trỏ project khác;
  - không file `"use client"` nào import `zod` / `lib/schemas` (bundle nặng thêm ~32 KB).
- **Nguồn:**
  - `P5`: key widget của `P6` vẫn chạy trên production; README / `.env.example` mang dữ liệu của khách trước.
  - `P8 b98e113`, `ecfce23`: tái chế qua 3 khách.
  - `P2 686042f`: 89 commit rác của site trước.

<a id="kt-09"></a>
### KT-09 · `.gitignore` / `.vercelignore` chuẩn — PHẢI
- Chặn `.env*` (trừ `.env.example`), `.codex`, `.cache`, `.claude`, và thư mục tài liệu thô của khách (`client-inputs/`: feedback có dữ liệu cá nhân, ảnh gốc, tệp lớn).
- Báo cáo QA / audit / bàn giao thì **commit vào `docs/`**, không để local-only ([QA-07](13-kiem-thu.md#qa-07), [GL-07](12-go-live.md#gl-07)).
- **KHÔNG chặn** `public/images`.
- Deploy chỉ từ git, không upload thư mục làm việc bằng CLI.
- Có check "0 ảnh 404 trên bản deploy" ([QA-04](13-kiem-thu.md#qa-04)).
- **Nguồn:**
  - `P5 f4bad19`, `P8 9a5489c`: mọi ảnh 404 trên production.
  - `P7 077a14d`: deploy CLI upload `.codex` chứa API key.
  - `P1 06d76bd`: write token lọt lên deploy.

<a id="kt-10"></a>
### KT-10 · Không để route nháp / mockup / cấu hình thử trên production — PHẢI
- Biến thể thiết kế (`home-v1..v6`, `/style-guide`, `/serenity-spa`) và cron giờ test KHÔNG merge vào `main`.
- Cần bản nháp thì đặt `noindex`, để ngoài sitemap và chặn ở production bằng env.
- Tính năng tạm ẩn đi qua **một cờ trung tâm** (`content/features.ts`) ảnh hưởng đồng bộ menu, route, sitemap, CTA, e2e.
- **Nguồn:**
  - `P6 KT-02`: 6 trang chủ thử nằm trên production, có trang cho index.
  - `P5 52266ef`, `a4ad8cc`, `ef6ff5d`.
  - `P8 d31b294`: lịch cron thử merge vào `main`.

<a id="kt-11"></a>
### KT-11 · Env có kiểm tra, fail-closed ở production — PHẢI
- Các biến dùng chung đọc qua một module `lib/env.ts` (zod).
- Biến bắt buộc thiếu ở production thì build hoặc khởi động **lỗi**, không lặng lẽ dùng fallback. Biến Sanity chỉ bắt buộc khi `SANITY_SOURCE=sanity` (dự án không bật Sanity chạy seed, [KT-01](#kt-01)).
- KHÔNG fallback giá trị thật (`?? "G-XXXX"`, `?? "http://localhost:3000"` rải nhiều chỗ).
- `.env.example` đủ tên biến, toàn placeholder.
- Tên biến chuẩn (khớp handler DigiForge):

| Nhóm | Biến |
|---|---|
| Host / index | `NEXT_PUBLIC_SITE_URL`, `ALLOW_INDEXING` |
| Nội dung / Sanity | `SANITY_SOURCE` (`seed` \| `sanity`, [KT-01](#kt-01)), `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`, `SANITY_REVALIDATE_SECRET` |
| Lead | `LEAD_DESTINATION`, `DGA_API_URL`, `DGA_FORM_KEY`, `LEAD_TO_EMAIL`, `LEADS_DRY_RUN` |
| Tracking / widget | `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA_ID`, `GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_CHAT_WIDGET_KEY` |
| Cron | `CRON_SECRET` |

- **Nguồn:**
  - `P8`, `P6`: `NEXT_PUBLIC_SITE_URL ?? localhost` ở 3 nơi.
  - `P8`: GA ID fallback hard-code, nên preview gửi dữ liệu vào property thật.
  - `P2` TASKS #22: form báo "bảo trì" sau go-live.

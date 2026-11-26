# 12 · Go-live & vận hành (`GL`)

Phase này website go-live trên `<slug>.vercel.app` (noindex, Q-25 / Q-27).

**Trước Phát hành (DigiForge v8, Q-118):** Thiết kế + Lập trình chạy trên máy — repo git local, nội dung trên seed, QA + G5 đo **bản build production local** đúng commit (`next build` + `next start` trên `127.0.0.1`, [QA-02](13-kiem-thu.md#qa-02)). Check chỉ có nghĩa trên hosting (https, http → https, HSTS và header do nền tảng đặt, tối ưu ảnh / ISR của Vercel) đo **sau phát hành** trên bản demo: bước security trên hosting (`launch.security_hosting`) + audit. Phát hành cần GitHub + Vercel (thiếu → dự án dừng ở đầu Phát hành); Sanity tuỳ chọn ([ND-10](04-noi-dung-cms.md#nd-10)).

Hai mốc trên cùng URL production (Q-106):
- **Bản demo — ngay sau G5.** DigiForge tạo repo GitHub + project Vercel (Hạ tầng), đẩy nhánh **đúng commit đã duyệt ở G5** + mở PR (repo đổi sau G5 → không đẩy, chạy lại QA / G5), đặt env production của bản demo, rồi merge PR khi job `ci` xanh; Vercel tự deploy `main` mang đúng env đó (không có hai bản build đua nhau).
  - Chưa áp cấu hình lần nào (chưa qua G6): form lead ở chế độ demo ([LD-01](09-lead.md#ld-01)), không tracking ([10-tracking.md](10-tracking.md)) — khoá / ID nhập sớm ở thẻ Cấu hình chưa được dùng trước G6.
  - Đã qua G6 (lượt sửa code sau đó, Q-108): áp lại cấu hình đã duyệt, không hỏi lại G6.
  - Audit đo bằng công cụ (Lighthouse, responsive, axe, so hình) chạy trên bản demo này, cùng stage phát hành (Q-92). Khách xem link từ mốc này.
- **Go-live chính thức — bước Release.**
  1. Cấu hình (form key CRM / email nhận lead / GTM / GA4 / Search Console / chatbot) lấy từ thẻ **Cấu hình dự án** — nhập lúc tạo dự án hoặc bất cứ lúc nào; mọi trường tuỳ chọn; để trống = giữ giá trị đã nhập (nếu có), chưa từng nhập thì website giữ chế độ demo / không nhúng mã đó. Xoá giá trị: Q-107.
  2. Checklist go-live ([GL-01](#gl-01), [GL-02](#gl-02)).
  3. **G6** duyệt checklist kèm tóm tắt cấu hình đã che.
  4. Đặt env production theo cấu hình + deploy lại ([GL-03](#gl-03)).
  5. Đối chiếu trên production (`check.release`), rồi gửi form thật ([LD-10](09-lead.md#ld-10)).
  - Sửa khoá đích / tracking / chatbot ở thẻ Cấu hình SAU G6: DigiForge áp lại env + đối chiếu lại, G6 không mở lại (Q-112). Đổi có / không form lead hoặc đích lead sau khi đã dựng code: qua yêu cầu thay đổi (Q-77).

Các luật về domain thật (DNS, MX, Search Console) áp dụng khi khách có domain riêng: chuyển từ site cũ, hoặc khi DigiForge có domain chung.

<a id="gl-01"></a>
### GL-01 · Runbook go-live có mốc và điều kiện rollback — PHẢI
- **T-3 ngày:**
  - sao lưu DNS, dataset CMS, ID deployment hiện tại;
  - **chép đủ MX / SPF / TXT** sang vùng DNS mới **trước** khi đổi NS;
  - xác định NS có thẩm quyền (`.vn` thì hỏi VNNIC);
  - hạ TTL nếu được; lưu IP / cách mở site cũ; diễn tập.
- **T:** đặt env production đủ ([GL-02](#gl-02)) → redeploy → đổi DNS → đợi Vercel báo "Valid Configuration".
- **T+1 giờ:** kiểm 10 điểm:
  1. 200, không có noindex ngoài ý muốn;
  2. redirect www / http đúng chiều;
  3. `robots.txt` đúng;
  4. sitemap `<loc>` đúng host;
  5. `check-urls` 0 lệch;
  6. form thật ([LD-10](09-lead.md#ld-10));
  7. (có Sanity) sửa thử trong Studio → trang đổi (webhook);
  8. email của khách vẫn chạy;
  9. `og:*` hiển thị trên Facebook / Zalo;
  10. Search Console + Bing đã nộp sitemap.
- **Điều kiện rollback có số:**
  - > 0,5 % URL lỗi;
  - 5xx lặp lại;
  - form không gửi được;
  - TLS lỗi > 30 phút;
  - email gián đoạn.
  - Cách rollback: "Promote previous deployment" / `vercel rollback`.
- **KHÔNG** huỷ hosting cũ khi còn mail / domain khác. Giữ site cũ ≥ 4 tuần. Crawl bù nội dung mới ngay trước khi đổi DNS.
- **Nguồn:** `P1` `docs/superpowers/plans/2026-10-13-P1-system-audit.md` §8; `P2` TASKS #23; `P7` (webhook suýt trỏ vào WordPress cũ); `P1 5e449a8`.

<a id="gl-02"></a>
### GL-02 · Cổng chặn go-live — PHẢI
Không go-live chính thức (G6 ở bước Release) khi còn mục nào dưới đây sai. Bản demo sau G5 không qua cổng này: nó đã qua check nhanh + G5, và audit đo ngay trên nó.
- **Env production đủ:**
  - nguồn nội dung: `SANITY_SOURCE` đúng lựa chọn của dự án; có Sanity thì project / dataset / token, `SANITY_REVALIDATE_SECRET`;
  - đích lead: CRM key hoặc mail. Chưa có thì website **còn ở chế độ demo** ([LD-01](09-lead.md#ld-01)): checklist ghi rõ là việc còn mở để người duyệt G6 quyết; không giả là đã có;
  - `NEXT_PUBLIC_SITE_URL` = host cuối;
  - `ALLOW_INDEXING` đúng quyết định;
  - GTM / GA nếu có.
  - Diff env preview ↔ production.
- Cửa nội dung đọc **đúng nguồn đã chọn** ([KT-01](01-kien-truc.md#kt-01)): dự án bật Sanity → `sanity` (seed dự phòng không được che việc CMS chưa nối); không bật Sanity → `seed` là nguồn chính thức, hợp lệ ([ND-10](04-noi-dung-cms.md#nd-10)).
- HTML production không có `localhost` / `vercel.app` (trừ khi đó là host chính thức).
- `sitemap.xml`, `robots.txt` (và `llms.txt` nếu có) trả 200. Mọi ảnh 200. Redirect đúng mã và đích. `og:image` 200 không qua redirect.
- Khi có GTM / GA4: GA4 nhận hit, `generate_lead` đã thấy ở Realtime (kiểm sau khi Release áp cấu hình — [TR-07](10-tracking.md#tr-07)).
- Không còn dấu vết khách khác ([KT-08](01-kien-truc.md#kt-08)), placeholder `missing_info` hay Lorem ipsum.
- Test + typecheck + build xanh trong CI.
- **Nguồn:**
  - `P7`: seed che việc CMS chưa nối.
  - `P2` TASKS #17, #22: noindex và form "bảo trì" sau go-live.
  - `P5`: `NEXT_PUBLIC_SITE_URL` là localhost suốt 43 ngày.
  - `P2`: 19 suite đỏ vẫn deploy.

<a id="gl-03"></a>
### GL-03 · Đổi env thì redeploy và kiểm HTML thật — PHẢI
- `NEXT_PUBLIC_*`, `ALLOW_INDEXING` và header trong `next.config.ts` được **chốt lúc build**. Đổi xong PHẢI redeploy.
- Sau redeploy kiểm bằng `curl` / grep bundle trên URL thật: header `X-Robots-Tag`, `robots.txt`, canonical, ID GTM.
- Purge ISR có thể còn hai bản cache: ép redeploy.
- **Nguồn:** `P2` TASKS #17; `P1` `next.config.ts`; `P7` `docs/tracking.md` §1; `P3 cb7316d`.

<a id="gl-04"></a>
### GL-04 · Đổi domain / host chính — PHẢI
Thứ tự:
1. Kiểm apex + www cùng về nền tảng mới (nhiều resolver; `curl` thẳng IP).
2. Đặt domain chính; domain phụ 301 / 308 về.
3. Cập nhật `NEXT_PUBLIC_SITE_URL`, CORS Sanity, webhook Sanity (dùng host chính).
4. Redeploy ([GL-03](#gl-03)).
5. Nộp lại sitemap, xoá sitemap cũ.
6. Kiểm preview Facebook / Zalo trên từng domain. Zalo không theo redirect, nên chia sẻ link host chính.

- **Nguồn:** `P7 4386cea`; `P8`: đổi www → apex làm CORS Sanity hỏng.

<a id="gl-05"></a>
### GL-05 · Theo dõi 4 tuần sau go-live — PHẢI
- **Mỗi ngày tuần đầu**, sau đó mỗi tuần:
  - log 404 của Vercel → bổ sung redirect;
  - Search Console: Pages, email cảnh báo (JobPosting / Breadcrumbs / Product), CWV;
  - lead nhận được so với trước.
- Theo dõi deploy bằng API / CLI (`vercel inspect --wait`). KHÔNG poll site production liên tục: Vercel Security Checkpoint sẽ trả 403.
- Hỏi thử AI theo bộ câu cố định ([GEO-08](03-geo.md#geo-08)).
- **Nguồn:** `P1 d1a172a`: 10 lần 404 trong 2 giờ đầu; `P1 dfea273`, `adb900d` (email GSC); `P2` (tài liệu 12/11).

<a id="gl-06"></a>
### GL-06 · CI/CD — PHẢI
- PR chạy job `ci`: `lint · typecheck · test · build`. Đây là required check của `main` (do `github.configure_ci` bật, sau khi nhánh làm việc lên GitHub).
- Repo lên GitHub sau G5 (DigiForge v8, Q-118), nên job `ci` chạy lần đầu ở stage Phát hành: bốn script phải chạy y hệt trên máy (check tĩnh + e2e local chạy đúng các script đó trước G5). CI đỏ → không merge, sửa bằng yêu cầu thay đổi.
- Không deploy khi test đỏ. QA chạy trên bản build local đúng commit trước G5; PR mở sau G5 với đúng commit đã duyệt.
- PR chỉ merge vào `main` sau G5, đúng commit đã duyệt và khi job `ci` của commit đó xanh — DigiForge merge (`github.merge_pr`, kiểu merge commit, không squash, để nhánh làm việc giữ lịch sử cho lượt sửa sau), sau khi đã đặt env production của bản demo. Production build từ `main`.
- Deploy production: `concurrency` không huỷ job đang chạy; ghim phiên bản CLI.
- Script QA (perf, chụp ảnh, audit) nằm **trong repo**, không để ở thư mục tạm.
- **Nguồn:**
  - `P2`, `P1`, `P7`, `P3`: không có CI chạy test.
  - `P4 6bfca9e`.
  - `P7`, `P2`: script QA ở thư mục tạm bị mất.

<a id="gl-07"></a>
### GL-07 · Bàn giao — PHẢI
- **Tài liệu cho khách:**
  - hướng dẫn sửa nội dung (ngắn, có ảnh, không thuật ngữ): có Sanity → hướng dẫn Studio; không có Sanity → cách gửi yêu cầu thay đổi nội dung trên DigiForge (không có Studio);
  - danh sách nội dung khách cần tự hoàn thiện;
  - cách đọc GA4 (độ trễ, nguồn);
  - mã import GTM + bảng sự kiện;
  - thông tin liên hệ hỗ trợ.
- **Quyền:** cổng khách; Studio `editor` (Q-28) khi dự án bật Sanity.
- **Báo cáo mỗi đợt / PR:** đã làm / đã kiểm / TODO cần thông tin thật / việc thủ công / cách rollback.
- Tài liệu thô của khách (feedback có dữ liệu cá nhân, ảnh gốc, tệp lớn) để **ngoài git** (`client-inputs/` trong `.gitignore` + `.vercelignore`).
- Báo cáo QA / audit / bàn giao thì commit vào `docs/`: để local-only sẽ mất khi merge.
- **Nguồn:** `P2` `docs/build-studio-guide.py`, `docs/gtm/*`; `P8` `docs/SEO_GEO_AEO_REPORT.md`; `P7` `docs/tracking.md`; `P2 0fe4e18`.

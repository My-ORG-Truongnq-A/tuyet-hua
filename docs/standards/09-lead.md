# 09 · Lead & chuyển đổi (`LD`)

Lead là thứ khách trả tiền để có, nên mất lead là lỗi nặng nhất. Trong 8 repo, có 5 repo từng mất lead hoặc báo thành công giả.

Đích lead chọn bằng `LEAD_DESTINATION`:
- `digiagent_crm` (mặc định, Q-14): gọi server-to-server tới `POST {DGA_API_URL}/api/v1/public/forms/{DGA_FORM_KEY}/submit`.
- `sanity_gmail`: lưu Sanity + gửi mail tới `LEAD_TO_EMAIL`.

Đích (CRM / Gmail) và **khoá của đích** (`DGA_FORM_KEY` / `LEAD_TO_EMAIL`) nhập ở thẻ **Cấu hình dự án** của DigiForge, lúc tạo dự án hoặc bất cứ lúc nào sau đó (Q-118; v7: bước Release — Q-106). Khoá chỉ chạy thật trên production ở lần áp cấu hình sau G6.

**Chưa có đích thì form vẫn dựng như thường** và chạy chế độ demo ([LD-01](#ld-01)) ở **mọi bản**: bản build local, bản demo production và cả bản chính thức. "Chưa có đích" gồm: thiếu khoá của đích, hoặc đích là DigiAgent CRM mà hệ thống DigiForge chưa có `DGA_API_URL`. Dự án chọn "Không làm form lead" thì không dựng form.

<a id="ld-01"></a>
### LD-01 · Lưu xong mới báo thành công — PHẢI
- Server action xử lý theo thứ tự:
  1. honeypot;
  2. validate bằng zod (định nghĩa form lấy từ dữ liệu trang, không từ browser);
  3. rate limit;
  4. **giao lead** (CRM / lưu CMS);
  5. thông báo (mail);
  6. trả `{ ok: true, requestCode }`.
- Chỉ trả "thành công" khi đã giao lead. **Ngoại lệ có điều kiện duy nhất:** chế độ demo bên dưới (chỉ khi `isDryRun` đúng). Lỗi thì trả `{ ok: false, fieldErrors, message }`, message **luôn kèm hotline**.
- **Không dry-run mà thiếu env đích thì trả lỗi** (lỗi cấu hình), KHÔNG giả thành công. `LEADS_DRY_RUN=1` (chế độ demo) là cách DigiForge đánh dấu **bản chưa có đích lead** — áp cho MỌI bản chưa có đích (Q-118):
  - test, e2e và **bản build local** (bản xem thử, QA, G5): DigiForge build / chạy với `LEADS_DRY_RUN=1`;
  - Vercel target **`preview`**: `LEADS_DRY_RUN=1`;
  - Vercel target **`production`**: DigiForge đặt / gỡ biến này ở `vercel.go_live`, TRƯỚC khi merge PR (lần deploy do merge `main` mang đúng env):
    - lúc phát hành bản demo (sau G5): KHÔNG đọc khoá mới nhập — áp lại cấu hình của lần áp gần nhất sau G6; chưa áp lần nào → chế độ demo;
    - lúc áp cấu hình ở Release (sau G6) và mỗi lần lưu lại cấu hình sau đó: có đích (khoá của đích, và `DGA_API_URL` của hệ thống khi đích là CRM) → `LEADS_DRY_RUN=0` + `LEAD_DESTINATION` + env của đích; chưa có đích → `LEADS_DRY_RUN=1`, KHÔNG đặt env đích — **bản chính thức vẫn ở chế độ demo**, dòng ghi chú vẫn hiện;
    - website không tự đoán chế độ từ env đích: chỉ đọc `LEADS_DRY_RUN` qua `isDryRun(process.env)`.
  - **Chế độ demo** (`isDryRun` đúng):
    - vẫn chạy honeypot, validate, rate limit như thật ([LD-04](#ld-04));
    - KHÔNG giao lead, KHÔNG gửi mail;
    - trả thành công kèm cờ `demo: true` (tính bằng chính `isDryRun`); form hiện thông báo thành công **kèm một dòng** "Bản demo — thông tin chưa được gửi tới doanh nghiệp";
    - dòng ghi chú chỉ hiện khi phản hồi có `demo: true` (không đọc env ở client), nên tự mất khi DigiForge áp cấu hình đích và tắt dry-run;
    - `check.forms` của DigiForge (QA trên bản build local, dry-run) **chặn** khi gửi hợp lệ thành công mà không thấy dòng ghi chú (`forms.demo_notice_missing`).
  - **Trạng thái dry-run đọc được từ ngoài:** `GET /api/leads/status` (chạy mỗi request: `dynamic = 'force-dynamic'`, hoặc `await connection()` đầu handler khi bật `cacheComponents` — Next 16 báo lỗi build nếu khai `dynamic`; `cache-control: no-store`) trả đúng `{ "dryRun": true | false, "kinds": ["bao-gia", …] }`.
    - `dryRun` tính bằng **chính hàm** nhánh giao lead dùng (vd `isDryRun(process.env)`), không trả env hay đích lead.
    - `kinds` là giá trị `$kind` của MỌI form đi qua đúng hàm giao lead đó. Form ghi chỗ khác (đặt lịch, newsletter, bình luận) không được liệt kê.
    - `check.forms` của DigiForge chỉ gửi thử (trên bản build local) khi đọc được `dryRun === true`, và chỉ gửi form có `$kind` nằm trong `kinds`. Form khác chỉ được kiểm phần không gửi.
    - Không có endpoint này thì QA không gửi thử, báo `forms.dry_run_unproven`.
    - Trên production, `check.postlaunch` (sau khi phát hành bản demo) và `check.release` (sau khi áp cấu hình) đọc endpoint này: `dryRun` phải khớp chế độ DigiForge **đã áp** (demo khi chưa có đích, live khi có).
      - Chế độ live (đã có đích): lệch hoặc không đọc được → **chặn** (lead thật có thể mất).
      - Chế độ demo (chưa có đích): lệch hoặc không đọc được → **chỉ cảnh báo**, không chặn luồng phát hành (Q-120 — form lead là phần tuỳ chọn). Sửa sau bằng yêu cầu thay đổi loại `code`.
- Nhánh `sanity_gmail`: lưu CMS **và** gửi mail song song (`Promise.allSettled`), "đã giao" khi ít nhất một bên OK. Mail lỗi thì đánh dấu trong Studio.
- Idempotent theo `requestId`: gửi lại cùng request thì trả mã cũ, không gửi mail lần hai.
- Định danh client gửi lên (`orderId`, tiêu đề chương trình) phải **tra lại ở server**.
- **Nguồn:**
  - `P7` `actions/lead.ts`: thiếu token thì `console.info` rồi trả success, mất lead 13 ngày.
  - `P1 c34ed07`: thiếu `SMTP_*`; `P1 c21e74a`.
  - `P2 885d182`: Gmail sập; TASKS #22: form báo "bảo trì".
  - `P8` `crm-lead.ts`: trả lỗi khi chưa cấu hình.
  - `P5` `quote-action.ts`.

<a id="ld-02"></a>
### LD-02 · Gửi CRM server-to-server, không iframe — PHẢI
- Gọi CRM từ server action. Khoá `name` / `phone` / `email` là khoá dành riêng; các trường còn lại đưa vào `custom_fields`.
- `context` gồm `page_url`, `referrer`, UTM ([LD-05](#ld-05)).
- Form key nằm trong env, KHÔNG nằm trong component.
- Domain của site phải có trong `allowed_domains` của form CRM nếu CRM kiểm tra. Thiếu thì API **vẫn trả "thành công" nhưng không tạo lead**.
- CRM DigiAgent trả "cảm ơn" cả khi chặn lượt gửi (honeypot, gửi dưới 2 s, CAPTCHA, Origin). Vì vậy phản hồi `ok` không phải bằng chứng lead đã vào CRM; sau khi áp cấu hình cần người xác nhận trong CRM (Q-37, [LD-10](#ld-10)).
- **Nếu bắt buộc dùng iframe CRM:**
  - nghe tín hiệu sống qua `postMessage` (kiểm `e.origin` **và** form key);
  - im lặng 10 s thì hiện phương án dự phòng (gọi, Zalo, email, mở tab mới, thử lại);
  - KHÔNG tin `onload`.
- **Nguồn:**
  - `P7`: chuyển sang iframe làm mất `generate_lead` và các trường riêng.
  - `P3 1ec73f4`: iframe trắng, trang vẫn 200, lead về 0.
  - `P3` `crm-lead.ts` (docstring `allowed_domains`).
  - `P8 51751d7`, `P6 52beb07`.

<a id="ld-03"></a>
### LD-03 · Form giữ dữ liệu khi lỗi — PHẢI
- React 19 reset `<form action={fn}>` sau mọi lần submit. Vì vậy dùng `onSubmit` + `preventDefault` + `startTransition(() => action(formData))`.
- Giữ `action` trên `<form>` để form vẫn chạy khi không có JS.
- Validate ở client bằng **cùng schema zod** với server. Schema nạp lười ([HN-07](05-hieu-nang.md#hn-07)).
- Lỗi gắn đúng ô, focus vào ô lỗi đầu tiên ([TC-02](08-tiep-can.md#tc-02)).
- Có `error.tsx` bắt server action throw ([KT-06](01-kien-truc.md#kt-06)).
- **Nguồn:** `P2 83c154f` (U1: mất cả 4 ô khi nhập sai 1 ô); `P2` e2e "rejected form keeps what the visitor typed".

<a id="ld-04"></a>
### LD-04 · Chống spam nhiều lớp — PHẢI
- **Honeypot** (`_hpf` / `website`, `z.string().max(0)`): `tabIndex=-1`, `aria-hidden`, `autoComplete="off"`.
  - Honeypot **không được nhận focus**: nút "chọn trường" từng focus nhầm vào honeypot và làm mất lead.
  - Bot bị bỏ qua im lặng: trả `ok: true` **không kèm lead**, để không đếm chuyển đổi. Đây là ngoại lệ có chủ đích của [LD-01](#ld-01): không cho bot biết đã bị chặn.
- **Thời gian điền** `elapsed_seconds` ≥ 2 s.
- **Rate limit dùng store chung** (Upstash Redis qua Vercel Marketplace, hoặc Vercel Firewall), theo `ip:kind`.
  - KHÔNG dùng `Map` trong bộ nhớ: vô hiệu trên serverless.
  - Chỉ đếm lượt submit **hợp lệ**: sửa typo vài lần không bị khoá. Bị chặn thì báo kèm hotline.
- CAPTCHA không cản người dùng (Turnstile / proof-of-work) khi bị spam thật. Kiểm Origin.
- Giới hạn kích thước: tệp ≤ 4 MB (giới hạn body của Vercel là 4,5 MB), kiểm cả client lẫn server, chỉ nhận `image/*` / `pdf`; số mục ≤ 30.
- **Nguồn:**
  - `P1 c21e74a` (honeypot nhận focus).
  - `P2 U10` (đếm lượt lỗi).
  - `P6 KT-17`, `P5`, `P8`: rate limit bằng `Map`.
  - `P3 b33004e`; `P4` `api/_pow.ts`.
  - `P2` B7 (CV 4 MB).

<a id="ld-05"></a>
### LD-05 · Nguồn lead (attribution) — PHẢI
- Lưu `utm_*`, `gclid` / `gbraid` / `wbraid`, `fbclid`, landing page, referrer.
  - Cookie first-party 30 ngày (`samesite=lax`, `secure`), mô hình "last non-direct".
  - Gặp `utm_*` mới thì ghi đè **toàn bộ** bộ giá trị.
- Gửi theo lead (field ẩn hoặc `context` của CRM).
- Mail thông báo hiện Nguồn / Chiến dịch / Trang gửi form.
- KHÔNG lưu click ID lâu hơn cần thiết. KHÔNG đưa PII vào analytics.
- **Nguồn:**
  - `P2 68fe9f7` (`lead-source.ts` + test).
  - `P3 13e0694`, `6275407` (`attribution.ts` + test).
  - `P6 KT-11`: chỉ gửi `referer` nên mất nguồn.

<a id="ld-06"></a>
### LD-06 · Dữ liệu và định dạng Việt Nam — PHẢI
- **SĐT:**
  - di động `(0|\+84|84)(3|5|7|8|9)\d{8}`; máy bàn `02\d{9}`;
  - chuẩn hoá bỏ khoảng trắng `.` `-` `()`;
  - E.164 trong schema.
- **Ngày giờ theo `Asia/Ho_Chi_Minh`:**
  - ngày tối thiểu của ô hẹn tính **ở client sau mount**, không tính lúc render tĩnh;
  - server so cùng múi giờ: `toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" })`;
  - test các mốc 23:30 và 06:30;
  - KHÔNG dùng `new Date().toISOString().slice(0, 10)`.
- Xuất CSV lead: có BOM, chặn formula injection, lọc ngày theo giờ VN.
- **Nguồn:** `P6 KT-09` (lỗi này `P5` chép lại); `P8`: UTC, thiếu số bàn; `P2 83c154f` (`vnPhoneRegex`); `P1` `lead-csv.ts`.

<a id="ld-07"></a>
### LD-07 · Lưu lead an toàn — PHẢI
- Lưu trong Sanity thì dùng ID có dấu chấm (`lead.<uuid>`): ID này chỉ đọc được bằng token, kể cả trong dataset public.
  - ID ngẫu nhiên, không chứa PII.
  - Loại khỏi webhook revalidate, sitemap, query công khai.
- **Kiểm:** query không token `count(*[_type == "lead"])` phải bằng 0.
- Không upload CV lên CMS: chỉ lưu tên file, file gửi kèm mail.
- Mail HTML escape mọi giá trị người dùng nhập.
- Log chỉ ghi `kind`, `requestId`, không ghi dữ liệu cá nhân.
- Lưu bằng chứng đồng ý ([BM-07](11-bao-mat-phap-ly.md#bm-07)).
- **Nguồn:** `P2` `lead-store.ts`; `P1` `PRIVATE_TYPES`, `lead-purpose.ts`.

<a id="ld-08"></a>
### LD-08 · Đường tới form và kênh nhanh — PHẢI
- **CTA chính** ("Nhận báo giá" / "Đặt lịch" / "Tư vấn") có ở header, hero (một CTA), thanh đáy mobile ([MB-03](06-mobile.md#mb-03)) và khối CTA cuối mỗi trang.
- Trang liên hệ đặt form ở đầu trang.
- **Kênh nhanh:** `tel:` (bỏ khoảng trắng), Zalo `https://zalo.me/<số|OA>` mở tab mới với `rel="noopener nofollow"`, Messenger / Fanpage, Chỉ đường.
  - **Chỉ một hotline chính** toàn site, lấy từ `siteSettings`.
- Form theo ngữ cảnh: điền sẵn dịch vụ / sản phẩm / vai trò từ trang gọi tới.
  - Form B2B có loại, số lượng, vai trò (nhà phân phối / đại lý / nhà thầu), tỉnh.
- Lọc không ra kết quả thì đề nghị form quan tâm.
- **Nguồn:** `P6 61f9a6d`; `P5 1fb1df4`; `P1 cb13478` (gộp 8 hotline); `P7` `PartnerRoleLink`; `P1 c21e74a`.

<a id="ld-09"></a>
### LD-09 · Chat widget và popup — NÊN
- **Chat widget:**
  - key **riêng của dự án** qua `NEXT_PUBLIC_CHAT_WIDGET_KEY`; trống thì không nhúng;
  - nạp trễ ([HN-05](05-hieu-nang.md#hn-05)); tắt trong Studio;
  - không đè thanh liên hệ;
  - CSP cho phép host widget; domain preview và production nằm trong `allowed_domains` của bot (Q-41).
- **Popup khuyến mãi:**
  - hiện sau 8 s hoặc sau tương tác; không che LCP; nút đóng 44 px;
  - ghi mốc nghỉ **ngay khi hiện**: 7 ngày giữa hai lần, 30 ngày sau khi bấm;
  - không hiện trên trang form / trang đích của chính nó.
- KHÔNG hiển thị form newsletter / tính năng chưa nối API.
- **Nguồn:** `P5`: key widget của site khác; `P3 07fa91a`, `18d2cd2`; `P5` `NewsletterSignup` giả lập.

<a id="ld-10"></a>
### LD-10 · Kiểm form thật trên production — PHẢI
- Kiểm sau khi DigiForge áp cấu hình đích lead lên production (Release sau G6, hoặc lần lưu khoá đích ở thẻ Cấu hình sau đó) và `check.release` xác nhận form đã thoát chế độ demo (`/api/leads/status` trả `dryRun: false`): gửi form thật với nội dung "TEST – vui lòng bỏ qua" (báo khách trước).
- Kiểm: lead vào CRM (người xác nhận), mail tới (nếu có đích mail), `generate_lead` tới GA4 Realtime (nếu có GTM / GA4), thông báo thành công đúng và **không còn** dòng ghi chú bản demo.
- **Ngoại lệ có điều kiện** (chỉ khi website còn chế độ demo — `isDryRun` đúng):
  - bản build local / bản demo không có lead thật để kiểm: chỉ kiểm thông báo thành công kèm dòng ghi chú bản demo;
  - go-live chính thức mà dự án chưa có đích lead thì website giữ chế độ demo: ghi thành việc còn mở trong checklist go-live, KHÔNG đánh dấu LD-10 đạt.
- **Nguồn:** `P2` TASKS #22; `P1` audit 8.3; Q-37.

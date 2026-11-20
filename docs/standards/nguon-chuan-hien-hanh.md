# Nguồn chuẩn hiện hành

Các chuẩn bên ngoài mà bộ tài liệu dựa vào, **xác minh ngày 16/11/2026** bằng nguồn chính thức (Google Search Central, web.dev, OpenAI, Anthropic, Perplexity, W3C, nextjs.org, sanity.io, văn bản pháp luật VN qua bản tin).
Mỗi mục có độ chắc chắn. Mục "chưa xác minh" không được dùng làm luật PHẢI.

**Cập nhật:** khi một chuẩn đổi (Google bỏ rich result, luật mới có hiệu lực…), sửa mục tương ứng ở đây + luật liên quan, ghi ngày.

Ghi chú phương pháp: ưu tiên trang chính thức (Google Search Central, OpenAI, Anthropic, Perplexity, nextjs.org, sanity.io, web.dev). Chỗ nào chỉ có nguồn thứ cấp (blog SEO, công ty luật) ghi rõ và hạ độ chắc chắn. Văn bản pháp luật VN chỉ đọc được qua bản tin/tóm tắt, chưa đọc nguyên văn điều khoản — cần luật sư đối chiếu trước khi ghi thành quy định cứng.

## 1. Google rich results / structured data
- **Kết luận:**
  - **FAQ rich result đã bị Google bỏ**: changelog ghi "will no longer appear in Google Search starting May 7, 2026" (thêm 08/05/2026); tài liệu FAQ bị xoá 15/06/2026. Trước đó (08/2023) FAQ chỉ còn cho site chính phủ/sức khoẻ uy tín.
  - **HowTo rich result đã bị bỏ từ 2023** (mobile rồi desktop, 09/2023). Mã `FAQPage`/`HowTo` vẫn hợp lệ trong schema.org, không gây hại, nhưng không còn cho hiển thị mở rộng trên Google.
  - Bị bỏ 2025–2026: Special announcement (hết 31/07/2025), Course info, Estimated salary, Learning video, Vehicle listing (xoá tài liệu 09/09/2025), Practice problem (xoá 06/01/2026); đã gắn banner thôi hỗ trợ Book actions, ClaimReview (06/2025; Book actions sau đó được giữ lại 05/11/2025). Sitelinks search box bỏ từ 11/2024.
  - Thư viện hiện hành (25 loại): Article, Breadcrumb, Carousel, Course list, Dataset, Discussion forum, Education Q&A, Employer aggregate rating, Event, Image metadata, Job posting, Local business, Math solver, Movie, Organization, Product, Profile page, Q&A, Recipe, Review snippet, Software app, Speakable, Subscription/paywalled, Vacation rental, Video. (Trang gallery không đánh dấu loại nào là deprecated, nhưng changelog là nguồn đúng cho việc bỏ.)
  - Dataset markup chỉ dùng cho Dataset Search (làm rõ 11/2025).
- **Hệ quả:**
  - PHẢI dùng JSON-LD cho: Organization, LocalBusiness (nếu có địa điểm), Article/BlogPosting, BreadcrumbList, Product + Review snippet (nếu bán hàng/đánh giá thật), VideoObject, Event khi phù hợp. PHẢI khớp nội dung hiển thị.
  - KHÔNG hứa "rich result FAQ/HowTo" cho khách trên Google. KHÔNG dùng FAQPage/HowTo như tính năng SEO chính; NÊN vẫn giữ khối FAQ hiển thị cho người dùng (và AI trích dẫn), markup FAQPage tuỳ chọn, không bắt buộc.
  - KHÔNG đánh dấu review tự viết/giả; KHÔNG markup nội dung không hiển thị.
- **Nguồn:** [Google Search Central — Updates/changelog](https://developers.google.com/search/updates) — mục 15/06/2026, 08/05/2026, 06/01/2026, 05/11/2025, 09/09/2025; [FAQ structured data](https://developers.google.com/search/docs/appearance/structured-data/faqpage); [Search gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery); HowTo: [SEJ](https://www.searchenginejournal.com/google-downgrades-visibility-of-howto-and-faq-rich-results/) (thứ cấp)
- **Độ chắc chắn:** cao (FAQ, danh sách bỏ); trung bình (HowTo — nguồn thứ cấp, trang changelog bản đọc chỉ phủ nửa đầu)

## 2. Google AI Overviews / AI Mode
- **Kết luận:** Tài liệu chính thức "AI features and your website": **không cần yêu cầu bổ sung và không cần schema đặc biệt** để xuất hiện trong AI Overviews/AI Mode; trang phải được index và đủ điều kiện hiển thị snippet. Kiểm soát: `nosnippet`, `data-nosnippet`, `max-snippet`, `noindex` (cũng chi phối AI features, nhưng đồng thời bỏ snippet ở kết quả thường). `Google-Extended` chỉ giới hạn huấn luyện/grounding ở sản phẩm Gemini khác, **không** ảnh hưởng Search. Lưu lượng AI Overviews/AI Mode tính vào báo cáo "Web" trong Search Console. Có tin thứ cấp về điều khiển opt-out riêng cho AI trong Search Console / yêu cầu của CMA (UK) — chưa xác minh từ tài liệu chính thức.
- **Hệ quả:** KHÔNG cần "markup cho AI Overviews". NÊN: nội dung hữu ích, trả lời trực tiếp ở đầu đoạn, heading rõ, có tác giả/nguồn, schema khớp nội dung. KHÔNG đặt `nosnippet`/`max-snippet` thấp trên trang muốn lên top. PHẢI giữ Googlebot truy cập được (robots.txt, không chặn CSS/JS).
- **Nguồn:** [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features); thứ cấp: [PPC Land — 7 ways to keep content out of AI](https://ppc.land/google-lists-7-ways-to-keep-content-out-of-search-ai-opt-out-included/)
- **Độ chắc chắn:** cao (nội dung chính thức); thấp (opt-out mới/CMA)

## 3. llms.txt
- **Kết luận:**
  - **Google**: Search không cần và không dùng llms.txt cho AI Overviews/AI Mode (Illyes, Mueller 2025: không hỗ trợ; hướng dẫn tối ưu cho generative AI trong Search Central liệt kê nó là không cần; changelog 06/2026 có mục làm rõ — nguồn thứ cấp). Lighthouse 13.x có kiểm "Agentic Browsing" thử nghiệm, llms.txt tuỳ chọn, thiếu không bị tính là lỗi.
  - **OpenAI, Perplexity**: chưa có tuyên bố chính thức rằng crawler đọc llms.txt; docs của họ chỉ nói về robots.txt.
  - **Anthropic**: có tin thứ cấp nói Claude đọc llms.txt khi truy xuất — chưa kiểm được trên tài liệu chính thức; Anthropic tự xuất bản llms.txt cho docs của họ (khác với việc đọc file của site khác). Next.js docs cũng xuất bản llms.txt (nextjs.org/llms.txt) cho agent.
  - Không có khuyến nghị chính thức từ nhà cung cấp lớn nào.
- **Hệ quả:** KHÔNG coi llms.txt là yếu tố xếp hạng/trích dẫn. NÊN (chi phí thấp, tự sinh từ CMS) cung cấp `/llms.txt` ngắn gọn cho agent/dev tools; KHÔNG ưu tiên hơn nội dung/schema/robots. KHÔNG để trả 404/5xx lỗi cấu hình nếu đã công bố.
- **Nguồn:** [SEJ — Google's llms.txt guidance depends on which product](https://www.searchenginejournal.com/googles-llms-txt-guidance-depends-on-which-product-you-ask/575431/) (thứ cấp); [Techwyse — June 2026](https://www.techwyse.com/news/ai-search/google-llms-txt-no-ranking-benefit-june-2026) (thứ cấp); [Next.js blog (llms.txt index)](https://nextjs.org/blog)
- **Độ chắc chắn:** trung bình (Google); thấp (Anthropic/OpenAI/Perplexity đọc hay không)

## 4. Crawler AI & robots.txt
- **Kết luận (bảng token hiện hành):**

| Nhà | Token | Mục đích | robots.txt |
|---|---|---|---|
| OpenAI | `GPTBot` | huấn luyện | Disallow = không dùng để train; **không** ảnh hưởng ChatGPT search |
| OpenAI | `OAI-SearchBot` | đưa site vào ChatGPT search | chặn = không hiện trong câu trả lời search (có thể vẫn là link điều hướng); hiệu lực ~24 giờ |
| OpenAI | `ChatGPT-User` | người dùng bấm / Custom GPT | OpenAI nói robots.txt "may not apply" vì do người dùng khởi tạo |
| OpenAI | `OAI-AdsBot` (mới) | kiểm tra landing page nộp làm quảng cáo ChatGPT | chỉ ghé trang được nộp quảng cáo |
| Anthropic | `ClaudeBot` | huấn luyện | tuân robots.txt |
| Anthropic | `Claude-SearchBot` | lập chỉ mục cho search | tuân robots.txt; chặn có thể giảm hiển thị |
| Anthropic | `Claude-User` | người dùng hỏi, Claude lấy trang | tuân robots.txt (Anthropic nói rõ); chặn giảm hiển thị |
| Perplexity | `PerplexityBot` | lập chỉ mục search, **không** train | nên cho phép nếu muốn hiện |
| Perplexity | `Perplexity-User` | người dùng hỏi | "thường bỏ qua robots.txt" |
| Google | `Google-Extended` | token (không crawl) điều khiển train/grounding Gemini | không ảnh hưởng Search |
| Apple | `Applebot-Extended` | token, opt-out train AI Apple | không ảnh hưởng Applebot search |
| Meta | `Meta-ExternalAgent` (train/index), `Meta-ExternalFetcher` (người dùng) | | nguồn thứ cấp |
| Common Crawl | `CCBot` | dataset mở dùng để train | |
| Microsoft | `Bingbot` | index Bing → Copilot | |

  - Anthropic: chặn theo từng subdomain; hỗ trợ `Crawl-delay`; không nên chặn theo IP; IP công bố ở claude.com/crawling/bots.json. Token cũ `Claude-Web`, `anthropic-ai` đã deprecated.
  - **Muốn lên ChatGPT search / Perplexity / Claude search thì cho: `OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot`** (và `Claude-User`, `ChatGPT-User` cho truy xuất theo yêu cầu). Chặn bot huấn luyện (GPTBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended, Meta-ExternalAgent) là lựa chọn độc lập, không làm mất hiển thị search.
  - ChatGPT search có dựa Bing không: OpenAI không công bố nhà cung cấp; nhiều blog nói ChatGPT từng dựa mạnh vào chỉ mục Bing, một số nói 2026 chuyển sang chỉ mục lai — **chưa xác nhận từ nguồn chính thức**. Copilot dùng nền Bing (Bing Webmaster có báo cáo AI Performance, preview 02/2026 — thứ cấp).
  - IndexNow: Bing, Yandex, Naver, Seznam hỗ trợ; Google không. Không có nguồn chính thức nói IndexNow ảnh hưởng ChatGPT.
- **Hệ quả:** PHẢI khai báo robots.txt tường minh theo từng token (qua `app/robots.ts`), ghi chú mục đích. NÊN mặc định cho phép bot search/user, quyết định train theo chính sách khách (mặc định đề xuất: cho phép search, chặn train nếu khách yêu cầu). KHÔNG dựa robots.txt để chặn `ChatGPT-User`/`Perplexity-User`; muốn chặn thật dùng WAF/xác minh IP. NÊN đăng ký Bing Webmaster Tools và bật IndexNow (rẻ, có lợi Bing/Copilot/Yandex/Naver) nhưng KHÔNG hứa tác động lên ChatGPT. KHÔNG chặn bằng IP.
- **Nguồn:** [OpenAI — Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots); [Anthropic — Does Anthropic crawl data from the web](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler); [Perplexity — Bots guide](https://docs.perplexity.ai/guides/bots); [Google — AI features](https://developers.google.com/search/docs/appearance/ai-features); Apple/Meta/CCBot: [searchengineworld](https://www.searchengineworld.com/bots-vs-your-website-which-ones-to-allow-and-which-to-block), [PPC Land — Meta-ExternalAgent](https://ppc.land/meta-externalagent/) (thứ cấp)
- **Độ chắc chắn:** cao (OpenAI/Anthropic/Perplexity/Google); trung bình-thấp (Meta/Apple/CCBot; Bing↔ChatGPT; IndexNow↔AI)

## 5. Core Web Vitals & Lighthouse
- **Kết luận:** Không đổi: **LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1** ở phân vị 75, tách mobile/desktop (trang web.dev "Web Vitals", cập nhật gần nhất 31/10/2024; trang không nêu chỉ số mới). INP thay FID từ 12/03/2024. Không thấy nguồn đáng tin về chỉ số CWV mới 2025–2026. Lighthouse hiện 13.x (13.0 ngày 10/10/2025, yêu cầu Node 22.19+): đổi sang audit dạng "insight", **trọng số điểm Performance giữ như từ Lighthouse 10** (TBT, LCP, CLS, FCP, Speed Index). Lighthouse 13.3+ có nhóm "Agentic Browsing" thử nghiệm (thứ cấp). Số phiên bản mới nhất (13.5.0, 09/2026) chưa xác minh.
- **Hệ quả:** PHẢI đặt ngưỡng nghiệm thu = 3 ngưỡng trên (field/CrUX là chuẩn; Lighthouse chỉ là lab). NÊN đặt mục tiêu nội bộ chặt hơn (LCP ≤ 2.0 s, INP ≤ 150 ms trên lab mobile). KHÔNG dùng điểm Lighthouse làm KPI duy nhất; KHÔNG viết tắt "FID".
- **Nguồn:** [web.dev — Web Vitals](https://web.dev/articles/vitals) (31/10/2024); [Chrome — Lighthouse 13.0](https://developer.chrome.com/blog/lighthouse-13-0); [SEJ — Lighthouse 13](https://www.searchenginejournal.com/google-lighthouse-13-launches-with-insight-based-audits/558051/)
- **Độ chắc chắn:** cao (ngưỡng); trung bình (Lighthouse chi tiết)

## 6. Mobile
- **Kết luận:** Tài liệu Google mô tả mobile-first indexing là việc dùng bản mobile để index/xếp hạng, ưu tiên responsive; nội dung/heading/structured data/meta phải tương đương desktop; không chặn tài nguyên, không bắt tương tác mới tải nội dung chính. Trang không nói rõ "đã hoàn tất" — kiến thức có sẵn: Google thông báo hoàn tất chuyển toàn bộ ~cuối 2023 (độ tin cậy trung bình, chưa kiểm lại trong phiên này). Target Size: WCAG 2.2 SC 2.5.8 AA tối thiểu **24×24 CSS px** (có ngoại lệ khoảng cách); khuyến nghị thực hành 44×44 (Apple HIG/WCAG 2.5.5 AAA) / 48 dp (Material). `interactive-widget` (viewport meta, `resizes-content` / `resizes-visual` / `overlays-content`) và đơn vị `dvh/svh/lvh` đã được hỗ trợ rộng — kiến thức có sẵn, chưa kiểm tài liệu trong phiên này.
- **Hệ quả:** PHẢI responsive một URL, parity nội dung mobile/desktop. PHẢI vùng chạm ≥ 24×24 (AA); NÊN ≥ 44×44 cho nút CTA/nav, khoảng cách ≥ 8 px. PHẢI `<meta name="viewport" content="width=device-width, initial-scale=1">`, KHÔNG khoá zoom (`user-scalable=no`/`maximum-scale=1`). NÊN dùng `100dvh`/`svh` thay `100vh` cho hero/menu full-screen; NÊN `interactive-widget=resizes-content` cho trang có form/chat khi bàn phím mở. KHÔNG giấu nội dung chính ở mobile.
- **Nguồn:** [Google — Mobile-first indexing best practices](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing); [WCAG 2.2 — 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) (chưa mở trong phiên này)
- **Độ chắc chắn:** cao (yêu cầu Google); trung bình (mốc hoàn tất, 24/44/48, `interactive-widget`/`dvh` — từ kiến thức có sẵn)

## 7. Accessibility
- **Kết luận:** **WCAG 2.2 vẫn là Recommendation hiện hành**; WCAG 3.0 vẫn là Working Draft (bản 03/03/2026 trên w3.org/TR/2026/WD-wcag-3.0-20260303; có tin thứ cấp về bản 09/2026, chưa xác minh). W3C nói WCAG 3 không thay WCAG 2, chưa thành chuẩn "trong vài năm tới"; AbilityNet (thứ cấp) nhắc mốc Candidate Recommendation dự kiến ~Q4/2027. Chưa tìm thấy thông tin ISO.
- **Hệ quả:** PHẢI lấy WCAG 2.2 AA làm chuẩn nền (tương phản 4.5:1 / 3:1, focus nhìn thấy, target size 24 px, form label/lỗi rõ, `lang="vi"`, alt, điều hướng bàn phím). KHÔNG đợi hay áp WCAG 3 (không dùng điểm APCA/Bronze làm tiêu chí nghiệm thu).
- **Nguồn:** [W3C — WCAG 3.0 Working Draft 2026-03-03](https://www.w3.org/TR/2026/WD-wcag-3.0-20260303/); [W3C WAI — WCAG 3 intro](https://www.w3.org/WAI/WCAG3); [W3C WAI news 2026-03-03](https://www.w3.org/WAI/news/2026-03-03/wcag3)
- **Độ chắc chắn:** cao

## 8. Next.js & Sanity
- **Kết luận:**
  - **Next.js mới nhất theo nextjs.org/blog: 16.4 (06/10/2026)**; 16.3 (03/08/2026, Instant Navigations), 16.2 (18/03/2026, Adapter API ổn định), 16.1 (18/12/2025), 16.0 (21/10/2025). Có bản vá bảo mật hằng tháng (gần nhất 03/11/2026) và vá ngoài lịch 14/10/2026 → PHẢI ghim phiên bản vá mới nhất. Số vá chính xác của 16.4.x chưa xác minh (npm dist-tags).
  - Cache Components: `cacheComponents: true` trong `next.config.ts` + directive `"use cache"` (có từ 16.0; 16.4 có "Cache Components improvements"). `proxy.ts` thay `middleware.ts` (Node.js runtime), đổi tên file + hàm export. Turbopack là bundler mặc định, hỗ trợ React 19.2 (16.0) → React 19.3 ở 16.4.
  - Metadata API (`generateMetadata`, `metadata`), `app/sitemap.ts` + `generateSitemaps`, `app/robots.ts`, `next/image` (AVIF/WebP qua `images.formats`), `next/font` — vẫn là cơ chế chuẩn cho SEO/hiệu năng (kiến thức có sẵn của họ API, không có dấu hiệu bị bỏ; chưa đọc lại từng trang docs).
  - **Sanity Studio: v5 (React ≥ 19.2) đã có đời v5.30+; đã có v6** (hướng dẫn v5→v6: Node ≥ 22.12, React ≥ 19.2.2, `@sanity/cli` ≥ 7, Vite 8, strict mode mặc định, đổi mặc định search sang `groq2024`). Ngày phát hành v6 chưa xác minh. **Live Content API đã GA** (ngày GA chưa xác minh; Presentation Live Mode dùng nó).
- **Hệ quả:** NÊN bắt đầu dự án mới trên Next.js 16.x (hiện 16.4) + `sanity` v5 hoặc v6 (chọn v6 nếu toolchain Node ≥ 22.12 ổn; nếu cần ổn định có thể v5 rồi nâng), PHẢI kiểm `package.json` ghim minor và xem bản vá bảo mật trước mỗi lần phát hành. NÊN dùng `proxy.ts` (KHÔNG tạo `middleware.ts` mới). Chỉ bật `cacheComponents` khi cả nhóm hiểu mô hình cache; NÊN dùng Metadata API + `app/sitemap.ts` + `app/robots.ts`. Live Content API: chỉ dùng cho preview/Draft Mode, trang public vẫn tĩnh/cache (và nhớ ràng buộc Sanity gói Free).
- **Nguồn:** [Next.js blog](https://nextjs.org/blog) (đọc 16/11/2026); [Next.js 16](https://nextjs.org/blog/next-16); [Sanity — Studio v5 to v6](https://www.sanity.io/docs/help/v5-to-v6); [Sanity — v4 to v5](https://www.sanity.io/docs/help/v4-to-v5); [Sanity — Live Content API GA](https://www.sanity.io/blog/the-live-content-api-is-now-generally-available)
- **Độ chắc chắn:** cao (phiên bản Next, yêu cầu v6); trung bình (Sanity ngày tháng, API chi tiết)

## 9. Pháp lý Việt Nam
**9a. Dữ liệu cá nhân**
- **Kết luận:**
  - **Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15** (Quốc hội thông qua 26/06/2025) **hiệu lực 01/01/2026**.
  - **Nghị định 356/2025/NĐ-CP** (hướng dẫn luật, ký 31/12/2025, hiệu lực 01/01/2026) **thay thế Nghị định 13/2023/NĐ-CP** (EY: "Nghị định 356 thay thế Nghị định 13") → ND 13 **hết hiệu lực** từ 01/01/2026.
  - Đồng ý (theo EY, tóm tắt): phải lưu và chứng minh được thời điểm + nội dung đồng ý; **không được tích sẵn mặc định đồng ý** hay chỉ dẫn gây nhầm giữa đồng ý/không đồng ý; chấp nhận đồng ý qua website/ứng dụng có cơ chế kỹ thuật xin đồng ý. Rút đồng ý: phản hồi trong 2 ngày làm việc, thực hiện 15 ngày (20 ngày nếu cần bên thứ ba; gia hạn 1 lần tối đa 15 ngày) — ghép cột chưa chắc, cần đối chiếu văn bản. Chuyển dữ liệu ra nước ngoài có hồ sơ đánh giá tác động; dữ liệu nhạy cảm (gồm sức khoẻ) cần biện pháp bảo vệ mạnh hơn. Xử phạt: **Nghị định 330/2026/NĐ-CP** (chưa đọc nguyên văn; một nguồn nói phạt tới ~60 triệu đồng cho một số hành vi thu thập lộ thông tin nhạy cảm — chưa kiểm).
  - Chưa xác minh được từ nguồn chính: quy định riêng cho tin nhắn marketing, dữ liệu trẻ em, nội dung bắt buộc của thông báo xử lý dữ liệu.
- **Hệ quả (form lead):** PHẢI: (1) checkbox đồng ý **không tích sẵn**, tách riêng với đồng ý nhận marketing; (2) ghi rõ mục đích, loại dữ liệu, bên xử lý/nhận, thời hạn, quyền (rút đồng ý, xoá…) và link Chính sách quyền riêng tư ngay cạnh form; (3) lưu bằng chứng đồng ý (thời điểm, phiên bản văn bản, nội dung, IP/UA tối thiểu); (4) có quy trình rút đồng ý ≤ 2 ngày làm việc phản hồi; (5) chỉ thu trường cần thiết. NÊN banner cookie/tracking có chọn lọc cho analytics/ads. KHÔNG thu dữ liệu nhạy cảm (sức khoẻ…) qua form chung nếu chưa có cơ sở pháp lý. Cần luật sư duyệt mẫu văn bản.
- **Nguồn:** [Thư viện pháp luật — Luật 91/2025/QH15](https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Law-91-2025-QH15-Personal-Data-Protection-665440.aspx); [Thư viện pháp luật — NĐ 356/2025/NĐ-CP](https://thuvienphapluat.vn/van-ban/Quyen-dan-su/Nghi-dinh-356-2025-ND-CP-huong-dan-Luat-Bao-ve-du-lieu-ca-nhan-687428.aspx); [EY — bản tin NĐ 356](https://www.ey.com/vi_vn/technical/tax/tax-and-law-updates/nghi-dinh-so-356-2025-nd-cp-quy-dinh-chi-tiet-mot-so-dieu-va-bien-phap-thi-hanh-luat-bao-ve-du-lieu-ca-nhan); [PwC VN — 28/01/2026](https://www.pwc.com/vn/vn/publications/2026/20260128-new-rules-personal-data-protection.pdf)
- **Độ chắc chắn:** cao (hiệu lực luật, NĐ 356 thay NĐ 13); trung bình (chi tiết đồng ý/thời hạn); thấp (marketing, trẻ em, mức phạt)

**9b. Thương mại điện tử (website bán hàng)**
- **Kết luận:** **Luật Thương mại điện tử số 122/2025/QH15** (thông qua 10/12/2025) và **Nghị định 248/2026/NĐ-CP** (ký 30/06/2026) **hiệu lực 01/07/2026**, thay khung NĐ 52/2013 (sửa bởi NĐ 85/2021). Theo nguồn thứ cấp (thuvienphapluat.vn bảng so sánh, công ty luật): nghĩa vụ **thông báo chỉ áp dụng cho nền tảng kinh doanh trực tiếp có chức năng đặt hàng trực tuyến**; website **chỉ giới thiệu** doanh nghiệp/sản phẩm (không đặt hàng/thanh toán trực tuyến) **không thuộc diện**. Cơ quan tiếp nhận khác nhau giữa các nguồn (UBND cấp tỉnh theo một số bài; Bộ Công Thương/online.gov.vn theo cách cũ) — **chưa xác minh nguyên văn**. Website đã được xác nhận trước 01/07/2026 được hoạt động theo nội dung cũ đến hết 30/06/2027 và phải bổ sung hồ sơ theo NĐ 248. Sàn/mạng xã hội có TMĐT, livestream bán hàng: xác thực người bán, danh tính livestream từ 01/01/2027 (thứ cấp).
- **Hệ quả:** PHẢI hỏi khách trước khi làm: site có giỏ hàng/đặt hàng/thanh toán trực tuyến không. Nếu có → PHẢI làm thủ tục thông báo trước khi vận hành và hiển thị logo/thông tin đã thông báo, điều khoản giao dịch, chính sách đổi trả/bảo mật/thanh toán/vận chuyển. Nếu chỉ giới thiệu + form liên hệ → KHÔNG cần thông báo TMĐT nhưng vẫn PHẢI có thông tin doanh nghiệp (tên, MST, địa chỉ, liên hệ) và chính sách quyền riêng tư. Ghi vào checklist "cần luật sư xác nhận".
- **Nguồn:** [Thư viện pháp luật — Luật TMĐT 2025](https://thuvienphapluat.vn/van-ban/Thuong-mai/Lenh-cong-bo-Luat-Thuong-mai-dien-tu-2025-691395.aspx) (bản tin; chưa đọc được toàn văn); [Bộ Công Thương — phổ biến Luật TMĐT và NĐ 248/2026](https://moit.gov.vn/tin-tuc/bo-cong-thuong-pho-bien-luat-thuong-mai-dien-tu-va-nghi-dinh-so-248-2026-nd-cp.html) (không nêu thủ tục website); [Thư viện pháp luật — thủ tục thông báo website bán hàng](https://thuvienphapluat.vn/banan/tin-tuc/thu-tuc-thong-bao-thiet-lap-website-thuong-mai-dien-tu-ban-hang-duoc-thuc-hien-nhu-the-nao-50918.html)
- **Độ chắc chắn:** cao (hiệu lực luật/NĐ); trung bình-thấp (phạm vi, cơ quan tiếp nhận thủ tục)

**9c. Quảng cáo dịch vụ y tế/thẩm mỹ**
- **Kết luận:** Dịch vụ khám chữa bệnh (gồm thẩm mỹ có can thiệp y tế) khi quảng cáo cần **Giấy xác nhận nội dung quảng cáo** của **Sở Y tế** (theo thủ tục địa phương, căn cứ Luật Quảng cáo, NĐ 181/2013 và TT 09/2015/TT-BYT vẫn được viện dẫn trong công bố thủ tục hành chính); cơ sở phải có giấy phép hoạt động khám chữa bệnh. Có tin Nghị định 87/2026/NĐ-CP xử phạt vi phạm quảng cáo hiệu lực 15/05/2026 (blog, chưa kiểm) và việc phân cấp quảng cáo thực phẩm bảo vệ sức khoẻ cho UBND tỉnh từ 01/07/2026. **Chưa xác minh** việc Luật Quảng cáo/NĐ 181 đã bị thay hay sửa gần đây.
- **Hệ quả:** PHẢI hỏi khách ngành y tế/thẩm mỹ/dược/TPCN: có giấy phép hoạt động + giấy xác nhận nội dung quảng cáo chưa; KHÔNG đăng nội dung quảng cáo (cam kết kết quả, trước–sau, so sánh, khuyến mại) trước khi khách cung cấp giấy. KHÔNG cam kết "100% hiệu quả". Lưu mã/ngày giấy xác nhận trong CMS và đặt ở chân bài quảng cáo.
- **Nguồn:** [LSVN — phân cấp cấp giấy xác nhận quảng cáo KCB](https://lsvn.vn/phan-cap-tham-quyen-cap-giay-xac-nhan-noi-dung-quang-cao-dich-vu-kham-chua-benh-a159242.html); [Công báo Trà Vinh — QĐ 1177](https://congbao.travinh.gov.vn/congbao/congbao.nsf/76CAEDF6E980B27C47258C90002C1005/$file/Kèm%20QĐ%201177.pdf) (thủ tục địa phương)
- **Độ chắc chắn:** trung bình-thấp (nên hỏi luật sư/Sở Y tế)

## 10. Đo lường quảng cáo
- **Kết luận:**
  - **OpenAI có quảng cáo ChatGPT** (chỉ hiện cho gói Free/Go) với **Ads Manager, Pixel (client-side) và Conversions API (server-side)**: ra mắt tự phục vụ cho doanh nghiệp Mỹ 05/05/2026 (CPC), dedupe bằng cùng Pixel ID + event ID, click-through + view-through 1 ngày; đối tác CAPI (LiveRamp, Hightouch, Tealium…), AppsFlyer/Adjust (07/2026). Nguồn chủ yếu thứ cấp (ppc.land…), chưa đọc docs developer của OpenAI. **OpenAI thông báo ChatGPT Ads mở ở Việt Nam từ 23/09/2026** (đợt 7 thị trường Đông Nam Á + Đài Loan) — tin tức từ trang OpenAI và báo quảng cáo VN; điều kiện pháp nhân thanh toán chưa rõ. Crawler `OAI-AdsBot` kiểm landing page.
  - **Consent Mode v2 của Google**: là yêu cầu theo chính sách đồng ý người dùng EU/EEA (và UK) của Google, không phải luật VN; **không bắt buộc cho traffic Việt Nam**. Khuyến nghị riêng: dùng nếu có khách EEA/UK hoặc để mô hình hoá chuyển đổi khi người dùng từ chối. Nguồn ở đây chỉ nêu EEA; phần "không bắt buộc ở VN" là suy luận từ phạm vi chính sách (độ tin cậy trung bình).
- **Hệ quả:** NÊN thiết kế lớp sự kiện chuyển đổi (dataLayer) dùng chung cho Google/Meta/OpenAI/Zalo, có `event_id` để dedupe pixel + CAPI; PHẢI chặn tag quảng cáo trước khi có đồng ý (ND 356 + Luật 91). NÊN triển khai Consent Mode v2 mặc định `denied` (rẻ, dùng được lâu dài); KHÔNG coi nó là bắt buộc pháp lý VN. Pixel OpenAI: NÊN thêm khi khách chạy ChatGPT Ads, qua cùng cơ chế consent.
- **Nguồn:** [OpenAI — ChatGPT Ads expands to Southeast Asia/Taiwan](https://openai.com/index/chatgpt-ads-expands-southeast-asia-taiwan/); [PPC Land — Ads Manager, CPC, CAPI + pixel](https://ppc.land/openai-opens-chatgpt-ads-manager-to-all-us-businesses-with-cpc-bidding/); [PPC Land — view-through 1 ngày](https://ppc.land/chatgpt-ads-gains-view-through-conversions-with-a-fixed-1-day-window/); [advertisingvietnam — ChatGPT Ads chính thức mở tại VN](https://advertisingvietnam.com/article/chatgpt-ads-chinh-thuc-mo-tai-viet-nam); [SEJ — Consent Mode v2](https://www.searchenginejournal.com/consent-mode-v2-google-shares-shares-key-details-for-advertisers/)
- **Độ chắc chắn:** trung bình (OpenAI ads/VN); trung bình (Consent Mode ngoài EEA)

## 11. Tìm kiếm tại Việt Nam & Zalo
- **Kết luận:** Google vẫn áp đảo. Statcounter VN: desktop 06/2026 Google ~89,5%, Cốc Cốc ~6,2%, Bing ~1,6%; bảng desktop/tablet/console 09/2026 hiển thị Cốc Cốc ~11,2%, Bing ~3,9% (bảng lỗi nhãn, cần mở gốc kiểm). Cốc Cốc đáng kể ở desktop (đứng hai về trình duyệt VN), không phải kênh chính. **Zalo**: không tìm thấy tài liệu chính thức về widget chat nhúng website trong phiên này — chỉ plugin bên thứ ba (WordPress/Odoo dùng OA ID) và trang tạo OA (oa.zalo.me). Link `https://zalo.me/<số điện thoại hoặc OA ID>` là cách phổ biến, rủi ro thấp (kiến thức có sẵn, **chưa xác minh** trên tài liệu Zalo/developers.zalo.me); widget "Zalo chat" chính thức tồn tại ở mức Zalo Social Plugins/OA (chưa xác minh hiện còn hỗ trợ).
- **Hệ quả:** NÊN đăng ký Google Search Console + Bing Webmaster Tools (Cốc Cốc dùng chỉ mục riêng, có Cốc Cốc Webmaster nhưng không cần làm riêng — chưa kiểm). NÊN nút Zalo là link `zalo.me/...` mở tab mới, không nhúng script bên thứ ba nặng (ảnh hưởng INP/LCP, và là tracker → qua consent). KHÔNG tự hứa widget "chính thức" khi chưa kiểm.
- **Nguồn:** [Statcounter VN — desktop](https://gs.statcounter.com/search-engine-host-market-share/desktop/viet-nam); [Statcounter VN — tất cả](https://gs.statcounter.com/search-engine-host-market-share/all/viet-nam); [Cốc Cốc Q1/2026 (BrandsVietnam)](https://www.brandsvietnam.com/congdong/topic/coc-coc-nguoi-dung-tim-kiem-gi-trong-q1-2026)
- **Độ chắc chắn:** trung bình (thị phần); thấp (Zalo embed chính thức)

---
## Phụ lục: danh sách chưa xác minh
1. Mốc Google hoàn tất mobile-first indexing; hỗ trợ `interactive-widget`/`dvh` (kiến thức có sẵn).
2. Nguyên văn Luật 91/2025, NĐ 356/2025, NĐ 330/2026 (marketing, trẻ em, phạt); cơ quan tiếp nhận thông báo website bán hàng; hiệu lực hiện tại của Luật Quảng cáo/NĐ 181/2013/NĐ 87/2026.
3. Zalo: chuẩn nhúng chính thức.
4. ChatGPT search ↔ Bing; IndexNow ↔ AI; Anthropic/OpenAI đọc llms.txt.
5. Số vá mới nhất của Next.js 16.4.x; ngày phát hành Sanity Studio v6; phiên bản Lighthouse mới nhất.

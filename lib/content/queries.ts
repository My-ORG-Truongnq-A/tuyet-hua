/**
 * Truy vấn GROQ dùng CHUNG cho nguồn Sanity và nguồn seed (KT-01, CM-14) — đúng 9 câu của
 * content_model.groq_queries, cộng 2 câu hạ tầng (ảnh, menu) mà content_model chưa liệt kê.
 * Không có nhánh truy vấn riêng cho seed. Trường nội bộ (rightsNote, sourceNote, consentNote) bị bỏ
 * ở bước hậu xử lý chung trong lib/content/index.ts (D-02) vì câu `page` trả cả document.
 */

/** settings — thêm `_updatedAt` (lastmod sitemap) và `favicon`, `redirects` không cần ở đây. */
export const SITE_SETTINGS_QUERY = /* groq */ `*[_id == "siteSettings"][0]{
  _updatedAt, brandName, personName, jobTitle, tagline, logo{ _type, image, alt, usageApproved },
  contact, ui, seoDefaults, blog, integrations
}`;

/** page — singleton trang theo ngôn ngữ, _id = <type>-<lang> (D-05). Tham số: $type, $lang. */
export const PAGE_QUERY = /* groq */ `*[_id == $type + "-" + $lang][0]`;

/** projectList — dự án trọng tâm trước, rồi sortOrder, rồi tên (REQ-02). Tham số: $lang. */
export const PROJECT_LIST_QUERY = /* groq */ `*[_type == "project" && language == $lang && defined(slug.current)] | order(featured desc, sortOrder asc, title asc){ _id, _updatedAt, title, "slug": slug.current, summary, heroImage, featured }`;

/** projectBySlug — Tham số: $lang, $slug. */
export const PROJECT_BY_SLUG_QUERY = /* groq */ `*[_type == "project" && language == $lang && slug.current == $slug][0]`;

/** postList — mới nhất trước, bỏ bài hẹn giờ tương lai. Tham số: $lang, $start, $end. */
export const POST_LIST_QUERY = /* groq */ `*[_type == "post" && language == $lang && publishedAt <= now()] | order(publishedAt desc)[$start...$end]{ _id, _updatedAt, title, "slug": slug.current, excerpt, coverImage, publishedAt }`;

/** Tổng số bài đã đăng (phân trang). Tham số: $lang. */
export const POST_COUNT_QUERY = /* groq */ `count(*[_type == "post" && language == $lang && publishedAt <= now()])`;

/** postBySlug — Tham số: $lang, $slug. */
export const POST_BY_SLUG_QUERY = /* groq */ `*[_type == "post" && language == $lang && slug.current == $slug && publishedAt <= now()][0]`;

/** testimonials — chỉ bản có đồng ý hiển thị (D-10). Tham số: $lang. */
export const TESTIMONIALS_QUERY = /* groq */ `*[_type == "testimonial" && language == $lang && consentConfirmed == true] | order(sortOrder asc){ authorName, authorDescriptor, quote, photo }`;

/** translations — bản dịch của một document (plugin document-internationalization). Tham số: $id. */
export const TRANSLATIONS_QUERY = /* groq */ `*[_type == "translation.metadata" && references($id)][0].translations[].value->{ _type, language, "slug": slug.current }`;

/** redirects — siteSettings.redirects (T5.4). */
export const REDIRECTS_QUERY = /* groq */ `*[_id == "siteSettings"][0].redirects`;

/** Hạ tầng: menu đầu / chân trang (singleton dịch theo trường). */
export const NAVIGATION_QUERY = /* groq */ `{
  "header": *[_id == "header"][0]{ navItems, showLanguageSwitch },
  "footer": *[_id == "footer"][0]{ navItems, legalItems, copyrightText }
}`;

/** Hạ tầng: thông tin ảnh cho mọi asset._ref trong kết quả (url, kích thước). Tham số: $ids. */
export const IMAGE_ASSETS_QUERY = /* groq */ `*[_type == "sanity.imageAsset" && _id in $ids]{
  _id, url, "width": metadata.dimensions.width, "height": metadata.dimensions.height, "lqip": metadata.lqip
}`;

/** Đúng 9 câu của content_model.groq_queries (test đối chiếu). */
export const CONTENT_MODEL_QUERIES = {
  settings: SITE_SETTINGS_QUERY,
  page: PAGE_QUERY,
  projectList: PROJECT_LIST_QUERY,
  projectBySlug: PROJECT_BY_SLUG_QUERY,
  postList: POST_LIST_QUERY,
  postBySlug: POST_BY_SLUG_QUERY,
  testimonials: TESTIMONIALS_QUERY,
  translations: TRANSLATIONS_QUERY,
  redirects: REDIRECTS_QUERY,
} as const;

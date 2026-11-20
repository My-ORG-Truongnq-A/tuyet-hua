/**
 * Truy vấn GROQ dùng CHUNG cho nguồn Sanity và nguồn seed (KT-01).
 * Bước khung chỉ có truy vấn của layout (siteSettings). Truy vấn từng trang thêm ở bước sanity_schemas.
 * Projection loại các trường nội bộ (ghi chú nguồn / quyền dùng).
 */
export const SITE_SETTINGS_QUERY = /* groq */ `*[_type == "siteSettings" && _id == "siteSettings"][0]{
  _updatedAt,
  personName,
  jobTitle,
  organization,
  tagline,
  phone,
  zaloPhone,
  email,
  area,
  socials[]{ _key, platform, url },
  seoDefaults{ titleTemplate, description }
}`;

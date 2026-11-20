import { defineField, defineType } from "sanity";
import { checkHttpsUrl, checkMinImageSize, checkSeoDescription, checkSeoTitle } from "../../lib/rules";

/** SEO từng trang. Trống → site dùng tiêu đề trang + siteSettings.seoDefaults (REQ-16). */
export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Tiêu đề SEO",
      type: "string",
      description: "Trống → dùng tiêu đề trang theo mẫu trong Cài đặt chung. Nên 40–60 ký tự.",
      validation: (r) => r.custom(checkSeoTitle).warning(),
    }),
    defineField({
      name: "description",
      title: "Mô tả SEO",
      type: "text",
      rows: 3,
      description: "Trống → dùng mô tả mặc định trong Cài đặt chung. Nên 120–160 ký tự.",
      validation: (r) => r.custom(checkSeoDescription).warning(),
    }),
    defineField({
      name: "ogImage",
      title: "Ảnh chia sẻ mạng xã hội",
      type: "image",
      description: "Tối thiểu 1200×630 px.",
      validation: (r) => r.custom(checkMinImageSize(1200, 630)),
    }),
    defineField({
      name: "noindex",
      title: "Ẩn trang này khỏi Google",
      type: "boolean",
      description: "Chỉ chặn riêng trang này. Cho phép index toàn site là cấu hình kỹ thuật, không nằm trong CMS.",
      initialValue: false,
    }),
    defineField({
      name: "canonicalOverride",
      title: "Canonical khác (nâng cao)",
      type: "url",
      description: "Để trống trong trường hợp thường — trang tự trỏ canonical về chính nó.",
      validation: (r) => r.uri({ scheme: ["https"] }).custom(checkHttpsUrl),
    }),
  ],
});

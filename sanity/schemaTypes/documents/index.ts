import { defineArrayMember, defineField, defineType, type SlugValidationContext } from "sanity";
import { slugify } from "../../../lib/slug";
import { checkMaxLength, checkSlug, UNIQUE_SLUG_QUERY, uniqueSlugParams } from "../../lib/rules";
import { contentGroup, INTERNAL_NOTE, languageField, seoField, seoGroup } from "../../lib/fields";
import { apiVersion } from "../../env";

/**
 * Slug duy nhất trong (loại, ngôn ngữ) — CM-06. Cùng câu GROQ với test chạy trên seed (groq-js).
 * Khác ngôn ngữ được trùng (slug dự án dùng chung cho vi / en).
 */
async function isUniqueInLanguage(slug: string, context: SlugValidationContext): Promise<boolean> {
  const doc = context.document;
  if (!doc) return true;
  const client = context.getClient({ apiVersion });
  return client.fetch<boolean>(UNIQUE_SLUG_QUERY, uniqueSlugParams(doc as never, slug));
}

const slugField = defineField({
  name: "slug",
  title: "Đường dẫn",
  type: "slug",
  group: "content",
  description: "Tự tạo từ tiêu đề: chữ thường không dấu, gạch ngang. Đổi sau khi đã đăng → thêm chuyển hướng trong Cài đặt chung.",
  options: { source: "title", slugify, isUnique: isUniqueInLanguage, maxLength: 96 },
  validation: (r) => r.required().custom(checkSlug),
});

const legacyField = defineField({ name: "legacy", title: "Truy vết nguồn cũ", type: "legacyId", readOnly: true, hidden: ({ value }) => !value });
const faqsField = defineField({ name: "faqs", title: "Câu hỏi thường gặp", type: "array", group: "content", of: [defineArrayMember({ type: "faq" })] });
const groups = [contentGroup, seoGroup];

/** Dự án (REQ-02): thêm / đổi dự án không phải sửa cấu trúc. Ẩn = bỏ publish (D-08). */
export const project = defineType({
  name: "project",
  title: "Dự án",
  type: "document",
  groups,
  fields: [
    languageField,
    defineField({ name: "title", title: "Tên dự án", type: "string", group: "content", validation: (r) => r.required() }),
    slugField,
    defineField({
      name: "featured",
      title: "Dự án trọng tâm",
      type: "boolean",
      group: "content",
      description: "Đứng đầu danh sách và khối dự án trang chủ.",
      initialValue: false,
    }),
    defineField({ name: "sortOrder", title: "Thứ tự", type: "number", group: "content", description: "Số nhỏ đứng trước (sau nhóm trọng tâm)." }),
    defineField({ name: "summary", title: "Tóm tắt", type: "text", rows: 3, group: "content", validation: (r) => r.custom(checkMaxLength(200)) }),
    defineField({ name: "heroImage", title: "Ảnh đại diện", type: "figure", group: "content" }),
    defineField({ name: "location", title: "Vị trí", type: "string", group: "content" }),
    defineField({ name: "developer", title: "Chủ đầu tư", type: "string", group: "content" }),
    defineField({
      name: "productTypes",
      title: "Loại sản phẩm",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({ name: "legalStatus", title: "Pháp lý", type: "string", group: "content" }),
    defineField({ name: "progress", title: "Tiến độ", type: "string", group: "content" }),
    defineField({
      name: "valueProposition",
      title: "Thông điệp dự án",
      type: "projectValueProposition",
      group: "content",
      description: "Trống → khối thông điệp tự ẩn.",
    }),
    defineField({ name: "personalExperience", title: "Trải nghiệm của tôi tại dự án", type: "blockContent", group: "content" }),
    defineField({ name: "body", title: "Thông tin chi tiết", type: "blockContent", group: "content" }),
    defineField({
      name: "gallery",
      title: "Thư viện ảnh",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "figure" })],
      options: { layout: "grid" },
    }),
    faqsField,
    defineField({ name: "cta", title: "Nút cuối trang", type: "link", group: "content" }),
    seoField,
    legacyField,
  ],
  orderings: [
    {
      title: "Trọng tâm trước",
      name: "featuredFirst",
      by: [
        { field: "featured", direction: "desc" },
        { field: "sortOrder", direction: "asc" },
        { field: "title", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "title", featured: "featured", language: "language", media: "heroImage.image" },
    prepare: ({ title, featured, language, media }) => ({
      title,
      subtitle: [featured ? "Trọng tâm" : null, language?.toUpperCase()].filter(Boolean).join(" · "),
      media,
    }),
  },
});

/** Bài viết (REQ-05). CTA Zalo cuối bài do template tự gắn. Ngày đăng ở tương lai → chưa hiện. */
export const post = defineType({
  name: "post",
  title: "Bài viết",
  type: "document",
  groups,
  fields: [
    languageField,
    defineField({ name: "title", title: "Tiêu đề", type: "string", group: "content", validation: (r) => r.required() }),
    slugField,
    defineField({
      name: "publishedAt",
      title: "Ngày đăng",
      type: "datetime",
      group: "content",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Tóm tắt",
      type: "text",
      rows: 3,
      group: "content",
      validation: (r) => r.required().custom(checkMaxLength(200)),
    }),
    defineField({ name: "coverImage", title: "Ảnh bìa", type: "figure", group: "content", validation: (r) => r.required() }),
    defineField({ name: "body", title: "Nội dung", type: "blockContent", group: "content", validation: (r) => r.required() }),
    faqsField,
    seoField,
    legacyField,
  ],
  orderings: [{ title: "Mới nhất", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title", publishedAt: "publishedAt", language: "language", media: "coverImage.image" },
    prepare: ({ title, publishedAt, language, media }) => ({
      title,
      subtitle: [publishedAt?.slice(0, 10), language?.toUpperCase()].filter(Boolean).join(" · "),
      media,
    }),
  },
});

/** Cảm nhận khách hàng (D-10): chỉ hiện khi người nói đã đồng ý hiển thị. */
export const testimonial = defineType({
  name: "testimonial",
  title: "Cảm nhận khách hàng",
  type: "document",
  fields: [
    languageField,
    defineField({
      name: "authorName",
      title: "Tên khách",
      type: "string",
      description: "Dạng khách đồng ý hiển thị (ví dụ viết tắt).",
      validation: (r) => r.required(),
    }),
    defineField({ name: "authorDescriptor", title: "Mô tả khách", type: "string", description: "Ví dụ nghề nghiệp / nơi ở — chỉ khi khách đồng ý." }),
    defineField({ name: "quote", title: "Lời cảm nhận", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({ name: "photo", title: "Ảnh", type: "figure" }),
    defineField({ name: "relatedProject", title: "Dự án liên quan", type: "reference", to: [{ type: "project" }], weak: true }),
    defineField({
      name: "consentConfirmed",
      title: "Khách đã đồng ý hiển thị",
      type: "boolean",
      initialValue: false,
      validation: (r) =>
        r.custom((value) => (value === true ? true : "Cần có đồng ý hiển thị của khách trước khi đăng.")),
    }),
    defineField({ name: "consentNote", title: "Ghi chú đồng ý", type: "string", description: INTERNAL_NOTE }),
    defineField({ name: "sortOrder", title: "Thứ tự", type: "number" }),
  ],
  orderings: [{ title: "Thứ tự", name: "sortOrderAsc", by: [{ field: "sortOrder", direction: "asc" }] }],
  preview: {
    select: { title: "authorName", subtitle: "quote", consent: "consentConfirmed", media: "photo.image" },
    prepare: ({ title, subtitle, consent, media }) => ({
      title: consent ? title : `${title ?? ""} (chưa có đồng ý)`,
      subtitle,
      media,
    }),
  },
});

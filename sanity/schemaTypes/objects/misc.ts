import { defineField, defineType } from "sanity";
import { checkHttpsUrl } from "../../lib/rules";

/** FAQ (project.faqs, post.faqs) — nuôi FAQPage JSON-LD khi có ≥ 1 mục. */
export const faq = defineType({
  name: "faq",
  title: "Câu hỏi thường gặp",
  type: "object",
  fields: [
    defineField({ name: "question", title: "Câu hỏi", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", title: "Trả lời", type: "blockContentLite", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "question" } },
});

/** Chuyển hướng khi đổi slug sau khi đã publish. Luật cả danh sách (CM-12) đặt ở siteSettings.redirects. */
export const redirect = defineType({
  name: "redirect",
  title: "Chuyển hướng",
  type: "object",
  fields: [
    defineField({
      name: "from",
      title: "Đường dẫn cũ",
      type: "string",
      description: "Bắt đầu bằng «/», không kèm tên miền. Ví dụ /du-an/ten-cu",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "to",
      title: "Đường dẫn mới",
      type: "string",
      description: "Đường dẫn trong website (bắt đầu «/») hoặc liên kết https.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "permanent",
      title: "Chuyển hướng vĩnh viễn (301/308)",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { from: "from", to: "to" },
    prepare: ({ from, to }) => ({ title: `${from ?? "?"} → ${to ?? "?"}` }),
  },
});

/** Truy vết nguồn cũ — dự án làm mới không có web cũ nên trống; giữ để thống nhất mô hình agency. */
export const legacyId = defineType({
  name: "legacyId",
  title: "Truy vết nguồn cũ",
  type: "object",
  readOnly: true,
  fields: [
    defineField({ name: "url", title: "URL gốc", type: "url" }),
    defineField({ name: "id", title: "ID gốc", type: "string" }),
    defineField({ name: "importedAt", title: "Thời điểm nhập", type: "datetime" }),
  ],
});

export const SOCIAL_PLATFORMS = [
  { title: "Facebook", value: "facebook" },
  { title: "Zalo OA", value: "zalo_oa" },
  { title: "TikTok", value: "tiktok" },
  { title: "YouTube", value: "youtube" },
  { title: "LinkedIn", value: "linkedin" },
  { title: "Instagram", value: "instagram" },
];

export const socialLink = defineType({
  name: "socialLink",
  title: "Mạng xã hội",
  type: "object",
  fields: [
    defineField({
      name: "platform",
      title: "Nền tảng",
      type: "string",
      options: { list: SOCIAL_PLATFORMS },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "url",
      title: "Liên kết",
      type: "url",
      validation: (r) => r.required().uri({ scheme: ["https"] }).custom(checkHttpsUrl),
    }),
  ],
  preview: { select: { title: "platform", subtitle: "url" } },
});

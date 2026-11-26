import { defineField } from "sanity";

/** Mô tả chung cho trường ghi chú nội bộ (D-02): projection của site không bao giờ trả các trường này. */
export const INTERNAL_NOTE =
  "Nội bộ — KHÔNG hiển thị trên website. Chỉ ghi trạng thái xác nhận, không ghi số điện thoại / tên người khác (dataset đọc công khai).";

/** Trường ngôn ngữ của document dịch theo tài liệu (plugin document-internationalization tự gán). */
export const languageField = defineField({
  name: "language",
  title: "Ngôn ngữ",
  type: "string",
  readOnly: true,
  hidden: true,
});

export const seoField = defineField({
  name: "seo",
  title: "SEO",
  type: "seo",
  group: "seo",
  options: { collapsible: true, collapsed: true },
});

export const seoGroup = { name: "seo", title: "SEO" };
export const contentGroup = { name: "content", title: "Nội dung", default: true };

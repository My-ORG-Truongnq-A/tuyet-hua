import { defineField, defineType } from "sanity";

/**
 * Song ngữ theo trường (D-04) cho siteSettings / header / footer. Bản vi bắt buộc; bản en tuỳ chọn —
 * site KHÔNG lấy chữ vi thay cho en (REQ-17): thiếu en thì chuỗi đó ẩn trên bản tiếng Anh.
 */
const EN_HINT = "Để trống nếu chưa dịch — trang tiếng Anh sẽ ẩn chuỗi này (không hiện tiếng Việt thay thế).";

export const localeString = defineType({
  name: "localeString",
  title: "Chuỗi song ngữ",
  type: "object",
  options: { columns: 2 },
  fields: [
    defineField({ name: "vi", title: "Tiếng Việt", type: "string", validation: (r) => r.required() }),
    defineField({ name: "en", title: "English", type: "string", description: EN_HINT }),
  ],
});

export const localeText = defineType({
  name: "localeText",
  title: "Đoạn văn song ngữ",
  type: "object",
  fields: [
    defineField({ name: "vi", title: "Tiếng Việt", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "en", title: "English", type: "text", rows: 3, description: EN_HINT }),
  ],
});

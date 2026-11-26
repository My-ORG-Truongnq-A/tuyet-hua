import { defineArrayMember, defineField, defineType } from "sanity";
import { INTERNAL_NOTE } from "../../lib/fields";

const CONFIRMED_HINT =
  "Bật khi khách đã xác nhận đúng sự thật. Chưa bật → không hiện ở bản chính thức (chỉ hiện kèm nhãn ở bản xem trước).";

/** Số liệu / thành tích ngắn (D-10): chỉ nhập số khách đã xác nhận. */
export const highlightStat = defineType({
  name: "highlightStat",
  title: "Số liệu / thành tích ngắn",
  type: "object",
  fields: [
    defineField({ name: "value", title: "Giá trị", type: "string", description: "Ví dụ «N+».", validation: (r) => r.required() }),
    defineField({ name: "label", title: "Nhãn", type: "string", validation: (r) => r.required() }),
    defineField({ name: "confirmed", title: "Đã xác nhận", type: "boolean", description: CONFIRMED_HINT, initialValue: false }),
    defineField({ name: "sourceNote", title: "Nguồn", type: "string", description: INTERNAL_NOTE }),
  ],
  preview: {
    select: { value: "value", label: "label", confirmed: "confirmed" },
    prepare: ({ value, label, confirmed }) => ({
      title: [value, label].filter(Boolean).join(" "),
      subtitle: confirmed ? undefined : "Chưa xác nhận",
    }),
  },
});

export const valueItem = defineType({
  name: "valueItem",
  title: "Ý / giá trị",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Tiêu đề", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Mô tả", type: "text", rows: 3 }),
    defineField({
      name: "icon",
      title: "Biểu tượng",
      type: "string",
      description: "Tuỳ chọn — mức dùng biểu tượng chờ khách chốt (MI-08). Để trống nếu không cần.",
      options: {
        list: [
          { title: "Thị trường", value: "market" },
          { title: "Pháp lý", value: "legal" },
          { title: "Tài chính", value: "finance" },
          { title: "Đồng hành", value: "handshake" },
          { title: "Đào tạo", value: "training" },
          { title: "Đội ngũ", value: "team" },
          { title: "Nhà ở", value: "home" },
        ],
      },
    }),
  ],
  preview: { select: { title: "title", subtitle: "description" } },
});

export const roleShare = defineType({
  name: "roleShare",
  title: "Vai trò định vị",
  type: "object",
  fields: [
    defineField({
      name: "share",
      title: "Tỷ lệ (%)",
      type: "number",
      validation: (r) => r.required().integer().min(0).max(100),
    }),
    defineField({ name: "title", title: "Vai trò", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Mô tả", type: "text", rows: 3 }),
  ],
  preview: {
    select: { share: "share", title: "title" },
    prepare: ({ share, title }) => ({ title: `${share ?? "?"}% — ${title ?? ""}` }),
  },
});

export const timelineItem = defineType({
  name: "timelineItem",
  title: "Mốc kinh nghiệm",
  type: "object",
  fields: [
    defineField({ name: "period", title: "Thời gian", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", title: "Vai trò", type: "string", validation: (r) => r.required() }),
    defineField({ name: "organization", title: "Đơn vị", type: "string" }),
    defineField({ name: "description", title: "Mô tả", type: "text", rows: 3 }),
  ],
  preview: { select: { title: "role", subtitle: "period" } },
});

export const achievement = defineType({
  name: "achievement",
  title: "Thành tích / vinh danh",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Thành tích", type: "string", validation: (r) => r.required() }),
    defineField({ name: "year", title: "Năm", type: "string" }),
    defineField({ name: "description", title: "Mô tả", type: "text", rows: 3 }),
    defineField({ name: "image", title: "Ảnh", type: "figure" }),
    defineField({ name: "confirmed", title: "Đã xác nhận", type: "boolean", description: CONFIRMED_HINT, initialValue: false }),
  ],
  preview: {
    select: { title: "title", year: "year", confirmed: "confirmed" },
    prepare: ({ title, year, confirmed }) => ({
      title,
      subtitle: [year, confirmed ? null : "Chưa xác nhận"].filter(Boolean).join(" · "),
    }),
  },
});

/** Thông điệp riêng của từng dự án (REQ-15) — trống thì khối tự ẩn. */
export const projectValueProposition = defineType({
  name: "projectValueProposition",
  title: "Thông điệp dự án",
  type: "object",
  fields: [
    defineField({ name: "headline", title: "Thông điệp chính", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "values",
      title: "Các giá trị",
      type: "array",
      of: [defineArrayMember({ type: "valueItem" })],
      validation: (r) => r.min(1).max(6),
    }),
    defineField({ name: "keyMessage", title: "Câu chốt", type: "string" }),
  ],
});

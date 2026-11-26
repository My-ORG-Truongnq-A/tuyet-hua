import { defineArrayMember, defineField, defineType } from "sanity";
import { checkHttpsUrl, checkYouTubeUrl } from "../../lib/rules";
import { LINKABLE_TYPES } from "./link";

/**
 * Liên kết trong văn bản: trang nội bộ (reference) hoặc https bên ngoài (site tự gắn rel="noopener").
 * Đặt tên `link` theo quy ước Portable Text; khác object `link` (nút) ở cấp gốc.
 */
const inlineLink = defineArrayMember({
  name: "link",
  title: "Liên kết",
  type: "object",
  fields: [
    defineField({
      name: "internal",
      title: "Trang trong website",
      type: "reference",
      to: LINKABLE_TYPES.map((type) => ({ type })),
      weak: true,
    }),
    defineField({
      name: "href",
      title: "Liên kết ngoài (https)",
      type: "url",
      validation: (r) => r.uri({ scheme: ["https"] }).custom(checkHttpsUrl),
    }),
  ],
  validation: (r) =>
    r.custom((value: { internal?: unknown; href?: unknown } | undefined) => {
      if (!value) return true;
      if (value.internal && value.href) return "Chọn trang trong website HOẶC liên kết ngoài, không cả hai.";
      return value.internal || value.href ? true : "Chọn trang đích hoặc nhập liên kết.";
    }),
});

/** Màu nhấn thương hiệu — mã màu do thiết kế quyết (MI-24), biên tập chỉ đánh dấu. */
const brandHighlight = { title: "Màu nhấn", value: "brandHighlight" };

/** Video YouTube — site render kiểu bấm-mới-tải, không tải iframe khi mở trang (REQ-16). */
export const embed = defineType({
  name: "embed",
  title: "Video YouTube",
  type: "object",
  fields: [
    defineField({ name: "url", title: "Liên kết YouTube", type: "url", validation: (r) => r.required().custom(checkYouTubeUrl) }),
    defineField({ name: "title", title: "Tên video", type: "string", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "title", subtitle: "url" } },
});

/** Nội dung bài / trang. Không có H1 — H1 là tiêu đề trang (REQ-16). */
export const blockContent = defineType({
  name: "blockContent",
  title: "Nội dung",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Đoạn văn", value: "normal" },
        { title: "Tiêu đề 2", value: "h2" },
        { title: "Tiêu đề 3", value: "h3" },
        { title: "Tiêu đề 4", value: "h4" },
        { title: "Trích dẫn", value: "blockquote" },
      ],
      lists: [
        { title: "Gạch đầu dòng", value: "bullet" },
        { title: "Đánh số", value: "number" },
      ],
      marks: {
        decorators: [{ title: "Đậm", value: "strong" }, { title: "Nghiêng", value: "em" }, brandHighlight],
        annotations: [inlineLink],
      },
    }),
    defineArrayMember({ type: "figure" }),
    defineArrayMember({ type: "table", title: "Bảng" }),
    defineArrayMember({ type: "embed" }),
  ],
});

/** Nội dung ngắn: đoạn văn, gạch đầu dòng, đậm / nghiêng, liên kết. */
export const blockContentLite = defineType({
  name: "blockContentLite",
  title: "Nội dung ngắn",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [{ title: "Đoạn văn", value: "normal" }],
      lists: [{ title: "Gạch đầu dòng", value: "bullet" }],
      marks: {
        decorators: [{ title: "Đậm", value: "strong" }, { title: "Nghiêng", value: "em" }],
        annotations: [inlineLink],
      },
    }),
  ],
});

import { defineField, defineType } from "sanity";
import { checkAlt } from "../../lib/rules";
import { INTERNAL_NOTE } from "../../lib/fields";

/**
 * Ảnh có mô tả bắt buộc (REQ-12) và cờ quyền dùng (D-09): bản go-live chỉ hiển thị ảnh đã xác nhận
 * quyền dùng + đồng ý của người trong ảnh; bản xem trước gắn nhãn «chờ xác nhận».
 */
export const figure = defineType({
  name: "figure",
  title: "Ảnh",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Ảnh",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "alt",
      title: "Mô tả ảnh (alt)",
      type: "string",
      description: "Mô tả đúng nội dung ảnh cho người dùng trình đọc màn hình và Google. 5–125 ký tự.",
      validation: (r) => r.required().custom(checkAlt),
    }),
    defineField({ name: "caption", title: "Chú thích", type: "string" }),
    defineField({ name: "credit", title: "Người chụp / nguồn", type: "string" }),
    defineField({
      name: "usageApproved",
      title: "Đã xác nhận quyền dùng ảnh",
      type: "boolean",
      description: "Bật khi đã có quyền dùng ảnh và sự đồng ý của người trong ảnh. Chưa bật → ảnh không hiện ở bản chính thức.",
      initialValue: false,
    }),
    defineField({ name: "rightsNote", title: "Ghi chú quyền dùng", type: "string", description: INTERNAL_NOTE }),
  ],
  preview: {
    select: { media: "image", alt: "alt", approved: "usageApproved" },
    prepare: ({ media, alt, approved }) => ({
      title: alt || "Ảnh chưa có mô tả",
      subtitle: approved ? undefined : "Chờ xác nhận quyền dùng",
      media,
    }),
  },
});

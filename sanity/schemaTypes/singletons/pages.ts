import { defineArrayMember, defineField, defineType } from "sanity";
import { checkHeroImageSize, checkRoleShares } from "../../lib/rules";
import { contentGroup, languageField, seoField, seoGroup } from "../../lib/fields";

/**
 * Trang tĩnh = singleton theo ngôn ngữ, _id cố định `<type>-<lang>` (homePage-vi…), KHÔNG có slug —
 * URL cố định trong code theo sitemap (D-05). Thứ tự khối trang chủ cố định trong code (D-06), khối trống tự ẩn.
 */
const groups = [contentGroup, seoGroup];

const titleField = (description = "Tiêu đề chính (H1) của trang.") =>
  defineField({ name: "title", title: "Tiêu đề", type: "string", group: "content", description, validation: (r) => r.required() });

const intro = defineField({ name: "intro", title: "Đoạn mở đầu", type: "text", rows: 3, group: "content" });

const pagePreview = (label: string) => ({
  select: { language: "language" },
  prepare: ({ language }: { language?: string }) => ({ title: label, subtitle: language === "en" ? "English" : "Tiếng Việt" }),
});

const stats = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "array",
    of: [defineArrayMember({ type: "highlightStat" })],
    description: "Chỉ số liệu đã bật «Đã xác nhận» mới hiện ở bản chính thức.",
  });

export const homePage = defineType({
  name: "homePage",
  title: "Trang chủ",
  type: "document",
  groups,
  fields: [
    languageField,
    titleField("Tên nội bộ trong Studio — tiêu đề lớn trang chủ là họ tên trong Cài đặt chung."),
    defineField({
      name: "hero",
      title: "1 · Ảnh chào mừng",
      type: "object",
      group: "content",
      description: "Khẩu hiệu lấy từ Cài đặt chung.",
      fields: [
        defineField({
          name: "image",
          title: "Ảnh chân dung (thấy rõ mặt)",
          type: "figure",
          validation: (r) => [
            r.required(),
            r.custom((v: { image?: never } | undefined) => checkHeroImageSize(v?.image)).warning(),
          ],
        }),
        defineField({ name: "headline", title: "Dòng tiêu đề", type: "string", description: "Trống → dùng họ tên." }),
        defineField({ name: "subline", title: "Dòng phụ", type: "string", description: "Trống → dùng chức danh." }),
        defineField({ name: "primaryCta", title: "Nút chính", type: "link" }),
        defineField({ name: "secondaryCta", title: "Nút phụ", type: "link" }),
        defineField({
          name: "pillarNotes",
          title: "Dòng phụ dưới 3 trụ cột",
          type: "array",
          of: [defineArrayMember({ type: "string" })],
          description:
            "Ba trụ cột là ba vế của khẩu hiệu (Cài đặt chung). Dòng thứ 1 nằm dưới vế 1, dòng 2 dưới vế 2… Để trống → không hiện dòng phụ.",
          validation: (r) => r.max(3),
        }),
      ],
    }),
    defineField({
      name: "story",
      title: "2 · Về tôi & câu chuyện",
      type: "object",
      group: "content",
      fields: [
        defineField({ name: "heading", title: "Tiêu đề", type: "string" }),
        defineField({ name: "quote", title: "Câu chuyện thương hiệu (một câu)", type: "string" }),
        defineField({ name: "body", title: "Nội dung", type: "blockContentLite" }),
        defineField({ name: "image", title: "Ảnh", type: "figure" }),
        stats("highlights", "Kinh nghiệm – thành tích"),
        defineField({
          name: "expertise",
          title: "Dòng «Lĩnh vực»",
          type: "string",
          description: "Hiện dưới chức danh trong khối Về tôi. Trống → ẩn dòng.",
        }),
        defineField({
          name: "focus",
          title: "Dòng «Tập trung»",
          type: "string",
          description: "Hiện dưới dòng Lĩnh vực trong khối Về tôi. Trống → ẩn dòng.",
        }),
        defineField({ name: "aboutLinkLabel", title: "Nhãn liên kết tới trang Giới thiệu", type: "string" }),
      ],
    }),
    defineField({
      name: "whyMe",
      title: "3 · Tại sao chọn tôi",
      type: "object",
      group: "content",
      fields: [
        defineField({ name: "heading", title: "Tiêu đề", type: "string" }),
        defineField({ name: "intro", title: "Mở đầu", type: "text", rows: 3 }),
        defineField({ name: "items", title: "Các ý", type: "array", of: [defineArrayMember({ type: "valueItem" })] }),
      ],
    }),
    defineField({
      name: "projectsSection",
      title: "4 · Dự án đang triển khai",
      type: "object",
      group: "content",
      description: "Danh sách lấy tự động từ mục Dự án (dự án trọng tâm đứng đầu).",
      fields: [
        defineField({ name: "heading", title: "Tiêu đề", type: "string" }),
        defineField({ name: "intro", title: "Mở đầu", type: "text", rows: 3 }),
        defineField({ name: "viewAllLabel", title: "Nhãn «Xem tất cả»", type: "string" }),
      ],
    }),
    defineField({
      name: "trustSection",
      title: "5 · Uy tín & đội ngũ",
      type: "object",
      group: "content",
      description: "Cảm nhận khách hàng lấy tự động từ mục Cảm nhận (chỉ bản đã có đồng ý hiển thị).",
      fields: [
        defineField({ name: "heading", title: "Tiêu đề", type: "string" }),
        defineField({ name: "body", title: "Nội dung", type: "blockContentLite" }),
        defineField({ name: "image", title: "Ảnh", type: "figure" }),
        stats("stats", "Số liệu"),
        defineField({
          name: "tags",
          title: "Nhãn kỹ năng dưới ảnh đội ngũ",
          type: "array",
          of: [defineArrayMember({ type: "string" })],
          description: "Chữ ngắn (2–4 từ), tối đa 8 nhãn. Để trống → không hiện hàng nhãn.",
          validation: (r) => r.max(8),
        }),
        defineField({ name: "teamLinkLabel", title: "Nhãn liên kết tới trang Đào tạo & Đội ngũ", type: "string" }),
        defineField({ name: "testimonialsHeading", title: "Tiêu đề phần cảm nhận", type: "string" }),
      ],
    }),
    defineField({
      name: "knowledgeSection",
      title: "6 · Kiến thức",
      type: "object",
      group: "content",
      fields: [
        defineField({ name: "heading", title: "Tiêu đề", type: "string" }),
        defineField({
          name: "postsLimit",
          title: "Số bài hiển thị",
          type: "number",
          validation: (r) => r.integer().min(1).max(12),
        }),
        defineField({ name: "viewAllLabel", title: "Nhãn «Xem tất cả»", type: "string" }),
      ],
    }),
    defineField({
      name: "servicesSection",
      title: "7 · Dịch vụ (chờ khách chốt)",
      type: "object",
      group: "content",
      fields: [
        defineField({ name: "enabled", title: "Hiện khối này", type: "boolean", initialValue: false }),
        defineField({ name: "heading", title: "Tiêu đề", type: "string" }),
        defineField({ name: "intro", title: "Mở đầu", type: "text", rows: 3 }),
        defineField({ name: "items", title: "Dịch vụ", type: "array", of: [defineArrayMember({ type: "valueItem" })] }),
      ],
    }),
    defineField({
      name: "connectSection",
      title: "8 · Kết nối",
      type: "object",
      group: "content",
      description: "Zalo, điện thoại, khu vực lấy từ Cài đặt chung.",
      fields: [
        defineField({ name: "heading", title: "Tiêu đề", type: "string" }),
        defineField({ name: "body", title: "Nội dung", type: "text", rows: 3 }),
      ],
    }),
    seoField,
  ],
  preview: pagePreview("Trang chủ"),
});

export const aboutPage = defineType({
  name: "aboutPage",
  title: "Giới thiệu về tôi",
  type: "document",
  groups,
  fields: [
    languageField,
    titleField(),
    defineField({ name: "heroImage", title: "Ảnh đầu trang", type: "figure", group: "content", validation: (r) => r.required() }),
    intro,
    defineField({
      name: "brandStory",
      title: "Câu chuyện thương hiệu",
      type: "object",
      group: "content",
      fields: [
        defineField({ name: "heading", title: "Tiêu đề", type: "string", validation: (r) => r.required() }),
        defineField({ name: "body", title: "Nội dung", type: "blockContent" }),
      ],
    }),
    defineField({
      name: "positioning",
      title: "Định vị",
      type: "object",
      group: "content",
      fields: [
        defineField({ name: "heading", title: "Tiêu đề", type: "string" }),
        defineField({
          name: "roles",
          title: "Vai trò",
          type: "array",
          of: [defineArrayMember({ type: "roleShare" })],
          validation: (r) => r.custom((roles) => checkRoleShares(roles as never)),
        }),
      ],
    }),
    defineField({ name: "bio", title: "Tiểu sử", type: "blockContent", group: "content" }),
    defineField({ name: "timeline", title: "Chặng đường", type: "array", group: "content", of: [defineArrayMember({ type: "timelineItem" })] }),
    defineField({
      name: "achievements",
      title: "Thành tích",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "achievement" })],
      description: "Chỉ thành tích đã bật «Đã xác nhận» mới hiện ở bản chính thức.",
    }),
    defineField({ name: "cta", title: "Nút cuối trang", type: "link", group: "content" }),
    seoField,
  ],
  preview: pagePreview("Giới thiệu về tôi"),
});

export const projectsPage = defineType({
  name: "projectsPage",
  title: "Trang danh sách dự án",
  type: "document",
  groups,
  fields: [languageField, titleField(), intro, seoField],
  preview: pagePreview("Dự án (trang danh sách)"),
});

export const teamPage = defineType({
  name: "teamPage",
  title: "Đào tạo & Đội ngũ",
  type: "document",
  groups,
  fields: [
    languageField,
    titleField(),
    defineField({ name: "heroImage", title: "Ảnh đầu trang", type: "figure", group: "content" }),
    intro,
    defineField({
      name: "leaderSection",
      title: "Vai trò leader",
      type: "object",
      group: "content",
      fields: [
        defineField({ name: "heading", title: "Tiêu đề", type: "string" }),
        defineField({ name: "body", title: "Nội dung", type: "blockContent" }),
      ],
    }),
    defineField({ name: "trainingPoints", title: "Nội dung đào tạo", type: "array", group: "content", of: [defineArrayMember({ type: "valueItem" })] }),
    { ...stats("stats", "Số liệu"), group: "content" },
    defineField({
      name: "gallery",
      title: "Ảnh hoạt động",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "figure" })],
      options: { layout: "grid" },
      description: "Chỉ ảnh đã xác nhận quyền dùng mới hiện ở bản chính thức.",
    }),
    defineField({
      name: "joinCtaHeading",
      title: "Lời mời tham gia đội ngũ",
      type: "string",
      group: "content",
      description: "Nút dùng «Nút tham gia đội ngũ» trong Cài đặt chung (không có form).",
    }),
    seoField,
  ],
  preview: pagePreview("Đào tạo & Đội ngũ"),
});

export const articlesPage = defineType({
  name: "articlesPage",
  title: "Trang danh sách bài viết",
  type: "document",
  groups,
  fields: [
    languageField,
    titleField(),
    intro,
    defineField({ name: "emptyStateText", title: "Câu hiện khi chưa có bài", type: "string", group: "content" }),
    seoField,
  ],
  preview: pagePreview("Bài viết (trang danh sách)"),
});

export const contactPage = defineType({
  name: "contactPage",
  title: "Liên hệ",
  type: "document",
  groups,
  description: "Không có form. Thông tin liên hệ lấy từ Cài đặt chung; mục trống không hiển thị.",
  fields: [
    languageField,
    titleField(),
    intro,
    defineField({ name: "image", title: "Ảnh", type: "figure", group: "content" }),
    seoField,
  ],
  preview: pagePreview("Liên hệ"),
});

export const privacyPage = defineType({
  name: "privacyPage",
  title: "Chính sách bảo mật",
  type: "document",
  groups,
  fields: [
    languageField,
    titleField(),
    defineField({ name: "body", title: "Nội dung", type: "blockContent", group: "content", validation: (r) => r.required() }),
    defineField({ name: "lastUpdated", title: "Ngày cập nhật", type: "date", group: "content", validation: (r) => r.required() }),
    seoField,
  ],
  preview: pagePreview("Chính sách bảo mật"),
});

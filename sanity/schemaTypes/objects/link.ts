import { defineField, defineType } from "sanity";
import { checkHttpsUrl } from "../../lib/rules";

/** Loại trang được trỏ tới bằng liên kết nội bộ. */
export const LINKABLE_TYPES = [
  "homePage",
  "aboutPage",
  "projectsPage",
  "teamPage",
  "articlesPage",
  "contactPage",
  "privacyPage",
  "project",
  "post",
] as const;

export const LINK_KINDS = [
  { title: "Nhắn Zalo", value: "zalo" },
  { title: "Gọi điện", value: "phone" },
  { title: "Trang trong website", value: "internal" },
  { title: "Liên kết ngoài", value: "external" },
];

type LinkParent = { kind?: string } | undefined;

/**
 * Nút / liên kết (D-07): kind = zalo | phone KHÔNG lưu số — số lấy từ Cài đặt chung lúc hiển thị,
 * đổi một chỗ thì mọi nút đổi theo (REQ-07, REQ-18). Không nhúng script Zalo (YC-07).
 */
export const link = defineType({
  name: "link",
  title: "Liên kết / nút",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Nhãn nút", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "kind",
      title: "Loại",
      type: "string",
      options: { list: LINK_KINDS, layout: "radio", direction: "horizontal" },
      initialValue: "zalo",
      description: "Zalo / Gọi điện dùng số trong Cài đặt chung — không nhập số ở đây.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "internal",
      title: "Trang đích",
      type: "reference",
      to: LINKABLE_TYPES.map((type) => ({ type })),
      weak: true,
      hidden: ({ parent }) => (parent as LinkParent)?.kind !== "internal",
      options: {
        // Chỉ trỏ tới trang cùng ngôn ngữ với trang đang sửa.
        filter: ({ document }) =>
          typeof document?.language === "string"
            ? { filter: "!defined(language) || language == $lang", params: { lang: document.language } }
            : { filter: "true" },
      },
      validation: (r) =>
        r.custom((value, ctx) =>
          (ctx.parent as LinkParent)?.kind === "internal" && !value ? "Chọn trang đích." : true,
        ),
    }),
    defineField({
      name: "href",
      title: "Địa chỉ liên kết",
      type: "url",
      hidden: ({ parent }) => (parent as LinkParent)?.kind !== "external",
      validation: (r) =>
        r.uri({ scheme: ["https"] }).custom((value, ctx) => {
          if ((ctx.parent as LinkParent)?.kind !== "external") return true;
          return value ? checkHttpsUrl(value) : "Nhập liên kết https://";
        }),
    }),
  ],
  preview: {
    select: { title: "label", kind: "kind" },
    prepare: ({ title, kind }) => ({
      title: title || "Nút chưa có nhãn",
      subtitle: LINK_KINDS.find((k) => k.value === kind)?.title,
    }),
  },
});

/** Khoá route của menu — code ánh xạ sang URL vi / en (không nhập URL tự do, REQ-32). */
export const NAV_TARGETS = [
  { title: "Trang chủ", value: "home" },
  { title: "Giới thiệu về tôi", value: "about" },
  { title: "Dự án", value: "projects" },
  { title: "Dịch vụ (chờ khách chốt)", value: "services" },
  { title: "Đào tạo & Đội ngũ", value: "team" },
  { title: "Đối tác (chờ khách chốt)", value: "partners" },
  { title: "Bài viết", value: "articles" },
  { title: "Liên hệ", value: "contact" },
  { title: "Chính sách bảo mật", value: "privacy" },
];

export const navItem = defineType({
  name: "navItem",
  title: "Mục menu",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Nhãn", type: "localeString", validation: (r) => r.required() }),
    defineField({
      name: "target",
      title: "Trang",
      type: "string",
      options: { list: NAV_TARGETS },
      validation: (r) => r.required(),
    }),
    defineField({ name: "visible", title: "Hiện trên menu", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: { title: "label.vi", target: "target", visible: "visible" },
    prepare: ({ title, target, visible }) => ({
      title: title || "Mục chưa có nhãn",
      subtitle: [NAV_TARGETS.find((t) => t.value === target)?.title, visible === false ? "đang ẩn" : null]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});

import { defineArrayMember, defineField, defineType } from "sanity";
import {
  checkEmail,
  checkGa4Id,
  checkGtmId,
  checkHttpsUrl,
  checkMinImageSize,
  checkNavItems,
  checkRedirects,
  checkVnPhone,
} from "../../lib/rules";

/**
 * Singleton toàn site, dịch theo trường (D-04). MỌI thông tin doanh nghiệp hiển thị trên site nằm ở đây
 * (REQ-18) — header, footer, JSON-LD, llms.txt, nút Zalo / gọi đều đọc từ một nguồn này.
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Cài đặt chung",
  type: "document",
  groups: [
    { name: "brand", title: "Thương hiệu", default: true },
    { name: "contact", title: "Liên hệ" },
    { name: "ui", title: "Nhãn nút & giao diện" },
    { name: "seoDefaults", title: "SEO mặc định" },
    { name: "blog", title: "Bài viết" },
    { name: "integrations", title: "Đo lường" },
    { name: "redirects", title: "Chuyển hướng" },
  ],
  fields: [
    // --- Thương hiệu ---
    defineField({
      name: "brandName",
      title: "Tên thương hiệu",
      type: "string",
      group: "brand",
      description: "Hiện ở đầu trang khi chưa có logo; dùng trong tiêu đề SEO.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "personName", title: "Họ tên", type: "string", group: "brand", validation: (r) => r.required() }),
    defineField({ name: "jobTitle", title: "Chức danh", type: "localeString", group: "brand", validation: (r) => r.required() }),
    defineField({
      name: "tagline",
      title: "Khẩu hiệu",
      type: "localeString",
      group: "brand",
      description: "Hiện ở trang chủ và chân trang, giữ nguyên văn.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "logo", title: "Logo", type: "figure", group: "brand", description: "Trống → đầu trang hiện tên thương hiệu dạng chữ." }),
    defineField({
      name: "favicon",
      title: "Biểu tượng trình duyệt (favicon)",
      type: "image",
      group: "brand",
      description: "Ảnh vuông, tối thiểu 512×512 px.",
      validation: (r) => r.custom(checkMinImageSize(512, 512, { square: true })),
    }),

    // --- Liên hệ (NAP) ---
    defineField({
      name: "contact",
      title: "Liên hệ",
      type: "object",
      group: "contact",
      validation: (r) => r.required(),
      fields: [
        defineField({
          name: "phone",
          title: "Số điện thoại",
          type: "string",
          description: "Hiển thị đúng dạng nhập (ví dụ 0900 000 000). Mọi nút Gọi điện dùng số này.",
          validation: (r) => r.required().custom(checkVnPhone),
        }),
        defineField({
          name: "zaloPhone",
          title: "Số Zalo",
          type: "string",
          description: "Trống → dùng số điện thoại. Mọi nút Zalo trên website dùng số này.",
          validation: (r) => r.custom(checkVnPhone),
        }),
        defineField({ name: "email", title: "Email", type: "string", description: "Trống → không hiển thị.", validation: (r) => r.custom(checkEmail) }),
        defineField({ name: "address", title: "Địa chỉ", type: "postalAddress", description: "Trống → không hiển thị." }),
        defineField({ name: "serviceArea", title: "Khu vực hoạt động", type: "localeString" }),
        defineField({ name: "openingHours", title: "Giờ làm việc", type: "array", of: [defineArrayMember({ type: "openingHoursSpec" })] }),
        defineField({ name: "openingHoursNote", title: "Ghi chú giờ làm việc", type: "localeString" }),
        defineField({ name: "socialLinks", title: "Mạng xã hội", type: "array", of: [defineArrayMember({ type: "socialLink" })] }),
      ],
    }),

    // --- Nhãn nút & giao diện ---
    defineField({
      name: "ui",
      title: "Nhãn nút & giao diện",
      type: "object",
      group: "ui",
      validation: (r) => r.required(),
      fields: [
        defineField({ name: "zaloCtaLabel", title: "Nút Zalo", type: "localeString", validation: (r) => r.required() }),
        defineField({ name: "callCtaLabel", title: "Nút gọi điện", type: "localeString", validation: (r) => r.required() }),
        defineField({ name: "consultCtaLabel", title: "Nút tư vấn (đầu trang chủ)", type: "localeString", validation: (r) => r.required() }),
        defineField({
          name: "joinTeamCta",
          title: "Nút tham gia đội ngũ",
          type: "object",
          description: "Không có form — nút mở Zalo / gọi điện / liên kết ngoài.",
          fields: [
            defineField({ name: "label", title: "Nhãn", type: "localeString" }),
            defineField({
              name: "kind",
              title: "Loại",
              type: "string",
              initialValue: "zalo",
              options: {
                list: [
                  { title: "Nhắn Zalo", value: "zalo" },
                  { title: "Gọi điện", value: "phone" },
                  { title: "Liên kết ngoài", value: "external" },
                ],
                layout: "radio",
                direction: "horizontal",
              },
            }),
            defineField({
              name: "href",
              title: "Liên kết",
              type: "url",
              hidden: ({ parent }) => (parent as { kind?: string } | undefined)?.kind !== "external",
              validation: (r) => r.uri({ scheme: ["https"] }).custom(checkHttpsUrl),
            }),
          ],
        }),
        defineField({ name: "languageSwitchLabel", title: "Nút chuyển ngôn ngữ", type: "localeString" }),
        defineField({ name: "readMoreLabel", title: "Nhãn «Xem thêm»", type: "localeString" }),
        defineField({ name: "breadcrumbHomeLabel", title: "Nhãn «Trang chủ» trên đường dẫn", type: "localeString" }),
        defineField({
          name: "notFound",
          title: "Trang không tìm thấy (404)",
          type: "object",
          fields: [
            defineField({ name: "title", title: "Tiêu đề", type: "localeString" }),
            defineField({ name: "body", title: "Nội dung", type: "localeText" }),
          ],
        }),
      ],
    }),

    // --- SEO mặc định ---
    defineField({
      name: "seoDefaults",
      title: "SEO mặc định",
      type: "object",
      group: "seoDefaults",
      fields: [
        defineField({
          name: "titleTemplate",
          title: "Mẫu tiêu đề",
          type: "localeString",
          description: "«%s» là tên trang. Ví dụ «%s | Tên thương hiệu».",
          validation: (r) =>
            r.custom((value: { vi?: string; en?: string } | undefined) => {
              for (const v of [value?.vi, value?.en]) if (v && !v.includes("%s")) return "Mẫu tiêu đề phải chứa «%s».";
              return true;
            }),
        }),
        defineField({ name: "description", title: "Mô tả mặc định", type: "localeText" }),
        defineField({
          name: "ogImage",
          title: "Ảnh chia sẻ mặc định",
          type: "image",
          description: "Tối thiểu 1200×630 px.",
          validation: (r) => r.custom(checkMinImageSize(1200, 630)),
        }),
      ],
    }),

    // --- Bài viết ---
    defineField({
      name: "blog",
      title: "Bài viết",
      type: "object",
      group: "blog",
      fields: [
        defineField({
          name: "postsPerPage",
          title: "Số bài mỗi trang",
          type: "number",
          description: "Trống → dùng mặc định của website.",
          validation: (r) => r.integer().min(1).max(48),
        }),
      ],
    }),

    // --- Đo lường (mã công khai — KHÔNG lưu API key / token) ---
    defineField({
      name: "integrations",
      title: "Đo lường",
      type: "object",
      group: "integrations",
      description: "Trống → website không tải mã đo lường nào. Chỉ nhập mã công khai, không nhập mật khẩu / token.",
      fields: [
        defineField({ name: "gtmId", title: "Google Tag Manager", type: "string", validation: (r) => r.custom(checkGtmId) }),
        defineField({ name: "ga4Id", title: "Google Analytics 4", type: "string", validation: (r) => r.custom(checkGa4Id) }),
        defineField({ name: "gscVerification", title: "Mã xác minh Search Console", type: "string" }),
      ],
    }),

    // --- Chuyển hướng ---
    defineField({
      name: "redirects",
      title: "Chuyển hướng",
      type: "array",
      group: "redirects",
      description: "Dùng khi đổi đường dẫn dự án / bài viết đã đăng, để link cũ không lỗi.",
      of: [defineArrayMember({ type: "redirect" })],
      validation: (r) => r.custom((list) => checkRedirects(list as never)),
    }),
  ],
  preview: { prepare: () => ({ title: "Cài đặt chung" }) },
});

export const header = defineType({
  name: "header",
  title: "Menu đầu trang",
  type: "document",
  description: "Nút «Kết nối Zalo» luôn có ở đầu trang và trên điện thoại — không tắt trong CMS (REQ-07).",
  fields: [
    defineField({
      name: "navItems",
      title: "Mục menu",
      type: "array",
      of: [defineArrayMember({ type: "navItem" })],
      validation: (r) => r.custom((items) => checkNavItems(items as never)),
    }),
    defineField({
      name: "showLanguageSwitch",
      title: "Hiện nút chuyển ngôn ngữ",
      type: "boolean",
      description: "Chỉ có tác dụng khi website đã bật tiếng Anh.",
      initialValue: false,
    }),
  ],
  preview: { prepare: () => ({ title: "Menu đầu trang" }) },
});

export const footer = defineType({
  name: "footer",
  title: "Chân trang",
  type: "document",
  description: "Tên, chức danh, khẩu hiệu, Zalo, điện thoại, khu vực, email, mạng xã hội lấy từ Cài đặt chung.",
  fields: [
    defineField({
      name: "navItems",
      title: "Liên kết",
      type: "array",
      of: [defineArrayMember({ type: "navItem" })],
      validation: (r) => r.custom((items) => checkNavItems(items as never, 12)),
    }),
    defineField({
      name: "legalItems",
      title: "Liên kết pháp lý",
      type: "array",
      of: [defineArrayMember({ type: "navItem" })],
      validation: (r) => r.custom((items) => checkNavItems(items as never)),
    }),
    defineField({
      name: "copyrightText",
      title: "Dòng bản quyền",
      type: "localeString",
      description: "Năm do website tự điền; chỉ nhập phần chữ phía sau.",
    }),
  ],
  preview: { prepare: () => ({ title: "Chân trang" }) },
});

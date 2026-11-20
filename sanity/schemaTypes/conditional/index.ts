import { defineArrayMember, defineField, defineType } from "sanity";
import { checkHttpsUrl } from "../../lib/rules";
import { languageField, seoField } from "../../lib/fields";

/**
 * Loại nội dung CHỜ KHÁCH CHỐT (content_model.conditional_types). Có định nghĩa nhưng KHÔNG đăng ký
 * trong schemaTypes/index.ts cho tới khi P6 kích hoạt (T6.2, T6.3) — trước đó không có trong Studio,
 * URL /doi-tac, /dich-vu trả 404.
 */
export const partner = defineType({
  name: "partner",
  title: "Đối tác",
  type: "document",
  fields: [
    languageField,
    defineField({ name: "name", title: "Tên đối tác", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "figure",
      validation: (r) =>
        r.custom((v: { usageApproved?: boolean } | undefined) =>
          !v || v.usageApproved === true ? true : "Logo đối tác cần xác nhận quyền dùng trước khi đăng.",
        ),
    }),
    defineField({ name: "url", title: "Website", type: "url", validation: (r) => r.uri({ scheme: ["https"] }).custom(checkHttpsUrl) }),
    defineField({ name: "sortOrder", title: "Thứ tự", type: "number" }),
  ],
});

export const servicesPage = defineType({
  name: "servicesPage",
  title: "Trang Dịch vụ",
  type: "document",
  fields: [
    languageField,
    defineField({ name: "title", title: "Tiêu đề", type: "string", validation: (r) => r.required() }),
    defineField({ name: "intro", title: "Mở đầu", type: "text", rows: 3 }),
    defineField({ name: "items", title: "Dịch vụ", type: "array", of: [defineArrayMember({ type: "valueItem" })] }),
    defineField({ name: "cta", title: "Nút", type: "link" }),
    seoField,
  ],
});

export const conditionalTypes = [partner, servicesPage];

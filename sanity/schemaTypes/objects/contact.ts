import { defineArrayMember, defineField, defineType } from "sanity";
import { checkHHmm, checkOpeningHours } from "../../lib/rules";

/** Trống → không hiển thị, không đưa vào JSON-LD. */
export const postalAddress = defineType({
  name: "postalAddress",
  title: "Địa chỉ",
  type: "object",
  fields: [
    defineField({ name: "streetAddress", title: "Số nhà, đường", type: "string" }),
    defineField({ name: "ward", title: "Phường / xã", type: "string" }),
    defineField({ name: "locality", title: "Quận / huyện / thành phố", type: "string" }),
    defineField({ name: "region", title: "Tỉnh / thành", type: "string" }),
    defineField({ name: "country", title: "Quốc gia (mã)", type: "string", initialValue: "VN" }),
  ],
});

export const WEEK_DAYS = [
  { title: "Thứ Hai", value: "Mo" },
  { title: "Thứ Ba", value: "Tu" },
  { title: "Thứ Tư", value: "We" },
  { title: "Thứ Năm", value: "Th" },
  { title: "Thứ Sáu", value: "Fr" },
  { title: "Thứ Bảy", value: "Sa" },
  { title: "Chủ Nhật", value: "Su" },
];

export const openingHoursSpec = defineType({
  name: "openingHoursSpec",
  title: "Giờ làm việc",
  type: "object",
  fields: [
    defineField({
      name: "days",
      title: "Ngày",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { list: WEEK_DAYS },
      validation: (r) => r.required().min(1),
    }),
    defineField({ name: "opens", title: "Mở cửa (HH:mm)", type: "string", validation: (r) => r.required().custom(checkHHmm) }),
    defineField({ name: "closes", title: "Đóng cửa (HH:mm)", type: "string", validation: (r) => r.required().custom(checkHHmm) }),
  ],
  validation: (r) => r.custom(checkOpeningHours),
  preview: {
    select: { days: "days", opens: "opens", closes: "closes" },
    prepare: ({ days, opens, closes }) => ({
      title: `${(days as string[] | undefined)?.join(", ") ?? ""} · ${opens ?? "?"}–${closes ?? "?"}`,
    }),
  },
});

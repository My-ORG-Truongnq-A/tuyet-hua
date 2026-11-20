import { isValidSlug } from "../../lib/slug";

/**
 * Luật validate THUẦN của schema (không import `sanity`) — schema gọi qua `Rule.custom(...)`,
 * test gọi trực tiếp. Trả `true` khi hợp lệ, chuỗi thông báo tiếng Việt khi không.
 * Giá trị trống trả `true`: bắt buộc hay không do `Rule.required()` quyết.
 */
export type RuleResult = true | string;

const isBlank = (v: unknown) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

/** Alt ảnh (REQ-12): 5–125 ký tự, không mở đầu bằng «ảnh» / «hình» (thừa với trình đọc màn hình). */
export function checkAlt(alt: unknown): RuleResult {
  if (isBlank(alt)) return true;
  const value = String(alt).trim();
  if (value.length < 5) return "Mô tả ảnh quá ngắn (tối thiểu 5 ký tự).";
  if (value.length > 125) return "Mô tả ảnh tối đa 125 ký tự.";
  // «hình thức», «hình dung»… là từ ghép hợp lệ; chỉ chặn «ảnh / hình / hình ảnh» đứng làm tiền tố.
  if (/^(hình ảnh|ảnh|hình|image|photo)(?=\s|$)(?!\s+(thức|dung|tượng|thành|như|học)(\s|$))/iu.test(value)) {
    return "Không bắt đầu bằng «ảnh» / «hình» — mô tả trực tiếp nội dung ảnh.";
  }
  return true;
}

export function checkHttpsUrl(url: unknown): RuleResult {
  if (isBlank(url)) return true;
  try {
    return new URL(String(url)).protocol === "https:" ? true : "Chỉ nhận liên kết https://";
  } catch {
    return "Liên kết không hợp lệ.";
  }
}

/** Số điện thoại Việt Nam: 10 chữ số sau khi bỏ khoảng trắng / dấu chấm / gạch, bắt đầu bằng 0. */
export function checkVnPhone(phone: unknown): RuleResult {
  if (isBlank(phone)) return true;
  const raw = String(phone).trim();
  if (!/^[0-9 .-]+$/.test(raw)) return "Chỉ gồm chữ số, khoảng trắng, dấu chấm hoặc gạch ngang.";
  const digits = raw.replace(/\D/g, "");
  return /^0\d{9}$/.test(digits) ? true : "Số điện thoại Việt Nam gồm 10 chữ số, bắt đầu bằng 0.";
}

export function checkEmail(email: unknown): RuleResult {
  if (isBlank(email)) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim()) ? true : "Email không hợp lệ.";
}

export function checkHHmm(value: unknown): RuleResult {
  if (isBlank(value)) return true;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value)) ? true : "Giờ theo dạng HH:mm, ví dụ 08:00.";
}

export function checkOpeningHours(spec: { opens?: string | null; closes?: string | null } | undefined): RuleResult {
  if (!spec?.opens || !spec?.closes) return true;
  if (checkHHmm(spec.opens) !== true || checkHHmm(spec.closes) !== true) return true; // lỗi định dạng báo ở từng trường
  return spec.closes > spec.opens ? true : "Giờ đóng cửa phải sau giờ mở cửa.";
}

export function checkSlug(slug: { current?: string | null } | string | null | undefined): RuleResult {
  const value = typeof slug === "string" ? slug : slug?.current;
  if (isBlank(value)) return true;
  return isValidSlug(value) ? true : "Đường dẫn chỉ gồm chữ thường không dấu, số và gạch ngang (ví dụ ha-long-xanh).";
}

/** Độ dài SEO (ND-02): dùng làm cảnh báo (warning), không chặn publish. */
export function checkSeoTitle(title: unknown): RuleResult {
  if (isBlank(title)) return true;
  return String(title).trim().length <= 60 ? true : "Tiêu đề SEO nên ≤ 60 ký tự để không bị cắt trên Google.";
}

export function checkSeoDescription(description: unknown): RuleResult {
  if (isBlank(description)) return true;
  const n = String(description).trim().length;
  if (n < 70) return "Mô tả SEO nên dài 70–160 ký tự (đang quá ngắn).";
  if (n > 160) return "Mô tả SEO nên dài 70–160 ký tự (đang quá dài).";
  return true;
}

export function checkMaxLength(max: number) {
  return (value: unknown): RuleResult =>
    isBlank(value) || String(value).trim().length <= max ? true : `Tối đa ${max} ký tự.`;
}

export function checkGtmId(value: unknown): RuleResult {
  if (isBlank(value)) return true;
  return /^GTM-[A-Z0-9]+$/.test(String(value).trim()) ? true : "Mã GTM có dạng GTM-XXXXXXX.";
}

export function checkGa4Id(value: unknown): RuleResult {
  if (isBlank(value)) return true;
  return /^G-[A-Z0-9]+$/.test(String(value).trim()) ? true : "Mã GA4 có dạng G-XXXXXXXXXX.";
}

/** Chỉ link YouTube (embed trong bài, render click-to-load). */
export function checkYouTubeUrl(url: unknown): RuleResult {
  if (isBlank(url)) return true;
  const https = checkHttpsUrl(url);
  if (https !== true) return https;
  const host = new URL(String(url)).hostname.replace(/^www\.|^m\./, "");
  return host === "youtube.com" || host === "youtu.be" ? true : "Chỉ nhận liên kết YouTube.";
}

type RoleShare = { share?: number | null };

/** Định vị 60/40: các vai trò là số nguyên 0–100, tổng = 100. */
export function checkRoleShares(roles: RoleShare[] | null | undefined): RuleResult {
  if (!roles?.length) return true;
  for (const r of roles) {
    if (typeof r.share !== "number" || !Number.isInteger(r.share) || r.share < 0 || r.share > 100) {
      return "Tỷ lệ mỗi vai trò là số nguyên 0–100.";
    }
  }
  const total = roles.reduce((sum, r) => sum + (r.share ?? 0), 0);
  return total === 100 ? true : `Tổng tỷ lệ các vai trò phải bằng 100 (đang là ${total}).`;
}

type NavItem = { target?: string | null; visible?: boolean | null };

/** Menu (REQ-29): tối đa 7 mục đang hiện, không trùng đích. */
export function checkNavItems(items: NavItem[] | null | undefined, maxVisible = 7): RuleResult {
  if (!items?.length) return true;
  const targets = items.map((i) => i.target).filter(Boolean);
  if (new Set(targets).size !== targets.length) return "Mỗi trang chỉ xuất hiện một lần trong menu.";
  const visible = items.filter((i) => i.visible !== false).length;
  return visible <= maxVisible ? true : `Tối đa ${maxVisible} mục hiện trên menu (đang có ${visible}).`;
}

type Redirect = { from?: string | null; to?: string | null };

/** Chuyển hướng (CM-12): from là path nội bộ, không trùng; to là path / https; một bước nhảy. */
export function checkRedirects(list: Redirect[] | null | undefined): RuleResult {
  if (!list?.length) return true;
  const froms = new Set<string>();
  for (const r of list) {
    const from = r.from?.trim() ?? "";
    const to = r.to?.trim() ?? "";
    if (!from.startsWith("/") || from.startsWith("//")) return `«${from}»: đường dẫn cũ phải bắt đầu bằng «/», không kèm tên miền.`;
    if (froms.has(from)) return `«${from}» bị khai báo hai lần.`;
    froms.add(from);
    if (!(to.startsWith("/") && !to.startsWith("//")) && checkHttpsUrl(to) !== true) {
      return `«${to}»: đích phải là đường dẫn bắt đầu bằng «/» hoặc liên kết https.`;
    }
    if (from === to) return `«${from}» chuyển hướng về chính nó.`;
  }
  for (const r of list) {
    const to = r.to?.trim() ?? "";
    if (froms.has(to)) return `«${to}» vừa là đích vừa là đường dẫn cũ — chỉ cho một bước chuyển hướng.`;
  }
  return true;
}

/** Ảnh tối thiểu (OG 1200×630, favicon 512×512): đọc kích thước từ _ref dạng image-<id>-<w>x<h>-<ext>. */
export function imageDimensionsFromRef(ref: string | null | undefined): { width: number; height: number } | null {
  const m = ref?.match(/^image-[A-Za-z0-9]+-(\d+)x(\d+)-[a-z0-9]+$/);
  return m ? { width: Number(m[1]), height: Number(m[2]) } : null;
}

type ImageValue = { asset?: { _ref?: string } | null } | null | undefined;

export function checkMinImageSize(minWidth: number, minHeight: number, { square = false } = {}) {
  return (image: ImageValue): RuleResult => {
    const dims = imageDimensionsFromRef(image?.asset?._ref);
    if (!dims) return true;
    if (square && dims.width !== dims.height) return "Ảnh phải là hình vuông.";
    return dims.width >= minWidth && dims.height >= minHeight
      ? true
      : `Ảnh tối thiểu ${minWidth}×${minHeight} px (ảnh đang là ${dims.width}×${dims.height}).`;
  };
}

/** Cảnh báo ảnh hero nhỏ (MI-06): cạnh dài < 2000 px. */
export function checkHeroImageSize(image: ImageValue): RuleResult {
  const dims = imageDimensionsFromRef(image?.asset?._ref);
  if (!dims) return true;
  return Math.max(dims.width, dims.height) >= 2000 ? true : "Ảnh hero nên có cạnh dài ≥ 2000 px để hiển thị sắc nét.";
}

/**
 * Slug duy nhất trong cùng loại + ngôn ngữ (CM-06). Cùng câu GROQ chạy trên Sanity (Studio)
 * và trên seed (seed:validate, test) — khác ngôn ngữ thì được trùng.
 */
export const UNIQUE_SLUG_QUERY = /* groq */ `!defined(*[
  _type == $type && language == $lang && slug.current == $slug && !(_id in [$draft, $published])
][0]._id)`;

export function uniqueSlugParams(doc: { _id: string; _type: string; language?: unknown }, slug: string) {
  const published = doc._id.replace(/^drafts\./, "");
  return {
    type: doc._type,
    lang: typeof doc.language === "string" ? doc.language : null,
    slug,
    draft: `drafts.${published}`,
    published,
  };
}

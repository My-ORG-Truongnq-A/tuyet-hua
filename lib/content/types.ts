/**
 * Kiểu dữ liệu chung sau lớp dữ liệu (đã gắn ảnh, đã lọc theo CONTENT_MODE). Trường chi tiết từng
 * trang do template khai báo khi dựng (P4); ở đây chỉ các khối dùng lại.
 */
export type ImageAsset = {
  _ref: string;
  _type?: "reference";
  url?: string;
  width?: number;
  height?: number;
  lqip?: string | null;
};

export type ImageField = {
  _type?: "image";
  asset?: ImageAsset | null;
  hotspot?: { x: number; y: number; width: number; height: number } | null;
  crop?: { top: number; bottom: number; left: number; right: number } | null;
};

/** Ảnh có alt; `pending` = chưa xác nhận quyền dùng (chỉ có ở bản xem trước). */
export type Figure = {
  _type?: "figure";
  _key?: string;
  image?: ImageField | null;
  alt?: string | null;
  caption?: string | null;
  credit?: string | null;
  usageApproved?: boolean | null;
  pending?: boolean;
};

export type LinkValue = {
  _type?: "link";
  label?: string | null;
  kind?: "zalo" | "phone" | "internal" | "external" | null;
  internal?: { _ref: string } | null;
  href?: string | null;
};

export type HighlightStat = { _key?: string; value: string; label: string; confirmed?: boolean | null; pending?: boolean };

export type SeoValue = {
  title?: string | null;
  description?: string | null;
  ogImage?: ImageField | null;
  noindex?: boolean | null;
  canonicalOverride?: string | null;
} | null;

/** Document trang tĩnh (singleton theo ngôn ngữ). Template mở rộng bằng kiểu riêng. */
export type PageDocument = {
  _id: string;
  _type: string;
  _updatedAt?: string;
  language?: string;
  title?: string | null;
  seo?: SeoValue;
  [field: string]: unknown;
};

export type ProjectListItem = {
  _id: string;
  _updatedAt?: string;
  title: string;
  slug: string;
  summary?: string | null;
  heroImage?: Figure | null;
  featured?: boolean | null;
};

export type PostListItem = {
  _id: string;
  _updatedAt?: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: Figure | null;
  publishedAt: string;
};

export type Testimonial = {
  authorName: string;
  authorDescriptor?: string | null;
  quote: string;
  photo?: Figure | null;
};

export type NavItem = { _key?: string; label?: { vi?: string | null; en?: string | null } | null; target?: string | null; visible?: boolean | null };

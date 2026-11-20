import type { Figure, HighlightStat, LinkValue, PageDocument } from "@/lib/content/types";
import type { PortableValue } from "@/lib/portable-text";
import type { ValueItem } from "../shared/blocks";

/** Kiểu dữ liệu homePage (content_model) sau lớp dữ liệu — đã gắn ảnh, đã qua gate CONTENT_MODE. */
export type HomePage = PageDocument & {
  hero?: { image?: Figure | null; headline?: string | null; subline?: string | null; primaryCta?: LinkValue | null; secondaryCta?: LinkValue | null } | null;
  story?: {
    heading?: string | null;
    quote?: string | null;
    body?: PortableValue;
    image?: Figure | null;
    highlights?: HighlightStat[] | null;
    aboutLinkLabel?: string | null;
  } | null;
  whyMe?: { heading?: string | null; intro?: string | null; items?: ValueItem[] | null } | null;
  projectsSection?: { heading?: string | null; intro?: string | null; viewAllLabel?: string | null } | null;
  trustSection?: {
    heading?: string | null;
    body?: PortableValue;
    image?: Figure | null;
    stats?: HighlightStat[] | null;
    teamLinkLabel?: string | null;
    testimonialsHeading?: string | null;
  } | null;
  knowledgeSection?: { heading?: string | null; postsLimit?: number | null; viewAllLabel?: string | null } | null;
  servicesSection?: { enabled?: boolean | null; heading?: string | null; intro?: string | null; items?: ValueItem[] | null } | null;
  connectSection?: { heading?: string | null; body?: string | null } | null;
};

/** Số bài ở khối Kiến thức khi postsLimit trống. */
export const DEFAULT_KNOWLEDGE_LIMIT = 3;

/** Thứ tự khối trang chủ cố định (sitemap.json, D-06, YC-08). */
export const HOME_SECTION_ORDER = ["hero", "story", "whyMe", "projects", "trust", "knowledge", "services", "connect"] as const;

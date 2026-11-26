import { pathFor, type PageKey } from "./routes";
import type { Lang } from "./env";

/**
 * Kế hoạch làm mới cache khi Sanity publish (KT-02) — hàm THUẦN, route /api/revalidate chỉ thực thi.
 * Tag = tên loại nội dung (khớp tag của getter trong lib/content) + path đúng trang vừa đổi.
 * Danh sách CONTENT_TYPES PHẢI khớp schema đã đăng ký (có test đối chiếu).
 */
const PAGE_ROUTE: Record<string, PageKey> = {
  homePage: "home",
  aboutPage: "about",
  projectsPage: "projects",
  teamPage: "team",
  articlesPage: "posts",
  contactPage: "contact",
  privacyPage: "privacy",
};

/** Loại nội dung có webhook — đúng các type document trong sanity/schemaTypes. */
export const CONTENT_TYPES = [
  "siteSettings",
  "header",
  "footer",
  ...Object.keys(PAGE_ROUTE),
  "project",
  "post",
  "testimonial",
] as const;

/** Loại hệ thống vẫn cần làm mới tag (bản dịch). */
const SYSTEM_TAGS = new Set(["translation.metadata"]);
/** Bỏ qua: asset (bất biến theo _id) và lead (chỉ sinh từ form, không có trên trang). */
const IGNORED_TYPES = new Set(["sanity.imageAsset", "sanity.fileAsset", "lead"]);

export type WebhookBody = { _id?: string; _type?: string; language?: string | null; slug?: string | null };
export type RevalidationPlan =
  | { action: "revalidate"; tags: string[]; paths: string[] }
  | { action: "skip"; reason: string };

const LANGS: Lang[] = ["vi", "en"];
const toLang = (v: unknown): Lang => (LANGS.includes(v as Lang) ? (v as Lang) : "vi");

export function planRevalidation(body: WebhookBody | null | undefined): RevalidationPlan {
  const id = body?._id;
  const type = body?._type;
  if (!id || !type) return { action: "skip", reason: "thiếu _id / _type" };
  if (id.startsWith("drafts.") || id.startsWith("versions.")) return { action: "skip", reason: "bản nháp" };
  if (IGNORED_TYPES.has(type)) return { action: "skip", reason: `bỏ qua loại ${type}` };
  if (SYSTEM_TAGS.has(type)) return { action: "revalidate", tags: [type], paths: [] };
  if (!(CONTENT_TYPES as readonly string[]).includes(type)) return { action: "skip", reason: `loại lạ ${type}` };

  const lang = toLang(body.language);
  const paths = new Set<string>();
  const pageKey = PAGE_ROUTE[type];
  if (pageKey) paths.add(pathFor(pageKey, lang));
  const slug = typeof body.slug === "string" && body.slug ? body.slug : null;
  if (type === "project") {
    paths.add(pathFor("projects", lang)).add(pathFor("home", lang));
    if (slug) paths.add(pathFor("projectDetail", lang, { slug }));
  }
  if (type === "post") {
    paths.add(pathFor("posts", lang)).add(pathFor("home", lang));
    if (slug) paths.add(pathFor("postDetail", lang, { slug }));
  }
  if (type === "testimonial") paths.add(pathFor("home", lang));
  // siteSettings / header / footer: chỉ tag — mọi trang đọc chúng đều mang tag tương ứng.
  return { action: "revalidate", tags: [type], paths: [...paths] };
}

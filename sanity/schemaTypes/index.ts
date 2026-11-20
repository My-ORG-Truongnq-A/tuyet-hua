import type { SchemaTypeDefinition } from "sanity";
import { post, project, testimonial } from "./documents";
import { objectTypes } from "./objects";
import { footer, header, siteSettings } from "./singletons/global";
import {
  aboutPage,
  articlesPage,
  contactPage,
  homePage,
  privacyPage,
  projectsPage,
  teamPage,
} from "./singletons/pages";

/**
 * MỘT mô hình nội dung cho Studio và seed/sanity/documents.json (content_model v1).
 * Không có `lead` (website không có form — REQ-20), `author`, `category`, `page` tự do (excluded_types).
 * `partner`, `servicesPage` (conditional/) chỉ đăng ký khi khách chốt.
 */

/** Singleton toàn site, _id = tên type. */
export const GLOBAL_SINGLETONS = ["siteSettings", "header", "footer"] as const;

/** Trang tĩnh: singleton theo ngôn ngữ, _id = `<type>-<lang>` (D-05). */
export const PAGE_SINGLETONS = [
  "homePage",
  "aboutPage",
  "projectsPage",
  "teamPage",
  "articlesPage",
  "contactPage",
  "privacyPage",
] as const;

export const SINGLETON_TYPES: readonly string[] = [...GLOBAL_SINGLETONS, ...PAGE_SINGLETONS];

/** Loại tạo nhiều bản, dịch theo tài liệu (plugin document-internationalization). */
export const COLLECTION_TYPES = ["project", "post", "testimonial"] as const;

export const documentTypes = [
  siteSettings,
  header,
  footer,
  homePage,
  aboutPage,
  projectsPage,
  teamPage,
  articlesPage,
  contactPage,
  privacyPage,
  project,
  post,
  testimonial,
];

export const schemaTypes: SchemaTypeDefinition[] = [...objectTypes, ...documentTypes];

import type { DocumentActionComponent, Template, TemplateItem } from "sanity";
import type { StructureResolver } from "sanity/structure";
import { COLLECTION_TYPES, GLOBAL_SINGLETONS, PAGE_SINGLETONS, SINGLETON_TYPES } from "./schemaTypes";

/**
 * Cấu trúc Studio nhóm theo nghiệp vụ khách (content_model.studio.structure).
 * ID mọi mục là ASCII cố định (ND-01) — không sinh từ tiêu đề tiếng Việt.
 */
export const STUDIO_LANGUAGES = [
  { id: "vi", title: "Tiếng Việt" },
  { id: "en", title: "English" },
] as const;

export const GLOBAL_ITEMS: { type: (typeof GLOBAL_SINGLETONS)[number]; title: string }[] = [
  { type: "siteSettings", title: "Cài đặt chung" },
  { type: "header", title: "Menu đầu trang" },
  { type: "footer", title: "Chân trang" },
];

export const PAGE_ITEMS: { type: (typeof PAGE_SINGLETONS)[number]; title: string }[] = [
  { type: "homePage", title: "Trang chủ" },
  { type: "aboutPage", title: "Giới thiệu về tôi" },
  { type: "projectsPage", title: "Dự án (trang danh sách)" },
  { type: "teamPage", title: "Đào tạo & Đội ngũ" },
  { type: "articlesPage", title: "Bài viết (trang danh sách)" },
  { type: "contactPage", title: "Liên hệ" },
  { type: "privacyPage", title: "Chính sách bảo mật" },
];

export const COLLECTION_ITEMS: {
  type: (typeof COLLECTION_TYPES)[number];
  id: string;
  title: string;
  ordering: { field: string; direction: "asc" | "desc" }[];
}[] = [
  {
    type: "project",
    id: "du-an",
    title: "Dự án",
    ordering: [
      { field: "featured", direction: "desc" },
      { field: "sortOrder", direction: "asc" },
      { field: "title", direction: "asc" },
    ],
  },
  { type: "post", id: "bai-viet", title: "Bài viết", ordering: [{ field: "publishedAt", direction: "desc" }] },
  { type: "testimonial", id: "cam-nhan", title: "Cảm nhận khách hàng", ordering: [{ field: "sortOrder", direction: "asc" }] },
];

/** _id singleton trang theo ngôn ngữ (D-05): homePage-vi, homePage-en… */
export const pageDocumentId = (type: string, lang: string) => `${type}-${lang}`;

/** Mẫu khởi tạo cho singleton trang: gán sẵn ngôn ngữ (trường language ẩn, chỉ đọc). */
export const pageTemplates: Template[] = PAGE_ITEMS.flatMap(({ type, title }) =>
  STUDIO_LANGUAGES.map((lang) => ({
    id: pageDocumentId(type, lang.id),
    title: `${title} (${lang.title})`,
    schemaType: type,
    value: { language: lang.id },
  })),
);

export const structure: StructureResolver = (S) =>
  S.list()
    .id("noi-dung")
    .title("Nội dung")
    .items([
      S.listItem()
        .id("cai-dat-chung")
        .title("Cài đặt chung")
        .child(
          S.list()
            .id("cai-dat-chung-list")
            .title("Cài đặt chung")
            .items(
              GLOBAL_ITEMS.map(({ type, title }) =>
                S.listItem().id(type).title(title).schemaType(type).child(S.document().schemaType(type).documentId(type).title(title)),
              ),
            ),
        ),
      S.listItem()
        .id("trang")
        .title("Trang")
        .child(
          S.list()
            .id("trang-list")
            .title("Trang")
            .items(
              PAGE_ITEMS.map(({ type, title }) =>
                S.listItem()
                  .id(type)
                  .title(title)
                  .schemaType(type)
                  .child(
                    S.list()
                      .id(`${type}-ngon-ngu`)
                      .title(title)
                      .items(
                        STUDIO_LANGUAGES.map((lang) => {
                          const id = pageDocumentId(type, lang.id);
                          return S.listItem()
                            .id(id)
                            .title(lang.title)
                            .schemaType(type)
                            .child(S.document().schemaType(type).documentId(id).initialValueTemplate(id).title(`${title} — ${lang.title}`));
                        }),
                      ),
                  ),
              ),
            ),
        ),
      S.divider(),
      ...COLLECTION_ITEMS.map(({ type, id, title, ordering }) =>
        S.listItem()
          .id(id)
          .title(title)
          .schemaType(type)
          .child(
            S.list()
              .id(`${id}-ngon-ngu`)
              .title(title)
              .items(
                STUDIO_LANGUAGES.map((lang) =>
                  S.listItem()
                    .id(`${id}-${lang.id}`)
                    .title(lang.title)
                    .schemaType(type)
                    .child(
                      S.documentTypeList(type)
                        .id(`${id}-${lang.id}-list`)
                        .title(`${title} — ${lang.title}`)
                        .filter("_type == $type && language == $lang")
                        .params({ type, lang: lang.id })
                        .defaultOrdering(ordering)
                        .initialValueTemplates([S.initialValueTemplateItem(`${type}-${lang.id}`)]),
                    ),
                ),
              ),
          ),
      ),
    ]);

/** Singleton chỉ còn publish / discardChanges / restore — không xoá, nhân bản, bỏ publish (D-13, CM-11). */
export const SINGLETON_ACTIONS = new Set(["publish", "discardChanges", "restore"]);

export function resolveDocumentActions(
  prev: DocumentActionComponent[],
  schemaType: string,
): DocumentActionComponent[] {
  if (!SINGLETON_TYPES.includes(schemaType)) return prev;
  return prev.filter((action) => typeof action.action === "string" && SINGLETON_ACTIONS.has(action.action));
}

/**
 * Loại không được tạo tay: mọi singleton (và mẫu theo ngôn ngữ của chúng) + `lead` (chỉ sinh từ form;
 * dự án hiện không có form nên chưa có type này — chặn sẵn nếu sau này thêm).
 */
export const NO_MANUAL_CREATE: readonly string[] = [...SINGLETON_TYPES, "lead"];

export function filterNewDocumentOptions(prev: TemplateItem[]): TemplateItem[] {
  return prev.filter(
    (item) => !NO_MANUAL_CREATE.some((type) => item.templateId === type || item.templateId.startsWith(`${type}-`)),
  );
}

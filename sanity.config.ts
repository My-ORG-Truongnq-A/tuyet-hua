import { documentInternationalization } from "@sanity/document-internationalization";
import { viVNLocale } from "@sanity/locale-vi-vn";
import { table } from "@sanity/table";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./sanity/env";
import { COLLECTION_TYPES, schemaTypes } from "./sanity/schemaTypes";
import {
  STUDIO_LANGUAGES,
  filterNewDocumentOptions,
  pageTemplates,
  resolveDocumentActions,
  structure,
} from "./sanity/structure";

/**
 * Sanity Studio nhúng ở /studio, giao diện tiếng Việt. Một dataset production (gói Free).
 * Gói Free không có custom role → hạn chế thao tác bằng structure + document actions (D-13).
 */
export default defineConfig({
  name: "default",
  title: "Hứa Thị Tuyết — Quản trị nội dung",
  basePath: "/studio",
  projectId,
  dataset,
  plugins: [
    structureTool({ structure, title: "Nội dung" }),
    viVNLocale(),
    table(),
    // Dịch theo tài liệu cho loại tạo nhiều bản; trang tĩnh dùng _id cố định <type>-<lang> (D-05).
    documentInternationalization({
      supportedLanguages: STUDIO_LANGUAGES.map((l) => ({ id: l.id, title: l.title })),
      schemaTypes: [...COLLECTION_TYPES],
      languageField: "language",
    }),
  ],
  schema: {
    types: schemaTypes,
    templates: (prev) => [...prev, ...pageTemplates],
  },
  document: {
    actions: (prev, { schemaType }) => resolveDocumentActions(prev, schemaType),
    newDocumentOptions: (prev) => filterNewDocumentOptions(prev),
  },
});

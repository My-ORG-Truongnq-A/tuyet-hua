import { viVNLocale } from "@sanity/locale-vi-vn";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

/** Sanity Studio nhúng ở /studio, giao diện tiếng Việt. Một dataset production (gói Free). */
export default defineConfig({
  name: "default",
  title: "Hứa Thị Tuyết — Quản trị nội dung",
  basePath: "/studio",
  projectId,
  dataset,
  plugins: [structureTool(), viVNLocale()],
  schema: { types: schemaTypes },
});

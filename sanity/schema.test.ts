import type { DocumentActionComponent, TemplateItem } from "sanity";
import { describe, expect, it } from "vitest";
import { conditionalTypes } from "./schemaTypes/conditional";
import { objectTypes } from "./schemaTypes/objects";
import { PAGE_SINGLETONS, SINGLETON_TYPES, schemaTypes } from "./schemaTypes";
import {
  COLLECTION_ITEMS,
  GLOBAL_ITEMS,
  PAGE_ITEMS,
  STUDIO_LANGUAGES,
  filterNewDocumentOptions,
  pageTemplates,
  resolveDocumentActions,
} from "./structure";

type Field = { name: string; type: string; fields?: Field[] };
type TypeDef = { name: string; type: string; fields?: Field[] };

const types = schemaTypes as unknown as TypeDef[];
const byName = new Map(types.map((t) => [t.name, t]));
const fieldNames = (name: string) => byName.get(name)?.fields?.map((f) => f.name) ?? [];

describe("schema theo content_model (T2.1, T2.2)", () => {
  it("đủ 20 object dùng chung", () => {
    const names = objectTypes.map((t) => t.name);
    for (const n of [
      "localeString", "localeText", "seo", "figure", "link", "navItem", "faq", "redirect", "legacyId",
      "highlightStat", "valueItem", "roleShare", "timelineItem", "achievement", "projectValueProposition",
      "postalAddress", "openingHoursSpec", "socialLink", "blockContent", "blockContentLite",
    ]) {
      expect(names).toContain(n);
    }
  });

  it("không có type bị loại (lead, author, category, page) và chưa đăng ký type chờ chốt", () => {
    for (const n of ["lead", "author", "category", "page", ...conditionalTypes.map((t) => t.name)]) {
      expect(byName.has(n)).toBe(false);
    }
  });

  it("tên type không trùng", () => {
    expect(new Set(types.map((t) => t.name)).size).toBe(types.length);
  });

  it("trang tĩnh không có slug, có language + seo (D-05)", () => {
    for (const type of PAGE_SINGLETONS) {
      const names = fieldNames(type);
      expect(names).not.toContain("slug");
      expect(names).toContain("language");
      expect(names).toContain("seo");
    }
  });

  it("project / post có slug + language; testimonial có cờ đồng ý", () => {
    expect(fieldNames("project")).toEqual(expect.arrayContaining(["language", "slug", "featured", "sortOrder", "valueProposition"]));
    expect(fieldNames("post")).toEqual(expect.arrayContaining(["language", "slug", "publishedAt", "excerpt", "coverImage", "body"]));
    expect(fieldNames("testimonial")).toEqual(expect.arrayContaining(["language", "consentConfirmed", "consentNote"]));
  });

  it("siteSettings chứa toàn bộ thông tin cơ bản (REQ-18)", () => {
    expect(fieldNames("siteSettings")).toEqual(
      expect.arrayContaining(["brandName", "personName", "jobTitle", "tagline", "logo", "favicon", "contact", "ui", "seoDefaults", "blog", "integrations", "redirects"]),
    );
    const contact = byName.get("siteSettings")?.fields?.find((f) => f.name === "contact");
    expect(contact?.fields?.map((f) => f.name)).toEqual(
      expect.arrayContaining(["phone", "zaloPhone", "email", "address", "serviceArea", "openingHours", "socialLinks"]),
    );
  });

  it("figure có alt + cờ quyền dùng (D-09); link không có trường số điện thoại (D-07)", () => {
    expect(fieldNames("figure")).toEqual(expect.arrayContaining(["image", "alt", "usageApproved", "rightsNote"]));
    expect(fieldNames("link")).toEqual(["label", "kind", "internal", "href"]);
  });
});

describe("Studio (T2.3)", () => {
  it("ID cấu trúc là ASCII (ND-01)", () => {
    const ids = [
      ...GLOBAL_ITEMS.map((i) => i.type),
      ...PAGE_ITEMS.map((i) => i.type),
      ...COLLECTION_ITEMS.map((i) => i.id),
      ...pageTemplates.map((t) => t.id),
    ];
    for (const id of ids) expect(id).toMatch(/^[A-Za-z0-9-]+$/);
  });

  it("mọi singleton có mục trong Studio; trang có bản vi + en với _id <type>-<lang>", () => {
    const listed = [...GLOBAL_ITEMS.map((i) => i.type), ...PAGE_ITEMS.map((i) => i.type)];
    expect([...listed].sort()).toEqual([...SINGLETON_TYPES].sort());
    expect(pageTemplates).toHaveLength(PAGE_ITEMS.length * STUDIO_LANGUAGES.length);
    expect(pageTemplates.find((t) => t.id === "homePage-vi")?.value).toEqual({ language: "vi" });
  });

  const action = (name: string) => Object.assign(() => null, { action: name }) as unknown as DocumentActionComponent;
  const all = ["publish", "unpublish", "delete", "duplicate", "discardChanges", "restore"].map(action);

  it("singleton chỉ còn publish / discardChanges / restore (CM-11)", () => {
    expect(resolveDocumentActions(all, "siteSettings").map((a) => a.action)).toEqual(["publish", "discardChanges", "restore"]);
    expect(resolveDocumentActions(all, "homePage").map((a) => a.action)).toEqual(["publish", "discardChanges", "restore"]);
    expect(resolveDocumentActions(all, "project")).toHaveLength(all.length);
  });

  it("không tạo tay singleton (kể cả mẫu theo ngôn ngữ) và lead", () => {
    const item = (templateId: string) => ({ templateId }) as TemplateItem;
    const kept = filterNewDocumentOptions(
      ["siteSettings", "header", "homePage", "homePage-vi", "aboutPage-en", "lead", "project", "project-vi", "post-en", "testimonial"].map(item),
    ).map((i) => i.templateId);
    expect(kept).toEqual(["project", "project-vi", "post-en", "testimonial"]);
  });
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { SeedAsset } from "../../lib/content/seed-assets";
import { checkSeed, type SeedDoc } from "./seed-check";

const root = join(__dirname, "../..");
const read = <T>(p: string) => JSON.parse(readFileSync(join(root, p), "utf8")) as T;
const docs = read<SeedDoc[]>("seed/sanity/documents.json");
const assets = read<SeedAsset[]>("seed/sanity/assets.json");
const pendingRequired = Object.keys(read<{ pendingRequired: object }>("seed/sanity/field-status.json").pendingRequired);

const clone = () => structuredClone(docs);
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- test sửa sâu cấu trúc JSON tuỳ ý
const find = (list: SeedDoc[], id: string) => list.find((d) => d._id === id)! as Record<string, any>;
const messages = async (list: unknown) => (await checkSeed({ docs: list, assets, pendingRequired })).map((i) => `${i.id} ${i.path} ${i.message}`);

describe("seed:validate (CM-02, ND-10)", () => {
  it("seed thật hợp lệ: đủ 12 document theo content_model", async () => {
    expect(await messages(docs)).toEqual([]);
    expect(docs.map((d) => d._id).sort()).toEqual(
      [
        "siteSettings", "header", "footer", "homePage-vi", "aboutPage-vi", "projectsPage-vi", "teamPage-vi",
        "articlesPage-vi", "contactPage-vi", "privacyPage-vi", "project-ha-long-xanh-vi", "project-lang-van-vi",
      ].sort(),
    );
  });

  it("seed không chứa số liệu / feedback / email minh hoạ (REQ-21) và ảnh đều chờ xác nhận", () => {
    expect(docs.some((d) => d._type === "testimonial" || d._type === "post")).toBe(false);
    const text = JSON.stringify(docs);
    expect(text).not.toMatch(/"confirmed":\s*true/);
    expect(text).not.toMatch(/"usageApproved":\s*true/);
    expect(find(docs, "siteSettings").contact.email).toBeNull();
  });

  it("thiếu trường bắt buộc → lỗi; trường chờ khách trong field-status → bỏ qua", async () => {
    const list = clone();
    delete find(list, "siteSettings").personName;
    expect(await messages(list)).toEqual(["siteSettings personName thiếu trường bắt buộc"]);
    expect(await checkSeed({ docs, assets, pendingRequired: [] })).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "privacyPage-vi", path: "body" })]),
    );
  });

  it("_type lạ, trường lạ, _id có dấu chấm, _id trùng", async () => {
    const list = clone();
    list.push({ _id: "lead.abc", _type: "lead" });
    find(list, "header").extra = 1;
    list.push({ ...find(list, "footer"), _id: "footer" } as SeedDoc);
    const out = await messages(list);
    expect(out).toEqual(
      expect.arrayContaining([
        "lead.abc _id _id chứa «.» (dataset public không đọc được — D-03)",
        "lead.abc _type _type «lead» không có trong schema",
        "header extra trường lạ «extra» (không có trong schema)",
        "footer _id _id bị trùng",
      ]),
    );
  });

  it("chạy luật custom: alt, số điện thoại, redirect", async () => {
    const list = clone();
    find(list, "homePage-vi").hero.image.alt = "Ảnh chân dung";
    find(list, "siteSettings").contact.phone = "12345";
    find(list, "siteSettings").redirects = [{ _key: "a", _type: "redirect", from: "/a", to: "/a", permanent: true }];
    const out = (await messages(list)).join("\n");
    expect(out).toMatch(/hero\.image\.alt Không bắt đầu/);
    expect(out).toMatch(/contact\.phone .*10 chữ số/);
    expect(out).toMatch(/redirects .*chính nó/);
  });

  it("_ref không tồn tại, ảnh không có trong assets.json, mảng thiếu _key", async () => {
    const list = clone();
    find(list, "homePage-vi").hero.secondaryCta.internal._ref = "khong-co";
    find(list, "teamPage-vi").gallery[0].image._sanityAsset = "image@file://./seed/sanity/assets/thieu.jpg";
    delete find(list, "header").navItems[0]._key;
    const out = (await messages(list)).join("\n");
    expect(out).toMatch(/_ref «khong-co»/);
    expect(out).toMatch(/thieu\.jpg/);
    expect(out).toMatch(/navItems\[0\] phần tử mảng thiếu _key/);
  });

  it("slug trùng trong cùng type + language → lỗi; khác ngôn ngữ → hợp lệ (CM-06)", async () => {
    const list = clone();
    find(list, "project-lang-van-vi").slug.current = "ha-long-xanh";
    expect((await messages(list)).join("\n")).toMatch(/slug «ha-long-xanh» trùng/);
    const other = clone();
    other.push({ ...find(other, "project-ha-long-xanh-vi"), _id: "project-ha-long-xanh-en", language: "en" } as unknown as SeedDoc);
    expect(await messages(other)).toEqual([]);
  });

  it("cụm từ cấm trong nội dung (CM-09)", async () => {
    const list = clone();
    find(list, "projectsPage-vi").intro = "Cam kết lợi nhuận 20%";
    expect((await messages(list)).join("\n")).toMatch(/cụm từ cấm/);
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EN_PROPER_NOUNS, EN_TRANSLATED_IDS } from "./content/en-copy";

type Doc = Record<string, unknown> & { _id: string; _type: string; language?: string };
const docs = JSON.parse(readFileSync("seed/sanity/documents.json", "utf8")) as Doc[];
const enDocs = docs.filter((d) => d.language === "en");
const VI_CHARS = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
const INTERNAL_KEYS = new Set(["rightsNote", "sourceNote", "consentNote", "_ref", "_id", "_type", "_key"]);

function viStrings(value: unknown, path: string, out: string[]) {
  if (typeof value === "string") {
    const text = EN_PROPER_NOUNS.reduce((s, n) => s.split(n).join(""), value).replace(/Tuyết/g, "");
    if (VI_CHARS.test(text)) out.push(`${path}: ${value}`);
  } else if (Array.isArray(value)) value.forEach((v, i) => viStrings(v, `${path}.${i}`, out));
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) if (!INTERNAL_KEYS.has(k) && k !== "vi") viStrings(v, `${path}.${k}`, out);
}

describe("seed en", () => {
  it("có bản en cho đúng các tài liệu được dịch, mỗi bản liên kết với bản vi", () => {
    expect(enDocs.map((d) => d._id).sort()).toEqual(EN_TRANSLATED_IDS.map((id) => id.replace(/-vi$/, "-en")).sort());
    for (const id of EN_TRANSLATED_IDS) {
      const meta = docs.find((d) => d._id === `translation-metadata-${id.replace(/-vi$/, "")}`) as
        | { translations: { _key: string; value: { _ref: string } }[] }
        | undefined;
      expect(meta?.translations.map((t) => [t._key, t.value._ref])).toEqual([["vi", id], ["en", id.replace(/-vi$/, "-en")]]);
    }
  });

  it("bản en không lọt chữ tiếng Việt (trừ tên riêng)", () => {
    const leaks: string[] = [];
    for (const d of enDocs) viStrings(d, d._id, leaks);
    for (const d of docs.filter((x) => ["siteSettings", "header", "footer"].includes(x._id))) viStrings(d, d._id, leaks);
    expect(leaks).toEqual([]);
  });

  it("liên kết nội bộ trong bản en trỏ tới bản en; slug dự án en có đủ", () => {
    const ids = new Set(docs.map((d) => d._id));
    for (const d of enDocs) {
      for (const m of JSON.stringify(d).matchAll(/"_ref":"([^"]+)"/g)) {
        if (m[1]!.startsWith("image-")) continue;
        expect(m[1]).toMatch(/-en$/);
        expect(ids.has(m[1]!)).toBe(true);
      }
    }
    expect(enDocs.filter((d) => d._type === "project").every((d) => (d.slug as { current?: string })?.current)).toBe(true);
  });
});

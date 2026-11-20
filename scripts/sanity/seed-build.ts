/**
 * Sinh documents.json từ scripts/sanity/content/base.json + vi-copy.ts (không sửa tay tệp sinh ra).
 * Ảnh `_sanityAsset` → `asset: { _type: "reference", _ref: image-<sha1>-<w>x<h>-<ext> }` (hợp đồng content-migration).
 * Hàm thuần — dùng chung cho `sanity:build-seed` và bước kiểm trước `sanity:migrate --apply`.
 */
import type { SeedAsset } from "../../lib/content/seed-assets";
import type { Overlay } from "./content/vi-copy";

type Json = Record<string, unknown>;

function setPath(doc: Json, path: string, value: unknown, id: string) {
  const parts = path.split(".");
  let node: Json = doc;
  for (const part of parts.slice(0, -1)) {
    const next = node[part];
    if (!next || typeof next !== "object") throw new Error(`[build-seed] ${id}: không có «${path}» trong khung seed`);
    node = next as Json;
  }
  const last = parts[parts.length - 1]!;
  if (!(last in node)) throw new Error(`[build-seed] ${id}: không có «${path}» trong khung seed`);
  node[last] = value;
}

function resolveAssets(value: unknown, byRef: Map<string, SeedAsset>): unknown {
  if (Array.isArray(value)) return value.map((v) => resolveAssets(v, byRef));
  if (!value || typeof value !== "object") return value;
  const obj = value as Json;
  if (typeof obj._sanityAsset === "string") {
    const asset = byRef.get(obj._sanityAsset);
    if (!asset) throw new Error(`[build-seed] ảnh «${obj._sanityAsset}» chưa có trong assets.json (pnpm seed:assets)`);
    const { _sanityAsset, ...rest } = obj;
    void _sanityAsset;
    return { ...(resolveAssets(rest, byRef) as Json), asset: { _type: "reference", _ref: asset.assetId } };
  }
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, resolveAssets(v, byRef)]));
}

export type EnCopy = {
  /** id các tài liệu `*-vi` được nhân bản thành `*-en`. */
  translatedIds: readonly string[];
  /** Chữ en áp lên bản nhân bản (id = id bản vi). */
  overlays: Overlay[];
  /** Singleton dùng chung: điền `.en` tại chỗ. */
  singletonOverlays: Overlay[];
};

const toEnId = (id: string) => id.replace(/-vi$/, "-en");

/** Đổi `_ref` trỏ tới tài liệu `*-vi` đã có bản en sang `*-en` (bản en chỉ liên kết nội bộ trong en). */
function retargetRefs(value: unknown, translated: Set<string>): unknown {
  if (Array.isArray(value)) return value.map((v) => retargetRefs(v, translated));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Json).map(([k, v]) =>
      k === "_ref" && typeof v === "string" && translated.has(v) ? [k, toEnId(v)] : [k, retargetRefs(v, translated)],
    ),
  );
}

function applyOverlays(docs: Json[], overlays: Overlay[]) {
  for (const { id, set } of overlays) {
    const doc = docs.find((d) => d._id === id);
    if (!doc) throw new Error(`[build-seed] không có document «${id}» trong khung seed`);
    for (const [path, value] of Object.entries(set)) setPath(doc, path, structuredClone(value), id);
  }
}

/** Tài liệu liên kết bản dịch (plugin document-internationalization): một metadata cho mỗi cặp vi / en. */
function translationMetadata(viDoc: Json): Json {
  const viId = viDoc._id as string;
  const base = viId.replace(/-vi$/, "");
  const ref = (key: string, id: string) => ({
    _key: key,
    _type: "internationalizedArrayReferenceValue",
    value: { _type: "reference", _ref: id, _weak: true },
  });
  return {
    _id: `translation-metadata-${base}`,
    _type: "translation.metadata",
    _createdAt: viDoc._createdAt,
    _updatedAt: viDoc._updatedAt,
    schemaTypes: [viDoc._type],
    translations: [ref("vi", viId), ref("en", toEnId(viId))],
  };
}

export function buildSeed(base: Json[], overlays: Overlay[], assets: SeedAsset[], en?: EnCopy): Json[] {
  const docs = structuredClone(base);
  applyOverlays(docs, overlays);
  if (en) {
    applyOverlays(docs, en.singletonOverlays);
    const translated = new Set(en.translatedIds);
    const enDocs: Json[] = [];
    const metas: Json[] = [];
    for (const id of en.translatedIds) {
      const vi = docs.find((d) => d._id === id);
      if (!vi) throw new Error(`[build-seed] không có document «${id}» để dịch`);
      const copy = retargetRefs(structuredClone(vi), translated) as Json;
      copy._id = toEnId(id);
      copy.language = "en";
      enDocs.push(copy);
      metas.push(translationMetadata(vi));
    }
    applyOverlays(enDocs, en.overlays.map((o) => ({ ...o, id: toEnId(o.id) })));
    docs.push(...enDocs, ...metas);
  }
  const byRef = new Map(assets.map((a) => [a._sanityAsset, a]));
  return resolveAssets(docs, byRef) as Json[];
}

export const serializeSeed = (docs: unknown) => `${JSON.stringify(docs, null, 2)}\n`;

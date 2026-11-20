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

export function buildSeed(base: Json[], overlays: Overlay[], assets: SeedAsset[]): Json[] {
  const docs = structuredClone(base);
  for (const { id, set } of overlays) {
    const doc = docs.find((d) => d._id === id);
    if (!doc) throw new Error(`[build-seed] không có document «${id}» trong khung seed`);
    for (const [path, value] of Object.entries(set)) setPath(doc, path, structuredClone(value), id);
  }
  const byRef = new Map(assets.map((a) => [a._sanityAsset, a]));
  return resolveAssets(docs, byRef) as Json[];
}

export const serializeSeed = (docs: unknown) => `${JSON.stringify(docs, null, 2)}\n`;

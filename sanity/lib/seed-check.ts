import { evaluate, parse } from "groq-js";
import { findBannedPhrases } from "../../lib/banned-phrases";
import type { SeedAsset } from "../../lib/content/seed-assets";
import { schemaTypes } from "../schemaTypes";
import { UNIQUE_SLUG_QUERY, uniqueSlugParams } from "./rules";

/**
 * Kiểm seed KHÔNG gọi mạng (CM-02, ND-10) — đi theo đúng định nghĩa schema đang đăng ký:
 * _type hợp lệ, không trường lạ, đủ trường bắt buộc (trừ trường chờ khách ghi trong field-status.json),
 * chạy các luật custom (alt, SĐT, https, redirect…), _key mảng, _ref tồn tại, slug duy nhất theo ngôn ngữ,
 * ảnh có trong assets.json, không cụm từ cấm (CM-09), _id không có «.» ngoài tiền tố drafts. (D-03).
 */
export type SeedDoc = { _id: string; _type: string; [key: string]: unknown };
export type SeedIssue = { id: string; path: string; message: string };

type FieldDef = {
  name: string;
  type: string;
  fields?: FieldDef[];
  of?: FieldDef[];
  validation?: unknown;
};
type TypeDef = FieldDef & { title?: string };

const types = new Map((schemaTypes as unknown as TypeDef[]).map((t) => [t.name, t]));
const SYSTEM_TYPES = new Set(["translation.metadata", "sanity.imageAsset"]);
const PRIMITIVES = new Set(["string", "text", "url", "date", "datetime", "number", "boolean"]);

// ---------- Ghi lại chuỗi Rule mà validation của schema gọi ----------
type Chain = { calls: { name: string; args: unknown[] }[]; warning: boolean };

function recordRules(validation: unknown): Chain[] {
  if (typeof validation !== "function") return [];
  const chains: Chain[] = [];
  const chainProxy = (chain: Chain): unknown =>
    new Proxy(
      {},
      {
        get: (_t, name) => (...args: unknown[]) => {
          if (name === "warning" || name === "info") chain.warning = true;
          chain.calls.push({ name: String(name), args });
          return chainProxy(chain);
        },
      },
    );
  const root = new Proxy(
    {},
    {
      get: (_t, name) => (...args: unknown[]) => {
        const chain: Chain = { calls: [], warning: false };
        chains.push(chain);
        chain.calls.push({ name: String(name), args });
        return chainProxy(chain);
      },
    },
  );
  (validation as (r: unknown) => unknown)(root);
  return chains;
}

export function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") {
    // Khoá hệ thống (_type, _key) không tính là nội dung; _ref / _sanityAsset là nội dung (ảnh, tham chiếu).
    return Object.entries(value as Record<string, unknown>).every(
      ([k, v]) => (k.startsWith("_") && k !== "_ref" && k !== "_sanityAsset") || isEmpty(v),
    );
  }
  return false;
}

// ---------- Duyệt giá trị theo định nghĩa trường ----------
type Ctx = {
  doc: SeedDoc;
  issues: SeedIssue[];
  pending: Set<string>;
  refs: { path: string; ref: string }[];
  assetRefs: { path: string; ref: string }[];
};

const pathKey = (doc: SeedDoc, path: string) => `${doc._id}.${path}`;

function fieldsOf(def: FieldDef): FieldDef[] | null {
  if (def.fields) return def.fields;
  const named = types.get(def.type);
  if (named && named !== def) return fieldsOf(named);
  return null;
}

function membersOf(def: FieldDef): FieldDef[] | null {
  if (def.of) return def.of;
  const named = types.get(def.type);
  return named?.of ?? null;
}

function baseType(def: FieldDef): string {
  const named = types.get(def.type);
  return named && named !== def ? baseType(named) : def.type;
}

function checkRules(def: FieldDef, value: unknown, parent: unknown, path: string, ctx: Ctx) {
  const chains = [...recordRules(def.validation), ...recordRules(types.get(def.type)?.validation)];
  for (const chain of chains) {
    if (chain.warning) continue;
    for (const call of chain.calls) {
      if (call.name === "required" && isEmpty(value) && !ctx.pending.has(pathKey(ctx.doc, path))) {
        ctx.issues.push({ id: ctx.doc._id, path, message: "thiếu trường bắt buộc" });
      }
      if (call.name === "custom" && typeof call.args[0] === "function") {
        const result = (call.args[0] as (v: unknown, c: unknown) => unknown)(value ?? undefined, {
          parent,
          document: ctx.doc,
          path: path.split("."),
        });
        if (typeof result === "string") ctx.issues.push({ id: ctx.doc._id, path, message: result });
      }
    }
  }
}

function walkValue(def: FieldDef, value: unknown, parent: unknown, path: string, ctx: Ctx) {
  checkRules(def, value, parent, path, ctx);
  if (isEmpty(value)) return;
  const kind = baseType(def);
  const issue = (message: string) => ctx.issues.push({ id: ctx.doc._id, path, message });

  if (PRIMITIVES.has(kind)) {
    const expected = kind === "number" ? "number" : kind === "boolean" ? "boolean" : "string";
    if (typeof value !== expected) issue(`phải là ${expected}`);
    return;
  }
  if (typeof value !== "object") return issue("phải là object");
  const obj = value as Record<string, unknown>;

  if (kind === "reference") {
    if (typeof obj._ref !== "string") return issue("reference thiếu _ref");
    ctx.refs.push({ path, ref: obj._ref });
    return;
  }
  if (kind === "image") {
    const assetRef = (obj.asset as { _ref?: unknown } | undefined)?._ref;
    if (typeof obj._sanityAsset === "string") ctx.assetRefs.push({ path, ref: obj._sanityAsset });
    else if (typeof assetRef === "string") ctx.assetRefs.push({ path, ref: assetRef });
    else if (!obj.asset) issue("ảnh thiếu _sanityAsset / asset");
    for (const k of Object.keys(obj)) {
      if (!["_type", "_key", "_sanityAsset", "asset", "hotspot", "crop"].includes(k)) issue(`trường lạ «${k}» trong ảnh`);
    }
    return;
  }
  if (kind === "slug") {
    if (typeof obj.current !== "string") issue("slug thiếu current");
    return;
  }
  if (kind === "array") {
    if (!Array.isArray(value)) return issue("phải là mảng");
    const members = membersOf(def) ?? [];
    const keys = new Set<string>();
    value.forEach((item, i) => {
      const itemPath = `${path}[${i}]`;
      if (item && typeof item === "object") {
        const it = item as Record<string, unknown>;
        if (typeof it._key !== "string") ctx.issues.push({ id: ctx.doc._id, path: itemPath, message: "phần tử mảng thiếu _key" });
        else if (keys.has(it._key)) ctx.issues.push({ id: ctx.doc._id, path: itemPath, message: `_key «${it._key}» bị trùng` });
        else keys.add(it._key);
      }
      const member =
        members.length === 1
          ? members[0]
          : members.find((m) => m.type === (item as { _type?: string })?._type || m.name === (item as { _type?: string })?._type);
      if (!member) return ctx.issues.push({ id: ctx.doc._id, path: itemPath, message: "phần tử mảng không đúng loại cho phép" });
      if (member.type === "block") return; // Portable Text: chỉ kiểm _key
      walkValue(member, item, value, itemPath, ctx);
    });
    return;
  }

  const fields = fieldsOf(def);
  if (!fields) return; // loại plugin (table…) — không kiểm sâu
  const known = new Set(fields.map((f) => f.name));
  for (const k of Object.keys(obj)) {
    if (!k.startsWith("_") && !known.has(k)) issue(`trường lạ «${k}» (không có trong schema)`);
  }
  if (typeof obj._type === "string" && types.has(def.type) && obj._type !== def.type) {
    issue(`_type «${obj._type}» khác loại «${def.type}» của trường`);
  }
  for (const f of fields) walkValue(f, obj[f.name], obj, path ? `${path}.${f.name}` : f.name, ctx);
}

// ---------- Kiểm toàn bộ seed ----------
export type SeedCheckInput = {
  docs: unknown;
  assets: SeedAsset[];
  /** Đường dẫn `<_id>.<trường>` được phép trống dù bắt buộc (content_model.field_status — chờ khách). */
  pendingRequired?: string[];
};

export async function checkSeed({ docs, assets, pendingRequired = [] }: SeedCheckInput): Promise<SeedIssue[]> {
  const issues: SeedIssue[] = [];
  if (!Array.isArray(docs)) return [{ id: "-", path: "", message: "documents.json phải là mảng document" }];
  const list = docs as SeedDoc[];
  const ids = new Set<string>();
  const pending = new Set(pendingRequired);
  const assetKeys = new Set(assets.flatMap((a) => [a._sanityAsset, a.assetId]));
  const allRefs: { id: string; path: string; ref: string }[] = [];

  for (const doc of list) {
    if (!doc || typeof doc._id !== "string" || typeof doc._type !== "string") {
      issues.push({ id: String(doc?._id ?? "?"), path: "", message: "document thiếu _id / _type" });
      continue;
    }
    if (ids.has(doc._id)) issues.push({ id: doc._id, path: "_id", message: "_id bị trùng" });
    ids.add(doc._id);
    if (doc._id.replace(/^drafts\./, "").includes(".")) {
      issues.push({ id: doc._id, path: "_id", message: "_id chứa «.» (dataset public không đọc được — D-03)" });
    }
    for (const phrase of findBannedPhrases(JSON.stringify(doc))) {
      issues.push({ id: doc._id, path: "", message: `cụm từ cấm «${phrase}» (REQ-13)` });
    }
    if (SYSTEM_TYPES.has(doc._type)) continue;
    const def = types.get(doc._type);
    if (!def || (def as { type: string }).type !== "document") {
      issues.push({ id: doc._id, path: "_type", message: `_type «${doc._type}» không có trong schema` });
      continue;
    }
    const ctx: Ctx = { doc, issues, pending, refs: [], assetRefs: [] };
    const { _id, _type, _createdAt, _updatedAt, _rev, ...rest } = doc;
    void _id; void _type; void _createdAt; void _updatedAt; void _rev;
    for (const k of Object.keys(rest)) {
      if (!k.startsWith("_") && !def.fields?.some((f) => f.name === k)) {
        issues.push({ id: doc._id, path: k, message: `trường lạ «${k}» (không có trong schema)` });
      }
    }
    for (const f of def.fields ?? []) walkValue(f, doc[f.name], doc, f.name, ctx);
    for (const r of ctx.assetRefs) {
      if (!assetKeys.has(r.ref)) issues.push({ id: doc._id, path: r.path, message: `ảnh «${r.ref}» không có trong assets.json` });
    }
    allRefs.push(...ctx.refs.map((r) => ({ id: doc._id, ...r })));

    const slug = (doc.slug as { current?: string } | undefined)?.current;
    if (slug) {
      const params = uniqueSlugParams(doc, slug);
      const unique = await (await evaluate(parse(UNIQUE_SLUG_QUERY, { params }), { dataset: list, params })).get();
      if (!unique) issues.push({ id: doc._id, path: "slug", message: `slug «${slug}» trùng trong cùng loại + ngôn ngữ (CM-06)` });
    }
  }

  for (const r of allRefs) {
    if (!ids.has(r.ref)) issues.push({ id: r.id, path: r.path, message: `_ref «${r.ref}» trỏ tới document không có trong seed` });
  }
  issues.push(...checkDerivedRights(list, assets));
  return issues;
}

type FigureUse = { id: string; path: string; file: string; approved: boolean };

/** Mọi figure (object có `image` trỏ tới ảnh seed) trong một giá trị, kèm đường dẫn và cờ usageApproved. */
function collectFigures(value: unknown, path: string, id: string, fileOf: (ref: string) => string | undefined, out: FigureUse[]) {
  if (Array.isArray(value)) {
    value.forEach((v, i) => {
      const key = (v as { _key?: unknown } | null)?._key;
      collectFigures(v, `${path}[${typeof key === "string" ? key : i}]`, id, fileOf, out);
    });
    return;
  }
  if (!value || typeof value !== "object") return;
  const obj = value as Record<string, unknown>;
  const image = obj.image as { _sanityAsset?: string; asset?: { _ref?: string } } | undefined;
  const ref = image?._sanityAsset ?? image?.asset?._ref;
  const file = ref ? fileOf(ref) : undefined;
  const isFigure = Boolean(file) && (obj._type === "figure" || "usageApproved" in obj);
  if (isFigure) out.push({ id, path, file: file!, approved: obj.usageApproved === true });
  for (const [k, v] of Object.entries(obj)) {
    if (!(isFigure && k === "image")) collectFigures(v, path ? `${path}.${k}` : k, id, fileOf, out);
  }
}

/**
 * Ảnh phái sinh (assets.json `derivedFrom`, ví dụ bản tách nền) kế thừa quyền dùng của ảnh gốc (T6.6): figure dùng bản
 * phái sinh phải cùng cờ usageApproved với figure dùng ảnh gốc — không được «xác nhận» riêng bản tách nền.
 */
export function checkDerivedRights(docs: SeedDoc[], assets: SeedAsset[]): SeedIssue[] {
  const byRef = new Map(assets.flatMap((a) => [[a._sanityAsset, a.file] as const, [a.assetId, a.file] as const]));
  const derived = new Map(assets.filter((a) => a.derivedFrom).map((a) => [a.file, a.derivedFrom!] as const));
  const uses: FigureUse[] = [];
  for (const doc of docs) if (doc && typeof doc._id === "string") collectFigures(doc, "", doc._id, (r) => byRef.get(r), uses);
  const issues: SeedIssue[] = [];
  for (const u of uses) {
    const original = derived.get(u.file);
    if (!original) continue;
    const originals = uses.filter((o) => o.file === original);
    if (originals.some((o) => o.approved !== u.approved)) {
      issues.push({
        id: u.id,
        path: u.path,
        message: `ảnh phái sinh «${u.file}» phải cùng cờ quyền dùng (usageApproved) với ảnh gốc «${original}»`,
      });
    }
  }
  return issues;
}

/**
 * pnpm sanity:migrate [--dry] [--json]              — mặc định: KHÔNG ghi, không cần token, in kế hoạch / ước lượng request
 * pnpm sanity:migrate --apply --max-requests <N>    — ghi thật (token ghi từ biến môi trường của tiến trình)
 * pnpm sanity:migrate --restore <backup.json> [--apply] — khôi phục tài liệu từ bản backup
 * Cờ: --force (ghi đè cả tài liệu đã sửa trong Studio), --json (với --dry: đúng MỘT object JSON ra stdout).
 *
 * Seed (seed/sanity/documents.json + assets.json) là nguồn; script kiểm seed == bản sinh lại + seed hợp lệ TRƯỚC mọi
 * request và KHÔNG sửa hai tệp đó. Trạng thái ở scripts/sanity/state/ (DigiForge exclude, không commit).
 * Không in / ghi token ở bất kỳ đâu. Biến môi trường khi --apply:
 * NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { SeedAsset } from "../../lib/content/seed-assets";
import { checkSeed } from "../../sanity/lib/seed-check";
import { viOverlays } from "./content/vi-copy";
import {
  chunk,
  docHash,
  emptyManifest,
  imageAssetIds,
  normalizeDoc,
  planDocs,
  planPatch,
  toWritable,
  worstCaseRequests,
  type Doc,
  type Manifest,
  type Remote,
} from "./migrate-core";
import { patches } from "./patches";
import { buildSeed, serializeSeed } from "./seed-build";

const root = process.cwd();
const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const value = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const apply = flag("--apply");
const json = flag("--json");
const force = flag("--force");
const restoreFile = value("--restore");
const maxRequests = Number(value("--max-requests") ?? "Infinity");

const STATE_DIR = join(root, "scripts/sanity/state");
const MANIFEST = join(STATE_DIR, "manifest.json");
const log = (msg: string) => {
  if (!json) console.log(msg);
};
const fail = (msg: string, extra: Record<string, unknown> = {}): never => {
  if (json) console.log(JSON.stringify({ ok: false, error: msg, ...extra }));
  else console.error(`[sanity:migrate] ${msg}`);
  process.exit(1);
};

const readJson = <T>(p: string) => JSON.parse(readFileSync(join(root, p), "utf8")) as T;

function loadManifest(): Manifest {
  return existsSync(MANIFEST) ? (JSON.parse(readFileSync(MANIFEST, "utf8")) as Manifest) : emptyManifest();
}
function saveManifest(m: Manifest) {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(MANIFEST, `${JSON.stringify(m, null, 2)}\n`);
}

async function verifySeed(docs: Doc[], assets: SeedAsset[]) {
  const regenerated = serializeSeed(
    buildSeed(readJson("scripts/sanity/content/base.json"), viOverlays, assets),
  );
  const onDisk = readFileSync(join(root, "seed/sanity/documents.json"), "utf8");
  if (regenerated !== onDisk) fail("documents.json lệch bản sinh lại — chạy `pnpm sanity:build-seed` rồi commit");
  const status = existsSync(join(root, "seed/sanity/field-status.json"))
    ? readJson<{ pendingRequired?: Record<string, string> }>("seed/sanity/field-status.json")
    : {};
  const issues = await checkSeed({ docs, assets, pendingRequired: Object.keys(status.pendingRequired ?? {}) });
  if (issues.length) {
    fail(`seed không hợp lệ (${issues.length} lỗi)`, { issues: issues.slice(0, 20) });
  }
  const missing = [...imageAssetIds(docs)].filter((id) => !assets.some((a) => a.assetId === id));
  if (missing.length) fail(`ảnh không có trong assets.json: ${missing.join(", ")}`);
}

type Client = {
  fetch: <T>(query: string, params?: Record<string, unknown>) => Promise<T>;
  assets: { upload: (type: "image", body: Buffer, opts: { filename: string }) => Promise<{ _id: string }> };
  transaction: () => {
    createOrReplace: (doc: Doc) => unknown;
    patch: (id: string, fn: (p: PatchBuilder) => unknown) => unknown;
    commit: (opts?: Record<string, unknown>) => Promise<{ results?: { id: string; document?: { _rev?: string } }[] }>;
  };
};
type PatchBuilder = {
  ifRevisionId: (rev: string) => PatchBuilder;
  set: (v: Record<string, unknown>) => PatchBuilder;
  unset: (v: string[]) => PatchBuilder;
};

async function makeClient(): Promise<Client> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !dataset || !token) {
    return fail("thiếu NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET / SANITY_API_WRITE_TOKEN");
  }
  const { createClient } = await import("next-sanity");
  return createClient({
    projectId,
    dataset,
    token,
    apiVersion: "2025-01-01",
    useCdn: false,
    perspective: "raw",
  }) as unknown as Client;
}

/** MỘT truy vấn gom: toàn bộ tài liệu đã publish có _id nằm trong tập script quản lý. */
async function fetchRemote(client: Client, ids: string[]): Promise<Remote> {
  const found = await client.fetch<(Doc & { _rev?: string })[]>(`*[_id in $ids]`, { ids });
  return new Map(found.map((d) => [d._id, d]));
}

function writeBackup(label: string, docs: Doc[]): string {
  const dir = join(STATE_DIR, "backups");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${label}.json`);
  writeFileSync(file, `${JSON.stringify(docs, null, 2)}\n`);
  return file;
}

async function restore(file: string) {
  const path = resolve(root, file);
  if (!existsSync(path)) fail(`không thấy backup «${file}»`);
  const docs = JSON.parse(readFileSync(path, "utf8")) as Doc[];
  const requests = 1 + Math.ceil(docs.length / 50);
  if (!apply) {
    const out = { ok: true, mode: "restore-dry", docs: docs.length, worstCaseApplyRequests: requests };
    console.log(json ? JSON.stringify(out) : `[sanity:migrate] --restore (dry): sẽ khôi phục ${docs.length} tài liệu, tối đa ${requests} request`);
    return;
  }
  if (requests > maxRequests) fail(`ước lượng ${requests} request vượt --max-requests ${maxRequests}`);
  const client = await makeClient();
  for (const batch of chunk(docs)) {
    const tx = client.transaction();
    for (const d of batch) tx.createOrReplace(toWritable(d));
    await tx.commit({ returnDocuments: false });
  }
  console.log(`[sanity:migrate] đã khôi phục ${docs.length} tài liệu từ backup`);
}

async function main() {
  if (restoreFile) return restore(restoreFile);

  const docs = readJson<Doc[]>("seed/sanity/documents.json");
  const assets = readJson<SeedAsset[]>("seed/sanity/assets.json");
  await verifySeed(docs, assets);

  const manifest = loadManifest();
  const used = [...imageAssetIds(docs)].map((id) => assets.find((a) => a.assetId === id)!);
  const uncached = used.filter((a) => manifest.assets[a.sha1hash] !== a.assetId);
  const patchDocs = patches.reduce((n, p) => n + p.docIds.length, 0);
  const worstCaseApplyRequests = worstCaseRequests({
    docCount: docs.length,
    uncachedAssets: uncached.length,
    patchDocCount: patchDocs,
  });

  if (!apply) {
    const summary = {
      ok: true,
      mode: "dry",
      documents: docs.length,
      byType: docs.reduce<Record<string, number>>((m, d) => ((m[d._type] = (m[d._type] ?? 0) + 1), m), {}),
      assets: used.length,
      uncachedAssets: uncached.length,
      patches: patches.map((p) => p.name),
      writeBatches: Math.ceil((docs.length + patchDocs) / 50),
      worstCaseApplyRequests,
    };
    if (json) console.log(JSON.stringify(summary));
    else {
      console.log(`[sanity:migrate] --dry: ${summary.documents} tài liệu, ${summary.assets} ảnh (${summary.uncachedAssets} chưa cache)`);
      console.log(`[sanity:migrate] request --apply tối đa: ${worstCaseApplyRequests} (không ghi gì)`);
    }
    return;
  }

  if (worstCaseApplyRequests > maxRequests) {
    fail(`ước lượng ${worstCaseApplyRequests} request vượt --max-requests ${maxRequests} — dừng trước khi gọi`);
  }
  const client = await makeClient();
  let requests = 0;

  // 1) Ảnh chưa cache — id tất định, Sanity khử trùng theo sha1.
  for (const asset of uncached) {
    requests++;
    const uploaded = await client.assets.upload("image", readFileSync(join(root, "seed/sanity/assets", asset.file)), {
      filename: asset.file,
    });
    if (uploaded._id !== asset.assetId) fail(`ảnh «${asset.file}»: Sanity trả ${uploaded._id}, seed ghi ${asset.assetId}`);
    manifest.assets[asset.sha1hash] = asset.assetId;
    saveManifest(manifest);
  }

  // 2) MỘT truy vấn đọc trạng thái hiện tại.
  requests++;
  const remote = await fetchRemote(client, [...docs.map((d) => d._id), ...patches.flatMap((p) => p.docIds)]);
  const plan = planDocs(docs, remote, manifest, force);
  const toWrite = docs.filter((d) => ["create", "replace"].includes(plan.find((p) => p.id === d._id)!.action));
  const manual = plan.filter((p) => p.action === "manual");

  const patchPlans = patches.map((p) => ({ p, ...planPatch(p, remote) }));
  const conflicts = patchPlans.flatMap((x) => x.conflicts.map((c) => `${x.p.name}: ${c}`));
  if (conflicts.length) fail(`patch xung đột, không ghi gì: ${conflicts.join("; ")}`);

  // 3) Backup bản đang có trước khi ghi đè.
  const replaced = toWrite.filter((d) => remote.has(d._id)).map((d) => remote.get(d._id)!);
  const patched = patchPlans.flatMap((x) => x.ops.map((o) => remote.get(o.id)!));
  let backup: string | undefined;
  if (replaced.length || patched.length) {
    backup = writeBackup(new Date().toISOString().replace(/[:.]/g, "-"), [...replaced, ...patched]);
  }

  // 4) Ghi theo lô.
  const written: Record<string, string | undefined> = {};
  for (const batch of chunk(toWrite)) {
    const tx = client.transaction();
    for (const d of batch) tx.createOrReplace(toWritable(d));
    requests++;
    const res = await tx.commit({ returnDocuments: true });
    for (const r of res.results ?? []) written[r.id] = r.document?._rev;
  }
  for (const d of toWrite) manifest.docs[d._id] = { rev: written[d._id], hash: docHash(d) };
  for (const d of docs) {
    if (plan.find((p) => p.id === d._id)!.action === "unchanged") {
      manifest.docs[d._id] = { rev: remote.get(d._id)?._rev, hash: docHash(d) };
    }
  }

  // 5) Patch khoá _rev.
  for (const { p, ops } of patchPlans) {
    if (!ops.length) continue;
    const tx = client.transaction();
    for (const op of ops) {
      tx.patch(op.id, (b) => {
        let patch = b.ifRevisionId(op.rev);
        if (op.set) patch = patch.set(op.set);
        if (op.unset) patch = patch.unset(op.unset);
        return patch;
      });
    }
    requests++;
    await tx.commit({ returnDocuments: false });
    log(`[sanity:migrate] patch ${p.name}: ${ops.length} tài liệu`);
  }
  saveManifest(manifest);

  const counts = plan.reduce<Record<string, number>>((m, p) => ((m[p.action] = (m[p.action] ?? 0) + 1), m), {});
  console.log(`[sanity:migrate] xong: ${JSON.stringify(counts)} — ${requests} request`);
  if (backup) console.log(`[sanity:migrate] backup: ${backup} (khôi phục: --restore <tệp> --apply)`);
  if (manual.length) {
    console.log(`[sanity:migrate] XEM TAY (không ghi đè, dùng --force nếu chắc chắn): ${manual.map((m) => `${m.id} (${m.reason})`).join("; ")}`);
  }
  void normalizeDoc;
}

main().catch((e: unknown) => {
  // Không in đối tượng lỗi đầy đủ (có thể chứa header yêu cầu) — chỉ thông điệp.
  console.error(`[sanity:migrate] lỗi: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { SeedAsset } from "@/lib/content/seed-assets";

/**
 * Ảnh của seed (url của asset ảo `/seed-assets/<tệp>` — BP-05). Chỉ phục vụ tệp có trong
 * seed/sanity/assets.json; sinh tĩnh lúc build, tên khác → 404. Khi bật Sanity, ảnh đi qua cdn.sanity.io.
 */
export const dynamicParams = false;

async function manifest(): Promise<SeedAsset[]> {
  return JSON.parse(await readFile(join(process.cwd(), "seed", "sanity", "assets.json"), "utf8")) as SeedAsset[];
}

export async function generateStaticParams() {
  return (await manifest()).map((a) => ({ file: a.file }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const asset = (await manifest()).find((a) => a.file === file);
  if (!asset) return new Response("Not found", { status: 404 });
  const body = await readFile(join(process.cwd(), "seed", "sanity", "assets", asset.file));
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Length": String(body.length),
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

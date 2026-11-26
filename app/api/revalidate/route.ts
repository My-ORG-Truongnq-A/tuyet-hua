import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { env } from "@/lib/env";
import { planRevalidation, type WebhookBody } from "@/lib/revalidate";

/**
 * Webhook Sanity → làm mới cache (KT-02). Chỉ có tác dụng khi bật Sanity (SANITY_SOURCE=sanity).
 * Cấu hình webhook (sau G5): trigger create/update/delete, filter `!(_id in path("drafts.**"))`,
 * projection `{ _id, _type, language, "slug": slug.current }`, secret = SANITY_REVALIDATE_SECRET.
 * Thiếu secret → 500 (không bỏ qua kiểm chữ ký); chữ ký sai → 401.
 */
export async function POST(request: NextRequest) {
  const secret = env.sanity.revalidateSecret;
  if (!secret) {
    return NextResponse.json({ ok: false, message: "Chưa cấu hình SANITY_REVALIDATE_SECRET" }, { status: 500 });
  }
  let parsed: Awaited<ReturnType<typeof parseBody<WebhookBody>>>;
  try {
    parsed = await parseBody<WebhookBody>(request, secret);
  } catch {
    return NextResponse.json({ ok: false, message: "Body không hợp lệ" }, { status: 400 });
  }
  if (parsed.isValidSignature !== true) {
    return NextResponse.json({ ok: false, message: "Chữ ký không hợp lệ" }, { status: 401 });
  }
  const plan = planRevalidation(parsed.body);
  if (plan.action === "skip") return NextResponse.json({ ok: true, skipped: plan.reason });
  for (const tag of plan.tags) revalidateTag(tag, "max");
  for (const path of plan.paths) revalidatePath(path);
  return NextResponse.json({ ok: true, tags: plan.tags, paths: plan.paths });
}

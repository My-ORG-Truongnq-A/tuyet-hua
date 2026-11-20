import type { ReactNode } from "react";
import { env, type ContentMode } from "@/lib/env";

/**
 * Nhãn «chờ xác nhận» / «chờ nội dung» (T3.7 — REQ-21): CHỈ hiện ở bản xem trước (CONTENT_MODE=preview).
 * Bản release không bao giờ in nhãn này.
 */
export function PendingLabel({
  children,
  tone = "light",
  className = "",
  mode = env.contentMode,
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
  mode?: ContentMode;
}) {
  if (mode !== "preview") return null;
  return (
    <span
      data-pending=""
      className={`inline-flex items-center gap-1.5 rounded-xs border border-dashed px-2 py-0.5 text-xs font-medium ${
        tone === "dark" ? "border-gold-300/60 text-gold-300" : "border-gold-700/50 text-gold-700"
      } ${className}`}
    >
      <span aria-hidden="true">●</span> {children}
    </span>
  );
}

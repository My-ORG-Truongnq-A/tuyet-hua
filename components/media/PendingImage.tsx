import { env } from "@/lib/env";

/**
 * Ô giữ chỗ ảnh trung tính (imageStrategy = client_photos): chỉ ở bản xem trước, kèm ghi chú ảnh cần.
 * Bản release không render (khối dùng nó tự bỏ ô).
 */
export function PendingImage({
  note,
  className = "",
  tone = "light",
}: {
  note: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  if (env.contentMode !== "preview") return null;
  const dark = tone === "dark";
  return (
    <div
      role="img"
      aria-label={note}
      data-pending=""
      className={`relative flex flex-col items-center justify-center gap-3 overflow-hidden p-6 text-center ${
        dark ? "bg-emerald-800 text-emerald-100 ring-1 ring-gold-500/40" : "bg-ivory-200 text-ink-600 ring-1 ring-stone-300"
      } ${className}`}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        className={`absolute inset-0 h-full w-full ${dark ? "text-gold-500/25" : "text-gold-500/40"}`}
        preserveAspectRatio="none"
        viewBox="0 0 400 240"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M0 190 C60 170 90 120 130 140 S200 200 250 160 S330 110 400 150" />
        <path d="M0 210 C70 195 110 160 150 175 S230 215 280 190 S350 160 400 180" />
        <path d="M40 160 l30 -50 l20 30 l15 -20 l30 40" />
        <path d="M250 150 l25 -45 l18 25 l14 -15 l26 35" />
      </svg>
      <p className="relative max-w-64 text-sm leading-snug">{note}</p>
    </div>
  );
}

/**
 * Biến Sanity cho Studio (chạy phía trình duyệt — Next inline NEXT_PUBLIC_*).
 * Site công khai đọc cấu hình qua lib/env.ts; tệp này chỉ dùng cho Studio.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || "2025-02-19";

/** Dự án chưa bật Sanity (Q-118) → /studio báo «chưa bật CMS», build vẫn đạt. */
export const studioEnabled = projectId.length > 0;

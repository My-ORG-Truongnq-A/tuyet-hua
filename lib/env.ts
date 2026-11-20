import { z } from "zod";

/**
 * Một cửa đọc biến môi trường (KT-11). Mọi module khác đọc qua `env`, không đọc process.env trực tiếp.
 * Giá trị mặc định luôn là giá trị AN TOÀN: noindex, seed, chỉ tiếng Việt, nội dung preview, form demo.
 * Thiếu biến bắt buộc ở production deploy → lỗi khi build / khởi động (fail-closed), không fallback.
 */

export const LANGUAGES = ["vi", "en"] as const;
export type Lang = (typeof LANGUAGES)[number];

export type SanitySource = "seed" | "sanity";
export type ContentMode = "preview" | "release";

export type Env = {
  /** Origin chuẩn, không / cuối (SEO-02). */
  siteUrl: string;
  /** ALLOW_INDEXING === "1" (SEO-01). Cần thêm điều kiện production + host — xem lib/indexing.ts. */
  allowIndexing: boolean;
  isProductionDeploy: boolean;
  sanitySource: SanitySource;
  sanity: {
    projectId?: string;
    dataset: string;
    apiVersion: string;
    readToken?: string;
    revalidateSecret?: string;
  };
  /** Ngôn ngữ đang bật; luôn có "vi", thứ tự cố định vi → en. */
  languages: Lang[];
  contentMode: ContentMode;
  /** Tệp seed (mặc định seed/sanity/documents.json; e2e có thể trỏ sang fixture). */
  seedFile?: string;
  leadsDryRun: boolean;
  tracking: {
    gtmId?: string;
    gaId?: string;
    googleSiteVerification?: string;
    chatWidgetKey?: string;
  };
};

type RawEnv = Record<string, string | undefined>;

const DEFAULT_SANITY_API_VERSION = "2025-02-19";

/** Chuỗi rỗng / chỉ khoảng trắng coi như không đặt. */
const opt = (v: string | undefined) => {
  const t = v?.trim();
  return t ? t : undefined;
};

function fail(name: string, message: string): never {
  throw new Error(`[env] ${name}: ${message}`);
}

function parseSiteUrl(raw: RawEnv): string {
  const value = opt(raw.NEXT_PUBLIC_SITE_URL);
  if (!value) {
    if (raw.VERCEL_ENV) {
      fail("NEXT_PUBLIC_SITE_URL", "bắt buộc trên bản deploy (không fallback localhost — KT-11)");
    }
    // Bản build local / dev / test: origin máy chạy.
    return `http://localhost:${opt(raw.PORT) ?? "3000"}`;
  }
  const parsed = z.url({ protocol: /^https?$/ }).safeParse(value);
  if (!parsed.success) fail("NEXT_PUBLIC_SITE_URL", `phải là URL http(s) đầy đủ, nhận «${value}»`);
  return new URL(value).origin;
}

function parseLanguages(value: string | undefined): Lang[] {
  if (!value) return ["vi"];
  const items = value.split(",").map((s) => s.trim()).filter(Boolean);
  for (const item of items) {
    if (!(LANGUAGES as readonly string[]).includes(item)) {
      fail("SITE_LANGUAGES", `chỉ nhận ${LANGUAGES.join(", ")}; nhận «${item}»`);
    }
  }
  return LANGUAGES.filter((l) => l === "vi" || items.includes(l));
}

export function parseEnv(raw: RawEnv): Env {
  const isProductionDeploy = raw.VERCEL_ENV ? raw.VERCEL_ENV === "production" : raw.NODE_ENV === "production";

  const projectId = opt(raw.NEXT_PUBLIC_SANITY_PROJECT_ID);
  const sourceRaw = opt(raw.SANITY_SOURCE);
  if (sourceRaw && sourceRaw !== "seed" && sourceRaw !== "sanity") {
    fail("SANITY_SOURCE", `chỉ nhận seed | sanity; nhận «${sourceRaw}»`);
  }
  const sanitySource: SanitySource = (sourceRaw as SanitySource | undefined) ?? (projectId ? "sanity" : "seed");
  if (sanitySource === "sanity" && !projectId) {
    fail("NEXT_PUBLIC_SANITY_PROJECT_ID", "bắt buộc khi SANITY_SOURCE=sanity");
  }

  const contentModeRaw = opt(raw.CONTENT_MODE) ?? "preview";
  if (contentModeRaw !== "preview" && contentModeRaw !== "release") {
    fail("CONTENT_MODE", `chỉ nhận preview | release; nhận «${contentModeRaw}»`);
  }

  return {
    siteUrl: parseSiteUrl(raw),
    allowIndexing: raw.ALLOW_INDEXING === "1",
    isProductionDeploy,
    sanitySource,
    sanity: {
      projectId,
      dataset: opt(raw.NEXT_PUBLIC_SANITY_DATASET) ?? "production",
      apiVersion: opt(raw.NEXT_PUBLIC_SANITY_API_VERSION) ?? DEFAULT_SANITY_API_VERSION,
      readToken: opt(raw.SANITY_API_READ_TOKEN),
      revalidateSecret: opt(raw.SANITY_REVALIDATE_SECRET),
    },
    languages: parseLanguages(opt(raw.SITE_LANGUAGES)),
    contentMode: contentModeRaw,
    seedFile: opt(raw.SEED_FILE),
    leadsDryRun: raw.LEADS_DRY_RUN !== "0",
    tracking: {
      gtmId: opt(raw.NEXT_PUBLIC_GTM_ID),
      gaId: opt(raw.NEXT_PUBLIC_GA_ID),
      googleSiteVerification: opt(raw.GOOGLE_SITE_VERIFICATION),
      chatWidgetKey: opt(raw.NEXT_PUBLIC_CHAT_WIDGET_KEY),
    },
  };
}

/**
 * Env của process hiện tại. Liệt kê tường minh từng biến NEXT_PUBLIC_* để Next inline đúng
 * (process.env không duyệt được ở client bundle).
 */
export const env: Env = parseEnv({
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  PORT: process.env.PORT,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  ALLOW_INDEXING: process.env.ALLOW_INDEXING,
  SANITY_SOURCE: process.env.SANITY_SOURCE,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
  SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
  SITE_LANGUAGES: process.env.SITE_LANGUAGES,
  CONTENT_MODE: process.env.CONTENT_MODE,
  SEED_FILE: process.env.SEED_FILE,
  LEADS_DRY_RUN: process.env.LEADS_DRY_RUN,
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
  NEXT_PUBLIC_CHAT_WIDGET_KEY: process.env.NEXT_PUBLIC_CHAT_WIDGET_KEY,
});

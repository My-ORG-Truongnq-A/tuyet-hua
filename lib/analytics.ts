/**
 * Tracking (10-tracking.md). Thuần, không import runtime — dùng được ở next.config, server và client.
 *
 * - TR-01: một đường nạp (GTM-only; GA4 gtag trực tiếp chỉ khi không có GTM), ID chỉ từ env,
 *   chỉ khi VERCEL_ENV=production. Bản build local / demo / preview: null → không nhúng gì.
 * - TR-03: tên sự kiện chuẩn, đo click liên hệ bằng một listener ở document, phân loại theo href.
 * - TR-05: không PII — sự kiện không mang số điện thoại, href hay nội dung người dùng.
 */

export type TrackingConfig = { kind: "gtm"; id: string } | { kind: "ga4"; id: string };

type TrackingEnv = {
  isVercelProduction: boolean;
  tracking: { gtmId?: string; gaId?: string };
};

const GTM_ID = /^GTM-[A-Z0-9]{4,12}$/;
const GA4_ID = /^G-[A-Z0-9]{4,16}$/;

const clean = (v: string | undefined, re: RegExp) => {
  const id = v?.trim().toUpperCase();
  return id && re.test(id) ? id : undefined;
};

export function resolveTracking(env: TrackingEnv): TrackingConfig | null {
  if (!env.isVercelProduction) return null;
  const gtm = clean(env.tracking.gtmId, GTM_ID);
  if (gtm) return { kind: "gtm", id: gtm };
  const ga = clean(env.tracking.gaId, GA4_ID);
  if (ga) return { kind: "ga4", id: ga };
  return null;
}

/** Mã xác minh Search Console (meta google-site-verification) — cùng cổng production như tracking. */
export function resolveSiteVerification(env: {
  isVercelProduction: boolean;
  tracking: { googleSiteVerification?: string };
}): string | null {
  const token = env.tracking.googleSiteVerification?.trim();
  if (!env.isVercelProduction || !token || !/^[A-Za-z0-9_-]{10,100}$/.test(token)) return null;
  return token;
}

/** Nguồn CSP cần mở khi có tracking (Google Tag / GA4). Thêm tag khác trong GTM → bổ sung host ở đây. */
export function trackingCspSources(config: TrackingConfig | null): { script: string[]; connect: string[]; img: string[] } {
  if (!config) return { script: [], connect: [], img: [] };
  return {
    script: ["https://www.googletagmanager.com"],
    connect: ["https://*.google-analytics.com", "https://*.analytics.google.com", "https://*.googletagmanager.com"],
    img: ["https://*.google-analytics.com", "https://*.googletagmanager.com"],
  };
}

export type ContactEventName = "click_phone" | "click_zalo" | "click_email" | "click_messenger" | "click_directions";

const ZALO_HOST = /^(?:[a-z0-9-]+\.)*zalo\.me$/;
const MESSENGER_HOST = /^(?:m\.me|(?:www\.)?messenger\.com)$/;
const MAPS_HOST = /^(?:maps\.app\.goo\.gl|maps\.google\.[a-z.]+)$/;
const GOOGLE_HOST = /^(?:www\.)?google\.[a-z.]+$/;

/** href → sự kiện liên hệ (TR-03); không phải liên kết liên hệ → null. */
export function classifyContactHref(href: string | null | undefined): ContactEventName | null {
  if (!href) return null;
  const h = href.trim();
  const scheme = h.slice(0, h.indexOf(":") + 1).toLowerCase();
  if (scheme === "tel:") return "click_phone";
  if (scheme === "mailto:") return "click_email";
  if (scheme !== "https:" && scheme !== "http:") return null;
  let url: URL;
  try {
    url = new URL(h);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (ZALO_HOST.test(host)) return "click_zalo";
  if (MESSENGER_HOST.test(host)) return "click_messenger";
  if (MAPS_HOST.test(host) || (GOOGLE_HOST.test(host) && url.pathname.startsWith("/maps"))) return "click_directions";
  return null;
}

/** Tối thiểu của Element mà linkLocation cần (test được không cần DOM). */
export type TrackableElement = {
  getAttribute(name: string): string | null;
  closest(selector: string): TrackableElement | null;
};

/** TR-03: `data-track-area` › khối (data-section / id section) › aria-label của liên kết. */
export function linkLocation(link: TrackableElement): string {
  const area = link.closest("[data-track-area]")?.getAttribute("data-track-area");
  if (area) return area;
  const section = link.closest("[data-section], section[id]");
  const name = section?.getAttribute("data-section") || section?.getAttribute("id");
  if (name) return name;
  return link.getAttribute("aria-label")?.trim() || "other";
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
export type UtmKey = (typeof UTM_KEYS)[number];
export { UTM_KEYS };

export type ContactEvent = {
  event: ContactEventName;
  link_location: string;
  page_path: string;
} & Partial<Record<UtmKey, string>>;

export function buildContactEvent(input: {
  event: ContactEventName;
  linkLocation: string;
  pagePath: string;
  firstTouch?: Partial<Record<UtmKey, string>> | null;
}): ContactEvent {
  const out: ContactEvent = {
    event: input.event,
    link_location: input.linkLocation,
    page_path: input.pagePath.split(/[?#]/)[0] || "/",
  };
  for (const k of UTM_KEYS) {
    const v = input.firstTouch?.[k];
    if (v) out[k] = v;
  }
  return out;
}

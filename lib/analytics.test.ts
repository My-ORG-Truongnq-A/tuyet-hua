import { describe, expect, it } from "vitest";
import {
  buildContactEvent,
  classifyContactHref,
  linkLocation,
  resolveSiteVerification,
  resolveTracking,
  trackingCspSources,
  type TrackableElement,
} from "./analytics";

const prod = { isVercelProduction: true };

describe("resolveTracking (TR-01: một đường nạp, ID từ env, chỉ production thật)", () => {
  it("không có ID → null (không nhúng gì)", () => {
    expect(resolveTracking({ ...prod, tracking: {} })).toBeNull();
  });

  it("có ID nhưng không phải VERCEL_ENV=production (bản build local, preview, demo) → null", () => {
    expect(resolveTracking({ isVercelProduction: false, tracking: { gtmId: "GTM-ABC1234", gaId: "G-ABCDE12345" } })).toBeNull();
  });

  it("có GTM → GTM-only, kể cả khi có GA4 (KHÔNG chạy cả hai)", () => {
    expect(resolveTracking({ ...prod, tracking: { gtmId: "GTM-ABC1234", gaId: "G-ABCDE12345" } })).toEqual({ kind: "gtm", id: "GTM-ABC1234" });
  });

  it("chỉ có GA4 → gtag trực tiếp", () => {
    expect(resolveTracking({ ...prod, tracking: { gaId: "G-ABCDE12345" } })).toEqual({ kind: "ga4", id: "G-ABCDE12345" });
  });

  it("chuẩn hoá chữ hoa / khoảng trắng", () => {
    expect(resolveTracking({ ...prod, tracking: { gtmId: " gtm-abc1234 " } })).toEqual({ kind: "gtm", id: "GTM-ABC1234" });
  });

  it("ID sai định dạng → bỏ qua (ID được chèn vào script — chặn chèn mã)", () => {
    expect(resolveTracking({ ...prod, tracking: { gtmId: "GTM-1');alert(1)//" } })).toBeNull();
    expect(resolveTracking({ ...prod, tracking: { gtmId: "UA-12345-1" } })).toBeNull();
    expect(resolveTracking({ ...prod, tracking: { gtmId: "abc", gaId: "G-ABCDE12345" } })).toEqual({ kind: "ga4", id: "G-ABCDE12345" });
  });
});

describe("resolveSiteVerification (Search Console)", () => {
  const token = "AbC_def-1234567890xyz";
  it("chỉ production thật + mã hợp lệ", () => {
    expect(resolveSiteVerification({ isVercelProduction: true, tracking: { googleSiteVerification: ` ${token} ` } })).toBe(token);
    expect(resolveSiteVerification({ isVercelProduction: false, tracking: { googleSiteVerification: token } })).toBeNull();
    expect(resolveSiteVerification({ isVercelProduction: true, tracking: {} })).toBeNull();
    expect(resolveSiteVerification({ isVercelProduction: true, tracking: { googleSiteVerification: '"><script>' } })).toBeNull();
  });
});

describe("trackingCspSources", () => {
  it("không tracking → không thêm nguồn nào", () => {
    expect(trackingCspSources(null)).toEqual({ script: [], connect: [], img: [] });
  });

  it("có tracking → mở đúng host Google Tag / GA4", () => {
    const s = trackingCspSources({ kind: "gtm", id: "GTM-ABC1234" });
    expect(s.script).toContain("https://www.googletagmanager.com");
    expect(s.connect).toEqual(expect.arrayContaining(["https://*.google-analytics.com", "https://*.analytics.google.com"]));
    expect(s.img).toContain("https://*.google-analytics.com");
  });
});

describe("classifyContactHref (TR-03 — tên sự kiện chuẩn)", () => {
  it.each([
    ["https://zalo.me/0359361359", "click_zalo"],
    ["https://zalo.me/g/abc", "click_zalo"],
    ["https://chat.zalo.me/?phone=0359361359", "click_zalo"],
    ["tel:0359361359", "click_phone"],
    ["TEL:+84359361359", "click_phone"],
    ["mailto:a@b.vn", "click_email"],
    ["https://m.me/tuyethua", "click_messenger"],
    ["https://maps.app.goo.gl/xyz", "click_directions"],
    ["https://www.google.com/maps/place/x", "click_directions"],
  ])("%s → %s", (href, event) => {
    expect(classifyContactHref(href)).toBe(event);
  });

  it.each(["/du-an", "https://example.com/zalo.me", "https://notzalo.me/1", "javascript:void(0)", "", null])("%s → null", (href) => {
    expect(classifyContactHref(href)).toBeNull();
  });
});

/** Phần tử giả: cây cha → con, đủ cho closest() theo [attr] / section[id]. */
function fakeTree(chain: Array<{ tag: string; attrs?: Record<string, string> }>): TrackableElement {
  const nodes = chain.map((n, i) => ({ ...n, index: i }));
  const make = (i: number): TrackableElement => ({
    getAttribute: (name) => nodes[i]?.attrs?.[name] ?? null,
    closest: (selector) => {
      for (let j = i; j >= 0; j--) {
        const n = nodes[j];
        if (!n) continue;
        const matches = selector.split(",").some((sel) => {
          const m = sel.trim().match(/^([a-z]*)(?:\[([a-z-]+)\])?$/);
          if (!m) return false;
          const [, tag, attr] = m;
          return (!tag || tag === n.tag) && (!attr || n.attrs?.[attr] !== undefined);
        });
        if (matches) return make(j);
      }
      return null;
    },
  });
  return make(nodes.length - 1);
}

describe("linkLocation (TR-03: data-track-area › section › aria-label)", () => {
  it("data-track-area gần nhất thắng", () => {
    const el = fakeTree([
      { tag: "section", attrs: { id: "lien-he", "data-section": "connect" } },
      { tag: "div", attrs: { "data-track-area": "mobile_bar" } },
      { tag: "a", attrs: { href: "https://zalo.me/1", "aria-label": "Zalo" } },
    ]);
    expect(linkLocation(el)).toBe("mobile_bar");
  });

  it("không có data-track-area → tên khối data-section, rồi id section", () => {
    expect(linkLocation(fakeTree([{ tag: "section", attrs: { id: "x", "data-section": "hero" } }, { tag: "a" }]))).toBe("hero");
    expect(linkLocation(fakeTree([{ tag: "section", attrs: { id: "gioi-thieu" } }, { tag: "a" }]))).toBe("gioi-thieu");
  });

  it("không khối nào → aria-label của liên kết, cuối cùng «other»", () => {
    expect(linkLocation(fakeTree([{ tag: "a", attrs: { "aria-label": "Gọi 0359" } }]))).toBe("Gọi 0359");
    expect(linkLocation(fakeTree([{ tag: "a" }]))).toBe("other");
  });
});

describe("buildContactEvent — không PII", () => {
  it("chỉ có event, link_location, page_path (+ utm first-touch nếu có); không có số điện thoại / href", () => {
    const e = buildContactEvent({
      event: "click_phone",
      linkLocation: "footer",
      pagePath: "/lien-he",
      firstTouch: { utm_source: "facebook", utm_campaign: "hlx" },
    });
    expect(e).toEqual({ event: "click_phone", link_location: "footer", page_path: "/lien-he", utm_source: "facebook", utm_campaign: "hlx" });
    expect(JSON.stringify(e)).not.toMatch(/0359|tel:|zalo\.me/);
  });

  it("page_path cắt query / hash", () => {
    expect(buildContactEvent({ event: "click_zalo", linkLocation: "header", pagePath: "/du-an?token=1#x" }).page_path).toBe("/du-an");
  });
});

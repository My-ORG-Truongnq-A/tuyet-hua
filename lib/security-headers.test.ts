import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, securityHeaders } from "./security-headers";

describe("header bảo mật (BM-01, T1.7)", () => {
  const map = Object.fromEntries(securityHeaders.map((h) => [h.key, h.value]));

  it("đủ header bắt buộc", () => {
    expect(map["X-Content-Type-Options"]).toBe("nosniff");
    expect(map["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(map["X-Frame-Options"]).toBe("SAMEORIGIN");
    expect(map["Permissions-Policy"]).toBe("camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()");
  });

  it("CSP production: không unsafe-eval, frame-ancestors 'self', ảnh Sanity CDN, không form gửi ra ngoài", () => {
    const csp = contentSecurityPolicy({ isDev: false });
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("img-src 'self' data: blob: https://cdn.sanity.io");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toContain("unsafe-eval");
  });

  it("CSP mặc định (không tracking): không có host Google", () => {
    expect(contentSecurityPolicy({ isDev: false })).not.toMatch(/google/);
  });

  it("CSP có tracking: thêm nguồn vào đúng chỉ thị", () => {
    const csp = contentSecurityPolicy({
      isDev: false,
      extra: { script: ["https://www.googletagmanager.com"], connect: ["https://*.google-analytics.com"], img: ["https://*.google-analytics.com"] },
    });
    expect(csp).toContain("script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;");
    expect(csp).toContain("connect-src 'self' https://*.google-analytics.com;");
    expect(csp).toContain("img-src 'self' data: blob: https://cdn.sanity.io https://*.google-analytics.com;");
  });

  it("CSP dev cho phép unsafe-eval (React dev tools / HMR)", () => {
    expect(contentSecurityPolicy({ isDev: true })).toContain("'unsafe-eval'");
  });
});

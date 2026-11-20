import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockEnv = vi.hoisted(() => ({
  env: { isVercelProduction: false, tracking: {} as Record<string, string | undefined> },
}));
vi.mock("@/lib/env", () => mockEnv);

const { Analytics } = await import("./Analytics");

describe("Analytics — chỗ nhúng duy nhất (TR-01)", () => {
  beforeEach(() => {
    mockEnv.env.isVercelProduction = false;
    mockEnv.env.tracking = {};
  });

  it("bản build local có ID → không render script", () => {
    mockEnv.env.tracking = { gtmId: "GTM-ABC1234" };
    expect(renderToStaticMarkup(<Analytics />)).toBe("");
  });

  it("production không có ID → không render script", () => {
    mockEnv.env.isVercelProduction = true;
    expect(renderToStaticMarkup(<Analytics />)).toBe("");
  });

  it("production + GTM + GA4 → một script, chỉ gtm.js (không nạp gtag lần hai)", () => {
    mockEnv.env.isVercelProduction = true;
    mockEnv.env.tracking = { gtmId: "GTM-ABC1234", gaId: "G-ABCDE12345" };
    const html = renderToStaticMarkup(<Analytics />);
    expect(html.match(/<script/g)).toHaveLength(1);
    expect(html).toContain('id="th-tag"');
    expect(html).toContain("gtm.js?id=GTM-ABC1234");
    expect(html).not.toContain("G-ABCDE12345");
  });
});

import { describe, expect, it } from "vitest";
import { AI_CRAWLERS, robotsFor } from "./robots";

const SITE = "https://tuyethua.vn";

describe("robotsFor (SEO-01, GEO-01)", () => {
  it("không được index → Disallow: / cho mọi bot, vẫn ghi rõ /studio, không khai sitemap", () => {
    const r = robotsFor({ indexable: false, siteUrl: SITE });
    expect(r.rules).toEqual([{ userAgent: "*", disallow: ["/", "/studio"] }]);
    expect(r.sitemap).toBeUndefined();
  });

  it("được index → cho phép, chặn /studio và /api/, có Sitemap tuyệt đối", () => {
    const r = robotsFor({ indexable: true, siteUrl: SITE });
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    expect(rules[0]).toEqual({ userAgent: "*", allow: "/", disallow: ["/studio", "/api/"] });
    expect(r.sitemap).toBe("https://tuyethua.vn/sitemap.xml");
  });

  it("khai tường minh ba nhóm crawler AI, mỗi khối lặp lại disallow của *", () => {
    const r = robotsFor({ indexable: true, siteUrl: SITE });
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    const agents = rules.flatMap((x) => (Array.isArray(x.userAgent) ? x.userAgent : [x.userAgent]));
    for (const bot of ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "ChatGPT-User", "Claude-User", "GPTBot", "ClaudeBot", "Google-Extended"]) {
      expect(agents).toContain(bot);
    }
    for (const rule of rules.slice(1)) expect(rule.disallow).toEqual(["/studio", "/api/"]);
  });

  it("không dùng token cũ", () => {
    const all = Object.values(AI_CRAWLERS).flat().map((b) => b.agent);
    expect(all).not.toContain("Claude-Web");
    expect(all).not.toContain("anthropic-ai");
  });
});

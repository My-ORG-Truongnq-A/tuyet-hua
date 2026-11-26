import type { MetadataRoute } from "next";

/**
 * robots.txt (SEO-01, GEO-01). Không được index → chặn toàn bộ (lớp 1; lớp 2 là header X-Robots-Tag).
 * Được index → khai tường minh crawler AI theo mục đích; mỗi khối lặp lại disallow của `*`.
 * Bot huấn luyện: cho phép mặc định — khách chưa yêu cầu chặn (ghi ở docs/standards/00-du-an.md).
 */
export const AI_CRAWLERS = {
  /** Tìm kiếm AI — hiển thị / trích dẫn trong kết quả */
  search: [
    { agent: "OAI-SearchBot", note: "ChatGPT Search" },
    { agent: "Claude-SearchBot", note: "Claude tìm kiếm" },
    { agent: "PerplexityBot", note: "Perplexity tìm kiếm" },
    { agent: "Bingbot", note: "Bing / Copilot" },
  ],
  /** Người dùng hỏi — bot tải trang khi người dùng yêu cầu */
  user: [
    { agent: "ChatGPT-User", note: "ChatGPT duyệt theo yêu cầu" },
    { agent: "Claude-User", note: "Claude duyệt theo yêu cầu" },
    { agent: "Perplexity-User", note: "Perplexity duyệt theo yêu cầu" },
  ],
  /** Huấn luyện mô hình */
  training: [
    { agent: "GPTBot", note: "OpenAI huấn luyện" },
    { agent: "ClaudeBot", note: "Anthropic huấn luyện" },
    { agent: "CCBot", note: "Common Crawl" },
    { agent: "Google-Extended", note: "Gemini huấn luyện" },
    { agent: "Applebot-Extended", note: "Apple huấn luyện" },
    { agent: "Meta-ExternalAgent", note: "Meta huấn luyện" },
  ],
} as const;

const DISALLOW = ["/studio", "/api/"];

export function robotsFor({ indexable, siteUrl }: { indexable: boolean; siteUrl: string }): MetadataRoute.Robots {
  if (!indexable) {
    return { rules: [{ userAgent: "*", disallow: ["/", "/studio"] }] };
  }
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...Object.values(AI_CRAWLERS).map((group) => ({
        userAgent: group.map((b) => b.agent),
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

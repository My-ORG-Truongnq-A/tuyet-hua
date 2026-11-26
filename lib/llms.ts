import type { SiteSettings } from "./content/site-settings";
import { formatPhone, zaloHref } from "./contact";
import { absoluteUrlFor } from "./site-url";

/**
 * /llms.txt sinh từ cùng nguồn dữ liệu (GEO-06), định dạng llmstxt.org.
 * Không phải yếu tố xếp hạng — chỉ là bản tóm tắt dễ đọc cho công cụ AI.
 */
export type LlmsPage = { title: string; path: string; description?: string | null };

export function llmsTxt({ settings, siteUrl, pages }: { settings: SiteSettings; siteUrl: string; pages: LlmsPage[] }): string {
  const out: string[] = [`# ${settings.personName}`, ""];
  if (settings.seo.description) out.push(`> ${settings.seo.description}`, "");

  const phone = formatPhone(settings.phone);
  const zalo = zaloHref(settings.zaloPhone);
  const facts = [
    settings.jobTitle && `- Chức danh: ${settings.jobTitle}`,
    settings.area && `- Khu vực hoạt động: ${settings.area}`,
    phone && `- Điện thoại: ${phone}`,
    zalo && `- Zalo: ${zalo}`,
    settings.email && `- Email: ${settings.email}`,
  ].filter((x): x is string => Boolean(x));
  if (facts.length) out.push("## Thông tin", "", ...facts, "");

  if (pages.length) {
    out.push("## Trang chính", "");
    for (const p of pages) {
      out.push(`- [${p.title}](${absoluteUrlFor(siteUrl, p.path)})${p.description ? `: ${p.description}` : ""}`);
    }
    out.push("");
  }
  return out.join("\n");
}

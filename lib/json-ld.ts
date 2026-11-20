import type { SiteSettings } from "./content/site-settings";
import { e164 } from "./contact";
import type { Lang } from "./env";
import { absoluteUrlFor } from "./site-url";

/**
 * JSON-LD: một @graph mỗi template (GEO-02). Dữ liệu cùng nguồn với phần hiển thị (siteSettings);
 * trường trống bị bỏ. Chưa đưa worksFor / tổ chức cho tới khi khách xác nhận (MI-14).
 */
type Node = Record<string, unknown>;

/** Bỏ thuộc tính null / undefined / "" / [] (đệ quy một cấp object thường). */
function clean<T extends Node>(node: T): T {
  const out: Node = {};
  for (const [k, v] of Object.entries(node)) {
    if (v === null || v === undefined || v === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v && typeof v === "object" && !Array.isArray(v) ? clean(v as Node) : v;
  }
  return out as T;
}

export const personId = (siteUrl: string) => `${siteUrl}/#person`;
export const websiteId = (siteUrl: string) => `${siteUrl}/#website`;

export function personNode(s: SiteSettings, siteUrl: string): Node {
  return clean({
    "@type": "Person",
    "@id": personId(siteUrl),
    name: s.personName,
    jobTitle: s.jobTitle,
    description: s.seo.description,
    url: siteUrl,
    telephone: e164(s.phone),
    email: s.email,
    areaServed: s.area ? { "@type": "Place", name: s.area } : null,
    sameAs: s.socials.map((x) => x.url),
  });
}

export function websiteNode(s: SiteSettings, siteUrl: string, lang: Lang): Node {
  return clean({
    "@type": "WebSite",
    "@id": websiteId(siteUrl),
    url: siteUrl,
    name: s.personName,
    description: s.seo.description,
    inLanguage: lang,
    publisher: { "@id": personId(siteUrl) },
  });
}

export function webPageNode(input: {
  siteUrl: string;
  path: string;
  name: string;
  lang: Lang;
  type?: "WebPage" | "ProfilePage" | "CollectionPage" | "ContactPage";
  description?: string | null;
}): Node {
  const url = absoluteUrlFor(input.siteUrl, input.path);
  return clean({
    "@type": input.type ?? "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: input.lang,
    isPartOf: { "@id": websiteId(input.siteUrl) },
    about: { "@id": personId(input.siteUrl) },
  });
}

export function breadcrumbNode(siteUrl: string, items: { name: string; path: string }[]): Node {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrlFor(siteUrl, it.path),
    })),
  };
}

export function graph(nodes: (Node | null | undefined | false)[]): Node {
  return { "@context": "https://schema.org", "@graph": nodes.filter(Boolean) };
}

/** JSON an toàn để nhúng trong <script type="application/ld+json">. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

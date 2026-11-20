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

/**
 * Chức danh dùng trong schema: bỏ phần đơn vị công tác sau « | » (vd. «… | Trường Phát Group») vì tên tổ chức
 * chưa được khách xác nhận cho JSON-LD (MI-14, REQ-28). Phần hiển thị trên trang vẫn dùng nguyên văn CMS.
 */
export function roleOnly(jobTitle: string | null | undefined): string | null {
  const role = jobTitle?.split(/\s+\|\s+/)[0]?.trim();
  return role ? role : null;
}
export const websiteId = (siteUrl: string) => `${siteUrl}/#website`;

export function personNode(s: SiteSettings, siteUrl: string): Node {
  return clean({
    "@type": "Person",
    "@id": personId(siteUrl),
    name: s.personName,
    jobTitle: roleOnly(s.jobTitle),
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
  /** ProfilePage / ContactPage: mainEntity → Person @id (seo_plan). */
  mainEntity?: boolean;
  /** Danh sách (ItemList) nằm trong trang. */
  hasPart?: Node | null;
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
    mainEntity: input.mainEntity ? { "@id": personId(input.siteUrl) } : null,
    hasPart: input.hasPart ?? null,
  });
}

export function itemListNode(siteUrl: string, items: { name: string; path: string }[]): Node {
  return {
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: absoluteUrlFor(siteUrl, it.path),
    })),
  };
}

const absImage = (siteUrl: string, src: string | null | undefined) =>
  src ? (/^https?:\/\//.test(src) ? src : absoluteUrlFor(siteUrl, src)) : null;

/** Dự án = Place (seo_plan): không Offer / giá / lợi suất (YC-13). */
export function placeNode(input: {
  siteUrl: string;
  path: string;
  name: string;
  description?: string | null;
  image?: string | null;
  address?: string | null;
}): Node {
  const url = absoluteUrlFor(input.siteUrl, input.path);
  return clean({
    "@type": "Place",
    "@id": `${url}#place`,
    name: input.name,
    url,
    description: input.description,
    image: absImage(input.siteUrl, input.image),
    address: input.address,
  });
}

export function blogPostingNode(input: {
  siteUrl: string;
  path: string;
  headline: string;
  description?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  image?: string | null;
  lang: Lang;
}): Node {
  const url = absoluteUrlFor(input.siteUrl, input.path);
  const person = { "@id": personId(input.siteUrl) };
  return clean({
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: input.headline,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    image: absImage(input.siteUrl, input.image),
    author: person,
    publisher: person,
    mainEntityOfPage: url,
    inLanguage: input.lang,
  });
}

/** FAQPage khi có ≥ 1 câu hỏi có câu trả lời (seo_plan site.geo.directAnswers). */
export function faqPageNode(faqs: { question: string; answer: string }[]): Node | null {
  const items = faqs.filter((f) => f.question.trim() && f.answer.trim());
  if (!items.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
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

import { serializeJsonLd } from "@/lib/json-ld";

/** Một <script type="application/ld+json"> chứa @graph của template (GEO-02). */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}

import type { MetadataRoute } from "next";
import { robotsFor } from "@/lib/robots";
import { SITE_INDEXABLE } from "@/lib/seo";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return robotsFor({ indexable: SITE_INDEXABLE, siteUrl: SITE_URL });
}

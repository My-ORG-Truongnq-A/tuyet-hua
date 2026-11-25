import type { Metadata } from "next";
import { describe, expect, it } from "vitest";
import { getProjects } from "@/lib/content/pages";
import { env } from "@/lib/env";
import { aboutMetadata } from "./about/metadata";
import { articlesMetadata } from "./articles/articles.data";
import { contactMetadata } from "./contact/metadata";
import { homeMetadata } from "./home/metadata";
import { privacyMetadata } from "./legal/metadata";
import { projectsMetadata } from "./projects/metadata";
import { projectMetadata } from "./projects/project.data";
import { teamMetadata } from "./team/metadata";

/**
 * Metadata thật của mọi trang đọc từ seed (cùng lớp dữ liệu với production): description 120–160 ký tự, không trùng
 * (SEO-04); og:image JPEG 1200×630 kèm alt (SEO-14). Thêm trang / dự án vào seed thì tự được kiểm.
 */
async function allMetadata(): Promise<[string, Metadata][]> {
  const out: [string, Metadata][] = [];
  for (const lang of env.languages) {
    const pages: [string, Promise<Metadata>][] = [
      ["home", homeMetadata(lang)],
      ["about", aboutMetadata(lang)],
      ["projects", projectsMetadata(lang)],
      ["team", teamMetadata(lang)],
      ["posts", articlesMetadata(lang, undefined)],
      ["contact", contactMetadata(lang)],
      ["privacy", privacyMetadata(lang)],
      ...(await getProjects(lang)).map((p) => [`project:${p.slug}`, projectMetadata(lang, p.slug)] as [string, Promise<Metadata>]),
    ];
    for (const [name, m] of pages) out.push([`${lang}:${name}`, await m]);
  }
  return out.filter(([, m]) => m.robots && typeof m.robots === "object" && "index" in m.robots && m.alternates?.canonical);
}

describe("metadata trang từ seed (SEO-04, SEO-14)", () => {
  it("description 120–160 ký tự và không trùng giữa các trang", async () => {
    const all = await allMetadata();
    expect(all.length).toBeGreaterThanOrEqual(8);
    const seen = new Map<string, string>();
    for (const [name, m] of all) {
      const d = String(m.description ?? "");
      expect(d.length, `${name}: «${d}» dài ${d.length}`).toBeGreaterThanOrEqual(120);
      expect(d.length, `${name}: dài ${d.length}`).toBeLessThanOrEqual(160);
      expect(seen.get(d), `${name} trùng description với ${seen.get(d)}`).toBeUndefined();
      seen.set(d, name);
    }
  });

  it("mọi trang có og:image JPEG 1200×630 kèm alt", async () => {
    for (const [name, m] of await allMetadata()) {
      const images = (m.openGraph as { images?: { url: string; width: number; height: number; alt: string }[] } | undefined)?.images;
      expect(images?.length, name).toBe(1);
      const [img] = images!;
      expect(img!.url, name).toMatch(/^https?:\/\/[^/]+\/.+(\.jpg|fm=jpg&q=80)$/);
      expect(img, name).toMatchObject({ width: 1200, height: 630 });
      expect(img!.alt.length, name).toBeGreaterThan(0);
    }
  });
});

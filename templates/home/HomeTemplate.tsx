import { Section } from "@/components/content/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPage, getPosts, getProjects, getTestimonials } from "@/lib/content/pages";
import { getSiteSettings } from "@/lib/content/site-settings";
import type { Lang } from "@/lib/env";
import { graph, personNode, webPageNode, websiteNode } from "@/lib/json-ld";
import { pathFor } from "@/lib/routes";
import { SITE_URL } from "@/lib/site-url";
import { UI } from "@/lib/ui-strings";
import { ValueList } from "../shared/blocks";
import { DEFAULT_KNOWLEDGE_LIMIT, type HomePage } from "./home.data";
import { Connect } from "./sections/Connect";
import { Hero } from "./sections/Hero";
import { Knowledge } from "./sections/Knowledge";
import { Projects } from "./sections/Projects";
import { Story } from "./sections/Story";
import { Trust } from "./sections/Trust";
import { WhyMe } from "./sections/WhyMe";

/**
 * Trang chủ (T4.1): thứ tự khối cố định hero → story → whyMe → projects → trust → knowledge → [services] → connect
 * (YC-08, D-06). Đúng một H1 = personName ở hero. Khối không có dữ liệu tự ẩn.
 * Giao diện từng khối là PHẦN CHUNG — G2 chưa ghi phương án (Q-58); phương án được chọn thay uiSlot.
 */
export async function HomeTemplate({ lang }: { lang: Lang }) {
  const [settings, page] = await Promise.all([getSiteSettings(lang), getPage<HomePage>("homePage", lang)]);
  const limit = page?.knowledgeSection?.postsLimit ?? DEFAULT_KNOWLEDGE_LIMIT;
  const [projects, posts, testimonials] = await Promise.all([getProjects(lang), getPosts(lang, 1, limit), getTestimonials(lang)]);
  const path = pathFor("home", lang);
  const services = page?.servicesSection;
  const serviceItems = (services?.items ?? []).filter((i) => i.title?.trim());
  return (
    <>
      <JsonLd
        data={graph([
          websiteNode(settings, SITE_URL, lang),
          personNode(settings, SITE_URL),
          webPageNode({ siteUrl: SITE_URL, path, name: settings.personName, lang, description: settings.seo.description }),
        ])}
      />
      <Hero lang={lang} settings={settings} hero={page?.hero} />
      <Story lang={lang} story={page?.story} />
      <WhyMe lang={lang} whyMe={page?.whyMe} />
      <Projects lang={lang} section={page?.projectsSection} projects={projects} />
      <Trust lang={lang} section={page?.trustSection} testimonials={testimonials} />
      <Knowledge lang={lang} section={page?.knowledgeSection} posts={posts.items} />
      <Section
        name="services"
        heading={services?.heading ?? UI[lang].sections.services}
        intro={services?.intro}
        empty={services?.enabled !== true || !serviceItems.length}
      >
        <ValueList items={serviceItems} />
      </Section>
      <Connect lang={lang} settings={settings} section={page?.connectSection} />
    </>
  );
}

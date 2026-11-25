/**
 * Bản tiếng Anh (skill i18n-content, glossary ở content/glossary.json). Chỉ dịch những gì ĐÃ có ở bản vi — không thêm
 * thông tin mới, không số liệu / chứng nhận / testimonial / giá. Trường vi còn trống (NEEDS_INPUT) thì en cũng để trống.
 * - Tài liệu `*-vi` có bản dịch: sinh `*-en` bằng cách nhân bản bản vi rồi áp `enOverlays` (id = id bản vi).
 * - Singleton (siteSettings / header / footer): điền trường `.en` tại chỗ (`enSingletonOverlays`).
 * - Trang chính sách bảo mật chưa có bản en (bản vi còn chờ người duyệt pháp lý) → không tạo URL en rỗng.
 * Sửa chữ ở ĐÂY rồi chạy `pnpm sanity:build-seed`; không sửa tay seed/sanity/documents.json.
 */
import { pt, type Overlay } from "./vi-copy";

/** Tài liệu vi được nhân bản sang en (privacyPage-vi cố ý không có). */
export const EN_TRANSLATED_IDS = [
  "homePage-vi",
  "aboutPage-vi",
  "projectsPage-vi",
  "teamPage-vi",
  "articlesPage-vi",
  "contactPage-vi",
  "project-ha-long-xanh-vi",
  "project-lang-van-vi",
] as const;

/** Tên riêng được phép còn dấu tiếng Việt trong chữ en (test kiểm không lọt chữ vi). */
export const EN_PROPER_NOUNS = ["Hứa Thị Tuyết", "Trường Phát", "Hạ Long Xanh", "Làng Vân", "Hạ Long", "Quảng Ninh"];

const SEO_DESCRIPTION =
  "Hứa Thị Tuyết advises on investment, cash-flow and holiday real estate in Ha Long, Quang Ninh, and stays with clients before and after every transaction.";

const ALT_PORTRAIT = "Portrait of Hứa Thị Tuyết in a navy blue suit, arms folded";
const CAPTION_HA_LONG_CREDIT = "Photo: Vyacheslav Argenberg, CC BY 4.0";

export const enOverlays: Overlay[] = [
  {
    id: "homePage-vi",
    set: {
      title: "Home",
      "hero.image.alt": ALT_PORTRAIT,
      "story.image.alt": "Hứa Thị Tuyết and colleagues looking at the scale model of a real estate project",
      "story.secondaryImage.alt": "Ha Long Bay in the mist, limestone islands reflected in the water",
      "story.secondaryImage.caption": `Illustration: Ha Long Bay. ${CAPTION_HA_LONG_CREDIT}`,
      "hero.primaryCta.label": "Talk with Tuyết",
      "hero.secondaryCta.label": "Explore projects",
      "story.quote": "I am also my own client",
      "story.heading": "About me",
      "story.body": pt(
        "home-story-en",
        "I buy, own and invest in real estate myself, especially at Hạ Long Xanh. So every piece of advice I give comes from the position of someone weighing a major decision.",
        "I advise on investment, cash-flow and holiday real estate in Hạ Long – Quảng Ninh, and I manage and train the TP55 Division sales team.",
      ),
      "story.aboutLinkLabel": "Read the full story",
      "story.expertise": "Investment real estate advisory and distribution",
      "story.focus": "Focus: cash-flow and holiday real estate, Vinhomes projects",
      "hero.pillarNotes": ["Market · legal · finance", "Fits your goals", "Before, during and after the deal"],
      "hero.headline":
        "Real estate advice that fits your needs, finances and goals. I stay with you before, during and after the transaction to help you keep lasting value.",
      "whyMe.heading": "The value I bring",
      "whyMe.intro": null,
      "whyMe.items": [
        { _key: "market", _type: "valueItem", icon: "target", title: "Know the market", description: "A grounded view of the Hạ Long – Quảng Ninh market, so you decide on a clear basis." },
        { _key: "legal", _type: "valueItem", icon: "scale", title: "Know the legal side", description: "Clear explanations of legal status and transaction steps before you commit any money." },
        { _key: "client", _type: "valueItem", icon: "people", title: "Know the client", description: "I listen to your needs, financial capacity and asset goals before talking about products." },
        { _key: "value", _type: "valueItem", icon: "diamond", title: "Curate real value", description: "I do not offer every product; I only suggest assets that fit your goals." },
        { _key: "cashflow", _type: "valueItem", icon: "chart", title: "Cash flow & value", description: "Together we look at how an asset can be used, generate cash flow and hold value over time." },
        { _key: "long-term", _type: "valueItem", icon: "handshake", title: "Long-term partnership", description: "With you before, during and after the transaction, including when you want to rent out or resell." },
      ],
      "projectsSection.heading": "Current projects",
      "projectsSection.intro": null,
      "projectsSection.viewAllLabel": "View all projects",
      "trustSection.heading": "Growing the team – Building success",
      "trustSection.body": pt(
        "home-trust-en",
        "I believe lasting success comes from a capable team and a culture of mutual support. Alongside advising clients, I manage, train and develop the TP55 Division sales team, sharing knowledge and hands-on experience every day.",
      ),
      "trustSection.testimonialsHeading": "What clients say about Tuyết",
      "trustSection.teamLinkLabel": "Join the team with Tuyết",
      "trustSection.tags": ["Hands-on training", "Knowledge sharing", "Advisory skills", "Support & mentoring", "Positive culture"],
      "knowledgeSection.heading": "Market insights",
      "knowledgeSection.viewAllLabel": "View all articles",
      "connectSection.heading": "Connect with Tuyết",
      "connectSection.body":
        "I am always ready to listen and to walk with you on the journey to lasting real estate value.",
      seo: {
        _type: "seo",
        title: "Hứa Thị Tuyết – Real Estate Advisor in Ha Long, Quang Ninh",
        description: SEO_DESCRIPTION,
      },
    },
  },
  {
    id: "aboutPage-vi",
    set: {
      title: "About me",
      "heroImage.alt": ALT_PORTRAIT,
      intro:
        "I am Hứa Thị Tuyết, Sales Director of the TP55 Division at Trường Phát Group. I advise on real estate in Hạ Long – Quảng Ninh and lead a sales team.",
      "brandStory.heading": "I am also my own client",
      "brandStory.body": pt(
        "about-story-en",
        "I am also my own client. I buy, own and invest in real estate myself, especially at Hạ Long Xanh, so I know how it feels to face a major financial decision: a lot of information, a lot of options and many questions without answers.",
        "From that experience I advise the way I would want to be advised: clear about the market, legal and financial sides; helping you choose an asset that fits your own goals; and still there after the transaction is done.",
      ),
      "positioning.heading": "Two roles, one direction",
      "positioning.roles.0.title": "Hands-on real estate advisor",
      "positioning.roles.0.description": "Market, legal and financial insight, and support after the transaction.",
      "positioning.roles.1.title": "Leader & trainer",
      "positioning.roles.1.description": "Managing, training and developing the TP55 Division sales team.",
      "cta.label": "Connect on Zalo",
      seo: {
        _type: "seo",
        title: "About me | Hứa Thị Tuyết",
        description:
          "The story of Hứa Thị Tuyết: a hands-on real estate advisor in Ha Long, Quang Ninh, who also leads and trains a sales team.",
      },
    },
  },
  {
    id: "projectsPage-vi",
    set: {
      title: "Current projects",
      intro:
        "The projects I currently advise on. Project details are being added step by step; for advice based on your own goals, message me on Zalo.",
      seo: {
        _type: "seo",
        title: "Projects | Hứa Thị Tuyết",
        description:
          "Real estate projects advised by Hứa Thị Tuyết in Hạ Long – Quảng Ninh, starting with Hạ Long Xanh and Làng Vân.",
      },
    },
  },
  {
    id: "teamPage-vi",
    set: {
      title: "Training & Team",
      intro: "Besides advising clients, I spend my time managing, training and developing the TP55 Division sales team.",
      "heroImage.alt": "Hứa Thị Tuyết teaching a real estate sales skills course",
      "gallery.0.alt": "Hứa Thị Tuyết presenting at a workshop on client profiles and needs",
      "gallery.1.alt": "The sales team in a group photo at the company office",
      "gallery.2.alt": "Speakers and participants in a group photo after a workshop",
      "gallery.3.alt": "Hứa Thị Tuyết with two speakers at a talk on premium real estate",
      "gallery.4.alt": "A talk show sharing sales experience with the sales team",
      "gallery.5.alt": "An in-house training session for the sales team at the office",
      "gallery.6.alt": "Hứa Thị Tuyết and a colleague holding a cake on the stage of an event",
      "gallery.7.alt": "Hứa Thị Tuyết posing with the sales team in the office",
      "leaderSection.heading": "Leadership role",
      "leaderSection.body": pt(
        "team-leader-en",
        "Alongside advising clients, leading and training the team is my second role in this brand.",
      ),
      joinCtaHeading: "Join the team with Tuyết",
      seo: {
        _type: "seo",
        title: "Training & Team | Hứa Thị Tuyết",
        description:
          "How Hứa Thị Tuyết leads, trains and develops a real estate sales team; for those who want to learn the profession and work together for the long term.",
      },
    },
  },
  {
    id: "articlesPage-vi",
    set: {
      title: "Insights",
      intro:
        "Knowledge on the market, legal and financial topics, and experience working with clients, written to be short and easy to apply.",
      emptyStateText: "The first articles will be published here soon.",
      seo: {
        _type: "seo",
        title: "Insights | Hứa Thị Tuyết",
        description: "Short, practical articles on the real estate market, legal and financial topics by Hứa Thị Tuyết.",
      },
    },
  },
  {
    id: "contactPage-vi",
    set: {
      title: "Contact",
      "image.alt": "Portrait of Hứa Thị Tuyết in a navy blue suit, smiling, hands clasped",
      intro: "Message me on Zalo or call to talk about what you need, or to learn about joining the team.",
      seo: {
        _type: "seo",
        title: "Contact | Hứa Thị Tuyết",
        description:
          "Connect with Hứa Thị Tuyết on Zalo or by phone for real estate advice in Hạ Long – Quảng Ninh, or to learn about joining the team.",
      },
    },
  },
  {
    id: "project-ha-long-xanh-vi",
    set: {
      "heroImage.alt": "Ha Long Bay seen from above, with limestone islands and boats on the water",
      "heroImage.caption": `Illustration of the Ha Long Bay area, not a photo of the project. ${CAPTION_HA_LONG_CREDIT}`,
      summary:
        "The view of someone who owns and invests at Hạ Long Xanh: one asset, three values — cash flow, residential & holiday living, and long-term value.",
      "valueProposition.headline": "ONE ASSET – THREE VALUES",
      "valueProposition.keyMessage": "Live in it. Put it to work. Build value over time.",
      "valueProposition.values.0.title": "Cash flow",
      "valueProposition.values.1.title": "Residential & holiday living",
      "valueProposition.values.2.title": "Long-term value",
      "cta.label": "Connect on Zalo",
      seo: {
        _type: "seo",
        title: "Hạ Long Xanh | Hứa Thị Tuyết",
        description:
          "Hạ Long Xanh from the view of an owner-investor: one asset, three values — cash flow, residential & holiday living, long-term value.",
      },
    },
  },
  {
    id: "project-lang-van-vi",
    set: {
      "heroImage.alt": "Illustration of mountains, clouds and water in emerald tones",
      "heroImage.caption": "Illustration only; real project photos to follow",
      "heroImage.credit": "Vector illustration made for this website",
      summary: "A project in development that I advise on. Detailed information will be added.",
      "cta.label": "Connect on Zalo",
    },
  },
];

/** Singleton dùng chung: điền `.en` tại chỗ (không nhân bản). */
export const enSingletonOverlays: Overlay[] = [
  {
    id: "siteSettings",
    set: {
      "jobTitle.en": "Sales Director – TP55 Division | Trường Phát Group",
      "tagline.en": "UNDERSTAND THE MARKET. CURATE REAL VALUE. STAY FOR THE LONG TERM.",
      "contact.serviceArea.en": "Hạ Long – Quảng Ninh",
      "ui.notFound.body.en":
        "The page you are looking for may have moved or no longer exists. You can go back to the home page, or message me on Zalo for help.",
      "ui.joinTeamCta.label.en": "Join the team with Tuyết",
      "ui.callCtaLabel.en": "Call",
      "ui.zaloCtaLabel.en": "Connect on Zalo",
      "ui.readMoreLabel.en": "Read more",
      "ui.consultCtaLabel.en": "Talk with Tuyết",
      "seoDefaults.description.en": SEO_DESCRIPTION,
      "seoDefaults.titleTemplate.en": "%s | Hứa Thị Tuyết",
    },
  },
  { id: "header", set: { showLanguageSwitch: true } },
  { id: "footer", set: { "copyrightText.en": "© Hứa Thị Tuyết. All rights reserved." } },
];

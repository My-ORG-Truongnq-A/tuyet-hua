import type { Lang } from "./env";
import type { PageKey } from "./routes";

/**
 * Chữ giao diện cố định của code (nhãn nút, tiêu đề khối mặc định, 404…) — KT-04.
 * Dữ kiện doanh nghiệp (tên, số điện thoại, khu vực…) KHÔNG đặt ở đây: đọc từ siteSettings.
 * Tiêu đề khối trong CMS (heading) luôn được ưu tiên; chữ ở đây chỉ là nhãn mặc định khi trường trống.
 * Mẫu mô tả SEO (seo_plan.templates.*.descriptionPattern) dùng {personName}, {area}, {title} điền từ CMS.
 */
type Strings = {
  locale: string;
  pages: Record<PageKey, string>;
  mainNav: string;
  openMenu: string;
  closeMenu: string;
  skipToContent: string;
  zaloCta: string;
  zaloMobile: string;
  callLabel: (phone: string) => string;
  phoneLabel: string;
  areaLabel: string;
  quickLinks: string;
  langSwitch: string;
  disclaimer: string;
  breadcrumb: string;
  viewAll: string;
  readMore: string;
  viewProject: string;
  pending: {
    confirm: string;
    content: string;
    image: string;
    firstPost: string;
    stats: string;
    storyImage: string;
    storyImage2: string;
    teamImage: string;
    /** Ô số liệu chờ (chỉ preview): giữ bố cục dải số của mockup, KHÔNG hiện số minh hoạ. */
    statValue: string;
    statSlots: [string, string, string, string];
    testimonial: string;
  };
  /** Nhãn nhỏ trên tiêu đề khối trang chủ (theo mockup). */
  homeEyebrow: { leader: string };
  /**
   * Chữ phụ của trang chủ theo mockup chưa có trường CMS (ghi «Lệch chuẩn» — chuyển vào siteSettings / homePage ở bước build):
   * pillarNotes = dòng phụ dưới 3 trụ cột hero (theo 3 vế tagline); expertise / focus = 2 dòng thông tin ở «Về tôi» (từ brief);
   * trustTags = nhãn kỹ năng dưới ảnh đội ngũ.
   */
  homeExtra: { pillarNotes: [string, string, string]; expertise: string; focus: string; trustTags: string[] };
  notFound: { eyebrow: string; title: string; body: string; links: string };
  error: { title: string; body: string; retry: string };
  homeAbout: string;
  sections: {
    story: string;
    whyMe: string;
    projects: string;
    trust: string;
    stats: string;
    testimonials: string;
    knowledge: string;
    services: string;
    connect: string;
  };
  about: { eyebrow: string; story: string; roles: string; bio: string; timeline: string; achievements: string; moments: string };
  project: {
    eyebrow: string;
    valueEyebrow: string;
    facts: string;
    factsNote: string;
    factLabels: { location: string; developer: string; productTypes: string; legalStatus: string; progress: string };
    experience: string;
    details: string;
    gallery: string;
    faqs: string;
    others: string;
    featured: string;
    ctaTitle: (name: string) => string;
    ctaBody: string;
    empty: string;
  };
  team: { leader: string; training: string; stats: string; gallery: string; join: string };
  posts: { published: string; updated: string; author: string; all: string; empty: string };
  pagination: { label: string; prev: string; next: string; page: (n: number) => string };
  quickFacts: { title: string; who: string; role: string; area: string; contact: string };
  contact: { email: string; address: string; hours: string; socials: string; reach: string };
  legal: { lastUpdated: string };
  seo: {
    /** Trang chủ: «{brandName} – {homeTopic} {area}» (seo_plan.templates.home.titlePattern). */
    homeTopic: string;
    projectTitle: (title: string) => string;
    descriptions: Partial<Record<"about" | "projects" | "team" | "posts" | "contact" | "privacy" | "project", string>>;
  };
};

export const UI: Record<Lang, Strings> = {
  vi: {
    locale: "vi-VN",
    pages: {
      home: "Trang chủ",
      about: "Giới thiệu",
      projects: "Dự án",
      projectDetail: "Dự án",
      team: "Đào tạo & Đội ngũ",
      posts: "Kiến thức",
      postDetail: "Bài viết",
      contact: "Liên hệ",
      privacy: "Chính sách bảo mật",
    },
    mainNav: "Menu chính",
    openMenu: "Mở menu",
    closeMenu: "Đóng menu",
    skipToContent: "Bỏ qua, tới nội dung chính",
    zaloCta: "Kết nối Zalo",
    zaloMobile: "Tư vấn qua Zalo",
    callLabel: (phone) => `Gọi ${phone}`,
    phoneLabel: "Zalo / Hotline",
    areaLabel: "Khu vực hoạt động",
    quickLinks: "Liên kết",
    langSwitch: "Chọn ngôn ngữ",
    disclaimer: "Thông tin trên website mang tính tham khảo.",
    breadcrumb: "Đường dẫn",
    viewAll: "Xem tất cả",
    readMore: "Đọc tiếp",
    viewProject: "Xem chi tiết",
    pending: {
      confirm: "Chờ xác nhận",
      content: "Chờ nội dung",
      image: "Chờ ảnh",
      firstPost: "Chờ bài viết đầu tiên",
      stats: "Chờ số liệu đã xác nhận: năm kinh nghiệm, số khách đã tư vấn, sản phẩm đã phân phối, sale đã đào tạo",
      storyImage: "Chờ ảnh thật: căn hộ chị Tuyết đã mua ở Hạ Long Xanh",
      storyImage2: "Chờ ảnh thật: chị Tuyết tại dự án, hướng vịnh Hạ Long",
      teamImage: "Chờ ảnh thật: buổi đào tạo / đội ngũ TP55",
      statValue: "Chờ số",
      statSlots: ["Năm kinh nghiệm thực chiến", "Khách hàng đã tư vấn và giao dịch", "Sản phẩm đã phân phối", "Sale được đào tạo và phát triển"],
      testimonial: "Chờ cảm nhận khách hàng (cần khách đồng ý hiển thị tên và lời nhận xét)",
    },
    homeEyebrow: { leader: "Leader & người đào tạo" },
    homeExtra: {
      pillarNotes: ["Thị trường · pháp lý · tài chính", "Phù hợp mục tiêu của bạn", "Trước, trong và sau giao dịch"],
      expertise: "Tư vấn, phân phối bất động sản đầu tư",
      focus: "Tập trung: BĐS dòng tiền, BĐS nghỉ dưỡng và các dự án Vinhomes",
      trustTags: ["Đào tạo thực chiến", "Chia sẻ kiến thức", "Kỹ năng tư vấn", "Hỗ trợ & đồng hành", "Văn hoá tích cực"],
    },
    notFound: {
      eyebrow: "Lỗi 404",
      title: "Không tìm thấy trang",
      body: "Đường dẫn có thể đã thay đổi hoặc không còn tồn tại. Mời anh / chị quay lại các trang chính dưới đây.",
      links: "Các trang chính",
    },
    error: {
      title: "Trang đang gặp sự cố",
      body: "Xin lỗi vì sự bất tiện. Anh / chị thử tải lại, hoặc liên hệ trực tiếp qua Zalo / hotline ở cuối trang.",
      retry: "Thử lại",
    },
    homeAbout: "Giới thiệu về tôi",
    sections: {
      story: "Về tôi",
      whyMe: "Giá trị tôi mang đến",
      projects: "Dự án đang triển khai",
      trust: "Uy tín & đội ngũ",
      stats: "Con số",
      testimonials: "Khách hàng chia sẻ",
      knowledge: "Kiến thức",
      services: "Dịch vụ",
      connect: "Kết nối",
    },
    about: {
      eyebrow: "Giới thiệu về tôi",
      story: "Câu chuyện",
      roles: "Hai vai trò",
      bio: "Tiểu sử",
      timeline: "Chặng đường",
      achievements: "Thành tích",
      moments: "Khoảnh khắc",
    },
    project: {
      eyebrow: "Dự án",
      valueEyebrow: "Thông điệp dự án",
      facts: "Thông tin dự án",
      factsNote: "Thông tin mang tính tham khảo; pháp lý và giá cần xác minh tại thời điểm giao dịch.",
      factLabels: {
        location: "Vị trí",
        developer: "Chủ đầu tư",
        productTypes: "Loại hình sản phẩm",
        legalStatus: "Pháp lý",
        progress: "Tiến độ",
      },
      experience: "Góc nhìn người trong cuộc",
      details: "Thông tin chi tiết",
      gallery: "Hình ảnh dự án",
      faqs: "Câu hỏi thường gặp",
      others: "Dự án khác",
      featured: "Dự án trọng tâm",
      ctaTitle: (name) => `Cần góc nhìn thật về ${name}?`,
      ctaBody: "Trao đổi trực tiếp qua Zalo để được tư vấn theo nhu cầu của anh / chị.",
      empty: "Danh sách dự án đang được cập nhật.",
    },
    team: {
      leader: "Vai trò dẫn dắt",
      training: "Nội dung đào tạo",
      stats: "Con số",
      gallery: "Hoạt động đội ngũ",
      join: "Cùng phát triển trong đội ngũ",
    },
    posts: {
      published: "Ngày đăng",
      updated: "Cập nhật",
      author: "Tác giả",
      all: "Tất cả bài viết",
      empty: "Bài viết đầu tiên đang được chuẩn bị.",
    },
    pagination: { label: "Phân trang", prev: "Trang trước", next: "Trang sau", page: (n) => `Trang ${n}` },
    quickFacts: { title: "Thông tin nhanh", who: "Ai", role: "Vai trò", area: "Khu vực", contact: "Liên hệ" },
    contact: { email: "Email", address: "Địa chỉ", hours: "Giờ làm việc", socials: "Mạng xã hội", reach: "Kênh liên hệ" },
    legal: { lastUpdated: "Cập nhật lần cuối" },
    seo: {
      homeTopic: "Tư vấn bất động sản",
      projectTitle: (title) => `${title} – Góc nhìn tư vấn`,
      descriptions: {
        about:
          "Câu chuyện của {personName}: người tư vấn bất động sản thực chiến tại {area}, đồng thời dẫn dắt và đào tạo đội ngũ kinh doanh.",
        projects:
          "Các dự án bất động sản tại {area} mà {personName} đang tư vấn: thông tin, góc nhìn người trong cuộc và cách kết nối để được tư vấn.",
        team: "Cách {personName} dẫn dắt, đào tạo và phát triển đội ngũ kinh doanh bất động sản; dành cho người muốn học nghề và cùng làm việc lâu dài.",
        posts:
          "Bài viết của {personName} về thị trường, pháp lý, tài chính và kinh nghiệm thực tế khi chọn bất động sản tại {area}.",
        contact:
          "Kết nối với {personName} qua Zalo hoặc điện thoại để được tư vấn bất động sản tại {area}, hoặc tìm hiểu cơ hội tham gia đội ngũ.",
        privacy:
          "Cách website {personName} thu thập và sử dụng dữ liệu của người truy cập, và cách liên hệ khi có câu hỏi về dữ liệu cá nhân.",
        project: "Thông tin dự án {title} tại {area} và góc nhìn tư vấn của {personName}. Kết nối Zalo để được tư vấn.",
      },
    },
  },
  en: {
    locale: "en-GB",
    pages: {
      home: "Home",
      about: "About",
      projects: "Projects",
      projectDetail: "Project",
      team: "Training & Team",
      posts: "Insights",
      postDetail: "Article",
      contact: "Contact",
      privacy: "Privacy policy",
    },
    mainNav: "Main menu",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    skipToContent: "Skip to main content",
    zaloCta: "Chat on Zalo",
    zaloMobile: "Chat on Zalo",
    callLabel: (phone) => `Call ${phone}`,
    phoneLabel: "Zalo / Hotline",
    areaLabel: "Area",
    quickLinks: "Links",
    langSwitch: "Choose language",
    disclaimer: "Information on this website is for reference only.",
    breadcrumb: "Breadcrumb",
    viewAll: "View all",
    readMore: "Read more",
    viewProject: "View details",
    pending: {
      confirm: "Pending confirmation",
      content: "Content pending",
      image: "Photo pending",
      firstPost: "First article coming soon",
      stats: "Awaiting confirmed figures: years of experience, clients advised, units distributed, sales staff trained",
      storyImage: "Real photo pending: Tuyết's own Hạ Long Xanh apartment",
      storyImage2: "Real photo pending: Tuyết on site, facing Hạ Long Bay",
      teamImage: "Real photo pending: TP55 training session / team",
      statValue: "Pending",
      statSlots: ["Years of hands-on experience", "Clients advised and served", "Units distributed", "Sales staff trained"],
      testimonial: "Client testimonial pending (requires the client's consent to show name and words)",
    },
    homeEyebrow: { leader: "Leader & mentor" },
    homeExtra: {
      pillarNotes: ["Market · legal · finance", "Fits your goals", "Before, during and after the deal"],
      expertise: "Investment real estate advisory and distribution",
      focus: "Focus: cash-flow and holiday real estate, Vinhomes projects",
      trustTags: ["Hands-on training", "Knowledge sharing", "Advisory skills", "Support & mentoring", "Positive culture"],
    },
    notFound: {
      eyebrow: "Error 404",
      title: "Page not found",
      body: "The link may have changed or no longer exists. Please continue from one of the main pages below.",
      links: "Main pages",
    },
    error: {
      title: "Something went wrong",
      body: "Sorry for the inconvenience. Please try again, or reach out via Zalo / hotline at the bottom of the page.",
      retry: "Try again",
    },
    homeAbout: "About me",
    sections: {
      story: "About me",
      whyMe: "What I bring",
      projects: "Current projects",
      trust: "Track record & team",
      stats: "In numbers",
      testimonials: "Client stories",
      knowledge: "Insights",
      services: "Services",
      connect: "Connect",
    },
    about: {
      eyebrow: "About me",
      story: "My story",
      roles: "Two roles",
      bio: "Biography",
      timeline: "Journey",
      achievements: "Achievements",
      moments: "Moments",
    },
    project: {
      eyebrow: "Project",
      valueEyebrow: "Project message",
      facts: "Project facts",
      factsNote: "For reference only; legal status and prices must be verified at the time of transaction.",
      factLabels: { location: "Location", developer: "Developer", productTypes: "Property types", legalStatus: "Legal status", progress: "Progress" },
      experience: "An insider's view",
      details: "Details",
      gallery: "Project photos",
      faqs: "Frequently asked questions",
      others: "Other projects",
      featured: "Featured project",
      ctaTitle: (name) => `Want an honest view on ${name}?`,
      ctaBody: "Chat directly on Zalo for advice that fits your needs.",
      empty: "The project list is being updated.",
    },
    team: { leader: "Leadership", training: "Training", stats: "In numbers", gallery: "Team activities", join: "Grow with the team" },
    posts: { published: "Published", updated: "Updated", author: "Author", all: "All articles", empty: "The first article is on its way." },
    pagination: { label: "Pagination", prev: "Previous", next: "Next", page: (n) => `Page ${n}` },
    quickFacts: { title: "Quick facts", who: "Who", role: "Role", area: "Area", contact: "Contact" },
    contact: { email: "Email", address: "Address", hours: "Opening hours", socials: "Social", reach: "Get in touch" },
    legal: { lastUpdated: "Last updated" },
    seo: {
      homeTopic: "Real estate advisor in",
      projectTitle: (title) => `${title} – Advisor's view`,
      // Mô tả tiếng Anh: NEEDS_INPUT (MI-01) → dùng seoDefaults.description.
      descriptions: {},
    },
  },
};

/** Thứ tự menu mặc định khi singleton header trong CMS trống (YC-08). */
export const MAIN_NAV: PageKey[] = ["about", "projects", "team", "posts", "contact"];

/** Trang tĩnh đã dựng — nguồn cho sitemap pages.xml, llms.txt, link 404. */
export const BUILT_PAGES: PageKey[] = ["home", "about", "projects", "team", "posts", "contact", "privacy"];

/** Điền {personName}, {area}, {title}…; thiếu giá trị nào → null (không sinh câu hỏng). */
export function fillPattern(pattern: string | undefined, values: Record<string, string | null | undefined>): string | null {
  if (!pattern) return null;
  let missing = false;
  const out = pattern.replace(/\{(\w+)\}/g, (_, k: string) => {
    const v = values[k]?.trim();
    if (!v) missing = true;
    return v ?? "";
  });
  return missing ? null : out;
}

export function formatDate(iso: string | null | undefined, lang: Lang): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(UI[lang].locale, { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(d);
}

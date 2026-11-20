import type { Lang } from "./env";
import type { PageKey } from "./routes";

/**
 * Chữ giao diện cố định của code (nhãn nút, menu mặc định, 404…) — KT-04.
 * Dữ kiện doanh nghiệp (tên, số điện thoại, khu vực…) KHÔNG đặt ở đây: đọc từ siteSettings.
 * Menu chính sẽ chuyển sang header.navItems trong CMS ở bước sanity_schemas (T3.1).
 */
type Strings = {
  pages: Record<PageKey, string>;
  mainNav: string;
  openMenu: string;
  skipToContent: string;
  zaloCta: string;
  zaloMobile: string;
  callLabel: (phone: string) => string;
  phoneLabel: string;
  areaLabel: string;
  quickLinks: string;
  langSwitch: string;
  disclaimer: string;
  notFound: { eyebrow: string; title: string; body: string; links: string };
  error: { title: string; body: string; retry: string };
  homeAbout: string;
};

export const UI: Record<Lang, Strings> = {
  vi: {
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
    skipToContent: "Bỏ qua, tới nội dung chính",
    zaloCta: "Kết nối Zalo",
    zaloMobile: "Tư vấn qua Zalo",
    callLabel: (phone) => `Gọi ${phone}`,
    phoneLabel: "Zalo / Hotline",
    areaLabel: "Khu vực hoạt động",
    quickLinks: "Liên kết",
    langSwitch: "Chọn ngôn ngữ",
    disclaimer: "Thông tin trên website mang tính tham khảo.",
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
  },
  en: {
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
    skipToContent: "Skip to main content",
    zaloCta: "Chat on Zalo",
    zaloMobile: "Chat on Zalo",
    callLabel: (phone) => `Call ${phone}`,
    phoneLabel: "Zalo / Hotline",
    areaLabel: "Area",
    quickLinks: "Links",
    langSwitch: "Choose language",
    disclaimer: "Information on this website is for reference only.",
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
  },
};

/** Thứ tự menu chính theo luồng trải nghiệm (YC-08). */
export const MAIN_NAV: PageKey[] = ["about", "projects", "team", "posts", "contact"];

/**
 * Trang đã dựng xong — nguồn cho sitemap, llms.txt, link 404. Bước khung chỉ có trang chủ;
 * bước implement_templates thêm key khi trang tương ứng có template.
 */
export const BUILT_PAGES: PageKey[] = ["home"];

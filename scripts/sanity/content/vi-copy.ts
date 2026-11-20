/**
 * Nội dung tiếng Việt viết thêm lên khung seed (base.json). Nguồn duy nhất của phần chữ: brief + business_profile
 * (yeu-cau-du-an.md). KHÔNG số liệu, chứng nhận, testimonial, khách hàng, giá — mục thiếu để trống và ghi ở
 * NEEDS_INPUT (xem seed/sanity/field-status.json và content_migration_report).
 * Sửa chữ ở ĐÂY rồi chạy `pnpm sanity:build-seed`; không sửa tay seed/sanity/documents.json.
 */
export type Overlay = { id: string; set: Record<string, unknown> };

/** Portable Text: mỗi đoạn là một block "normal" thuần chữ, _key tất định theo thứ tự đoạn. */
export function pt(prefix: string, ...paragraphs: string[]) {
  return paragraphs.map((text, i) => ({
    _type: "block",
    _key: `${prefix}-${i + 1}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `${prefix}-${i + 1}-s`, text, marks: [] }],
  }));
}

const ls = (vi: string) => ({ _type: "localeString", en: null, vi });
const lt = (vi: string) => ({ _type: "localeText", en: null, vi });

const SEO_DESCRIPTION =
  "Hứa Thị Tuyết tư vấn bất động sản đầu tư, dòng tiền và nghỉ dưỡng tại Hạ Long – Quảng Ninh, đồng hành cùng khách hàng trước và sau giao dịch.";

export const viOverlays: Overlay[] = [
  {
    id: "siteSettings",
    set: {
      "ui.callCtaLabel.vi": "Gọi điện",
      "ui.readMoreLabel.vi": "Xem thêm",
      "ui.notFound.body": lt(
        "Trang bạn tìm có thể đã đổi địa chỉ hoặc không còn tồn tại. Bạn có thể quay về trang chủ, hoặc nhắn Zalo để được hỗ trợ.",
      ),
      "seoDefaults.description": lt(SEO_DESCRIPTION),
      "seoDefaults.titleTemplate": ls("%s | Hứa Thị Tuyết"),
    },
  },
  { id: "footer", set: { "copyrightText.vi": "© Hứa Thị Tuyết. Bảo lưu mọi quyền." } },
  {
    id: "homePage-vi",
    set: {
      "story.heading": "Về tôi",
      "story.body": pt(
        "home-story",
        "Tôi trực tiếp mua, sở hữu và đầu tư bất động sản, đặc biệt tại Hạ Long Xanh. Vì vậy, mỗi lời tư vấn tôi đưa ra đều đặt mình vào vị trí của người đang cân nhắc một quyết định lớn.",
        "Tôi tư vấn bất động sản đầu tư, dòng tiền và nghỉ dưỡng tại Hạ Long – Quảng Ninh, đồng thời quản lý và đào tạo đội ngũ kinh doanh Khối TP55.",
      ),
      "story.aboutLinkLabel": "Đọc câu chuyện đầy đủ",
      "whyMe.intro": "Ba điều tôi giữ khi đồng hành cùng khách hàng, theo đúng tinh thần của lời hứa thương hiệu.",
      "whyMe.items": [
        {
          _key: "market",
          _type: "valueItem",
          title: "Thấu hiểu thị trường",
          description: "Nhìn thị trường qua ba lớp: thị trường, pháp lý và tài chính, trước khi nói đến sản phẩm.",
        },
        {
          _key: "value",
          _type: "valueItem",
          title: "Tinh chọn giá trị",
          description:
            "Cùng bạn xác định mục tiêu — bảo toàn tài sản, tạo dòng tiền, an cư và nghỉ dưỡng hay đa dạng hóa danh mục — rồi mới chọn tài sản phù hợp.",
        },
        {
          _key: "long-term",
          _type: "valueItem",
          title: "Đồng hành bền lâu",
          description: "Công việc của tôi không dừng ở lúc ký hợp đồng; tôi tiếp tục đồng hành cùng bạn sau giao dịch.",
        },
      ],
      "projectsSection.intro": "Các dự án tôi đang đồng hành tư vấn, bắt đầu từ Hạ Long Xanh và Làng Vân.",
      "projectsSection.viewAllLabel": "Xem tất cả dự án",
      "trustSection.heading": "Uy tín & đội ngũ",
      "trustSection.body": pt(
        "home-trust",
        "Bên cạnh vai trò tư vấn, tôi quản lý, đào tạo và phát triển đội ngũ kinh doanh Khối TP55.",
      ),
      "trustSection.testimonialsHeading": "Cảm nhận từ khách hàng",
      "knowledgeSection.heading": "Kiến thức thị trường",
      "knowledgeSection.viewAllLabel": "Xem tất cả bài viết",
      "connectSection.heading": "Kết nối cùng tôi",
      "connectSection.body":
        "Nhắn Zalo hoặc gọi điện để trao đổi nhu cầu của bạn. Tôi sẽ lắng nghe trước, rồi cùng bạn xem hướng đi phù hợp.",
      seo: {
        _type: "seo",
        title: "Hứa Thị Tuyết – Tư vấn bất động sản Hạ Long, Quảng Ninh",
        description: SEO_DESCRIPTION,
      },
    },
  },
  {
    id: "aboutPage-vi",
    set: {
      intro:
        "Tôi là Hứa Thị Tuyết, Giám đốc Kinh doanh Khối TP55 tại Trường Phát Group, tư vấn bất động sản tại Hạ Long – Quảng Ninh và dẫn dắt đội ngũ kinh doanh.",
      "brandStory.body": pt(
        "about-story",
        "Tôi cũng là khách hàng của chính mình. Tôi trực tiếp mua, sở hữu và đầu tư bất động sản, đặc biệt tại Hạ Long Xanh, nên hiểu cảm giác của người đứng trước một quyết định tài chính lớn: nhiều thông tin, nhiều lựa chọn và nhiều câu hỏi chưa có lời đáp.",
        "Từ trải nghiệm đó, tôi tư vấn theo cách mà chính tôi muốn được tư vấn: nói rõ về thị trường, pháp lý và tài chính; giúp bạn chọn tài sản phù hợp với mục tiêu của mình; và còn ở đó sau khi giao dịch hoàn tất.",
      ),
      "positioning.heading": "Hai vai trò, một hướng đi",
      seo: {
        _type: "seo",
        title: "Giới thiệu về tôi | Hứa Thị Tuyết",
        description:
          "Câu chuyện của Hứa Thị Tuyết: người tư vấn bất động sản thực chiến tại Hạ Long – Quảng Ninh, đồng thời dẫn dắt và đào tạo đội ngũ kinh doanh.",
      },
    },
  },
  {
    id: "projectsPage-vi",
    set: {
      intro:
        "Các dự án tôi đang đồng hành tư vấn. Thông tin từng dự án được cập nhật dần; để được tư vấn theo mục tiêu của riêng bạn, hãy nhắn Zalo.",
    },
  },
  {
    id: "teamPage-vi",
    set: {
      intro:
        "Ngoài việc tư vấn khách hàng, tôi dành thời gian quản lý, đào tạo và phát triển đội ngũ kinh doanh Khối TP55.",
      "leaderSection.heading": "Vai trò leader",
      "leaderSection.body": pt(
        "team-leader",
        "Cùng với tư vấn khách hàng, dẫn dắt và đào tạo đội ngũ là vai trò thứ hai của tôi trong thương hiệu này.",
      ),
      joinCtaHeading: "Tham gia đội ngũ cùng Tuyết",
      seo: {
        _type: "seo",
        description:
          "Cách Hứa Thị Tuyết dẫn dắt, đào tạo và phát triển đội ngũ kinh doanh bất động sản; dành cho người muốn học nghề và cùng làm việc lâu dài.",
      },
    },
  },
  {
    id: "articlesPage-vi",
    set: {
      intro:
        "Kiến thức về thị trường, pháp lý, tài chính và kinh nghiệm đồng hành cùng khách hàng, viết ngắn gọn và dễ áp dụng.",
      emptyStateText: "Các bài viết đầu tiên sẽ sớm được đăng tại đây.",
    },
  },
  {
    id: "contactPage-vi",
    set: {
      intro: "Nhắn Zalo hoặc gọi điện để trao đổi nhu cầu của bạn, hoặc tìm hiểu cơ hội tham gia đội ngũ.",
      seo: {
        _type: "seo",
        description:
          "Kết nối với Hứa Thị Tuyết qua Zalo hoặc điện thoại để được tư vấn bất động sản tại Hạ Long – Quảng Ninh, hoặc tìm hiểu cơ hội tham gia đội ngũ.",
      },
    },
  },
  {
    id: "project-ha-long-xanh-vi",
    set: {
      summary:
        "Góc nhìn của người trực tiếp sở hữu và đầu tư tại Hạ Long Xanh: một tài sản, ba giá trị — tạo dòng tiền, an cư & nghỉ dưỡng, giá trị dài hạn.",
    },
  },
  {
    id: "project-lang-van-vi",
    set: { summary: "Dự án đang triển khai mà tôi đồng hành tư vấn. Thông tin chi tiết sẽ được cập nhật." },
  },
];

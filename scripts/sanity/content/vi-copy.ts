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
      // Hai dòng «Lĩnh vực / Tập trung» khối Về tôi — từ brief (yeu-cau-du-an.md), trước đây tạm ở ui-strings (T6.5)
      "story.expertise": "Tư vấn, phân phối bất động sản đầu tư",
      "story.focus": "Tập trung: BĐS dòng tiền, BĐS nghỉ dưỡng và các dự án Vinhomes",
      "hero.pillarNotes": ["Thị trường · pháp lý · tài chính", "Phù hợp mục tiêu của bạn", "Trước, trong và sau giao dịch"],
      "hero.headline":
        "Tư vấn giải pháp bất động sản phù hợp với nhu cầu, tài chính và mục tiêu của bạn. Đồng hành trước, trong và sau giao dịch để cùng bạn giữ giá trị bền vững.",
      "whyMe.heading": "Giá trị tôi mang đến",
      "whyMe.intro": null,
      "whyMe.items": [
        { _key: "market", _type: "valueItem", icon: "target", title: "Hiểu thị trường", description: "Nhìn thị trường Hạ Long – Quảng Ninh từ thực tế, để bạn quyết định trên cơ sở rõ ràng." },
        { _key: "legal", _type: "valueItem", icon: "scale", title: "Hiểu pháp lý", description: "Nói rõ pháp lý và quy trình giao dịch trước khi bạn xuống tiền." },
        { _key: "client", _type: "valueItem", icon: "people", title: "Hiểu khách hàng", description: "Lắng nghe nhu cầu, khả năng tài chính và mục tiêu tài sản của bạn trước khi nói đến sản phẩm." },
        { _key: "value", _type: "valueItem", icon: "diamond", title: "Tinh chọn giá trị", description: "Không giới thiệu mọi sản phẩm; chỉ đề xuất tài sản phù hợp với mục tiêu của bạn." },
        { _key: "cashflow", _type: "valueItem", icon: "chart", title: "Dòng tiền & giá trị", description: "Cùng bạn xem khả năng khai thác, tạo dòng tiền và giá trị dài hạn của tài sản." },
        { _key: "long-term", _type: "valueItem", icon: "handshake", title: "Đồng hành bền lâu", description: "Đồng hành trước, trong và sau giao dịch, cả khi bạn cần khai thác hay gửi bán." },
      ],
      "projectsSection.intro": null,
      "projectsSection.viewAllLabel": "Xem tất cả dự án",
      "trustSection.heading": "Phát triển đội ngũ – Kiến tạo thành công",
      "trustSection.body": pt(
        "home-trust",
        "Tôi tin thành công bền vững đến từ một đội ngũ giỏi và văn hoá đồng hành. Bên cạnh vai trò tư vấn, tôi quản lý, đào tạo và phát triển đội ngũ kinh doanh Khối TP55, chia sẻ kiến thức và kinh nghiệm thực chiến mỗi ngày.",
      ),
      "trustSection.testimonialsHeading": "Khách hàng nói về Tuyết",
      "trustSection.tags": ["Đào tạo thực chiến", "Chia sẻ kiến thức", "Kỹ năng tư vấn", "Hỗ trợ & đồng hành", "Văn hoá tích cực"],
      "knowledgeSection.heading": "Kiến thức thị trường",
      "knowledgeSection.viewAllLabel": "Xem tất cả bài viết",
      "connectSection.heading": "Kết nối với Tuyết",
      "connectSection.body":
        "Tôi luôn sẵn sàng lắng nghe và đồng hành cùng bạn trên hành trình tìm kiếm giá trị bất động sản bền vững.",
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

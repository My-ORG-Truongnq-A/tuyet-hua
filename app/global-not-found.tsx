import { RootHtml } from "@/components/layout/RootHtml";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { NotFoundTemplate } from "@/templates/not-found/NotFoundTemplate";
import { notFoundMetadata } from "@/templates/not-found/metadata";
import "./globals.css";

/**
 * 404 cho mọi URL không khớp route (KT-06, T4.17). Site có hai root layout (vi / en — BP-01) nên dùng
 * global-not-found theo khuyến nghị của Next 16: trả HTTP 404 kèm HTML đầy đủ (header / footer, link trang chính,
 * nút Zalo). /en/* khi tiếng Anh tắt cũng tới đây (rewrite trong next.config.ts).
 */
export const metadata = notFoundMetadata("vi");

export default function GlobalNotFound() {
  return (
    <RootHtml lang="vi">
      <SiteChrome lang="vi">
        <NotFoundTemplate lang="vi" />
      </SiteChrome>
    </RootHtml>
  );
}

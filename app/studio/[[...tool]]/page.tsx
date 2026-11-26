import { studioEnabled } from "@/sanity/env";
import { Studio } from "./Studio";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ tool: [] }];
}

export default function StudioPage() {
  if (!studioEnabled) {
    return (
      <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: "36rem", margin: "4rem auto", padding: "0 1.25rem", lineHeight: 1.6 }}>
        <h1 style={{ fontSize: "1.5rem" }}>Chưa bật CMS</h1>
        <p>
          Website đang chạy nội dung từ seed trong repo. Studio quản trị nội dung sẽ hoạt động khi dự án được nối
          Sanity (đặt <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code>).
        </p>
      </main>
    );
  }
  return <Studio />;
}

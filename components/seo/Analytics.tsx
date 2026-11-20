import { resolveTracking } from "@/lib/analytics";
import { env } from "@/lib/env";
import { trackingBootstrap } from "@/lib/tracking-bootstrap";
import { ContactTracker } from "./ContactTracker";

/**
 * Chỗ nhúng tracking duy nhất (TR-01), gắn trong RootHtml → mọi trang site (vi / en / 404), KHÔNG có ở /studio
 * (root layout riêng). Chỉ render Google Tag khi VERCEL_ENV=production và có NEXT_PUBLIC_GTM_ID / NEXT_PUBLIC_GA_ID
 * hợp lệ; bản build local / demo / preview: 0 script đo lường. Lớp dataLayer + click liên hệ + UTM first-touch
 * luôn chạy (thuần first-party, không gửi request nào khi chưa có tag).
 */
export function Analytics() {
  const config = resolveTracking(env);
  return (
    <>
      {config && <script id="th-tag" dangerouslySetInnerHTML={{ __html: trackingBootstrap(config) }} />}
      <ContactTracker sendViaGtag={config?.kind === "ga4"} />
    </>
  );
}

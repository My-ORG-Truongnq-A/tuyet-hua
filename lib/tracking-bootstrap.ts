import type { TrackingConfig } from "./analytics";

const SAFE_ID = /^(?:GTM|G)-[A-Z0-9]{4,16}$/;

/**
 * Đoạn mã inline nạp Google Tag (TR-01 + HN-05), chỉ render khi resolveTracking() trả cấu hình
 * (production thật + có ID). Viết tay ES5 vì gtag cần đối tượng `arguments` thật.
 *
 * - Dựng hàng đợi ngay: dataLayer, gtag, Consent Mode v2 mặc định — quảng cáo / remarketing `denied`
 *   (chưa có CMP — TR-05), analytics `granted`.
 * - GTM-only: đẩy `gtm.start`; GA4 trực tiếp (không có GTM): `gtag('js')` + `gtag('config')`.
 *   Page view khi điều hướng SPA: GA4 Enhanced Measurement (lịch sử trình duyệt) / trigger History Change trong GTM.
 * - Nạp thư viện ở tương tác đầu (pointerdown / keydown / touchstart / scroll, once + passive) hoặc sau 4 s;
 *   URL có click ID quảng cáo thì nạp ngay. Cờ `__thTag` chống nạp / khởi tạo hai lần.
 */
export function trackingBootstrap(config: TrackingConfig): string {
  if (!SAFE_ID.test(config.id)) throw new Error(`[tracking] ID không hợp lệ: ${config.id}`);
  const id = JSON.stringify(config.id);
  const src = JSON.stringify(
    `https://www.googletagmanager.com/${config.kind === "gtm" ? "gtm.js" : "gtag/js"}?id=${config.id}`,
  );
  const init =
    config.kind === "gtm"
      ? "w.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});"
      : `gtag('js',new Date());gtag('config',${id});`;

  return [
    "(function(w,d){",
    "if(w.__thTag)return;w.__thTag=1;",
    "w.dataLayer=w.dataLayer||[];",
    "function gtag(){w.dataLayer.push(arguments);}",
    "w.gtag=w.gtag||gtag;",
    "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});",
    init,
    "var evs=['pointerdown','keydown','touchstart','scroll'],done=false,t;",
    "function load(){if(done)return;done=true;clearTimeout(t);",
    "for(var i=0;i<evs.length;i++)w.removeEventListener(evs[i],load);",
    `var s=d.createElement('script');s.async=true;s.src=${src};d.head.appendChild(s);}`,
    "if(/[?&](gclid|gbraid|wbraid|fbclid|msclkid|ttclid)=/.test(w.location.search)){load();return;}",
    "for(var j=0;j<evs.length;j++)w.addEventListener(evs[j],load,{once:true,passive:true});",
    "t=setTimeout(load,4000);",
    "})(window,document);",
  ].join("");
}

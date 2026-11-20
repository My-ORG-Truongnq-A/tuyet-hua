"use client";

import { useEffect } from "react";
import { buildContactEvent, classifyContactHref, linkLocation } from "@/lib/analytics";
import { FIRST_TOUCH_KEY, parseFirstTouch, resolveFirstTouch, utmOnly, type FirstTouch } from "@/lib/attribution";

type DataLayerWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

/** Đọc / ghi first-touch; storage bị chặn (chế độ riêng tư, quota) thì bỏ qua — không làm hỏng trang. */
function syncFirstTouch(): FirstTouch | null {
  try {
    const now = Date.now();
    const current = parseFirstTouch({
      search: window.location.search,
      pathname: window.location.pathname,
      referrer: document.referrer,
      now,
    });
    const { record, write } = resolveFirstTouch(window.localStorage.getItem(FIRST_TOUCH_KEY), current, now);
    if (write) {
      if (record) window.localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(record));
      else window.localStorage.removeItem(FIRST_TOUCH_KEY);
    }
    return record;
  } catch {
    return null;
  }
}

/**
 * Đo click liên hệ (TR-03): MỘT listener ở document, pha capture, phân loại theo href — nút mới đúng định dạng
 * (zalo.me, tel:, mailto:) tự được đo, không gắn onClick từng nút. Sự kiện vào `window.dataLayer`
 * (hàng đợi trong bộ nhớ trình duyệt; chỉ rời máy khi GTM / GA4 được nạp trên production).
 * Zalo mở tab mới, tel: / mailto: không rời trang → không cần event_callback (TR-04).
 * Kèm UTM first-touch (nếu có) để GA4 dựng custom dimension utm_*.
 * `sendViaGtag`: chỉ khi nạp GA4 trực tiếp (không GTM) — gửi thêm gtag("event") vì object dataLayer không tự tới GA4;
 * chế độ GTM-only KHÔNG gọi gtag (tag GA4 Event trong container đã bắt sự kiện — tránh đếm đúp).
 */
export function ContactTracker({ sendViaGtag = false }: { sendViaGtag?: boolean }) {
  useEffect(() => {
    const w = window as DataLayerWindow;
    w.dataLayer = w.dataLayer || [];
    const firstTouch = syncFirstTouch();
    const utm = utmOnly(firstTouch);
    if (firstTouch) {
      w.dataLayer.push({
        first_touch: { ...utm, landing_page: firstTouch.landing_page, referrer_host: firstTouch.referrer_host },
      });
    }

    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[href]");
      if (!link) return;
      const event = classifyContactHref(link.getAttribute("href"));
      if (!event) return;
      const payload = buildContactEvent({ event, linkLocation: linkLocation(link), pagePath: window.location.pathname, firstTouch: utm });
      (w.dataLayer ||= []).push(payload);
      if (sendViaGtag && typeof w.gtag === "function") {
        const { event: name, ...params } = payload;
        w.gtag("event", name, params);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [sendViaGtag]);

  return null;
}

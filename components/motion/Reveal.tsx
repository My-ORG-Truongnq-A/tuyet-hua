"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Hiện dần khi cuộn tới (T3.9): chỉ opacity + transform, thời lượng / khoảng dịch từ token
 * (--duration-reveal, --reveal-distance). prefers-reduced-motion → không ẩn, không transition.
 * HTML phía server luôn hiển thị (không JS vẫn đọc được); phần tử đang trong màn hình lúc tải không animate.
 * KHÔNG bọc ảnh LCP. Phần tử nào dùng Reveal do phương án quyết định (T3.9-A / T3.9-B).
 */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.dataset.reveal = "pending";
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset.reveal = "shown";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

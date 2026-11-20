import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Root layout riêng cho Studio: không header / footer / tracking / widget, noindex (KT-04). */
export const metadata: Metadata = {
  title: "Quản trị nội dung",
  robots: { index: false, follow: false },
};

export default function StudioRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}

import type { ReactNode } from "react";
import { fontVariables } from "../fonts";
import "../globals.css";

export default function ViRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}

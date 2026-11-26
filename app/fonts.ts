import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";

/**
 * Hai họ font, đủ glyph tiếng Việt, tự host qua next/font (không request runtime tới Google — HN-04, GD-03).
 * Chỉ weight có trong design_tokens.typography. Preload ≤ 4 face: chỉ Playfair (tiêu đề màn đầu,
 * 2 subset × 2 kiểu); Be Vietnam Pro dùng fallback đã chỉnh cỡ (adjustFontFallback) cho tới khi nạp xong.
 */
export const fontDisplay = Playfair_Display({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
});

export const fontSans = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-bevietnam",
  display: "swap",
  preload: false,
});

export const fontVariables = `${fontDisplay.variable} ${fontSans.variable}`;

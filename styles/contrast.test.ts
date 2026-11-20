import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Kiểm tương phản các cặp chữ / nền khai báo trong tokens.css (GD-02, TC-04).
 * Đọc thẳng tệp token → đổi giá trị màu mà vỡ tương phản thì test đỏ.
 */
const css = readFileSync(join(__dirname, "tokens.css"), "utf8");

function block(selectorPattern: RegExp): Record<string, string> {
  const m = css.match(selectorPattern);
  if (!m?.[1]) throw new Error(`Không thấy khối ${selectorPattern}`);
  const out: Record<string, string> = {};
  for (const [, name, value] of m[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[name!] = value!.trim();
  return out;
}

const theme = block(/@theme\s*{([\s\S]*?)@keyframes/);
const pa1 = block(/:root,\s*\[data-variant="pa1"\]\s*{([\s\S]*?)}/);
const pa2 = { ...pa1, ...block(/\[data-variant="pa2"\]\s*{([\s\S]*?)}/) };

function resolve(vars: Record<string, string>, name: string, depth = 0): string {
  const raw = vars[name] ?? theme[name];
  if (!raw) throw new Error(`Thiếu token ${name}`);
  const ref = raw.match(/^var\((--[\w-]+)\)$/);
  if (ref && depth < 5) return resolve(vars, ref[1]!, depth + 1);
  if (!/^#[0-9a-f]{6}$/i.test(raw)) throw new Error(`${name} không phải hex: ${raw}`);
  return raw;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

type Pair = [fg: string, bg: string, min: number];

/** Chữ thường 4.5, thành phần UI / vòng focus 3. */
const SEMANTIC_PAIRS: Pair[] = [
  ["--on-page", "--surface-page", 4.5],
  ["--on-page", "--surface-alt", 4.5],
  ["--on-page-muted", "--surface-page", 4.5],
  ["--on-page-muted", "--surface-alt", 4.5],
  ["--on-page-heading", "--surface-page", 4.5],
  ["--on-page-heading", "--surface-alt", 4.5],
  ["--on-page-accent", "--surface-page", 4.5],
  ["--on-page-accent", "--surface-alt", 4.5],
  ["--on-hero", "--surface-hero", 4.5],
  ["--on-hero", "--surface-hero-2", 4.5],
  ["--on-hero-muted", "--surface-hero", 4.5],
  ["--on-hero-accent", "--surface-hero", 4.5],
  ["--cta-fg", "--cta-bg", 4.5],
  ["--cta-fg", "--cta-bg-hover", 4.5],
  ["--focus-ring", "--surface-page", 3],
];

const FIXED_PAIRS: Pair[] = [
  ["--color-emerald-100", "--color-emerald-950", 4.5], // chữ footer
  ["--color-gold-300", "--color-emerald-950", 4.5], // nhãn footer
  ["--color-gold-300", "--color-emerald-900", 4.5], // chữ nhấn trên dải tối
  ["--color-ivory-100", "--color-emerald-800", 4.5], // chữ trên nền band pa2 / nút
  ["--color-emerald-100", "--color-emerald-800", 4.5],
  ["--focus-ring-on-dark", "--color-emerald-900", 3],
  ["--color-danger", "--color-ivory-100", 4.5],
  ["--color-success", "--color-ivory-100", 4.5],
  ["--color-brand-ink", "--color-white", 4.5],
  ["--color-muted", "--color-white", 4.5],
];

describe("tương phản token", () => {
  for (const [name, vars] of [["pa1", pa1], ["pa2", pa2]] as const) {
    for (const [fg, bg, min] of SEMANTIC_PAIRS) {
      it(`${name}: ${fg} trên ${bg} ≥ ${min}:1`, () => {
        expect(contrast(resolve(vars, fg), resolve(vars, bg))).toBeGreaterThanOrEqual(min);
      });
    }
  }

  for (const [fg, bg, min] of FIXED_PAIRS) {
    it(`${fg} trên ${bg} ≥ ${min}:1`, () => {
      expect(contrast(resolve(pa1, fg), resolve(pa1, bg))).toBeGreaterThanOrEqual(min);
    });
  }

  it("gold-500 chỉ trang trí: dưới 4.5:1 trên ngà nên không được là token chữ", () => {
    const textTokens = Object.entries(pa1).filter(([k]) => k.startsWith("--on-") || k === "--cta-fg");
    for (const [, v] of textTokens) expect(v).not.toContain("gold-500");
  });

  it("không còn bảng màu mặc định Tailwind", () => {
    expect(css).toMatch(/--color-\*:\s*initial/);
  });
});

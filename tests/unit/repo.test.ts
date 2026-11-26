import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/** Test rào repo sạch (KT-08, KT-09, KT-07, GL-06). */
const ROOT = join(__dirname, "..", "..");
const SKIP = new Set(["node_modules", ".next", ".git", ".digiauto", "coverage", "test-results", "playwright-report"]);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const sourceFiles = () =>
  walk(ROOT).filter((f) => /\.(ts|tsx|mjs)$/.test(f) && !relative(ROOT, f).startsWith("tests"));

describe("repo", () => {
  it(".gitignore chặn .env* trừ .env.example, không chặn public/images", () => {
    const lines = readFileSync(join(ROOT, ".gitignore"), "utf8").split(/\r?\n/).map((l) => l.trim());
    expect(lines).toContain(".env*");
    expect(lines).toContain("!.env.example");
    expect(lines.some((l) => /^\/?public(\/images)?\/?$/.test(l))).toBe(false);
  });

  it("mẫu biến môi trường có đủ tên biến chuẩn, không chứa giá trị bí mật (KT-11)", () => {
    const sample = readFileSync(join(ROOT, ".env" + ".example"), "utf8");
    const names = [
      "NEXT_PUBLIC_SITE_URL", "ALLOW_INDEXING", "SANITY_SOURCE", "NEXT_PUBLIC_SANITY_PROJECT_ID",
      "NEXT_PUBLIC_SANITY_DATASET", "SANITY_API_READ_TOKEN", "SANITY_API_WRITE_TOKEN", "SANITY_REVALIDATE_SECRET",
      "LEAD_DESTINATION", "DGA_API_URL", "DGA_FORM_KEY", "LEAD_TO_EMAIL", "LEADS_DRY_RUN",
      "NEXT_PUBLIC_GTM_ID", "NEXT_PUBLIC_GA_ID", "GOOGLE_SITE_VERIFICATION", "NEXT_PUBLIC_CHAT_WIDGET_KEY",
      "CRON_SECRET", "CONTENT_MODE", "SITE_LANGUAGES",
    ];
    for (const n of names) expect(sample, n).toMatch(new RegExp(`^${n}=`, "m"));
    for (const secret of ["SANITY_API_READ_TOKEN", "SANITY_API_WRITE_TOKEN", "SANITY_REVALIDATE_SECRET", "DGA_FORM_KEY", "CRON_SECRET"]) {
      expect(sample, secret).toMatch(new RegExp(`^${secret}=$`, "m"));
    }
  });

  it("chỉ một lockfile (pnpm)", () => {
    expect(existsSync(join(ROOT, "pnpm-lock.yaml"))).toBe(true);
    expect(existsSync(join(ROOT, "package-lock.json"))).toBe(false);
    expect(existsSync(join(ROOT, "yarn.lock"))).toBe(false);
  });

  it("đủ bốn script typecheck / lint / test / build và job CI tên `ci` chạy cả bốn", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { scripts: Record<string, string> };
    for (const s of ["typecheck", "lint", "test", "build"]) expect(pkg.scripts[s], s).toBeTruthy();
    const ci = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8");
    expect(ci).toMatch(/^\s{2}ci:\s*$/m);
    for (const s of ["typecheck", "lint", "test", "build"]) expect(ci).toContain(`pnpm ${s}`);
  });

  it("không đặt header / redirect trong vercel.json (BM-01, SEO-09)", () => {
    expect(existsSync(join(ROOT, "vercel.json"))).toBe(false);
  });

  it('không file "use client" nào import zod (KT-08)', () => {
    const offenders = sourceFiles().filter((f) => {
      const src = readFileSync(f, "utf8");
      return /^\s*["']use client["']/.test(src) && /from\s+["']zod["']/.test(src);
    });
    expect(offenders).toEqual([]);
  });

  it("chỉ lib/env.ts đọc NEXT_PUBLIC_SITE_URL; nơi khác dùng lib/site-url (SEO-02)", () => {
    const offenders = sourceFiles()
      .filter((f) => readFileSync(f, "utf8").includes("process.env.NEXT_PUBLIC_SITE_URL"))
      .map((f) => relative(ROOT, f).replaceAll("\\", "/"))
      .filter((f) => f !== "lib/env.ts");
    expect(offenders).toEqual([]);
  });
});

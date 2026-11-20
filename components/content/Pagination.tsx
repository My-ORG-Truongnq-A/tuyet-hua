import type { Lang } from "@/lib/env";
import { pageHref } from "@/lib/pagination";
import { UI } from "@/lib/ui-strings";

/** Phân trang ?trang=N (T3.11) — liên kết số trang thường, không JS. */
export function Pagination({ basePath, page, totalPages, lang }: { basePath: string; page: number; totalPages: number; lang: Lang }) {
  if (totalPages < 2) return null;
  const t = UI[lang].pagination;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const link = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm px-3 text-sm font-medium";
  return (
    <nav aria-label={t.label} className="mt-14">
      <ul className="flex flex-wrap items-center gap-2">
        {page > 1 && (
          <li>
            <a href={pageHref(basePath, page - 1)} rel="prev" className={`${link} text-emerald-800 hover:bg-(--surface-alt)`}>
              ← {t.prev}
            </a>
          </li>
        )}
        {pages.map((n) => (
          <li key={n}>
            {n === page ? (
              <span aria-current="page" className={`${link} bg-emerald-800 text-ivory-100`}>
                {n}
              </span>
            ) : (
              <a href={pageHref(basePath, n)} aria-label={t.page(n)} className={`${link} text-emerald-800 hover:bg-(--surface-alt)`}>
                {n}
              </a>
            )}
          </li>
        ))}
        {page < totalPages && (
          <li>
            <a href={pageHref(basePath, page + 1)} rel="next" className={`${link} text-emerald-800 hover:bg-(--surface-alt)`}>
              {t.next} →
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
}

"use client";

import { usePathname } from "next/navigation";
import type { Lang } from "@/lib/env";
import { alternatePath, pathFor } from "@/lib/routes";

/**
 * Chuyển VI / EN (T3.1, REQ-17): trỏ tới bản tương ứng; trang chưa có bản dịch → trang chủ ngôn ngữ kia.
 * Chỉ render khi có hơn một ngôn ngữ đang bật.
 */
export function LangSwitch({ lang, languages, label }: { lang: Lang; languages: readonly Lang[]; label: string }) {
  const pathname = usePathname();
  if (languages.length < 2) return null;
  return (
    <nav aria-label={label} className="text-xs font-semibold tracking-widest">
      <ul className="flex items-center gap-1">
        {languages.map((l, i) => (
          <li key={l} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden="true">/</span>}
            {l === lang ? (
              <span aria-current="true">{l.toUpperCase()}</span>
            ) : (
              <a
                href={alternatePath(pathname, l) ?? pathFor("home", l)}
                hrefLang={l}
                lang={l}
                className="inline-flex min-h-11 min-w-8 items-center justify-center underline-offset-4 hover:underline"
              >
                {l.toUpperCase()}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

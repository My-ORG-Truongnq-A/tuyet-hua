"use client";

import { useEffect } from "react";
import type { Lang } from "@/lib/env";
import { UI } from "@/lib/ui-strings";

/**
 * Màn lỗi (KT-06): nút «Thử lại»; hotline / Zalo vẫn hiện ở footer và thanh liên hệ mobile của layout
 * (client component không đọc được siteSettings nên không lặp số ở đây — không hard-code số).
 */
export function ErrorView({ lang, error, reset }: { lang: Lang; error: Error & { digest?: string }; reset: () => void }) {
  const t = UI[lang].error;
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="container-page section-y" aria-labelledby="err-title">
      <h1 id="err-title" className="font-display text-h2 text-(--on-page-heading)">
        {t.title}
      </h1>
      <p className="mt-4 max-w-(--container-prose) text-lead text-(--on-page-muted)">{t.body}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex min-h-11 items-center rounded-sm bg-emerald-800 px-5 text-sm font-semibold uppercase tracking-wide text-ivory-100 hover:bg-emerald-700"
      >
        {t.retry}
      </button>
    </section>
  );
}

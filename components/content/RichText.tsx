import { PortableText, type PortableTextComponents } from "next-sanity";
import type { ReactNode } from "react";
import type { Figure as FigureValue } from "@/lib/content/types";
import type { Lang } from "@/lib/env";
import { resolveLink } from "@/lib/links";
import { hasBlocks, type PortableValue } from "@/lib/portable-text";
import { Figure } from "../media/Figure";

/**
 * Portable Text (T3.6) cho blockContent / blockContentLite. Heading bắt đầu từ h2 (trang chỉ có một H1);
 * link ngoài mở tab mới với rel="noopener noreferrer"; ảnh trong bài đi qua Figure (alt bắt buộc).
 */
type LinkMark = { href?: string | null; internal?: { _ref: string } | null };
type TableValue = { rows?: { _key?: string; cells?: string[] }[] };
type EmbedValue = { url?: string; title?: string };

function components(lang: Lang): PortableTextComponents {
  return {
    block: {
      h1: ({ children }) => <h2 className="mt-10 font-display text-h2 text-(--on-page-heading)">{children}</h2>,
      h2: ({ children }) => <h2 className="mt-10 font-display text-h2 text-(--on-page-heading)">{children}</h2>,
      h3: ({ children }) => <h3 className="mt-8 font-display text-h3 text-(--on-page-heading)">{children}</h3>,
      h4: ({ children }) => <h4 className="mt-6 font-semibold">{children}</h4>,
      normal: ({ children }) => <p className="mt-4">{children}</p>,
      blockquote: ({ children }) => (
        <blockquote className="mt-6 border-l-2 border-(--line-accent) pl-5 font-display text-h3 italic text-(--on-page-heading)">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-(--line-accent)">{children}</ul>,
      number: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-6">{children}</ol>,
    },
    marks: {
      strong: ({ children }) => <strong>{children}</strong>,
      em: ({ children }) => <em>{children}</em>,
      brandHighlight: ({ children }) => <span className="text-(--on-page-heading)">{children}</span>,
      link: ({ value, children }: { value?: LinkMark; children: ReactNode }) => {
        const internal = value?.internal?._ref ? resolveLink({ kind: "internal", internal: value.internal }, { lang, zaloPhone: null, phone: null }) : null;
        const href = internal?.href ?? value?.href ?? null;
        if (!href) return <>{children}</>;
        const external = /^https?:\/\//.test(href);
        return (
          <a
            href={href}
            className="text-emerald-800 underline underline-offset-4 hover:text-emerald-700"
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {children}
          </a>
        );
      },
    },
    types: {
      figure: ({ value }: { value: FigureValue }) => (
        <Figure figure={value} lang={lang} sizes="(min-width: 768px) 40rem, 100vw" className="mt-8" imgClassName="h-auto rounded-sm" />
      ),
      table: ({ value }: { value: TableValue }) => {
        const rows = (value.rows ?? []).filter((r) => r.cells?.length);
        if (!rows.length) return null;
        const [head, ...body] = rows;
        return (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {head!.cells!.map((c, i) => (
                    <th key={i} scope="col" className="border-b border-(--on-page-heading) py-2 pr-4 text-left font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((r, ri) => (
                  <tr key={r._key ?? ri}>
                    {r.cells!.map((c, i) => (
                      <td key={i} className="border-b border-(--line-subtle) py-2 pr-4">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      },
      // Không nhúng iframe (CSP, không script bên thứ ba) — hiển thị liên kết tới video.
      embed: ({ value }: { value: EmbedValue }) =>
        value.url ? (
          <p className="mt-4">
            <a href={value.url} target="_blank" rel="noopener noreferrer" className="text-emerald-800 underline underline-offset-4">
              {value.title || value.url}
            </a>
          </p>
        ) : null,
    },
  };
}

export function RichText({ value, lang, className = "" }: { value: PortableValue; lang: Lang; className?: string }) {
  if (!hasBlocks(value)) return null;
  return (
    <div className={`max-w-(--container-prose) [&>:first-child]:mt-0 ${className}`}>
      <PortableText value={value} components={components(lang)} />
    </div>
  );
}

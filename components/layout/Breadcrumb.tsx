/**
 * Breadcrumb hiển thị (T3.8). Cùng danh sách mục với BreadcrumbList JSON-LD của template (lib/json-ld breadcrumbNode).
 * Không dùng trên trang chủ và 404.
 */
export type Crumb = { label: string; path: string };

export function Breadcrumb({ items, label, className = "" }: { items: Crumb[]; label: string; className?: string }) {
  if (items.length < 2) return null;
  return (
    <nav aria-label={label} className={`text-sm ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="[overflow-wrap:anywhere]">
                  {c.label}
                </span>
              ) : (
                <>
                  <a href={c.path} className="underline-offset-4 hover:underline">
                    {c.label}
                  </a>
                  <span aria-hidden="true">›</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

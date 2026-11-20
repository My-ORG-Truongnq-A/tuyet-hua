"use client";

import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string };

/** Link menu có aria-current theo đường dẫn hiện tại (T3.1). */
export function NavLinks({ items, variant }: { items: NavItem[]; variant: "bar" | "sheet" }) {
  const pathname = usePathname();
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  if (variant === "bar") {
    return (
      <ul className="flex items-center gap-7 text-sm font-medium">
        {items.map((n) => (
          <li key={n.href}>
            <a
              href={n.href}
              aria-current={isCurrent(n.href) ? "page" : undefined}
              className="border-b border-transparent py-1 transition-colors hover:border-current aria-[current=page]:border-(--on-hero-accent)"
            >
              {n.label}
            </a>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul>
      {items.map((n) => (
        <li key={n.href}>
          <a
            href={n.href}
            aria-current={isCurrent(n.href) ? "page" : undefined}
            className="flex min-h-11 items-center rounded-xs px-3 hover:bg-ivory-200 aria-[current=page]:font-semibold aria-[current=page]:text-emerald-800"
          >
            {n.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

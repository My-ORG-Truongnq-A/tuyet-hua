"use client";

import { useRef, type ReactNode } from "react";
import { Icon } from "../ui/Icon";
import { NavLinks, type NavItem } from "./NavLinks";

/**
 * Menu mobile toàn màn hình (T3.2) bằng <dialog> modal: mở / đóng bằng nút, Esc đóng (native),
 * phần ngoài menu bị inert nên focus nằm trong menu; đóng xong trình duyệt trả focus về nút mở.
 */
export function MobileMenu({
  items,
  openLabel,
  closeLabel,
  navLabel,
  children,
}: {
  items: NavItem[];
  openLabel: string;
  closeLabel: string;
  navLabel: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        aria-label={openLabel}
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
        className="grid size-11 cursor-pointer place-items-center rounded-sm ring-1 ring-current/30"
      >
        <Icon name="menu" />
      </button>
      <dialog
        ref={ref}
        aria-label={navLabel}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-ivory-50 p-0 text-ink-900 backdrop:bg-emerald-950/40 open:flex open:flex-col"
      >
        <div className="container-page flex min-h-(--header-h) items-center justify-end">
          <button
            type="button"
            aria-label={closeLabel}
            onClick={() => ref.current?.close()}
            className="grid size-11 cursor-pointer place-items-center rounded-sm ring-1 ring-current/30"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="container-page flex-1 overflow-y-auto pb-10">
          <nav aria-label={navLabel} className="text-lg">
            <NavLinks items={items} variant="sheet" />
          </nav>
          {children && <div className="mt-8 grid gap-4 border-t border-line pt-6">{children}</div>}
        </div>
      </dialog>
    </>
  );
}

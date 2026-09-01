"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { mainNavItems, mobileMoreItems } from "@/lib/navigation";
import { cn } from "@/lib/utils/cn";
import { useQuickAction } from "@/lib/context/quick-action-context";

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const { openQuickRegister } = useQuickAction();

  const mobileItems = mainNavItems.filter((item) => item.mobile !== false);

  return (
    <>
      {moreOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {moreOpen && (
        <div className="fixed inset-x-4 bottom-20 z-50 rounded-2xl border border-kumbu-100 bg-white p-3 shadow-lg lg:hidden">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-kumbu-400">
            Mais
          </p>
          <div className="grid grid-cols-2 gap-1">
            {mobileMoreItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-kumbu-700 hover:bg-kumbu-50"
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-kumbu-100 bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 items-end gap-1">
          {mobileItems.slice(0, 2).map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium",
                  active ? "text-kumbu-900 font-semibold" : "text-kumbu-500",
                )}
              >
                <span className="text-lg" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            aria-label="Registar movimento"
            className="mx-auto -mt-5 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-kumbu-600 text-white shadow-md transition-transform hover:bg-kumbu-700 active:scale-95"
            onClick={() => openQuickRegister("EXPENSE")}
          >
            <span className="text-2xl leading-none font-bold">+</span>
          </button>

          {mobileItems.slice(2).map((item) => {
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium",
                  active ? "text-kumbu-900 font-semibold" : "text-kumbu-500",
                )}
              >
                <span className="text-lg" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            aria-label="Mais op��es"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((open) => !open)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium",
              moreOpen ? "text-kumbu-900 font-semibold" : "text-kumbu-500",
            )}
          >
            <span className="text-lg" aria-hidden>
              ?
            </span>
            Mais
          </button>
        </div>
      </nav>
    </>
  );
}

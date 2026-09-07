"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { mainNavItems, mobileMoreItems } from "@/lib/navigation";
import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "@/components/ui/icons";
import { useQuickAction } from "@/lib/context/quick-action-context";

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const { openQuickRegister } = useQuickAction();

  const mobileItems = mainNavItems.filter((item) => item.mobile !== false);

  return (
    <>
      {/* Overlay for "More" drawer */}
      {moreOpen && (
        <button
          type="button"
          aria-label="Fechar menu de opções"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden transition-opacity"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* "More" drawer */}
      {moreOpen && (
        <div className="fixed inset-x-3 bottom-[calc(72px+env(safe-area-inset-bottom,0px))] z-50 overflow-hidden rounded-2xl border border-kumbu-100 bg-white shadow-2xl lg:hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2 border-b border-kumbu-50">
            <p className="text-[11px] font-bold uppercase tracking-widest text-kumbu-400">
              Mais Funcionalidades
            </p>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="rounded-lg p-1 text-kumbu-400 hover:bg-kumbu-50 hover:text-kumbu-700 transition-colors"
              aria-label="Fechar"
            >
              <Icon name="x" className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-px bg-kumbu-100 p-px max-h-[60vh] overflow-y-auto overscroll-contain">
            {mobileMoreItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 bg-white p-3 text-center transition-colors min-h-[72px]",
                    active
                      ? "bg-kumbu-50/70 text-kumbu-900 font-semibold"
                      : "text-kumbu-600 hover:text-kumbu-900 hover:bg-kumbu-50/40",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                      active ? "bg-kumbu-600 text-white" : "bg-kumbu-50 text-kumbu-600",
                    )}
                  >
                    <Icon
                      name={item.icon as IconName}
                      className="w-4 h-4"
                    />
                  </div>
                  <span className="text-[10px] leading-tight line-clamp-1">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-kumbu-100 bg-white/95 backdrop-blur-md pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
        <div className="mx-auto grid max-w-lg grid-cols-5 items-end">
          {/* Left items: Início, Diário */}
          <BottomNavItem
            href="/"
            label="Início"
            icon="home"
            active={pathname === "/"}
          />
          <BottomNavItem
            href="/diario"
            label="Diário"
            icon="book"
            active={pathname.startsWith("/diario")}
          />

          {/* Central register FAB */}
          <div className="flex flex-col items-center pb-1">
            <button
              type="button"
              aria-label="Registar movimento"
              className="-mt-5 flex h-13 w-13 flex-col items-center justify-center rounded-full bg-kumbu-600 text-white shadow-lg ring-4 ring-white hover:bg-kumbu-700 active:scale-90 transition-all duration-150"
              onClick={() => openQuickRegister("EXPENSE")}
            >
              <Icon name="plus" className="w-6 h-6 stroke-[2.5]" />
            </button>
            <span className="mt-1 text-[9px] font-semibold text-kumbu-500">
              Registar
            </span>
          </div>

          {/* Right item: Carteiras */}
          <BottomNavItem
            href="/carteiras"
            label="Carteiras"
            icon="wallet"
            active={pathname.startsWith("/carteiras")}
          />

          {/* More button */}
          <button
            type="button"
            aria-label="Mais opções"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((open) => !open)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-medium transition-colors",
              moreOpen ? "text-kumbu-900 font-semibold" : "text-kumbu-500 hover:text-kumbu-800",
            )}
          >
            <Icon
              name="more-horizontal"
              className={cn(
                "w-5 h-5",
                moreOpen ? "text-kumbu-700" : "text-kumbu-400",
              )}
            />
            <span>Mais</span>
            {moreOpen ? (
              <span className="h-1 w-4 rounded-full bg-kumbu-600" />
            ) : (
              <span className="h-1 w-4" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}

function BottomNavItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: IconName;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors",
        active ? "text-kumbu-900" : "text-kumbu-500",
      )}
    >
      <Icon
        name={icon}
        className={cn(
          "w-5 h-5",
          active ? "text-kumbu-700" : "text-kumbu-400",
        )}
      />
      {label}
      {active ? (
        <span className="h-1 w-4 rounded-full bg-kumbu-600" />
      ) : (
        <span className="h-1 w-4" />
      )}
    </Link>
  );
}

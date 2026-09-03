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
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* "More" drawer */}
      {moreOpen && (
        <div className="fixed inset-x-3 bottom-[72px] z-50 overflow-hidden rounded-2xl border border-kumbu-100 bg-white shadow-xl lg:hidden">
          <p className="px-4 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-widest text-kumbu-400">
            Mais opções
          </p>
          <div className="grid grid-cols-3 gap-px bg-kumbu-100 border-t border-kumbu-100">
            {mobileMoreItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 bg-white px-2 py-4 text-[11px] font-medium transition-colors",
                    active
                      ? "text-kumbu-900"
                      : "text-kumbu-500 hover:text-kumbu-800",
                  )}
                >
                  <Icon
                    name={item.icon as IconName}
                    className={cn(
                      "w-5 h-5",
                      active ? "text-kumbu-700" : "text-kumbu-400",
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-kumbu-100 bg-white/95 backdrop-blur-sm pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1 lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 items-end">
          {/* First two items */}
          {mobileItems.slice(0, 2).map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <BottomNavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon as IconName}
                active={active}
              />
            );
          })}

          {/* Central register button */}
          <div className="flex flex-col items-center pb-1">
            <button
              type="button"
              aria-label="Registar movimento"
              className="-mt-6 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-kumbu-600 text-white shadow-lg ring-4 ring-white hover:bg-kumbu-700 active:scale-95 transition-all duration-150"
              onClick={() => openQuickRegister("EXPENSE")}
            >
              <Icon name="plus" className="w-6 h-6" />
            </button>
            <span className="mt-1 text-[9px] font-medium text-kumbu-400">
              Registar
            </span>
          </div>

          {/* Next two items */}
          {mobileItems.slice(2).map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <BottomNavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon as IconName}
                active={active}
              />
            );
          })}

          {/* More button */}
          <button
            type="button"
            aria-label="Mais opções"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((open) => !open)}
            className={cn(
              "flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors",
              moreOpen ? "text-kumbu-900" : "text-kumbu-500",
            )}
          >
            <Icon
              name="more-horizontal"
              className={cn(
                "w-5 h-5",
                moreOpen ? "text-kumbu-700" : "text-kumbu-400",
              )}
            />
            Mais
            {moreOpen && (
              <span className="h-1 w-1 rounded-full bg-kumbu-600" />
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

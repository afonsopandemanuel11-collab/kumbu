"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mainNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { useQuickAction } from "@/lib/context/quick-action-context";

export function Sidebar() {
  const pathname = usePathname();
  const { openQuickRegister } = useQuickAction();
  const items = mainNavItems.filter((item) => item.desktop !== false);

  return (
    <aside className="hidden w-60 shrink-0 border-r border-kumbu-100 bg-white lg:flex lg:flex-col">
      <div className="border-b border-kumbu-100 px-5 py-5">
        <Link href="/" className="block">
          <span className="text-xl font-bold tracking-tight text-kumbu-900">
            KUMBU
          </span>
          <span className="mt-0.5 block text-xs text-kumbu-500">
            Gest�o Financeira Pessoal
          </span>
        </Link>
      </div>

      <div className="px-3 pt-4 pb-2">
        <Button
          fullWidth
          size="sm"
          className="shadow-xs font-semibold gap-1.5 py-2.5"
          onClick={() => openQuickRegister("EXPENSE")}
        >
          <span className="text-base leading-none">+</span> Registar
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3 overflow-y-auto">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-kumbu-100 font-semibold text-kumbu-900"
                  : "text-kumbu-600 hover:bg-kumbu-50 hover:text-kumbu-900",
              )}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-kumbu-100 p-3">
        <Link
          href="/definicoes"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            pathname.startsWith("/definicoes")
              ? "bg-kumbu-100 font-semibold text-kumbu-900"
              : "text-kumbu-600 hover:bg-kumbu-50 hover:text-kumbu-900",
          )}
        >
          <span aria-hidden>??</span>
          Defini��es
        </Link>
      </div>
    </aside>
  );
}

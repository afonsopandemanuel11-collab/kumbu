"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mainNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "@/components/ui/icons";
import { useQuickAction } from "@/lib/context/quick-action-context";

export function Sidebar() {
  const pathname = usePathname();
  const { openQuickRegister } = useQuickAction();
  const items = mainNavItems.filter((item) => item.desktop !== false);

  return (
    <aside className="hidden w-[220px] shrink-0 border-r border-kumbu-100 bg-white lg:flex lg:flex-col">
      {/* Logo */}
      <div className="px-5 py-5">
        <Link href="/" className="block group">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-kumbu-600 text-white text-xs font-bold shrink-0">
              K
            </span>
            <span className="text-lg font-bold tracking-tight text-kumbu-900 group-hover:text-kumbu-700 transition-colors">
              KUMBU
            </span>
          </div>
          <span className="mt-1 block text-[11px] text-kumbu-400 font-medium pl-9">
            Gestão Financeira Pessoal
          </span>
        </Link>
      </div>

      {/* Register button */}
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => openQuickRegister("EXPENSE")}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-kumbu-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-kumbu-700 active:scale-[0.98] transition-all duration-150"
        >
          <Icon name="plus" className="w-4 h-4" />
          Registar
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 px-2 overflow-y-auto">
        <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-kumbu-400">
          Principal
        </p>
        {items.slice(0, 2).map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon as IconName}
              active={active}
            />
          );
        })}

        <p className="px-3 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-widest text-kumbu-400">
          Gestão
        </p>
        {items.slice(2, 5).map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon as IconName}
              active={active}
            />
          );
        })}

        <p className="px-3 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-widest text-kumbu-400">
          Análise
        </p>
        {items.slice(5).map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon as IconName}
              active={active}
            />
          );
        })}
      </nav>

      {/* Settings */}
      <div className="border-t border-kumbu-100 p-2">
        <NavItem
          href="/definicoes"
          label="Definições"
          icon="settings"
          active={pathname.startsWith("/definicoes")}
        />
      </div>
    </aside>
  );
}

function NavItem({
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
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-150",
        active
          ? "bg-kumbu-50 font-semibold text-kumbu-900"
          : "font-medium text-kumbu-500 hover:bg-kumbu-50 hover:text-kumbu-800",
      )}
    >
      <Icon
        name={icon}
        className={cn(
          "w-[18px] h-[18px] shrink-0",
          active ? "text-kumbu-700" : "text-kumbu-400",
        )}
      />
      {label}
      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-kumbu-600" />
      )}
    </Link>
  );
}

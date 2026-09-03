"use client";

import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Icon } from "@/components/ui/icons";
import { createClient } from "@/lib/supabase/client";
import { QuickActionProvider, useQuickAction } from "@/lib/context/quick-action-context";

type AppShellProps = {
  children: React.ReactNode;
  userName?: string | null;
};

function AppShellInner({ children, userName }: AppShellProps) {
  const router = useRouter();
  const { openQuickRegister } = useQuickAction();

  const firstName = userName?.split(" ")[0] ?? "Utilizador";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-[#f5f7f6]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-kumbu-100 bg-white/95 px-4 backdrop-blur-sm lg:px-6">
          {/* Mobile: logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-kumbu-600 text-white text-xs font-bold">
              K
            </span>
            <span className="text-base font-bold text-kumbu-900">KUMBU</span>
          </div>

          {/* Desktop: greeting */}
          <div className="hidden lg:flex items-center gap-2">
            <p className="text-sm text-kumbu-600">
              Olá,{" "}
              <span className="font-semibold text-kumbu-900">{firstName}</span>{" "}
              👋
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openQuickRegister("EXPENSE")}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-kumbu-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-kumbu-700 active:scale-[0.98] transition-all"
            >
              <Icon name="plus" className="w-4 h-4" />
              Registar
            </button>

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sair"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-kumbu-500 hover:bg-kumbu-50 hover:text-kumbu-800 transition-colors"
            >
              <Icon name="logout" className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 py-5 pb-28 lg:px-6 lg:pb-8 lg:py-6">
          <div className="mx-auto max-w-5xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <QuickActionProvider>
      <AppShellInner {...props} />
    </QuickActionProvider>
  );
}

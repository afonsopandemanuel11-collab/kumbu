"use client";

import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Icon } from "@/components/ui/icons";
import { createClient } from "@/lib/supabase/client";
import { QuickActionProvider, useQuickAction } from "@/lib/context/quick-action-context";
import { OfflineSyncProvider } from "@/lib/offline/context/offline-sync-context";
import { SyncStatusBadge } from "@/components/pwa/sync-status-badge";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";

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
        <header className="sticky top-0 z-30 flex h-[calc(3.5rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] items-center justify-between border-b border-kumbu-100 bg-white/95 px-4 backdrop-blur-md lg:px-6">
          {/* Mobile: logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-kumbu-600 text-white text-sm font-bold shadow-2xs">
              K
            </span>
            <span className="text-base font-bold tracking-tight text-kumbu-900">KUMBU</span>
          </div>

          {/* Desktop: greeting */}
          <div className="hidden lg:flex items-center gap-2">
            <p className="text-sm text-kumbu-600">
              Olá,{" "}
              <span className="font-semibold text-kumbu-900">{firstName}</span>{" "}
              👋
            </p>
          </div>

          {/* Actions & Sync Status */}
          <div className="flex items-center gap-2">
            <SyncStatusBadge />

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
              aria-label="Sair da conta"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-kumbu-500 hover:bg-kumbu-50 hover:text-kumbu-800 transition-colors"
            >
              <Icon name="logout" className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-3.5 py-4 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] sm:px-5 sm:py-5 lg:px-6 lg:pb-8 lg:py-6">
          <div className="mx-auto max-w-5xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      <BottomNav />
      <PwaInstallPrompt />
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <OfflineSyncProvider>
      <QuickActionProvider>
        <AppShellInner {...props} />
      </QuickActionProvider>
    </OfflineSyncProvider>
  );
}

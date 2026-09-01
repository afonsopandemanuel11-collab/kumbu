"use client";

import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { QuickActionProvider, useQuickAction } from "@/lib/context/quick-action-context";

type AppShellProps = {
  children: React.ReactNode;
  userName?: string | null;
};

function AppShellInner({ children, userName }: AppShellProps) {
  const router = useRouter();
  const { openQuickRegister } = useQuickAction();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-kumbu-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-kumbu-100 bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="lg:hidden">
            <p className="text-lg font-bold text-kumbu-900">KUMBU</p>
            <p className="text-xs text-kumbu-500">Gest�o Financeira Pessoal</p>
          </div>

          <div className="hidden lg:block">
            <p className="text-sm font-medium text-kumbu-700">
              Ol�{userName ? `, ${userName}` : ""} ??
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="hidden sm:inline-flex gap-1.5"
              onClick={() => openQuickRegister("EXPENSE")}
            >
              <span className="font-bold">+</span> Registar
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-28 lg:px-8 lg:pb-8">{children}</main>
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

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils/currency";
import { AccountModal } from "@/components/accounts/account-modal";
import type { Account, AccountType } from "@/lib/services/accounts";

type AccountsViewProps = {
  initialAccounts: Account[];
  userId: string;
};

const typeIcons: Record<AccountType, string> = {
  BANK: "??",
  CASH: "??",
  DIGITAL_WALLET: "??",
  CARD: "??",
  SAVINGS: "??",
  PROJECT: "??",
  OTHER: "??",
};

const typeLabels: Record<AccountType, string> = {
  BANK: "Banco",
  CASH: "Dinheiro",
  DIGITAL_WALLET: "Carteira Digital",
  CARD: "Cart�o",
  SAVINGS: "Poupan�a",
  PROJECT: "Projecto",
  OTHER: "Outro",
};

export function AccountsView({ initialAccounts, userId }: AccountsViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const totalBalance = initialAccounts.reduce((acc, a) => acc + (a.current_balance ?? 0), 0);

  function handleCreate() {
    setEditingAccount(null);
    setModalOpen(true);
  }

  function handleEdit(account: Account) {
    setEditingAccount(account);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header & Total */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
            Carteiras
          </h1>
          <p className="mt-0.5 text-sm text-kumbu-500">
            Gere as tuas contas banc�rias, dinheiro em m�o e carteiras.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-1.5 self-start sm:self-auto">
          <span>+</span> Criar Carteira
        </Button>
      </div>

      {initialAccounts.length > 0 && (
        <div className="rounded-2xl border border-kumbu-100 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-wider text-kumbu-400">
            Saldo Total em Carteiras
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-kumbu-900">
            {formatCurrency(totalBalance)}
          </p>
        </div>
      )}

      {/* List or Empty State */}
      {initialAccounts.length === 0 ? (
        <EmptyState
          title="Ainda n�o tens nenhuma carteira."
          description="Cria a tua primeira carteira para come�ares a controlar e movimentar o teu dinheiro."
          actionLabel="+ Criar carteira"
          onAction={handleCreate}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {initialAccounts.map((account) => (
            <Card
              key={account.id}
              className="flex flex-col justify-between transition-all hover:border-kumbu-300 hover:shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-kumbu-50 text-xl">
                      {typeIcons[account.type] ?? "??"}
                    </span>
                    <div>
                      <h3 className="font-semibold text-kumbu-900">{account.name}</h3>
                      <p className="text-xs text-kumbu-500">{typeLabels[account.type]}</p>
                    </div>
                  </div>
                  <Badge variant={account.current_balance >= 0 ? "success" : "danger"}>
                    {account.currency}
                  </Badge>
                </div>

                {account.description && (
                  <p className="text-xs text-kumbu-500 line-clamp-2">
                    {account.description}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-end justify-between border-t border-kumbu-50 pt-3">
                <div>
                  <p className="text-[11px] text-kumbu-400">Saldo actual</p>
                  <p className="text-lg font-bold text-kumbu-900">
                    {formatCurrency(account.current_balance, account.currency)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleEdit(account)}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium text-kumbu-600 hover:bg-kumbu-50 hover:text-kumbu-900"
                >
                  Editar
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Account Modal */}
      <AccountModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        accountToEdit={editingAccount}
        userId={userId}
      />
    </div>
  );
}

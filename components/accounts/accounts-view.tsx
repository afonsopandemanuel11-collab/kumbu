"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils/currency";
import { AccountModal } from "@/components/accounts/account-modal";
import type { Account, AccountType } from "@/lib/services/accounts";

type AccountsViewProps = {
  initialAccounts: Account[];
  userId: string;
};

const typeEmoji: Record<AccountType, string> = {
  BANK: "🏦",
  CASH: "💵",
  DIGITAL_WALLET: "📱",
  CARD: "💳",
  SAVINGS: "🏛️",
  PROJECT: "🚀",
  OTHER: "💰",
};

const typeLabel: Record<AccountType, string> = {
  BANK: "Banco",
  CASH: "Dinheiro",
  DIGITAL_WALLET: "Carteira Digital",
  CARD: "Cartão",
  SAVINGS: "Poupança",
  PROJECT: "Projecto",
  OTHER: "Outro",
};

export function AccountsView({ initialAccounts, userId }: AccountsViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const activeAccounts = initialAccounts.filter(
    (a) => a.is_active && !a.archived_at,
  );
  const archivedAccounts = initialAccounts.filter(
    (a) => !a.is_active || a.archived_at,
  );
  const totalBalance = activeAccounts.reduce(
    (sum, a) => sum + (a.current_balance ?? 0),
    0,
  );

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
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
            Carteiras & Contas
          </h1>
          <p className="mt-0.5 text-sm text-kumbu-500">
            Gere os teus saldos em diferentes tipos de conta.
          </p>
        </div>
        <Button onClick={handleCreate} size="sm" className="gap-1.5 self-start">
          <Icon name="plus" className="w-4 h-4" />
          Nova Carteira
        </Button>
      </div>

      {/* Total balance banner */}
      {activeAccounts.length > 0 && (
        <div className="rounded-3xl bg-kumbu-800 px-6 py-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-kumbu-300">
            Saldo Consolidado
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums">
            {formatCurrency(totalBalance)}
          </p>
          <p className="mt-1 text-xs text-kumbu-400">
            {activeAccounts.length} carteira
            {activeAccounts.length !== 1 ? "s" : ""} activa
            {activeAccounts.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Active accounts */}
      {activeAccounts.length === 0 ? (
        <EmptyState
          icon="💳"
          title="Nenhuma carteira criada ainda."
          description="Cria a tua primeira carteira para começares a registar movimentos financeiros."
          actionLabel="+ Criar carteira"
          onAction={handleCreate}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activeAccounts.map((acc) => (
            <AccountCard
              key={acc.id}
              account={acc}
              onEdit={() => handleEdit(acc)}
            />
          ))}
        </div>
      )}

      {/* Archived accounts */}
      {archivedAccounts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-kumbu-400 px-1">
            Arquivadas
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {archivedAccounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleEdit(acc)}
                className="flex items-center gap-3 rounded-2xl border border-kumbu-100 bg-kumbu-50 px-4 py-3 text-left opacity-60 hover:opacity-80 transition-opacity"
              >
                <span className="text-lg opacity-50">
                  {typeEmoji[acc.type] ?? "💰"}
                </span>
                <div>
                  <p className="text-xs font-medium text-kumbu-700 line-through">
                    {acc.name}
                  </p>
                  <p className="text-[11px] text-kumbu-400">Arquivada</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <AccountModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        accountToEdit={editingAccount}
        userId={userId}
      />
    </div>
  );
}

function AccountCard({
  account,
  onEdit,
}: {
  account: Account;
  onEdit: () => void;
}) {
  const isNegative = account.current_balance < 0;

  return (
    <button
      type="button"
      onClick={onEdit}
      className="group w-full text-left rounded-2xl border border-kumbu-100 bg-white p-5 space-y-4 hover:border-kumbu-300 hover:shadow-sm transition-all duration-150"
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-kumbu-50 text-xl">
            {typeEmoji[account.type] ?? "💰"}
          </span>
          <div>
            <p className="text-sm font-semibold text-kumbu-900 group-hover:text-kumbu-700 transition-colors">
              {account.name}
            </p>
            <p className="text-[11px] text-kumbu-400">
              {typeLabel[account.type] ?? "Conta"}
            </p>
          </div>
        </div>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Icon name="chevron-right" className="w-4 h-4 text-kumbu-400" />
        </span>
      </div>

      {/* Balance */}
      <div>
        <p
          className={`text-2xl font-extrabold tracking-tight tabular-nums ${
            isNegative ? "text-rose-700" : "text-kumbu-900"
          }`}
        >
          {formatCurrency(account.current_balance, account.currency)}
        </p>
        <p className="mt-0.5 text-[11px] text-kumbu-400">
          {account.currency ?? "AOA"}
        </p>
      </div>
    </button>
  );
}

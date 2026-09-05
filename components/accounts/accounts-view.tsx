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
  const [selectedAllocAccountId, setSelectedAllocAccountId] = useState<string>(
    activeAccounts[0]?.id ?? ""
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

      {/* Carteira Física & Alocações Internas (Prompt Item 10) */}
      {activeAccounts.length > 0 && (
        <div className="rounded-3xl border border-kumbu-100 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🗂️</span>
                <h2 className="text-sm font-bold text-kumbu-900">
                  Carteira Física ≠ Finalidade do Dinheiro
                </h2>
              </div>
              <p className="text-xs text-kumbu-500 mt-0.5">
                O dinheiro pode estar na mesma conta bancária, mas o Kumbu ajuda-te a planear a finalidade de cada parcela.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="alloc-acc-select"
                className="text-xs text-kumbu-500 shrink-0"
              >
                Analisar carteira:
              </label>
              <select
                id="alloc-acc-select"
                value={selectedAllocAccountId || activeAccounts[0]?.id}
                onChange={(e) => setSelectedAllocAccountId(e.target.value)}
                className="rounded-xl border border-kumbu-200 bg-kumbu-50/50 px-3 py-1.5 text-xs font-semibold text-kumbu-900 focus:outline-none focus:ring-1 focus:ring-kumbu-500"
              >
                {activeAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.current_balance, acc.currency)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(() => {
            const currentAcc =
              activeAccounts.find(
                (a) =>
                  a.id === (selectedAllocAccountId || activeAccounts[0]?.id)
              ) || activeAccounts[0];
            const bal = currentAcc ? Math.max(0, currentAcc.current_balance) : 0;
            const curr = currentAcc?.currency ?? "AOA";

            const allocations = [
              { label: "Investimento / Futuro", pct: 20, color: "bg-blue-500" },
              { label: "Eu / Lazer & Bem-estar", pct: 20, color: "bg-amber-500" },
              { label: "Fundo Protegido (Reserva)", pct: 10, color: "bg-purple-500" },
              {
                label: "Família / Compromissos",
                pct: 30,
                color: "bg-emerald-500",
              },
              { label: "Projectos & Objectivos", pct: 20, color: "bg-kumbu-600" },
            ];

            return (
              <div className="space-y-4 pt-1">
                {/* Visual multi-segment bar */}
                <div className="h-3 w-full overflow-hidden rounded-full flex bg-kumbu-100">
                  {allocations.map((item, idx) => (
                    <div
                      key={idx}
                      className={`${item.color} h-full transition-all`}
                      style={{ width: `${item.pct}%` }}
                      title={`${item.label} (${item.pct}%)`}
                    />
                  ))}
                </div>

                {/* Allocation cards breakdown */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
                  {allocations.map((item, idx) => {
                    const allocatedAmount = Math.round(bal * (item.pct / 100));
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-kumbu-100 bg-kumbu-50/40 p-3 space-y-1"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${item.color}`} />
                          <span className="text-[11px] font-medium text-kumbu-700 truncate">
                            {item.label}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-kumbu-900 tabular-nums">
                          {formatCurrency(allocatedAmount, curr)}
                        </p>
                        <p className="text-[10px] text-kumbu-400">
                          {item.pct}% da carteira
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
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

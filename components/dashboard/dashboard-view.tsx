"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils/currency";
import { formatRelativeDate } from "@/lib/utils/date";
import { useQuickAction } from "@/lib/context/quick-action-context";
import type { FinancialDiaryEntry } from "@/lib/services/transactions";
import type { Account } from "@/lib/services/accounts";
import type { DailySummary, MonthlySummary } from "@/lib/services/reports";

type DashboardViewProps = {
  userName: string;
  currency: string;
  totalBalance: number;
  todaySummary: DailySummary | null;
  monthSummary: MonthlySummary | null;
  accounts: Account[];
  recentDiary: FinancialDiaryEntry[];
};

const accountTypeIcon: Record<string, string> = {
  BANK: "🏦",
  CASH: "💵",
  DIGITAL_WALLET: "📱",
  CARD: "💳",
  SAVINGS: "🏛️",
  PROJECT: "🚀",
  OTHER: "💰",
};

export function DashboardView({
  userName,
  currency,
  totalBalance,
  todaySummary,
  monthSummary,
  accounts,
  recentDiary,
}: DashboardViewProps) {
  const { openQuickRegister } = useQuickAction();

  const firstName = userName.split(" ")[0];

  const todayIncome = todaySummary?.daily_income ?? 0;
  const todayExpense = todaySummary?.daily_expense ?? 0;
  const todayNet = todaySummary?.daily_net ?? todayIncome - todayExpense;

  const monthIncome = monthSummary?.income ?? 0;
  const monthExpense = monthSummary?.expense ?? 0;
  const monthNet = monthSummary?.net ?? monthIncome - monthExpense;

  const isZeroState =
    totalBalance === 0 &&
    accounts.length === 0 &&
    recentDiary.length === 0 &&
    todayIncome === 0 &&
    todayExpense === 0;

  const activeAccounts = accounts.filter((a) => a.is_active && !a.archived_at);

  return (
    <div className="space-y-6">
      {/* Page greeting */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
            Olá, {firstName} 👋
          </h1>
          <p className="mt-0.5 text-sm text-kumbu-500">
            Como estão as tuas finanças hoje?
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => openQuickRegister("EXPENSE")}
          className="shrink-0 hidden sm:flex gap-1.5"
        >
          <Icon name="plus" className="w-4 h-4" />
          Registar
        </Button>
      </div>

      {/* Hero balance card */}
      <div className="relative overflow-hidden rounded-3xl bg-kumbu-800 p-6 text-white shadow-lg">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-kumbu-700/50" />
        <div className="pointer-events-none absolute -bottom-12 -left-6 h-36 w-36 rounded-full bg-kumbu-900/40" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-kumbu-300">
            Saldo total
          </p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {formatCurrency(totalBalance, currency)}
          </p>
          <p className="mt-1 text-xs text-kumbu-400">
            {activeAccounts.length > 0
              ? `Disponível em ${activeAccounts.length} carteira${activeAccounts.length !== 1 ? "s" : ""}`
              : "Sem carteiras activas"}
          </p>

          {/* Quick actions row */}
          <div className="mt-5 flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
            {[
              { label: "Ganhei", action: "INCOME" as const, color: "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200" },
              { label: "Gastei", action: "EXPENSE" as const, color: "bg-rose-500/20 hover:bg-rose-500/30 text-rose-200" },
              { label: "Transferir", action: "TRANSFER" as const, color: "bg-kumbu-600/40 hover:bg-kumbu-600/60 text-kumbu-200" },
              { label: "Poupar", action: "GOAL" as const, color: "bg-amber-500/20 hover:bg-amber-500/30 text-amber-200" },
              { label: "Dívida", action: "NEW_DEBT" as const, color: "bg-purple-500/20 hover:bg-purple-500/30 text-purple-200" },
            ].map(({ label, action, color }) => (
              <button
                key={action}
                type="button"
                onClick={() => openQuickRegister(action)}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${color}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isZeroState ? (
        <EmptyState
          icon="💡"
          title="O teu Kumbu começa aqui."
          description="Ainda não tens movimentos financeiros. Começa a acompanhar o teu dinheiro registando o primeiro movimento."
          actionLabel="+ Registar primeiro movimento"
          onAction={() => openQuickRegister("INCOME")}
        />
      ) : (
        <>
          {/* Today + This Month */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SummaryCard
              title="Hoje"
              subtitle="Resumo diário"
              income={todayIncome}
              expense={todayExpense}
              net={todayNet}
              currency={currency}
            />
            <SummaryCard
              title="Este Mês"
              subtitle="Resumo mensal"
              income={monthIncome}
              expense={monthExpense}
              net={monthNet}
              currency={currency}
            />
          </div>

          {/* Accounts */}
          {activeAccounts.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-kumbu-800">
                  As tuas Carteiras
                </h2>
                <Link
                  href="/carteiras"
                  className="flex items-center gap-1 text-xs font-semibold text-kumbu-600 hover:text-kumbu-800 transition-colors"
                >
                  Ver todas ({activeAccounts.length})
                  <Icon name="chevron-right" className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {activeAccounts.slice(0, 4).map((acc) => (
                  <div
                    key={acc.id}
                    className="rounded-2xl border border-kumbu-100 bg-white p-4 space-y-2 hover:border-kumbu-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base" aria-hidden>
                        {accountTypeIcon[acc.type] ?? "💰"}
                      </span>
                      <span className="text-[10px] font-medium text-kumbu-400 uppercase tracking-wide">
                        {acc.type === "BANK"
                          ? "Banco"
                          : acc.type === "CASH"
                          ? "Dinheiro"
                          : acc.type === "DIGITAL_WALLET"
                          ? "Digital"
                          : acc.type === "CARD"
                          ? "Cartão"
                          : acc.type === "SAVINGS"
                          ? "Poupança"
                          : "Outro"}
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] text-kumbu-500 truncate">
                        {acc.name}
                      </p>
                      <p className="text-sm font-bold text-kumbu-900 tabular-nums">
                        {formatCurrency(acc.current_balance, acc.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recent activity */}
          {recentDiary.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-kumbu-800">
                  Actividade Recente
                </h2>
                <Link
                  href="/diario"
                  className="flex items-center gap-1 text-xs font-semibold text-kumbu-600 hover:text-kumbu-800 transition-colors"
                >
                  Ver diário
                  <Icon name="chevron-right" className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="rounded-2xl border border-kumbu-100 bg-white divide-y divide-kumbu-50 overflow-hidden">
                {recentDiary.slice(0, 6).map((entry, index) => {
                  const isIncome =
                    entry.type === "INCOME" ||
                    entry.type === "PROJECT_INCOME";
                  const isTransfer = entry.type === "TRANSFER";
                  const isGoal = entry.type === "SAVING";

                  const sign = isIncome ? "+" : isTransfer ? "" : "-";
                  const amountColor = isIncome
                    ? "text-emerald-700"
                    : isTransfer
                    ? "text-kumbu-700"
                    : "text-rose-700";

                  const dotColor = isIncome
                    ? "bg-emerald-500"
                    : isTransfer
                    ? "bg-sky-500"
                    : isGoal
                    ? "bg-amber-500"
                    : "bg-rose-500";

                  return (
                    <div
                      key={entry.id ?? `entry-${index}`}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-kumbu-900 truncate">
                            {entry.category_name ||
                              (isTransfer ? "Transferência" : "Movimento")}
                          </p>
                          <p className="text-[11px] text-kumbu-400 truncate">
                            {isTransfer
                              ? `${entry.account_name} → ${entry.destination_account_name}`
                              : entry.account_name}
                            {entry.description
                              ? ` · ${entry.description}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-3">
                        <p className={`text-xs font-semibold tabular-nums ${amountColor}`}>
                          {sign}
                          {formatCurrency(
                            entry.amount ?? 0,
                            entry.currency ?? "AOA",
                          )}
                        </p>
                        <p className="text-[10px] text-kumbu-400">
                          {formatRelativeDate(entry.transaction_date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  subtitle,
  income,
  expense,
  net,
  currency,
}: {
  title: string;
  subtitle: string;
  income: number;
  expense: number;
  net: number;
  currency: string;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-kumbu-900">{title}</p>
        <p className="text-[11px] text-kumbu-400">{subtitle}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-[10px] font-medium text-emerald-700 uppercase tracking-wide">
            Ganhos
          </p>
          <p className="mt-1.5 text-xs font-bold text-emerald-800 tabular-nums">
            +{formatCurrency(income, currency)}
          </p>
        </div>
        <div className="rounded-xl bg-rose-50 p-3">
          <p className="text-[10px] font-medium text-rose-700 uppercase tracking-wide">
            Gastos
          </p>
          <p className="mt-1.5 text-xs font-bold text-rose-800 tabular-nums">
            -{formatCurrency(expense, currency)}
          </p>
        </div>
        <div className="rounded-xl bg-kumbu-50 p-3">
          <p className="text-[10px] font-medium text-kumbu-700 uppercase tracking-wide">
            Resultado
          </p>
          <p
            className={`mt-1.5 text-xs font-bold tabular-nums ${
              net >= 0 ? "text-kumbu-900" : "text-rose-700"
            }`}
          >
            {net >= 0 ? "+" : ""}
            {formatCurrency(net, currency)}
          </p>
        </div>
      </div>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils/currency";
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

  const todayIncome = todaySummary?.daily_income ?? 0;
  const todayExpense = todaySummary?.daily_expense ?? 0;
  const todayNet = todaySummary?.daily_net ?? (todayIncome - todayExpense);

  const monthIncome = monthSummary?.income ?? 0;
  const monthExpense = monthSummary?.expense ?? 0;
  const monthNet = monthSummary?.net ?? (monthIncome - monthExpense);

  const isZeroState =
    totalBalance === 0 &&
    accounts.length === 0 &&
    recentDiary.length === 0 &&
    todayIncome === 0 &&
    todayExpense === 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Greetings Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
            Ol�, {userName} ??
          </h1>
          <p className="mt-0.5 text-sm text-kumbu-500">
            Como est�o as tuas finan�as hoje?
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => openQuickRegister("EXPENSE")}
            className="gap-1.5"
          >
            <span>+</span> Registar
          </Button>
        </div>
      </div>

      {/* Saldo Total Hero Card */}
      <div className="rounded-3xl border border-kumbu-100 bg-white p-6 shadow-xs transition-all">
        <p className="text-xs font-semibold uppercase tracking-wider text-kumbu-400">
          Saldo total
        </p>
        <p className="mt-2 text-3xl font-extrabold tracking-tight text-kumbu-900 sm:text-4xl">
          {formatCurrency(totalBalance, currency)}
        </p>

        {/* Quick action buttons row */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-kumbu-50">
          <button
            type="button"
            onClick={() => openQuickRegister("INCOME")}
            className="flex items-center gap-1.5 rounded-xl bg-kumbu-50 px-3 py-2 text-xs font-semibold text-kumbu-800 hover:bg-kumbu-100 transition-colors"
          >
            <span>??</span> Ganhei
          </button>
          <button
            type="button"
            onClick={() => openQuickRegister("EXPENSE")}
            className="flex items-center gap-1.5 rounded-xl bg-kumbu-50 px-3 py-2 text-xs font-semibold text-kumbu-800 hover:bg-kumbu-100 transition-colors"
          >
            <span>??</span> Gastei
          </button>
          <button
            type="button"
            onClick={() => openQuickRegister("TRANSFER")}
            className="flex items-center gap-1.5 rounded-xl bg-kumbu-50 px-3 py-2 text-xs font-semibold text-kumbu-800 hover:bg-kumbu-100 transition-colors"
          >
            <span>?</span> Transferir
          </button>
          <button
            type="button"
            onClick={() => openQuickRegister("GOAL")}
            className="flex items-center gap-1.5 rounded-xl bg-kumbu-50 px-3 py-2 text-xs font-semibold text-kumbu-800 hover:bg-kumbu-100 transition-colors"
          >
            <span>??</span> Poupar
          </button>
          <button
            type="button"
            onClick={() => openQuickRegister("NEW_DEBT")}
            className="flex items-center gap-1.5 rounded-xl bg-kumbu-50 px-3 py-2 text-xs font-semibold text-kumbu-800 hover:bg-kumbu-100 transition-colors"
          >
            <span>??</span> D�vida
          </button>
          <button
            type="button"
            onClick={() => openQuickRegister("PROJECT")}
            className="flex items-center gap-1.5 rounded-xl bg-kumbu-50 px-3 py-2 text-xs font-semibold text-kumbu-800 hover:bg-kumbu-100 transition-colors"
          >
            <span>??</span> Projecto
          </button>
        </div>
      </div>

      {isZeroState ? (
        <EmptyState
          title="O teu Kumbu come�a aqui."
          description="Ainda n�o tens movimentos financeiros. Come�a a acompanhar o teu dinheiro registando o primeiro movimento."
          actionLabel="+ Registar primeiro movimento"
          onAction={() => openQuickRegister("INCOME")}
        />
      ) : (
        <>
          {/* Summary Sections: Hoje & Este M�s */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Hoje */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-kumbu-900">Hoje</h3>
                <span className="text-xs text-kumbu-400">Resumo di�rio</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="rounded-xl bg-emerald-50/60 p-2.5">
                  <p className="text-[11px] font-medium text-emerald-700">Ganhos</p>
                  <p className="mt-1 text-sm font-bold text-emerald-800">
                    +{formatCurrency(todayIncome, currency)}
                  </p>
                </div>
                <div className="rounded-xl bg-rose-50/60 p-2.5">
                  <p className="text-[11px] font-medium text-rose-700">Gastos</p>
                  <p className="mt-1 text-sm font-bold text-rose-800">
                    -{formatCurrency(todayExpense, currency)}
                  </p>
                </div>
                <div className="rounded-xl bg-kumbu-50 p-2.5">
                  <p className="text-[11px] font-medium text-kumbu-700">Resultado</p>
                  <p className={`mt-1 text-sm font-bold ${todayNet >= 0 ? "text-kumbu-900" : "text-rose-700"}`}>
                    {todayNet >= 0 ? "+" : ""}{formatCurrency(todayNet, currency)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Este M�s */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-kumbu-900">Este M�s</h3>
                <span className="text-xs text-kumbu-400">Resumo mensal</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="rounded-xl bg-emerald-50/60 p-2.5">
                  <p className="text-[11px] font-medium text-emerald-700">Ganhos</p>
                  <p className="mt-1 text-sm font-bold text-emerald-800">
                    +{formatCurrency(monthIncome, currency)}
                  </p>
                </div>
                <div className="rounded-xl bg-rose-50/60 p-2.5">
                  <p className="text-[11px] font-medium text-rose-700">Gastos</p>
                  <p className="mt-1 text-sm font-bold text-rose-800">
                    -{formatCurrency(monthExpense, currency)}
                  </p>
                </div>
                <div className="rounded-xl bg-kumbu-50 p-2.5">
                  <p className="text-[11px] font-medium text-kumbu-700">Resultado</p>
                  <p className={`mt-1 text-sm font-bold ${monthNet >= 0 ? "text-kumbu-900" : "text-rose-700"}`}>
                    {monthNet >= 0 ? "+" : ""}{formatCurrency(monthNet, currency)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Carteiras Summary Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-kumbu-900">As tuas Carteiras</h2>
              <Link
                href="/carteiras"
                className="text-xs font-semibold text-kumbu-600 hover:text-kumbu-800"
              >
                Ver todas ({accounts.length}) ?
              </Link>
            </div>

            {accounts.length === 0 ? (
              <Card className="py-4 text-center text-xs text-kumbu-500">
                Ainda n�o tens carteiras criadas.{" "}
                <Link href="/carteiras" className="font-semibold text-kumbu-700">
                  Criar carteira
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {accounts.slice(0, 4).map((acc) => (
                  <Card key={acc.id} className="p-3.5 space-y-1">
                    <p className="text-xs text-kumbu-500 truncate">{acc.name}</p>
                    <p className="text-base font-bold text-kumbu-900">
                      {formatCurrency(acc.current_balance, acc.currency)}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Financial Diary Activities */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-kumbu-900">Actividade Recente</h2>
              <Link
                href="/diario"
                className="text-xs font-semibold text-kumbu-600 hover:text-kumbu-800"
              >
                Abrir Di�rio ?
              </Link>
            </div>

            {recentDiary.length === 0 ? (
              <Card className="py-6 text-center text-xs text-kumbu-500">
                Sem registos recentes.
              </Card>
            ) : (
              <div className="space-y-2">
                {recentDiary.slice(0, 5).map((entry, index) => {
                  const isPositive = entry.type === "INCOME" || entry.type === "PROJECT_INCOME";
                  const isTransfer = entry.type === "TRANSFER";
                  const isGoal = entry.type === "SAVING";
                  const isDebt = entry.type === "DEBT_PAYMENT";

                  const icon = isPositive ? "??" : isTransfer ? "?" : isGoal ? "??" : isDebt ? "??" : "??";
                  const sign = isPositive ? "+" : isTransfer ? "" : "-";
                  const color = isPositive
                    ? "text-emerald-700 font-semibold"
                    : isTransfer
                    ? "text-kumbu-800 font-medium"
                    : "text-rose-700 font-medium";

                  return (
                    <Card
                      key={entry.id ?? `entry-${index}`}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-kumbu-50 text-base">
                          {icon}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-kumbu-900">
                            {entry.category_name || (isTransfer ? "Transfer�ncia" : "Movimento")}
                          </p>
                          <p className="text-[11px] text-kumbu-400">
                            {isTransfer
                              ? `${entry.account_name} ? ${entry.destination_account_name}`
                              : entry.account_name}
                            {entry.description ? ` � ${entry.description}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`text-xs ${color}`}>
                          {sign}
                          {formatCurrency(entry.amount, entry.currency ?? "AOA")}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

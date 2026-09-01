"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import type {
  NetWorth,
  DailySummary,
  MonthlySummary,
  CategoryExpenseBreakdown,
  AccountExpenseBreakdown,
  IncomeByCategory,
} from "@/lib/services/reports";

type ReportsViewProps = {
  netWorth: NetWorth | null;
  dailySummaries: DailySummary[];
  monthlySummaries: MonthlySummary[];
  categoryExpenses: CategoryExpenseBreakdown[];
  categoryIncomes: IncomeByCategory[];
  accountExpenses: AccountExpenseBreakdown[];
};

export function ReportsView({
  netWorth,
  monthlySummaries,
  categoryExpenses,
  categoryIncomes,
  accountExpenses,
}: ReportsViewProps) {
  const [activeTab, setActiveTab] = useState<"CATEGORIES" | "MONTHS" | "ACCOUNTS">("CATEGORIES");

  const totalAssets = netWorth?.total_assets ?? 0;
  const totalLiabilities = netWorth?.total_liabilities ?? 0;
  const totalNetWorth = netWorth?.net_worth ?? (totalAssets - totalLiabilities);

  const totalExpenseBreakdown = categoryExpenses.reduce((sum, c) => sum + (c.total ?? 0), 0);
  const totalIncomeBreakdown = categoryIncomes.reduce((sum, c) => sum + (c.total ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
          Relat�rios & An�lise
        </h1>
        <p className="mt-0.5 text-sm text-kumbu-500">
          Vis�o detalhada sobre patrim�nio, distribui��o de categorias e hist�rico de evolu��o.
        </p>
      </div>

      {/* Patrim�nio L�quido Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-kumbu-100 bg-white p-5 shadow-xs space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-kumbu-400">
            Patrim�nio L�quido
          </p>
          <p className="text-2xl font-extrabold text-kumbu-900">
            {formatCurrency(totalNetWorth)}
          </p>
          <p className="text-[11px] text-kumbu-500">Activos subtra�dos de passivos</p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/40 p-5 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Total Activos (Saldos + A Receber)
          </p>
          <p className="text-2xl font-extrabold text-emerald-800">
            {formatCurrency(totalAssets)}
          </p>
          <p className="text-[11px] text-emerald-600">Dinheiro em contas e direitos</p>
        </div>

        <div className="rounded-3xl border border-rose-100 bg-rose-50/40 p-5 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
            Total Passivos (D�vidas a Pagar)
          </p>
          <p className="text-2xl font-extrabold text-rose-800">
            {formatCurrency(totalLiabilities)}
          </p>
          <p className="text-[11px] text-rose-600">Obriga��es e d�vidas pendentes</p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-kumbu-100 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("CATEGORIES")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === "CATEGORIES"
              ? "border-b-2 border-kumbu-900 text-kumbu-900"
              : "text-kumbu-500 hover:text-kumbu-800"
          }`}
        >
          Por Categorias
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("MONTHS")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === "MONTHS"
              ? "border-b-2 border-kumbu-900 text-kumbu-900"
              : "text-kumbu-500 hover:text-kumbu-800"
          }`}
        >
          Evolu��o Mensal
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ACCOUNTS")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === "ACCOUNTS"
              ? "border-b-2 border-kumbu-900 text-kumbu-900"
              : "text-kumbu-500 hover:text-kumbu-800"
          }`}
        >
          Por Carteiras
        </button>
      </div>

      {/* Categories Breakdown */}
      {activeTab === "CATEGORIES" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Expenses by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
              <CardDescription>
                Total acumulado: {formatCurrency(totalExpenseBreakdown)}
              </CardDescription>
            </CardHeader>

            {categoryExpenses.length === 0 ? (
              <p className="py-6 text-center text-xs text-kumbu-400">
                Ainda n�o h� dados de despesas por categoria.
              </p>
            ) : (
              <div className="space-y-3 pt-2">
                {categoryExpenses.map((cat, idx) => {
                  const total = cat.total ?? 0;
                  const pct = totalExpenseBreakdown > 0 ? Math.round((total / totalExpenseBreakdown) * 100) : 0;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-kumbu-900">{cat.category ?? "Sem Categoria"}</span>
                        <span className="text-kumbu-600 font-medium">
                          {formatCurrency(total)} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-kumbu-100">
                        <div
                          className="h-full rounded-full bg-rose-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Incomes by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Receitas por Categoria</CardTitle>
              <CardDescription>
                Total acumulado: {formatCurrency(totalIncomeBreakdown)}
              </CardDescription>
            </CardHeader>

            {categoryIncomes.length === 0 ? (
              <p className="py-6 text-center text-xs text-kumbu-400">
                Ainda n�o h� dados de receitas por categoria.
              </p>
            ) : (
              <div className="space-y-3 pt-2">
                {categoryIncomes.map((cat, idx) => {
                  const total = cat.total ?? 0;
                  const pct = totalIncomeBreakdown > 0 ? Math.round((total / totalIncomeBreakdown) * 100) : 0;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-kumbu-900">{cat.category ?? "Sem Categoria"}</span>
                        <span className="text-kumbu-600 font-medium">
                          {formatCurrency(total)} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-kumbu-100">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Monthly Evolution */}
      {activeTab === "MONTHS" && (
        <Card>
          <CardHeader>
            <CardTitle>Hist�rico de Desempenho Mensal</CardTitle>
            <CardDescription>
              Comparativo de ganhos, gastos e resultado l�quido dos �ltimos meses.
            </CardDescription>
          </CardHeader>

          {monthlySummaries.length === 0 ? (
            <p className="py-8 text-center text-xs text-kumbu-400">
              Sem dados mensais registados at� ao momento.
            </p>
          ) : (
            <div className="divide-y divide-kumbu-100">
              {monthlySummaries.map((m, idx) => {
                const inc = m.income ?? 0;
                const exp = m.expense ?? 0;
                const net = m.net ?? (inc - exp);

                return (
                  <div key={idx} className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-kumbu-900">{m.month}</p>
                      <p className="text-xs text-kumbu-500">
                        Ganhos: <span className="text-emerald-700 font-semibold">+{formatCurrency(inc)}</span> � Gastos: <span className="text-rose-700 font-semibold">-{formatCurrency(exp)}</span>
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-[11px] text-kumbu-400">Resultado L�quido</p>
                      <p className={`text-sm font-extrabold ${net >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {net >= 0 ? "+" : ""}{formatCurrency(net)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Account Expenses */}
      {activeTab === "ACCOUNTS" && (
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Carteira</CardTitle>
            <CardDescription>
              Distribui��o de gastos conforme a conta ou carteira de origem.
            </CardDescription>
          </CardHeader>

          {accountExpenses.length === 0 ? (
            <p className="py-8 text-center text-xs text-kumbu-400">
              Sem dados de despesas por carteira.
            </p>
          ) : (
            <div className="space-y-3 pt-2">
              {accountExpenses.map((acc, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl bg-kumbu-50 p-3.5">
                  <span className="text-sm font-semibold text-kumbu-900">{acc.account ?? "Carteira"}</span>
                  <span className="text-sm font-bold text-rose-700">-{formatCurrency(acc.total)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

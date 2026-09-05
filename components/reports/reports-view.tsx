"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const [activeTab, setActiveTab] = useState<
    "CATEGORIES" | "MONTHS" | "ACCOUNTS"
  >("CATEGORIES");

  const totalAssets = netWorth?.total_assets ?? 0;
  const totalLiabilities = netWorth?.total_liabilities ?? 0;
  const totalNetWorth =
    netWorth?.net_worth ?? totalAssets - totalLiabilities;

  const totalExpenseBreakdown = categoryExpenses.reduce(
    (sum, c) => sum + (c.total ?? 0),
    0,
  );
  const totalIncomeBreakdown = categoryIncomes.reduce(
    (sum, c) => sum + (c.total ?? 0),
    0,
  );

  const topExpense = categoryExpenses[0];
  const topIncome = categoryIncomes[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
          Relatórios & Análise
        </h1>
        <p className="mt-0.5 text-sm text-kumbu-500">
          Leitura estratégica do teu património, hábitos de consumo e evolução ao longo do tempo.
        </p>
      </div>

      {/* Património Líquido Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-kumbu-100 bg-white p-5 shadow-xs space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-kumbu-400">
            Património Líquido
          </p>
          <p className="text-2xl font-extrabold text-kumbu-900 tabular-nums">
            {formatCurrency(totalNetWorth)}
          </p>
          <p className="text-[11px] text-kumbu-400">
            Activos subtraídos de passivos
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-5 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700">
            Total Activos
          </p>
          <p className="text-2xl font-extrabold text-emerald-800 tabular-nums">
            {formatCurrency(totalAssets)}
          </p>
          <p className="text-[11px] text-emerald-600">
            Saldos em carteiras e a receber
          </p>
        </div>

        <div className="rounded-3xl border border-rose-100 bg-rose-50/50 p-5 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-rose-700">
            Total Passivos
          </p>
          <p className="text-2xl font-extrabold text-rose-800 tabular-nums">
            {formatCurrency(totalLiabilities)}
          </p>
          <p className="text-[11px] text-rose-600">
            Obrigações e dívidas a pagar
          </p>
        </div>
      </div>

      {/* Narrative Insights Banner */}
      {topExpense && totalExpenseBreakdown > 0 && (
        <div className="rounded-2xl border border-kumbu-100 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-xs font-semibold text-kumbu-900">
                A tua maior categoria de gasto é {topExpense.category}
              </p>
              <p className="text-[11px] text-kumbu-500">
                Representa {Math.round((topExpense.total ?? 0) / totalExpenseBreakdown * 100)}% de todas as tuas despesas acumuladas ({formatCurrency(topExpense.total ?? 0)}).
              </p>
            </div>
          </div>
          {topIncome && (
            <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-kumbu-50">
              <p className="text-[11px] text-kumbu-400">Principal receita</p>
              <p className="text-xs font-bold text-emerald-700">{topIncome.category}</p>
            </div>
          )}
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-4 border-b border-kumbu-100">
        <button
          type="button"
          onClick={() => setActiveTab("CATEGORIES")}
          className={`pb-2.5 text-sm font-semibold transition-colors ${
            activeTab === "CATEGORIES"
              ? "border-b-2 border-kumbu-700 text-kumbu-900"
              : "text-kumbu-400 hover:text-kumbu-700"
          }`}
        >
          Por Categorias
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("MONTHS")}
          className={`pb-2.5 text-sm font-semibold transition-colors ${
            activeTab === "MONTHS"
              ? "border-b-2 border-kumbu-700 text-kumbu-900"
              : "text-kumbu-400 hover:text-kumbu-700"
          }`}
        >
          Evolução Mensal
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ACCOUNTS")}
          className={`pb-2.5 text-sm font-semibold transition-colors ${
            activeTab === "ACCOUNTS"
              ? "border-b-2 border-kumbu-700 text-kumbu-900"
              : "text-kumbu-400 hover:text-kumbu-700"
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
                Ainda não há dados de despesas por categoria.
              </p>
            ) : (
              <div className="space-y-3 pt-2">
                {categoryExpenses.map((cat, idx) => {
                  const total = cat.total ?? 0;
                  const pct =
                    totalExpenseBreakdown > 0
                      ? Math.round((total / totalExpenseBreakdown) * 100)
                      : 0;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-kumbu-900">
                          {cat.category ?? "Sem Categoria"}
                        </span>
                        <span className="text-kumbu-600 font-medium tabular-nums">
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
                Ainda não há dados de receitas por categoria.
              </p>
            ) : (
              <div className="space-y-3 pt-2">
                {categoryIncomes.map((cat, idx) => {
                  const total = cat.total ?? 0;
                  const pct =
                    totalIncomeBreakdown > 0
                      ? Math.round((total / totalIncomeBreakdown) * 100)
                      : 0;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-kumbu-900">
                          {cat.category ?? "Sem Categoria"}
                        </span>
                        <span className="text-kumbu-600 font-medium tabular-nums">
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
            <CardTitle>Histórico de Desempenho Mensal</CardTitle>
            <CardDescription>
              Comparativo de ganhos, gastos, poupança e resultado líquido dos últimos meses.
            </CardDescription>
          </CardHeader>

          {monthlySummaries.length === 0 ? (
            <p className="py-8 text-center text-xs text-kumbu-400">
              Sem dados mensais registados até ao momento.
            </p>
          ) : (
            <div className="divide-y divide-kumbu-100">
              {monthlySummaries.map((m, idx) => {
                const inc = m.income ?? 0;
                const exp = m.expense ?? 0;
                const net = m.net ?? inc - exp;
                const saving = m.saving ?? 0;
                const savingRate = inc > 0 ? Math.round((saving / inc) * 100) : 0;

                // Compare with previous month in list if exists (list is desc by month)
                const nextOlderMonth = monthlySummaries[idx + 1];
                let expenseTrend: number | null = null;
                if (nextOlderMonth && (nextOlderMonth.expense ?? 0) > 0) {
                  const olderExp = nextOlderMonth.expense ?? 0;
                  expenseTrend = Math.round(((exp - olderExp) / olderExp) * 100);
                }

                return (
                  <div
                    key={idx}
                    className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-kumbu-900">
                          {m.month}
                        </p>
                        {expenseTrend !== null && (
                          <Badge
                            variant={expenseTrend <= 0 ? "success" : "warning"}
                            size="sm"
                          >
                            {expenseTrend <= 0 ? "Despesas " : "Despesas +"}
                            {expenseTrend}%
                          </Badge>
                        )}
                        {savingRate > 0 && (
                          <Badge variant="default" size="sm">
                            Poupança {savingRate}%
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-kumbu-500">
                        Ganhos:{" "}
                        <span className="text-emerald-700 font-semibold tabular-nums">
                          +{formatCurrency(inc)}
                        </span>{" "}
                        · Gastos:{" "}
                        <span className="text-rose-700 font-semibold tabular-nums">
                          -{formatCurrency(exp)}
                        </span>
                        {saving > 0 && (
                          <span>
                            {" "}· Poupança:{" "}
                            <span className="text-kumbu-700 font-semibold tabular-nums">
                              {formatCurrency(saving)}
                            </span>
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-[11px] text-kumbu-400">
                        Resultado Líquido
                      </p>
                      <p
                        className={`text-sm font-extrabold tabular-nums ${
                          net >= 0 ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {net >= 0 ? "+" : ""}
                        {formatCurrency(net)}
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
              Distribuição de gastos conforme a conta ou carteira de origem.
            </CardDescription>
          </CardHeader>

          {accountExpenses.length === 0 ? (
            <p className="py-8 text-center text-xs text-kumbu-400">
              Sem dados de despesas por carteira.
            </p>
          ) : (
            <div className="space-y-3 pt-2">
              {accountExpenses.map((acc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl bg-kumbu-50 p-3.5"
                >
                  <span className="text-sm font-semibold text-kumbu-900">
                    {acc.account ?? "Carteira"}
                  </span>
                  <span className="text-sm font-bold text-rose-700 tabular-nums">
                    -{formatCurrency(acc.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils/currency";
import { formatRelativeDate } from "@/lib/utils/date";
import { useQuickAction } from "@/lib/context/quick-action-context";
import type {
  RecurringTransaction,
  CashFlowProjection,
  BudgetVsActual,
} from "@/lib/services/budgets";
import type { MonthlySummary } from "@/lib/services/reports";

type RecurringWithRelations = RecurringTransaction & {
  categories?: { name: string; icon: string | null } | null;
  accounts?: { name: string } | null;
};

type PlaneamentoViewProps = {
  recurringList: RecurringWithRelations[];
  cashFlowList: CashFlowProjection[];
  budgetVsActualList: BudgetVsActual[];
  monthSummary: MonthlySummary | null;
};

const frequencyLabels: Record<string, string> = {
  DAILY: "Diário",
  WEEKLY: "Semanal",
  BIWEEKLY: "Quinzenal",
  MONTHLY: "Mensal",
  YEARLY: "Anual",
};

export function PlaneamentoView({
  recurringList,
  cashFlowList,
  budgetVsActualList,
  monthSummary,
}: PlaneamentoViewProps) {
  const { openQuickRegister } = useQuickAction();

  // Calculate approximate monthly fixed expenses
  const monthlyFixedExpenses = useMemo(() => {
    return recurringList
      .filter((r) => r.is_active && (r.type === "EXPENSE" || r.type === "PROJECT_EXPENSE"))
      .reduce((sum, r) => {
        const amt = r.amount;
        switch (r.frequency) {
          case "DAILY":
            return sum + amt * 30;
          case "WEEKLY":
            return sum + amt * 4.33;
          case "BIWEEKLY":
            return sum + amt * 2.16;
          case "MONTHLY":
            return sum + amt;
          case "YEARLY":
            return sum + amt / 12;
          default:
            return sum + amt;
        }
      }, 0);
  }, [recurringList]);

  const currentMonthExpense = monthSummary?.expense ?? 0;
  const currentMonthIncome = monthSummary?.income ?? 0;

  // Estimated free cash after fixed commitments
  const estimatedFreeCash = currentMonthIncome - monthlyFixedExpenses;

  const activeRecurring = recurringList.filter((r) => r.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
            Planeamento Financeiro
          </h1>
          <p className="mt-0.5 text-sm text-kumbu-500">
            Diferencia gastos fixos de variáveis, monitoriza compromissos e planeia os teus próximos meses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/orcamentos">
            <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
              <Icon name="chart" className="w-3.5 h-3.5" />
              Ver Orçamentos
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => openQuickRegister("EXPENSE")}
            className="gap-1.5 text-xs"
          >
            <Icon name="plus" className="w-3.5 h-3.5" />
            Novo Registo
          </Button>
        </div>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-kumbu-100 bg-white p-5 shadow-xs space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-kumbu-400">
            Gastos Fixos / Mês
          </p>
          <p className="text-2xl font-extrabold text-rose-800 tabular-nums">
            {formatCurrency(monthlyFixedExpenses)}
          </p>
          <p className="text-[11px] text-kumbu-400">
            {activeRecurring.length} compromisso{activeRecurring.length !== 1 ? "s" : ""} recorrente{activeRecurring.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-3xl border border-kumbu-100 bg-white p-5 shadow-xs space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-kumbu-400">
            Gasto Real do Mês
          </p>
          <p className="text-2xl font-extrabold text-kumbu-900 tabular-nums">
            {formatCurrency(currentMonthExpense)}
          </p>
          <p className="text-[11px] text-kumbu-400">
            Total consumido no período actual
          </p>
        </div>

        <div className="rounded-3xl border border-kumbu-100 bg-white p-5 shadow-xs space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-kumbu-400">
            Margem Livre Estimada
          </p>
          <p
            className={`text-2xl font-extrabold tabular-nums ${
              estimatedFreeCash >= 0 ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {estimatedFreeCash >= 0 ? "+" : ""}
            {formatCurrency(estimatedFreeCash)}
          </p>
          <p className="text-[11px] text-kumbu-400">
            Ganhos do mês após cobrir gastos fixos
          </p>
        </div>
      </div>

      {/* Main Grid: Recurring Expenses vs Projections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Recurring List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-kumbu-800">
              Gastos Fixos & Despesas Recorrentes
            </h2>
            <Link
              href="/orcamentos"
              className="text-xs font-semibold text-kumbu-600 hover:text-kumbu-800"
            >
              Configurar na área de orçamentos →
            </Link>
          </div>

          {activeRecurring.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-kumbu-200 bg-white p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-kumbu-800">
                Nenhum gasto fixo ou recorrente registado.
              </p>
              <p className="text-xs text-kumbu-400 max-w-sm mx-auto">
                Adiciona contas periódicas como renda, internet ou mensalidades para planear o teu fluxo com precisão.
              </p>
              <div className="pt-2">
                <Link href="/orcamentos">
                  <Button size="sm" variant="secondary">
                    + Configurar Despesa Recorrente
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-kumbu-100 bg-white divide-y divide-kumbu-50">
              {activeRecurring.map((item) => {
                const isIncome = item.type === "INCOME" || item.type === "PROJECT_INCOME";
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-kumbu-50/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-kumbu-50 text-base shrink-0">
                        {item.categories?.icon || (isIncome ? "💰" : "📋")}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-semibold text-kumbu-900 truncate">
                            {item.description || item.categories?.name || "Compromisso"}
                          </p>
                          <Badge variant="default" size="sm">
                            {frequencyLabels[item.frequency] ?? item.frequency}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-kumbu-400 truncate">
                          Conta: {item.accounts?.name ?? "Carteira"} · Próxima:{" "}
                          {formatRelativeDate(item.next_occurrence)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <p
                        className={`text-xs font-bold tabular-nums ${
                          isIncome ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(item.amount)}
                      </p>
                      <p className="text-[10px] text-kumbu-400">
                        {frequencyLabels[item.frequency] ?? ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cash Flow Projections */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-sm font-semibold text-kumbu-800">
            Próximas Previsões de Fluxo
          </h2>

          {cashFlowList.length === 0 ? (
            <div className="rounded-2xl border border-kumbu-100 bg-white p-6 text-center space-y-1">
              <p className="text-xs font-medium text-kumbu-600">
                Sem previsões pendentes
              </p>
              <p className="text-[11px] text-kumbu-400">
                As previsões são geradas automaticamente a partir das transacções recorrentes.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-kumbu-100 bg-white divide-y divide-kumbu-50">
              {cashFlowList.slice(0, 8).map((cf, idx) => {
                const isIncome = cf.type === "INCOME" || cf.type === "PROJECT_INCOME";
                return (
                  <div
                    key={cf.recurring_id ?? idx}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-kumbu-900 truncate">
                        {cf.description || "Movimento previsto"}
                      </p>
                      <p className="text-[10px] text-kumbu-400">
                        Previsão: {formatRelativeDate(cf.next_occurrence)}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p
                        className={`text-xs font-bold tabular-nums ${
                          isIncome ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(cf.amount ?? 0)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Planning Guideline */}
          <div className="rounded-2xl border border-kumbu-100 bg-white p-4 space-y-2">
            <p className="text-xs font-semibold text-kumbu-800">
              💡 Princípio de Planeamento
            </p>
            <p className="text-xs text-kumbu-600 leading-relaxed">
              Mantém os teus compromissos fixos abaixo de 50-60% dos teus rendimentos estáveis para teres flexibilidade perante imprevistos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

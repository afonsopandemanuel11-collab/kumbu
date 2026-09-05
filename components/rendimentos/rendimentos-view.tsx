"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils/currency";
import { formatRelativeDate } from "@/lib/utils/date";
import { useQuickAction } from "@/lib/context/quick-action-context";
import type { IncomeByCategory, MonthlySummary } from "@/lib/services/reports";

export type IncomeTransactionItem = {
  id: string;
  amount: number;
  currency: string;
  transaction_date: string;
  description: string | null;
  type: string;
  category?: { name: string; icon: string | null } | null;
  account?: { name: string } | null;
};

type RendimentosViewProps = {
  categoryIncomes: IncomeByCategory[];
  monthSummary: MonthlySummary | null;
  recentIncomes: IncomeTransactionItem[];
};

export function RendimentosView({
  categoryIncomes,
  monthSummary,
  recentIncomes,
}: RendimentosViewProps) {
  const { openQuickRegister } = useQuickAction();

  const totalMonthlyIncome = monthSummary?.income ?? 0;
  const totalAllTimeIncome = useMemo(
    () => categoryIncomes.reduce((acc, curr) => acc + (curr.total ?? 0), 0),
    [categoryIncomes]
  );

  const topCategory = categoryIncomes[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
            Rendimentos
          </h1>
          <p className="mt-0.5 text-sm text-kumbu-500">
            Compreende de onde vem o teu dinheiro e a distribuição das tuas fontes de receita.
          </p>
        </div>
        <Button
          onClick={() => openQuickRegister("INCOME")}
          size="sm"
          className="gap-1.5 self-start bg-emerald-600 hover:bg-emerald-700"
        >
          <Icon name="plus" className="w-4 h-4" />
          Registar Ganho
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-xs space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700">
            Ganhos Este Mês
          </p>
          <p className="text-2xl font-extrabold text-emerald-800 tabular-nums">
            +{formatCurrency(totalMonthlyIncome)}
          </p>
          <p className="text-[11px] text-kumbu-400">
            Total recebido no mês corrente
          </p>
        </div>

        <div className="rounded-3xl border border-kumbu-100 bg-white p-5 shadow-xs space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-kumbu-500">
            Total Acumulado
          </p>
          <p className="text-2xl font-extrabold text-kumbu-900 tabular-nums">
            {formatCurrency(totalAllTimeIncome)}
          </p>
          <p className="text-[11px] text-kumbu-400">
            Histórico de todas as entradas registadas
          </p>
        </div>

        <div className="rounded-3xl border border-kumbu-100 bg-white p-5 shadow-xs space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-kumbu-500">
            Principal Origem
          </p>
          <p className="text-xl font-extrabold text-kumbu-900 truncate">
            {topCategory?.category ?? "Nenhuma ainda"}
          </p>
          <p className="text-[11px] text-kumbu-400">
            {topCategory?.total != null
              ? `${formatCurrency(topCategory.total)} acumulados`
              : "Sem receitas registadas"}
          </p>
        </div>
      </div>

      {/* Main Content */}
      {recentIncomes.length === 0 && categoryIncomes.length === 0 ? (
        <EmptyState
          icon="💰"
          title="Ainda não tens rendimentos registados."
          description="Regista o teu salário, rendimentos de serviços, vendas ou outros ganhos para começar a acompanhar as tuas entradas."
          actionLabel="+ Registar Ganho"
          onAction={() => openQuickRegister("INCOME")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Category Breakdown */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Origens / Categorias</CardTitle>
                <CardDescription>
                  Distribuição acumulada por tipo de receita
                </CardDescription>
              </CardHeader>

              <div className="space-y-4 pt-2">
                {categoryIncomes.map((cat, idx) => {
                  const total = cat.total ?? 0;
                  const pct =
                    totalAllTimeIncome > 0
                      ? Math.round((total / totalAllTimeIncome) * 100)
                      : 0;

                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-kumbu-900">
                          {cat.category ?? "Sem Categoria"}
                        </span>
                        <span className="font-medium text-emerald-700 tabular-nums">
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
            </Card>

            {/* Income Allocation Tip */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                <span>🎯</span>
                <span>Dividir para Conquistar</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Ao receber um novo rendimento, distribui parcelas para despesas essenciais, fundo protegido, lazer e projectos de longo prazo.
              </p>
            </div>
          </div>

          {/* Recent Incomes List */}
          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-sm font-semibold text-kumbu-800">
              Últimas Entradas Registadas
            </h2>

            <div className="overflow-hidden rounded-2xl border border-kumbu-100 bg-white divide-y divide-kumbu-50">
              {recentIncomes.map((inc) => (
                <div
                  key={inc.id}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-kumbu-50/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                      {inc.category?.icon ? inc.category.icon : "💰"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-kumbu-900 truncate">
                        {inc.category?.name ?? "Rendimento"}
                      </p>
                      <p className="text-[11px] text-kumbu-400 truncate">
                        {inc.account?.name ?? "Carteira"}
                        {inc.description ? ` · ${inc.description}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs font-bold text-emerald-700 tabular-nums">
                      +{formatCurrency(inc.amount, inc.currency)}
                    </p>
                    <p className="text-[10px] text-kumbu-400">
                      {formatRelativeDate(inc.transaction_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils/currency";
import { formatRelativeDate } from "@/lib/utils/date";
import { useQuickAction } from "@/lib/context/quick-action-context";
import { createClient } from "@/lib/supabase/client";
import {
  syncAllocationRules,
  resetDefaultAllocationRules,
  DEFAULT_ALLOCATION_RULES,
  type AllocationRule,
} from "@/lib/services/allocation-rules";
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
  initialAllocationRules?: AllocationRule[];
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
  initialAllocationRules = [],
}: PlaneamentoViewProps) {
  const { openQuickRegister } = useQuickAction();

  // Allocation Rules ("Dividir para Conquistar") state
  const [allocationRules, setAllocationRules] = useState<AllocationRule[]>(
    initialAllocationRules.length > 0
      ? initialAllocationRules
      : DEFAULT_ALLOCATION_RULES.map((r, i) => ({ ...r, id: `def-${i}` }))
  );
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [editableRules, setEditableRules] = useState<
    { name: string; percentage: number; color?: string; icon?: string }[]
  >([]);
  const [savingRules, setSavingRules] = useState(false);
  const [rulesMessage, setRulesMessage] = useState<string | null>(null);

  // Simulator income input
  const defaultSimAmount = monthSummary?.income && monthSummary.income > 0 ? monthSummary.income : 250000;
  const [simulatedIncome, setSimulatedIncome] = useState<string>(defaultSimAmount.toString());

  const handleStartEditRules = () => {
    setEditableRules(
      allocationRules.map((r) => ({
        name: r.name,
        percentage: r.percentage,
        color: r.color,
        icon: r.icon,
      }))
    );
    setIsEditingRules(true);
    setRulesMessage(null);
  };

  const handleRulePercentageChange = (index: number, val: string) => {
    const num = Math.max(0, Math.min(100, parseFloat(val) || 0));
    setEditableRules((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], percentage: num };
      return next;
    });
  };

  const handleRuleNameChange = (index: number, val: string) => {
    setEditableRules((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name: val };
      return next;
    });
  };

  const totalPercentage = useMemo(() => {
    return editableRules.reduce((sum, r) => sum + (r.percentage || 0), 0);
  }, [editableRules]);

  const handleSaveRules = async () => {
    if (totalPercentage !== 100) {
      setRulesMessage(`O total das percentagens deve ser exactamente 100%. Actualmente está em ${totalPercentage}%.`);
      return;
    }

    setSavingRules(true);
    setRulesMessage(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão não iniciada");

      const saved = await syncAllocationRules(supabase, user.id, editableRules);
      setAllocationRules(saved);
      setIsEditingRules(false);
      setRulesMessage("Regras de alocação guardadas com sucesso!");
      setTimeout(() => setRulesMessage(null), 4000);
    } catch (err: unknown) {
      setRulesMessage(err instanceof Error ? err.message : "Erro ao guardar as regras.");
    } finally {
      setSavingRules(false);
    }
  };

  const handleResetRules = async () => {
    if (!confirm("Desejas repor as percentagens recomendadas do método 'Dividir para Conquistar'?")) return;
    setSavingRules(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão não iniciada");

      const reset = await resetDefaultAllocationRules(supabase, user.id);
      setAllocationRules(reset);
      setIsEditingRules(false);
      setRulesMessage("Percentagens padrão restauradas.");
      setTimeout(() => setRulesMessage(null), 4000);
    } catch (err: unknown) {
      setRulesMessage(err instanceof Error ? err.message : "Erro ao restaurar regras.");
    } finally {
      setSavingRules(false);
    }
  };

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
        <div className="flex flex-wrap items-center gap-2">
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

      {/* Estratégia: Dividir para Conquistar (Allocation Rules) */}
      <Card className="border-kumbu-100 bg-white p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <h2 className="text-sm font-bold text-kumbu-900">
                Estratégia: Dividir para Conquistar
              </h2>
              <Badge variant="default" size="sm">
                Alocação Inteligente
              </Badge>
            </div>
            <p className="text-xs text-kumbu-500 mt-0.5">
              Define a proporção ideal para cada kwanza que entra, distribuindo automaticamente o teu dinheiro antes de o gastares.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditingRules ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleStartEditRules}
                className="text-xs gap-1.5"
              >
                <Icon name="settings" className="w-3.5 h-3.5" />
                Personalizar Regras
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingRules(false)}
                className="text-xs"
              >
                Cancelar Edição
              </Button>
            )}
          </div>
        </div>

        {rulesMessage && (
          <div
            className={`rounded-xl p-3 text-xs border ${
              rulesMessage.includes("sucesso") || rulesMessage.includes("restauradas")
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {rulesMessage}
          </div>
        )}

        {/* Multi-segment allocation progress bar */}
        <div className="space-y-2">
          <div className="h-3 w-full overflow-hidden rounded-full flex bg-kumbu-100">
            {allocationRules.map((rule, idx) => (
              <div
                key={rule.id ?? idx}
                style={{ width: `${rule.percentage}%` }}
                className={`h-full transition-all duration-300 ${rule.color || "bg-kumbu-600"}`}
                title={`${rule.name}: ${rule.percentage}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-kumbu-600">
            {allocationRules.map((rule, idx) => (
              <div key={rule.id ?? idx} className="flex items-center gap-1.5">
                <span className="text-xs">{rule.icon || "•"}</span>
                <span className="font-semibold text-kumbu-800">{rule.name}</span>
                <span className="text-kumbu-500 font-bold">({rule.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {!isEditingRules ? (
          /* Simulator View */
          <div className="rounded-2xl border border-kumbu-100 bg-kumbu-50/50 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-kumbu-900">
                  Simulador de Distribuição Imediata
                </p>
                <p className="text-[11px] text-kumbu-500">
                  Insere um valor que pretendes receber para ver como deve ser dividido.
                </p>
              </div>
              <div className="flex items-center gap-2 max-w-xs">
                <span className="text-xs text-kumbu-500 whitespace-nowrap">Receita:</span>
                <Input
                  type="number"
                  value={simulatedIncome}
                  onChange={(e) => setSimulatedIncome(e.target.value)}
                  className="h-8 text-xs bg-white w-32 font-bold tabular-nums text-right"
                />
                <span className="text-xs font-semibold text-kumbu-600">Kz</span>
              </div>
            </div>

            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {(() => {
                const baseVal = parseFloat(simulatedIncome) || 0;
                return allocationRules.map((rule, idx) => {
                  const part = Math.round((baseVal * rule.percentage) / 100);
                  return (
                    <div
                      key={rule.id ?? idx}
                      className="rounded-xl border border-white bg-white p-3 shadow-2xs space-y-1"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{rule.icon || "💰"}</span>
                        <p className="text-[11px] font-semibold text-kumbu-900 truncate">
                          {rule.name}
                        </p>
                      </div>
                      <p className="text-sm font-extrabold text-kumbu-900 tabular-nums">
                        {formatCurrency(part)}
                      </p>
                      <p className="text-[10px] text-kumbu-400">
                        {rule.percentage}% do montante
                      </p>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        ) : (
          /* Edit Rules Form */
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-kumbu-900">
                Ajustar Percentagens de Alocação
              </p>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  totalPercentage === 100
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                Total: {totalPercentage}% {totalPercentage === 100 ? "✓ Válido" : "(deve totalizar 100%)"}
              </span>
            </div>

            <div className="space-y-3">
              {editableRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-3 items-center bg-white p-2.5 rounded-xl border border-kumbu-100"
                >
                  <div className="col-span-1 flex justify-center text-base">
                    {rule.icon || "💰"}
                  </div>
                  <div className="col-span-7 sm:col-span-8">
                    <Input
                      value={rule.name}
                      onChange={(e) => handleRuleNameChange(idx, e.target.value)}
                      className="h-8 text-xs"
                      placeholder="Nome do destino"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-3 flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={rule.percentage}
                      onChange={(e) => handleRulePercentageChange(idx, e.target.value)}
                      className="h-8 text-xs font-bold text-right"
                    />
                    <span className="text-xs font-bold text-kumbu-600">%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetRules}
                disabled={savingRules}
                className="text-xs text-kumbu-600"
              >
                Restaurar Padrão
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditingRules(false)}
                  disabled={savingRules}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveRules}
                  disabled={savingRules || totalPercentage !== 100}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {savingRules ? "A guardar..." : "Guardar Regras"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

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

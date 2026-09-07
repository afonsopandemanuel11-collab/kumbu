"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { BudgetModal } from "@/components/budgets/budget-modal";
import type {
  Budget,
  BudgetVsActual,
  RecurringTransaction,
  CashFlowProjection,
  BudgetPeriodType,
} from "@/lib/services/budgets";
import type { Category } from "@/lib/services/categories";
import type { Account } from "@/lib/services/accounts";

type BudgetsViewProps = {
  initialBudgets: Budget[];
  budgetVsActualList: BudgetVsActual[];
  recurringList: RecurringTransaction[];
  cashFlowList: CashFlowProjection[];
  categories: Category[];
  accounts: Account[];
  userId: string;
};

const periodLabels: Record<BudgetPeriodType, string> = {
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
  YEARLY: "Anual",
};

export function BudgetsView({
  initialBudgets,
  budgetVsActualList,
  recurringList,
  cashFlowList,
  categories,
  accounts,
  userId,
}: BudgetsViewProps) {
  const [activeTab, setActiveTab] = useState<"BUDGETS" | "RECURRING">("BUDGETS");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  function handleCreate() {
    setEditingBudget(null);
    setModalOpen(true);
  }

  function handleEdit(budget: Budget) {
    setEditingBudget(budget);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
            Orçamentos & Planeamento
          </h1>
          <p className="mt-0.5 text-sm text-kumbu-500">
            Define limites de gastos por categoria e antecipa o teu fluxo de caixa.
          </p>
        </div>
        {activeTab === "BUDGETS" && (
          <Button onClick={handleCreate} size="sm" className="gap-1.5 self-start">
            <Icon name="plus" className="w-4 h-4" />
            Definir Orçamento
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-kumbu-100">
        <button
          type="button"
          onClick={() => setActiveTab("BUDGETS")}
          className={`pb-2.5 text-sm font-semibold transition-colors ${
            activeTab === "BUDGETS"
              ? "border-b-2 border-kumbu-700 text-kumbu-900"
              : "text-kumbu-400 hover:text-kumbu-700"
          }`}
        >
          Orçamentos Activos
          <span className="ml-1.5 text-[11px] text-kumbu-400">
            ({initialBudgets.length})
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("RECURRING")}
          className={`pb-2.5 text-sm font-semibold transition-colors ${
            activeTab === "RECURRING"
              ? "border-b-2 border-kumbu-700 text-kumbu-900"
              : "text-kumbu-400 hover:text-kumbu-700"
          }`}
        >
          Recorrências & Projecções
          <span className="ml-1.5 text-[11px] text-kumbu-400">
            ({recurringList.length})
          </span>
        </button>
      </div>

      {/* Orçamentos Tab */}
      {activeTab === "BUDGETS" && (
        <>
          {initialBudgets.length === 0 ? (
            <EmptyState
              icon="📊"
              title="Ainda não tens nenhum orçamento definido."
              description="Define um limite de despesas para categorias como Alimentação, Lazer ou Transportes para manter o teu controlo financeiro."
              actionLabel="+ Definir primeiro orçamento"
              onAction={handleCreate}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {initialBudgets.map((b) => {
                const vsActual = budgetVsActualList.find((va) => va.budget_id === b.id);
                const actual = vsActual?.actual_expense ?? 0;
                const limit = b.amount;
                const percentage = limit > 0 ? Math.round((actual / limit) * 100) : 0;
                const available = limit - actual;

                const category = categories.find((c) => c.id === b.category_id);
                const title = category?.name ?? "Todas as Despesas";
                const icon = category?.icon ?? "📁";

                let progressColor = "bg-emerald-600";
                let badgeVariant: "success" | "warning" | "danger" = "success";

                if (percentage >= 100) {
                  progressColor = "bg-rose-600";
                  badgeVariant = "danger";
                } else if (percentage >= 75) {
                  progressColor = "bg-amber-500";
                  badgeVariant = "warning";
                }

                return (
                  <div
                    key={b.id}
                    className="flex flex-col justify-between rounded-2xl border border-kumbu-100 bg-white p-5 space-y-4 hover:border-kumbu-200 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-kumbu-50 text-xl">
                            {icon}
                          </span>
                          <div>
                            <h3 className="font-semibold text-kumbu-900">{title}</h3>
                            <p className="text-xs text-kumbu-400">
                              {periodLabels[b.period_type]} · {formatDate(b.start_date)} até {formatDate(b.end_date)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={badgeVariant} size="sm">
                          {percentage}% Usado
                        </Badge>
                      </div>

                      {/* Progress & Numbers */}
                      <div className="mt-4 space-y-2">
                        <div className="flex flex-wrap items-baseline justify-between gap-1">
                          <p className="text-base font-extrabold text-kumbu-900 tabular-nums">
                            {formatCurrency(actual)}
                            <span className="text-xs font-normal text-kumbu-400 ml-1">
                              / {formatCurrency(limit)}
                            </span>
                          </p>
                          <span
                            className={`text-xs font-semibold tabular-nums ${
                              available >= 0 ? "text-emerald-700" : "text-rose-700"
                            }`}
                          >
                            {available >= 0
                              ? `${formatCurrency(available)} disponíveis`
                              : `Excedido em ${formatCurrency(Math.abs(available))}`}
                          </span>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-kumbu-100">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end border-t border-kumbu-50 pt-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(b)}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium text-kumbu-400 hover:bg-kumbu-50 hover:text-kumbu-700 transition-colors"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Recorrências & Projecções Tab */}
      {activeTab === "RECURRING" && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-kumbu-800">
            Próximas Transacções Previstas (Fluxo de Caixa)
          </h2>
          {cashFlowList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-kumbu-200 p-8 text-center text-xs text-kumbu-400">
              Não existem transacções recorrentes programadas no momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {cashFlowList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-2xl border border-kumbu-100 bg-white p-4"
                >
                  <div>
                    <p className="text-xs font-semibold text-kumbu-900">
                      {item.description || "Transacção Recorrente"}
                    </p>
                    <p className="text-[11px] text-kumbu-400">
                      Próxima data: {formatDate(item.next_occurrence)}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-bold tabular-nums ${
                      item.type === "INCOME" ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {item.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <BudgetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        budgetToEdit={editingBudget}
        categories={categories}
        accounts={accounts}
        userId={userId}
      />
    </div>
  );
}

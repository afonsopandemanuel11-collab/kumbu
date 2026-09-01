"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { BudgetModal } from "@/components/budgets/budget-modal";
import type { Budget, BudgetVsActual, RecurringTransaction, CashFlowProjection, BudgetPeriodType } from "@/lib/services/budgets";
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
            Or�amentos & Planeamento
          </h1>
          <p className="mt-0.5 text-sm text-kumbu-500">
            Define limites de gastos por categoria e antecipa o teu fluxo de caixa.
          </p>
        </div>
        {activeTab === "BUDGETS" && (
          <Button onClick={handleCreate} className="gap-1.5 self-start sm:self-auto">
            <span>+</span> Definir Or�amento
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-kumbu-100 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("BUDGETS")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === "BUDGETS"
              ? "border-b-2 border-kumbu-900 text-kumbu-900"
              : "text-kumbu-500 hover:text-kumbu-800"
          }`}
        >
          Or�amentos Activos ({initialBudgets.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("RECURRING")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === "RECURRING"
              ? "border-b-2 border-kumbu-900 text-kumbu-900"
              : "text-kumbu-500 hover:text-kumbu-800"
          }`}
        >
          Recorr�ncias & Proje��es ({recurringList.length})
        </button>
      </div>

      {/* Or�amentos Tab */}
      {activeTab === "BUDGETS" && (
        <>
          {initialBudgets.length === 0 ? (
            <EmptyState
              title="Ainda n�o tens nenhum or�amento definido."
              description="Define um limite de despesas para categorias como Alimenta��o, Lazer ou Transportes para manter o teu controlo financeiro."
              actionLabel="+ Definir primeiro or�amento"
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
                const icon = category?.icon ?? "??";

                let progressColor = "bg-emerald-600";
                let badgeVariant: "success" | "warning" | "danger" = "success";

                if (percentage >= 100) {
                  progressColor = "bg-rose-600";
                  badgeVariant = "danger";
                } else if (percentage >= 75) {
                  progressColor = "bg-amber-600";
                  badgeVariant = "warning";
                }

                return (
                  <Card
                    key={b.id}
                    className="flex flex-col justify-between space-y-4 transition-all hover:border-kumbu-300"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{icon}</span>
                          <div>
                            <h3 className="font-bold text-kumbu-900">{title}</h3>
                            <p className="text-xs text-kumbu-500">
                              {periodLabels[b.period_type]} � {formatDate(b.start_date)} at� {formatDate(b.end_date)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={badgeVariant} size="sm">
                          {percentage}% Usado
                        </Badge>
                      </div>

                      {/* Progress & Numbers */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-baseline justify-between">
                          <p className="text-sm font-extrabold text-kumbu-900">
                            {formatCurrency(actual)}
                            <span className="text-xs font-normal text-kumbu-500 ml-1">
                              / {formatCurrency(limit)}
                            </span>
                          </p>
                          <span className={`text-xs font-bold ${available >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                            {available >= 0 ? `${formatCurrency(available)} dispon�veis` : `Excedido em ${formatCurrency(Math.abs(available))}`}
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
                        className="rounded-lg px-2.5 py-1 text-xs font-medium text-kumbu-500 hover:bg-kumbu-50 hover:text-kumbu-900"
                      >
                        Editar
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Recorr�ncias & Proje��es Tab */}
      {activeTab === "RECURRING" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-kumbu-900">
              Pr�ximas Transac��es Previstas (Fluxo de Caixa)
            </h2>
            {cashFlowList.length === 0 ? (
              <Card className="p-6 text-center text-xs text-kumbu-500">
                N�o existem transac��es recorrentes programadas no momento.
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {cashFlowList.map((item, idx) => (
                  <Card key={idx} className="flex items-center justify-between p-3.5">
                    <div>
                      <p className="text-xs font-bold text-kumbu-900">
                        {item.description || "Transac��o Recorrente"}
                      </p>
                      <p className="text-[11px] text-kumbu-400">
                        Pr�xima data: {formatDate(item.next_occurrence)}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-bold ${
                        item.type === "INCOME" ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {item.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(item.amount)}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
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

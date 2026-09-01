"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { GoalModal } from "@/components/goals/goal-modal";
import { ContributeGoalModal } from "@/components/goals/contribute-goal-modal";
import type { Goal, GoalProgress, GoalPriority, GoalStatus } from "@/lib/services/goals";
import type { Account } from "@/lib/services/accounts";

type GoalsViewProps = {
  initialGoals: Goal[];
  progressList: GoalProgress[];
  accounts: Account[];
  userId: string;
};

const priorityBadges: Record<GoalPriority, { label: string; variant: "default" | "success" | "danger" | "warning" | "info" | "neutral" }> = {
  LOW: { label: "Baixa", variant: "neutral" },
  MEDIUM: { label: "M�dia", variant: "info" },
  HIGH: { label: "Alta", variant: "warning" },
};

const statusBadges: Record<GoalStatus, { label: string; variant: "default" | "success" | "danger" | "warning" | "info" | "neutral" }> = {
  ACTIVE: { label: "Em Progresso", variant: "info" },
  COMPLETED: { label: "Conclu�da", variant: "success" },
  PAUSED: { label: "Pausada", variant: "neutral" },
  CANCELLED: { label: "Cancelada", variant: "danger" },
};

export function GoalsView({
  initialGoals,
  progressList,
  accounts,
  userId,
}: GoalsViewProps) {
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const totalSaved = initialGoals.reduce((sum, g) => sum + (g.current_amount ?? 0), 0);
  const totalTarget = initialGoals.reduce((sum, g) => sum + (g.target_amount ?? 0), 0);
  const overallPercentage = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  function handleCreate() {
    setSelectedGoal(null);
    setGoalModalOpen(true);
  }

  function handleEdit(goal: Goal) {
    setSelectedGoal(goal);
    setGoalModalOpen(true);
  }

  function handleContribute(goal: Goal) {
    setSelectedGoal(goal);
    setContributeModalOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
            Metas de Poupan�a
          </h1>
          <p className="mt-0.5 text-sm text-kumbu-500">
            Define sonhos financeiros e acompanha o teu progresso at� os alcan�ar.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-1.5 self-start sm:self-auto">
          <span>+</span> Criar Meta
        </Button>
      </div>

      {initialGoals.length > 0 && (
        <div className="rounded-3xl border border-kumbu-100 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-kumbu-400">
                Total Poupado em Metas
              </p>
              <p className="mt-1 text-2xl font-extrabold text-kumbu-900">
                {formatCurrency(totalSaved)}
                <span className="text-xs font-normal text-kumbu-500 ml-2">
                  de {formatCurrency(totalTarget)}
                </span>
              </p>
            </div>
            <span className="text-xl font-bold text-kumbu-800">{overallPercentage}%</span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-kumbu-100">
            <div
              className="h-full rounded-full bg-kumbu-600 transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Goal List or Empty State */}
      {initialGoals.length === 0 ? (
        <EmptyState
          title="Ainda n�o tens nenhuma meta."
          description="Cria uma meta para come�ar a poupar para uma viagem, reserva de emerg�ncia ou compra importante."
          actionLabel="+ Criar meta"
          onAction={handleCreate}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {initialGoals.map((goal) => {
            const prog = progressList.find((p) => p.goal_id === goal.id);
            const percentage =
              prog?.progress_percentage ??
              (goal.target_amount > 0
                ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
                : 0);
            const remaining = Math.max(0, goal.target_amount - goal.current_amount);
            const prioBadge = priorityBadges[goal.priority] ?? priorityBadges.MEDIUM;
            const statBadge = statusBadges[goal.status] ?? statusBadges.ACTIVE;

            return (
              <Card
                key={goal.id}
                className="flex flex-col justify-between space-y-4 transition-all hover:border-kumbu-300"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">??</span>
                      <div>
                        <h3 className="font-bold text-kumbu-900">{goal.name}</h3>
                        {goal.description && (
                          <p className="text-xs text-kumbu-500 line-clamp-1">
                            {goal.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <Badge variant={prioBadge.variant} size="sm">
                        {prioBadge.label}
                      </Badge>
                      <Badge variant={statBadge.variant} size="sm">
                        {statBadge.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Numbers & Progress Bar */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm font-extrabold text-kumbu-900">
                        {formatCurrency(goal.current_amount, goal.currency)}
                        <span className="text-xs font-normal text-kumbu-500 ml-1">
                          / {formatCurrency(goal.target_amount, goal.currency)}
                        </span>
                      </p>
                      <span className="text-sm font-bold text-kumbu-700">{percentage}%</span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-kumbu-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentage >= 100 ? "bg-emerald-600" : "bg-kumbu-600"
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-kumbu-500">
                      {remaining > 0
                        ? `Faltam ${formatCurrency(remaining, goal.currency)}`
                        : "? Meta atingida com sucesso!"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-kumbu-50 pt-3 text-xs">
                  <span className="text-kumbu-400">
                    {goal.deadline ? `Prazo: ${formatDate(goal.deadline)}` : "Sem prazo definido"}
                  </span>
                  <div className="flex gap-2">
                    {goal.status === "ACTIVE" && (
                      <Button
                        size="sm"
                        onClick={() => handleContribute(goal)}
                        className="h-8 text-xs py-1"
                      >
                        + Poupar
                      </Button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleEdit(goal)}
                      className="rounded-lg px-2.5 py-1 font-medium text-kumbu-500 hover:bg-kumbu-50 hover:text-kumbu-900"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        goalToEdit={selectedGoal}
        accounts={accounts}
        userId={userId}
      />

      <ContributeGoalModal
        isOpen={contributeModalOpen}
        onClose={() => setContributeModalOpen(false)}
        goal={selectedGoal}
        accounts={accounts}
      />
    </div>
  );
}

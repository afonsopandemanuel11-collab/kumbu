"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icons";
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

const priorityBadges: Record<
  GoalPriority,
  { label: string; variant: "default" | "success" | "danger" | "warning" | "info" | "neutral" }
> = {
  LOW: { label: "Baixa", variant: "neutral" },
  MEDIUM: { label: "Média", variant: "info" },
  HIGH: { label: "Alta", variant: "warning" },
};

const statusLabels: Record<GoalStatus, string> = {
  ACTIVE: "Em progresso",
  COMPLETED: "Concluída",
  PAUSED: "Pausada",
  CANCELLED: "Cancelada",
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

  const totalSaved = initialGoals.reduce(
    (sum, g) => sum + (g.current_amount ?? 0),
    0,
  );
  const totalTarget = initialGoals.reduce(
    (sum, g) => sum + (g.target_amount ?? 0),
    0,
  );
  const overallPct =
    totalTarget > 0
      ? Math.min(100, Math.round((totalSaved / totalTarget) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
            Metas de Poupança
          </h1>
          <p className="mt-0.5 text-sm text-kumbu-500">
            Define sonhos financeiros e acompanha o teu progresso.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedGoal(null);
            setGoalModalOpen(true);
          }}
          size="sm"
          className="gap-1.5 self-start"
        >
          <Icon name="plus" className="w-4 h-4" />
          Criar Meta
        </Button>
      </div>

      {/* Overall progress banner */}
      {initialGoals.length > 0 && (
        <div className="rounded-2xl border border-kumbu-100 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-kumbu-400">
                Total Poupado em Metas
              </p>
              <p className="mt-1 text-2xl font-extrabold text-kumbu-900 tabular-nums">
                {formatCurrency(totalSaved)}
                <span className="text-sm font-normal text-kumbu-400 ml-2">
                  de {formatCurrency(totalTarget)}
                </span>
              </p>
            </div>
            <span className="text-xl font-bold text-kumbu-700">
              {overallPct}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-kumbu-100">
            <div
              className="h-full rounded-full bg-kumbu-600 animate-progress"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Goals list */}
      {initialGoals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="Ainda não tens nenhuma meta."
          description="Cria uma meta para começar a poupar para uma viagem, reserva de emergência ou compra importante."
          actionLabel="+ Criar meta"
          onAction={() => setGoalModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {initialGoals.map((goal) => {
            const prog = progressList.find((p) => p.goal_id === goal.id);
            const pct =
              prog?.progress_percentage ??
              (goal.target_amount > 0
                ? Math.min(
                    100,
                    Math.round(
                      (goal.current_amount / goal.target_amount) * 100,
                    ),
                  )
                : 0);
            const remaining = Math.max(
              0,
              goal.target_amount - goal.current_amount,
            );
            const prioBadge =
              priorityBadges[goal.priority] ?? priorityBadges.MEDIUM;
            const isComplete = goal.status === "COMPLETED" || pct >= 100;
            const isActive = goal.status === "ACTIVE";

            const barColor = isComplete
              ? "bg-emerald-500"
              : pct >= 75
              ? "bg-amber-500"
              : "bg-kumbu-600";

            return (
              <div
                key={goal.id}
                className="rounded-2xl border border-kumbu-100 bg-white p-5 space-y-4 hover:border-kumbu-200 transition-colors"
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-kumbu-900">{goal.name}</p>
                    {goal.description && (
                      <p className="text-xs text-kumbu-400 line-clamp-1 mt-0.5">
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Badge variant={prioBadge.variant} size="sm">
                      {prioBadge.label}
                    </Badge>
                  </div>
                </div>

                {/* Numbers */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <p className="text-base font-extrabold text-kumbu-900 tabular-nums">
                      {formatCurrency(goal.current_amount, goal.currency)}
                      <span className="text-xs font-normal text-kumbu-400 ml-1">
                        / {formatCurrency(goal.target_amount, goal.currency)}
                      </span>
                    </p>
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        isComplete ? "text-emerald-700" : "text-kumbu-700"
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-kumbu-100">
                    <div
                      className={`h-full rounded-full animate-progress ${barColor}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-kumbu-400">
                    {remaining > 0
                      ? `Faltam ${formatCurrency(remaining, goal.currency)}`
                      : "✓ Meta atingida!"}
                    {goal.deadline
                      ? ` · Prazo: ${formatDate(goal.deadline)}`
                      : ""}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-kumbu-50 pt-3">
                  <Link
                    href={`/metas/${goal.id}`}
                    className="font-semibold text-kumbu-700 hover:text-kumbu-900 transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <span>Ver detalhes</span>
                    <Icon name="chevron-right" className="w-3 h-3" />
                  </Link>
                  <div className="flex gap-2">
                    {isActive && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedGoal(goal);
                          setContributeModalOpen(true);
                        }}
                        className="h-8 text-xs px-3 gap-1"
                      >
                        <Icon name="plus" className="w-3.5 h-3.5" />
                        Poupar
                      </Button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGoal(goal);
                        setGoalModalOpen(true);
                      }}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium text-kumbu-400 hover:bg-kumbu-50 hover:text-kumbu-700 transition-colors"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

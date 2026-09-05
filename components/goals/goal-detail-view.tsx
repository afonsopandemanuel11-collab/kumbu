"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate, formatRelativeDate } from "@/lib/utils/date";
import { GoalModal } from "@/components/goals/goal-modal";
import { ContributeGoalModal } from "@/components/goals/contribute-goal-modal";
import type { Goal, GoalProgress, GoalPriority, GoalStatus } from "@/lib/services/goals";
import type { Account } from "@/lib/services/accounts";

type GoalContribution = {
  id: string;
  amount: number;
  currency: string;
  transaction_date: string;
  description: string | null;
  accounts?: { name: string } | null;
};

type GoalDetailViewProps = {
  goal: Goal;
  progress: GoalProgress | null;
  contributions: GoalContribution[];
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

export function GoalDetailView({
  goal,
  progress,
  contributions,
  accounts,
  userId,
}: GoalDetailViewProps) {
  const router = useRouter();
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);

  const target = goal.target_amount ?? 0;
  const current = goal.current_amount ?? 0;
  const remaining = Math.max(0, target - current);
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const isComplete = goal.status === "COMPLETED" || pct >= 100;
  const prioBadge = priorityBadges[goal.priority] ?? priorityBadges.MEDIUM;

  // Pace calculation (Prompt Item 19)
  const paceInfo = (() => {
    if (!goal.deadline) return null;
    const deadlineDate = new Date(goal.deadline);
    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { status: "EXPIRED", label: "Prazo ultrapassado" };
    }

    if (remaining <= 0) {
      return { status: "REACHED", label: "Meta atingida!" };
    }

    const monthsLeft = Math.max(1, diffDays / 30.4);
    const monthlyPace = Math.ceil(remaining / monthsLeft);
    const weeksLeft = Math.max(1, diffDays / 7);
    const weeklyPace = Math.ceil(remaining / weeksLeft);

    return {
      status: "ACTIVE",
      diffDays,
      monthlyPace,
      weeklyPace,
    };
  })();

  return (
    <div className="space-y-6">
      {/* Navigation header */}
      <div className="flex items-center gap-2 text-xs font-semibold text-kumbu-500">
        <Link
          href="/metas"
          className="hover:text-kumbu-900 transition-colors flex items-center gap-1"
        >
          <span>←</span>
          <span>Todas as Metas</span>
        </Link>
        <span>/</span>
        <span className="text-kumbu-900">{goal.name}</span>
      </div>

      {/* Main Goal Card */}
      <div className="rounded-3xl border border-kumbu-100 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl shrink-0">
              🎯
            </span>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
                  {goal.name}
                </h1>
                <Badge variant={prioBadge.variant} size="sm">
                  Prioridade {prioBadge.label}
                </Badge>
                <Badge variant={isComplete ? "success" : "default"} size="sm">
                  {statusLabels[goal.status]}
                </Badge>
              </div>
              {goal.description && (
                <p className="mt-1 text-sm text-kumbu-500 leading-relaxed">
                  {goal.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setGoalModalOpen(true)}
              className="text-xs"
            >
              Editar
            </Button>
            {goal.status === "ACTIVE" && (
              <Button
                size="sm"
                onClick={() => setContributeModalOpen(true)}
                className="gap-1.5 text-xs bg-kumbu-600 hover:bg-kumbu-700"
              >
                <Icon name="plus" className="w-3.5 h-3.5" />
                Poupar para esta Meta
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar & Numbers */}
        <div className="rounded-2xl border border-kumbu-100 bg-kumbu-50/50 p-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs text-kumbu-500">Montante acumulado</p>
              <p className="text-2xl font-extrabold text-kumbu-900 tabular-nums">
                {formatCurrency(current, goal.currency)}
                <span className="text-sm font-normal text-kumbu-400 ml-2">
                  de {formatCurrency(target, goal.currency)}
                </span>
              </p>
            </div>
            <div className="text-right">
              <span
                className={`text-xl font-extrabold tabular-nums ${
                  isComplete ? "text-emerald-700" : "text-kumbu-700"
                }`}
              >
                {pct}%
              </span>
            </div>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-kumbu-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isComplete ? "bg-emerald-500" : "bg-kumbu-600"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-kumbu-500 pt-0.5">
            <span>
              {remaining > 0
                ? `Faltam ${formatCurrency(remaining, goal.currency)}`
                : "✓ Objectivo 100% concluído!"}
            </span>
            <span>
              {goal.deadline
                ? `Prazo: ${formatDate(goal.deadline)}`
                : "Sem data limite"}
            </span>
          </div>
        </div>
      </div>

      {/* Pace Recommendation (Ritmo Necessário) */}
      {paceInfo && paceInfo.status === "ACTIVE" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="text-xs font-bold text-amber-950">
                Ritmo Necessário para Cumprir o Prazo
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                Restam <strong>{paceInfo.diffDays} dias</strong> até ao prazo final ({formatDate(goal.deadline!)}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-amber-200/60">
            <div>
              <p className="text-[10px] text-amber-700 uppercase tracking-wide">
                Por Mês
              </p>
              <p className="text-sm font-extrabold text-amber-950 tabular-nums">
                {formatCurrency(paceInfo.monthlyPace, goal.currency)}
              </p>
            </div>
            <div className="h-8 w-px bg-amber-200" />
            <div>
              <p className="text-[10px] text-amber-700 uppercase tracking-wide">
                Por Semana
              </p>
              <p className="text-sm font-extrabold text-amber-950 tabular-nums">
                {formatCurrency(paceInfo.weeklyPace, goal.currency)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contribution History (Prompt Item 20) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-kumbu-800">
            Histórico de Contribuições ({contributions.length})
          </h2>
          {goal.status === "ACTIVE" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setContributeModalOpen(true)}
              className="text-xs"
            >
              + Nova Contribuição
            </Button>
          )}
        </div>

        {contributions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-kumbu-200 bg-white p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-kumbu-800">
              Ainda não tens contribuições registadas para esta meta.
            </p>
            <p className="text-xs text-kumbu-400">
              Cada quantia que poupares ficará gravada aqui, transformando o teu sonho num plano visual.
            </p>
            <div className="pt-2">
              <Button
                size="sm"
                onClick={() => setContributeModalOpen(true)}
              >
                + Fazer Primeira Contribuição
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-kumbu-100 bg-white divide-y divide-kumbu-50">
            {contributions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-kumbu-50/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 font-bold text-sm shrink-0">
                    🎯
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-kumbu-900 truncate">
                      {tx.description || "Aporte para meta"}
                    </p>
                    <p className="text-[11px] text-kumbu-400 truncate">
                      {tx.accounts?.name ? `Origem: ${tx.accounts.name}` : "Carteira"}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs font-bold text-emerald-700 tabular-nums">
                    +{formatCurrency(tx.amount, tx.currency)}
                  </p>
                  <p className="text-[10px] text-kumbu-400">
                    {formatRelativeDate(tx.transaction_date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => {
          setGoalModalOpen(false);
          router.refresh();
        }}
        goalToEdit={goal}
        accounts={accounts}
        userId={userId}
      />
      <ContributeGoalModal
        isOpen={contributeModalOpen}
        onClose={() => {
          setContributeModalOpen(false);
          router.refresh();
        }}
        goal={goal}
        accounts={accounts}
      />
    </div>
  );
}

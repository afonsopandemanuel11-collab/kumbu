"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate, formatRelativeDate } from "@/lib/utils/date";
import { useQuickAction } from "@/lib/context/quick-action-context";
import { ProjectModal } from "@/components/projects/project-modal";
import type {
  Project,
  ProjectSummary,
  ProjectDailyActivity,
  ProjectStatus,
} from "@/lib/services/projects";
import type { Account } from "@/lib/services/accounts";

type ProjectTransaction = {
  id: string;
  amount: number;
  currency: string;
  transaction_date: string;
  description: string | null;
  type: string;
  categories?: { name: string; icon: string | null } | null;
  accounts?: { name: string } | null;
};

type ProjectDetailViewProps = {
  project: Project;
  summary: ProjectSummary | null;
  dailyActivities: ProjectDailyActivity[];
  transactions: ProjectTransaction[];
  accounts: Account[];
  userId: string;
};

const statusBadges: Record<
  ProjectStatus,
  {
    label: string;
    variant: "default" | "success" | "danger" | "warning" | "info" | "neutral";
  }
> = {
  PLANNED: { label: "Planeado", variant: "neutral" },
  ACTIVE: { label: "Activo", variant: "success" },
  PAUSED: { label: "Pausado", variant: "warning" },
  COMPLETED: { label: "Concluído", variant: "info" },
  CANCELLED: { label: "Cancelado", variant: "danger" },
};

export function ProjectDetailView({
  project,
  summary,
  dailyActivities,
  transactions,
  accounts,
  userId,
}: ProjectDetailViewProps) {
  const router = useRouter();
  const { openQuickRegister } = useQuickAction();
  const [modalOpen, setModalOpen] = useState(false);

  const income = summary?.income ?? 0;
  const expense = summary?.expense ?? 0;
  const netResult = summary?.result ?? income - expense;
  const budget = project.budget ?? 0;

  // Budget calculations
  const remainingBudget = budget > 0 ? budget - expense : 0;
  const budgetProgress =
    budget > 0 ? Math.min(100, Math.round((expense / budget) * 100)) : 0;
  const isOverBudget = budget > 0 && expense > budget;

  const badge = statusBadges[project.status] ?? statusBadges.ACTIVE;

  return (
    <div className="space-y-6">
      {/* Navigation header */}
      <div className="flex items-center gap-2 text-xs font-semibold text-kumbu-500">
        <Link
          href="/projectos"
          className="hover:text-kumbu-900 transition-colors flex items-center gap-1"
        >
          <span>←</span>
          <span>Todos os Projectos</span>
        </Link>
        <span>/</span>
        <span className="text-kumbu-900">{project.name}</span>
      </div>

      {/* Main Project Header Card */}
      <div className="rounded-3xl border border-kumbu-100 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kumbu-50 text-2xl shrink-0">
              🚀
            </span>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
                  {project.name}
                </h1>
                <Badge variant={badge.variant} size="sm">
                  {badge.label}
                </Badge>
              </div>
              {project.description && (
                <p className="mt-1 text-sm text-kumbu-500 leading-relaxed">
                  {project.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-4 text-xs text-kumbu-400 flex-wrap">
                {project.start_date && (
                  <span>Início: {formatDate(project.start_date)}</span>
                )}
                {project.end_date && (
                  <span>Conclusão: {formatDate(project.end_date)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setModalOpen(true)}
              className="text-xs"
            >
              Editar
            </Button>
            <Button
              size="sm"
              onClick={() => openQuickRegister("PROJECT")}
              className="gap-1.5 text-xs"
            >
              <Icon name="plus" className="w-3.5 h-3.5" />
              Registar Movimento
            </Button>
          </div>
        </div>

        {/* Budget Execution Bar */}
        {budget > 0 && (
          <div className="rounded-2xl border border-kumbu-100 bg-kumbu-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-kumbu-900">
                Execução do Orçamento
              </span>
              <span
                className={`font-bold tabular-nums ${
                  isOverBudget ? "text-rose-700" : "text-kumbu-700"
                }`}
              >
                {budgetProgress}% consumido
              </span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-kumbu-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget ? "bg-rose-500" : "bg-kumbu-600"
                }`}
                style={{ width: `${Math.min(100, budgetProgress)}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-kumbu-500 pt-1">
              <span>Gasto: {formatCurrency(expense, project.currency)}</span>
              <span>
                {isOverBudget
                  ? `Excedido em ${formatCurrency(expense - budget, project.currency)}`
                  : `Disponível: ${formatCurrency(remainingBudget, project.currency)}`}
              </span>
              <span>Orçamento: {formatCurrency(budget, project.currency)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-700">
            Total Investido / Gasto
          </p>
          <p className="text-xl font-extrabold text-rose-800 tabular-nums">
            -{formatCurrency(expense, project.currency)}
          </p>
          <p className="text-[10px] text-rose-600">Custos totais registados</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
            Receitas do Projecto
          </p>
          <p className="text-xl font-extrabold text-emerald-800 tabular-nums">
            +{formatCurrency(income, project.currency)}
          </p>
          <p className="text-[10px] text-emerald-600">
            Entradas geradas pelo projecto
          </p>
        </div>

        <div className="rounded-2xl border border-kumbu-100 bg-white p-4 space-y-1 shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-kumbu-500">
            Resultado Financeiro
          </p>
          <p
            className={`text-xl font-extrabold tabular-nums ${
              netResult >= 0 ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {netResult >= 0 ? "+" : ""}
            {formatCurrency(netResult, project.currency)}
          </p>
          <p className="text-[10px] text-kumbu-400">Balanço líquido actual</p>
        </div>
      </div>

      {/* Grid: Transactions vs Daily Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Detailed Transactions */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-kumbu-800">
              Histórico de Movimentos do Projecto ({transactions.length})
            </h2>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => openQuickRegister("PROJECT")}
              className="text-xs"
            >
              + Adicionar Movimento
            </Button>
          </div>

          {transactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-kumbu-200 bg-white p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-kumbu-800">
                Ainda não há movimentos registados para este projecto.
              </p>
              <p className="text-xs text-kumbu-400">
                Regista gastos de compras, contratações ou receitas para começar a acompanhar a evolução financeira.
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  onClick={() => openQuickRegister("PROJECT")}
                >
                  + Registar Primeiro Movimento
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-kumbu-100 bg-white divide-y divide-kumbu-50">
              {transactions.map((tx) => {
                const isIncome = tx.type === "PROJECT_INCOME" || tx.type === "INCOME";
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-kumbu-50/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          isIncome ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-kumbu-900 truncate">
                          {tx.description || tx.categories?.name || (isIncome ? "Receita" : "Despesa")}
                        </p>
                        <p className="text-[11px] text-kumbu-400 truncate">
                          {tx.accounts?.name ? `Carteira: ${tx.accounts.name}` : ""}
                          {tx.categories?.name ? ` · ${tx.categories.name}` : ""}
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
                        {formatCurrency(tx.amount, tx.currency)}
                      </p>
                      <p className="text-[10px] text-kumbu-400">
                        {formatRelativeDate(tx.transaction_date)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Daily Activity Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-sm font-semibold text-kumbu-800">
            Actividade Agregada por Dia
          </h2>

          {dailyActivities.length === 0 ? (
            <div className="rounded-2xl border border-kumbu-100 bg-white p-5 text-center text-xs text-kumbu-400">
              Sem actividade agregada registada.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-kumbu-100 bg-white divide-y divide-kumbu-50">
              {dailyActivities.map((dayAct, idx) => (
                <div
                  key={dayAct.day ?? idx}
                  className="flex items-center justify-between px-4 py-3 text-xs"
                >
                  <div>
                    <p className="font-semibold text-kumbu-900">
                      {formatDate(dayAct.day ?? "")}
                    </p>
                    <p className="text-[10px] text-kumbu-400">
                      Gastos: -{formatCurrency(dayAct.expense ?? 0, project.currency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold tabular-nums ${
                        (dayAct.result ?? 0) >= 0
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }`}
                    >
                      {(dayAct.result ?? 0) >= 0 ? "+" : ""}
                      {formatCurrency(dayAct.result ?? 0, project.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <ProjectModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          router.refresh();
        }}
        projectToEdit={project}
        accounts={accounts}
        userId={userId}
      />
    </div>
  );
}

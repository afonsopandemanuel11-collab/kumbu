"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { ProjectModal } from "@/components/projects/project-modal";
import { useQuickAction } from "@/lib/context/quick-action-context";
import type {
  Project,
  ProjectSummary,
  ProjectStatus,
} from "@/lib/services/projects";
import type { Account } from "@/lib/services/accounts";

type ProjectsViewProps = {
  initialProjects: Project[];
  summaries: ProjectSummary[];
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

export function ProjectsView({
  initialProjects,
  summaries,
  accounts,
  userId,
}: ProjectsViewProps) {
  const { openQuickRegister } = useQuickAction();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  function handleCreate() {
    setEditingProject(null);
    setModalOpen(true);
  }

  function handleEdit(project: Project) {
    setEditingProject(project);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
            Projectos
          </h1>
          <p className="mt-0.5 text-sm text-kumbu-500">
            Acompanha as receitas, despesas e o resultado de cada projecto ou iniciativa.
          </p>
        </div>
        <Button onClick={handleCreate} size="sm" className="gap-1.5 self-start">
          <Icon name="plus" className="w-4 h-4" />
          Criar Projecto
        </Button>
      </div>

      {/* List or Empty State */}
      {initialProjects.length === 0 ? (
        <EmptyState
          icon="🚀"
          title="Ainda não tens nenhum projecto."
          description="Cria o teu primeiro projecto para controlar os ganhos e gastos de um negócio, evento ou obra."
          actionLabel="+ Criar projecto"
          onAction={handleCreate}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {initialProjects.map((project) => {
            const summary = summaries.find((s) => s.project_id === project.id);
            const income = summary?.income ?? 0;
            const expense = summary?.expense ?? 0;
            const result = summary?.result ?? income - expense;
            const badge = statusBadges[project.status] ?? statusBadges.ACTIVE;

            return (
              <div
                key={project.id}
                className="flex flex-col justify-between rounded-2xl border border-kumbu-100 bg-white p-5 space-y-4 hover:border-kumbu-200 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-kumbu-50 text-xl">
                        🚀
                      </span>
                      <div>
                        <h3 className="font-semibold text-kumbu-900">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-xs text-kumbu-400 line-clamp-1">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={badge.variant} size="sm">
                      {badge.label}
                    </Badge>
                  </div>

                  {project.budget && (
                    <div className="mt-3 space-y-1.5 rounded-xl bg-kumbu-50 p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-kumbu-600">Orçamento previsto</span>
                        <span className="font-semibold text-kumbu-900 tabular-nums">
                          {formatCurrency(project.budget, project.currency)}
                        </span>
                      </div>
                      {(() => {
                        const pct = Math.min(
                          100,
                          Math.round((expense / project.budget) * 100)
                        );
                        const isOver = expense > project.budget;
                        return (
                          <div className="space-y-1 pt-1">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-kumbu-200">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isOver ? "bg-rose-500" : "bg-kumbu-600"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-kumbu-400">
                              <span>{pct}% gasto</span>
                              <span>
                                {isOver
                                  ? `Excedido em ${formatCurrency(expense - project.budget, project.currency)}`
                                  : `Resta: ${formatCurrency(project.budget - expense, project.currency)}`}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Financial Metrics Summary */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-emerald-50 p-2.5">
                      <p className="text-[10px] font-medium text-emerald-700 uppercase tracking-wide">
                        Receitas
                      </p>
                      <p className="mt-1 text-xs font-bold text-emerald-800 tabular-nums">
                        +{formatCurrency(income, project.currency)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-rose-50 p-2.5">
                      <p className="text-[10px] font-medium text-rose-700 uppercase tracking-wide">
                        Gastos
                      </p>
                      <p className="mt-1 text-xs font-bold text-rose-800 tabular-nums">
                        -{formatCurrency(expense, project.currency)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-kumbu-50 p-2.5">
                      <p className="text-[10px] font-medium text-kumbu-700 uppercase tracking-wide">
                        Resultado
                      </p>
                      <p
                        className={`mt-1 text-xs font-bold tabular-nums ${
                          result >= 0 ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {result >= 0 ? "+" : ""}
                        {formatCurrency(result, project.currency)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-kumbu-50 pt-3 text-xs">
                  <Link
                    href={`/projectos/${project.id}`}
                    className="font-semibold text-kumbu-700 hover:text-kumbu-900 transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <span>Ver detalhes</span>
                    <Icon name="chevron-right" className="w-3 h-3" />
                  </Link>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => openQuickRegister("PROJECT")}
                      className="rounded-lg px-2.5 py-1 text-xs font-semibold text-kumbu-700 hover:bg-kumbu-50 transition-colors"
                    >
                      + Movimento
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(project)}
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

      {/* Modal */}
      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectToEdit={editingProject}
        accounts={accounts}
        userId={userId}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { ProjectModal } from "@/components/projects/project-modal";
import { useQuickAction } from "@/lib/context/quick-action-context";
import type { Project, ProjectSummary, ProjectStatus } from "@/lib/services/projects";
import type { Account } from "@/lib/services/accounts";

type ProjectsViewProps = {
  initialProjects: Project[];
  summaries: ProjectSummary[];
  accounts: Account[];
  userId: string;
};

const statusBadges: Record<ProjectStatus, { label: string; variant: "default" | "success" | "danger" | "warning" | "info" | "neutral" }> = {
  PLANNED: { label: "Planeado", variant: "neutral" },
  ACTIVE: { label: "Activo", variant: "success" },
  PAUSED: { label: "Pausado", variant: "warning" },
  COMPLETED: { label: "Conclu�do", variant: "info" },
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
            Projectos
          </h1>
          <p className="mt-0.5 text-sm text-kumbu-500">
            Acompanha as receitas, despesas e o resultado de cada projecto ou iniciativa.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-1.5 self-start sm:self-auto">
          <span>+</span> Criar Projecto
        </Button>
      </div>

      {/* List or Empty State */}
      {initialProjects.length === 0 ? (
        <EmptyState
          title="Ainda n�o tens nenhum projecto."
          description="Cria o teu primeiro projecto para controlar os ganhos e gastos de um neg�cio, evento ou reforma."
          actionLabel="+ Criar projecto"
          onAction={handleCreate}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {initialProjects.map((project) => {
            const summary = summaries.find((s) => s.project_id === project.id);
            const income = summary?.income ?? 0;
            const expense = summary?.expense ?? 0;
            const result = summary?.result ?? (income - expense);
            const badge = statusBadges[project.status] ?? statusBadges.ACTIVE;

            return (
              <Card
                key={project.id}
                className="flex flex-col justify-between space-y-4 transition-all hover:border-kumbu-300"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">??</span>
                        <h3 className="font-bold text-kumbu-900">{project.name}</h3>
                      </div>
                      {project.description && (
                        <p className="mt-1 text-xs text-kumbu-500 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>

                  {project.budget && (
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-kumbu-50 px-3 py-2 text-xs">
                      <span className="text-kumbu-500">Or�amento previsto</span>
                      <span className="font-semibold text-kumbu-900">
                        {formatCurrency(project.budget, project.currency)}
                      </span>
                    </div>
                  )}

                  {/* Financial Metrics Summary */}
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-kumbu-50 pt-3">
                    <div className="rounded-xl bg-emerald-50/70 p-2.5">
                      <p className="text-[11px] font-medium text-emerald-700">Receitas</p>
                      <p className="mt-0.5 text-xs font-bold text-emerald-800">
                        +{formatCurrency(income, project.currency)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-rose-50/70 p-2.5">
                      <p className="text-[11px] font-medium text-rose-700">Gastos</p>
                      <p className="mt-0.5 text-xs font-bold text-rose-800">
                        -{formatCurrency(expense, project.currency)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-kumbu-50 p-2.5">
                      <p className="text-[11px] font-medium text-kumbu-700">Resultado</p>
                      <p
                        className={`mt-0.5 text-xs font-bold ${
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
                  <span className="text-kumbu-400">
                    {project.start_date ? `In�cio: ${formatDate(project.start_date)}` : "Sem data de in�cio"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openQuickRegister("PROJECT")}
                      className="rounded-lg px-2.5 py-1 font-semibold text-kumbu-700 hover:bg-kumbu-50"
                    >
                      + Movimento
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(project)}
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

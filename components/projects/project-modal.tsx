"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import {
  createProject,
  updateProject,
  type Project,
  type ProjectStatus,
} from "@/lib/services/projects";
import { sanitizeDate } from "@/lib/utils/date";
import type { Account } from "@/lib/services/accounts";

type ProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
  accounts: Account[];
  userId: string;
};

const projectStatuses: { value: ProjectStatus; label: string }[] = [
  { value: "PLANNED", label: "Planeado" },
  { value: "ACTIVE", label: "Activo" },
  { value: "PAUSED", label: "Pausado" },
  { value: "COMPLETED", label: "Concluído" },
  { value: "CANCELLED", label: "Cancelado" },
];

function ProjectFormInner({
  projectToEdit,
  accounts,
  userId,
  onClose,
}: {
  projectToEdit?: Project | null;
  accounts: Account[];
  userId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(projectToEdit?.name ?? "");
  const [budget, setBudget] = useState(
    projectToEdit?.budget ? String(projectToEdit.budget) : "",
  );
  const [accountId, setAccountId] = useState(
    projectToEdit?.account_id ?? (accounts[0]?.id ?? ""),
  );
  const [status, setStatus] = useState<ProjectStatus>(
    projectToEdit?.status ?? "ACTIVE",
  );
  const [startDate, setStartDate] = useState(
    projectToEdit?.start_date ? projectToEdit.start_date.split("T")[0] : "",
  );
  const [endDate, setEndDate] = useState(
    projectToEdit?.end_date ? projectToEdit.end_date.split("T")[0] : "",
  );
  const [description, setDescription] = useState(
    projectToEdit?.description ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Indica o nome do projecto.");
      return;
    }

    const numBudget = budget
      ? parseFloat(budget.replace(/\s+/g, "").replace(",", "."))
      : null;

    setLoading(true);
    const supabase = createClient();
    const safeStart = sanitizeDate(startDate) ?? null;
    const safeEnd = sanitizeDate(endDate) ?? null;

    try {
      if (projectToEdit) {
        await updateProject(supabase, projectToEdit.id, {
          name: name.trim(),
          budget: numBudget,
          account_id: accountId || null,
          status,
          start_date: safeStart,
          end_date: safeEnd,
          description: description.trim() || null,
        });
      } else {
        await createProject(supabase, {
          user_id: userId,
          name: name.trim(),
          budget: numBudget,
          account_id: accountId || null,
          status,
          start_date: safeStart,
          end_date: safeEnd,
          description: description.trim() || null,
        });
      }

      router.refresh();
      onClose();
    } catch {
      setError("Não foi possível guardar o projecto. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="proj-name">Nome do Projecto</Label>
        <Input
          id="proj-name"
          placeholder="Ex: UNIKIVI Vitae, Reforma da Casa"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="proj-budget">Orçamento Estimado (Kz)</Label>
          <Input
            id="proj-budget"
            type="number"
            step="any"
            placeholder="Opcional"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="proj-status">Estado</Label>
          <Select
            id="proj-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          >
            {projectStatuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="proj-acc">Carteira Associada (opcional)</Label>
        <Select
          id="proj-acc"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
          <option value="">Nenhuma carteira específica</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.current_balance} Kz)
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="proj-start">Data de Início</Label>
          <Input
            id="proj-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="proj-end">Data de Fim</Label>
          <Input
            id="proj-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="proj-desc">Descrição (opcional)</Label>
        <Input
          id="proj-desc"
          placeholder="Objectivos ou notas do projecto"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {error && (
        <div
          className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="pt-2">
        <Button type="submit" fullWidth disabled={loading}>
          {loading
            ? "A guardar..."
            : projectToEdit
              ? "Guardar Alterações"
              : "Criar Projecto"}
        </Button>
      </div>
    </form>
  );
}

export function ProjectModal({
  isOpen,
  onClose,
  projectToEdit,
  accounts,
  userId,
}: ProjectModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={projectToEdit ? "Editar Projecto" : "Criar Projecto"}
      description={
        projectToEdit
          ? "Actualiza as informações do teu projecto."
          : "Controla as receitas e gastos dedicados a uma iniciativa."
      }
    >
      <ProjectFormInner
        key={projectToEdit?.id ?? "new"}
        projectToEdit={projectToEdit}
        accounts={accounts}
        userId={userId}
        onClose={onClose}
      />
    </Modal>
  );
}

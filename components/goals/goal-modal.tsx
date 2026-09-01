"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { createGoal, updateGoal, type Goal, type GoalPriority, type GoalStatus } from "@/lib/services/goals";
import { sanitizeDate } from "@/lib/utils/date";
import type { Account } from "@/lib/services/accounts";

type GoalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: Goal | null;
  accounts: Account[];
  userId: string;
};

const priorities: { value: GoalPriority; label: string }[] = [
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "M�dia" },
  { value: "HIGH", label: "Alta" },
];

const statuses: { value: GoalStatus; label: string }[] = [
  { value: "ACTIVE", label: "Em Progresso" },
  { value: "COMPLETED", label: "Atingida" },
  { value: "PAUSED", label: "Pausada" },
  { value: "CANCELLED", label: "Cancelada" },
];

function GoalFormInner({
  goalToEdit,
  accounts,
  userId,
  onClose,
}: {
  goalToEdit?: Goal | null;
  accounts: Account[];
  userId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(goalToEdit?.name ?? "");
  const [targetAmount, setTargetAmount] = useState(goalToEdit ? String(goalToEdit.target_amount) : "");
  const [accountId, setAccountId] = useState(goalToEdit?.account_id ?? (accounts[0]?.id ?? ""));
  const [priority, setPriority] = useState<GoalPriority>(goalToEdit?.priority ?? "MEDIUM");
  const [status, setStatus] = useState<GoalStatus>(goalToEdit?.status ?? "ACTIVE");
  const [deadline, setDeadline] = useState(goalToEdit?.deadline ? goalToEdit.deadline.split("T")[0] : "");
  const [description, setDescription] = useState(goalToEdit?.description ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Indica o nome da meta.");
      return;
    }

    const numTarget = parseFloat(targetAmount.replace(/\s+/g, "").replace(",", "."));
    if (isNaN(numTarget) || numTarget <= 0) {
      setError("Indica um valor objectivo v�lido maior que 0.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const safeDeadline = sanitizeDate(deadline) ?? null;

    try {
      if (goalToEdit) {
        await updateGoal(supabase, goalToEdit.id, {
          name: name.trim(),
          target_amount: numTarget,
          account_id: accountId || null,
          priority,
          status,
          deadline: safeDeadline,
          description: description.trim() || null,
        });
      } else {
        await createGoal(supabase, {
          user_id: userId,
          name: name.trim(),
          target_amount: numTarget,
          account_id: accountId || null,
          priority,
          deadline: safeDeadline,
          description: description.trim() || null,
        });
      }

      router.refresh();
      onClose();
    } catch {
      setError("N�o foi poss�vel guardar a meta. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="goal-name">Nome da Meta</Label>
        <Input
          id="goal-name"
          placeholder="Ex: Comprar computador, Fundo de Emerg�ncia"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="goal-target">Valor Objectivo (Kz)</Label>
          <Input
            id="goal-target"
            type="number"
            step="any"
            min="0"
            placeholder="0,00"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="goal-prio">Prioridade</Label>
          <Select
            id="goal-prio"
            value={priority}
            onChange={(e) => setPriority(e.target.value as GoalPriority)}
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="goal-acc">Carteira Destino (opcional)</Label>
          <Select
            id="goal-acc"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            <option value="">Nenhuma carteira espec�fica</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.current_balance} Kz)
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="goal-deadline">Data Limite (opcional)</Label>
          <Input
            id="goal-deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
      </div>

      {goalToEdit && (
        <div className="space-y-1.5">
          <Label htmlFor="goal-status">Estado</Label>
          <Select
            id="goal-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as GoalStatus)}
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="goal-desc">Descri��o / Motiva��o (opcional)</Label>
        <Input
          id="goal-desc"
          placeholder="Ex: Poupar 50.000 Kz por m�s"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700" role="alert">
          {error}
        </div>
      )}

      <div className="pt-2">
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "A guardar..." : goalToEdit ? "Guardar Altera��es" : "Criar Meta"}
        </Button>
      </div>
    </form>
  );
}

export function GoalModal({
  isOpen,
  onClose,
  goalToEdit,
  accounts,
  userId,
}: GoalModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? "Editar Meta" : "Criar Nova Meta"}
      description={
        goalToEdit
          ? "Actualiza as informa��es da tua meta financeira."
          : "Define um objectivo de poupan�a e acompanha o teu progresso."
      }
    >
      <GoalFormInner
        key={goalToEdit?.id ?? "new"}
        goalToEdit={goalToEdit}
        accounts={accounts}
        userId={userId}
        onClose={onClose}
      />
    </Modal>
  );
}

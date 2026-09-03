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
  createDebt,
  updateDebt,
  type Debt,
  type DebtType,
  type DebtStatus,
} from "@/lib/services/debts";
import { sanitizeDate } from "@/lib/utils/date";

type DebtModalProps = {
  isOpen: boolean;
  onClose: () => void;
  debtToEdit?: Debt | null;
  defaultType?: DebtType;
  userId: string;
};

const debtStatuses: { value: DebtStatus; label: string }[] = [
  { value: "OPEN", label: "Pendente" },
  { value: "PARTIALLY_PAID", label: "Parcialmente Pago" },
  { value: "PAID", label: "Totalmente Pago" },
  { value: "OVERDUE", label: "Em Atraso" },
  { value: "CANCELLED", label: "Cancelado" },
];

function DebtFormInner({
  debtToEdit,
  defaultType,
  userId,
  onClose,
}: {
  debtToEdit?: Debt | null;
  defaultType?: DebtType;
  userId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [personName, setPersonName] = useState(debtToEdit?.person_name ?? "");
  const [type, setType] = useState<DebtType>(
    debtToEdit?.type ?? (defaultType ?? "I_OWE"),
  );
  const [amount, setAmount] = useState(
    debtToEdit ? String(debtToEdit.original_amount) : "",
  );
  const [dueDate, setDueDate] = useState(
    debtToEdit?.due_date ? debtToEdit.due_date.split("T")[0] : "",
  );
  const [status, setStatus] = useState<DebtStatus>(
    debtToEdit?.status ?? "OPEN",
  );
  const [description, setDescription] = useState(
    debtToEdit?.description ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!personName.trim()) {
      setError("Indica o nome da pessoa.");
      return;
    }

    const numAmount = parseFloat(amount.replace(/\s+/g, "").replace(",", "."));
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Indica um valor válido maior que 0.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const safeDate = sanitizeDate(dueDate) ?? null;

    try {
      if (debtToEdit) {
        await updateDebt(supabase, debtToEdit.id, {
          person_name: personName.trim(),
          type,
          original_amount: numAmount,
          status,
          due_date: safeDate,
          description: description.trim() || null,
        });
      } else {
        await createDebt(supabase, {
          user_id: userId,
          person_name: personName.trim(),
          type,
          original_amount: numAmount,
          due_date: safeDate,
          description: description.trim() || null,
        });
      }

      router.refresh();
      onClose();
    } catch {
      setError("Não foi possível guardar a dívida. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="debt-type">Tipo</Label>
          <Select
            id="debt-type"
            value={type}
            onChange={(e) => setType(e.target.value as DebtType)}
          >
            <option value="I_OWE">Eu devo (A pagar)</option>
            <option value="OWED_TO_ME">Devem-me (A receber)</option>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="debt-person">Pessoa / Entidade</Label>
          <Input
            id="debt-person"
            placeholder="Nome da pessoa"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            required
            autoFocus
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="debt-amount">Valor Total (Kz)</Label>
          <Input
            id="debt-amount"
            type="number"
            step="any"
            min="0"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="debt-date">Data Limite (opcional)</Label>
          <Input
            id="debt-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      {debtToEdit && (
        <div className="space-y-1.5">
          <Label htmlFor="debt-status">Estado</Label>
          <Select
            id="debt-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as DebtStatus)}
          >
            {debtStatuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="debt-desc">Descrição / Motivo (opcional)</Label>
        <Input
          id="debt-desc"
          placeholder="Ex: Empréstimo de emergência, Compra de material"
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
            : debtToEdit
              ? "Guardar Alterações"
              : "Criar Dívida"}
        </Button>
      </div>
    </form>
  );
}

export function DebtModal({
  isOpen,
  onClose,
  debtToEdit,
  defaultType,
  userId,
}: DebtModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={debtToEdit ? "Editar Dívida" : "Registar Dívida"}
      description={
        debtToEdit
          ? "Actualiza as informações da dívida."
          : "Regista valores que deves ou que outras pessoas te devem."
      }
    >
      <DebtFormInner
        key={debtToEdit?.id ?? `new-${defaultType}`}
        debtToEdit={debtToEdit}
        defaultType={defaultType}
        userId={userId}
        onClose={onClose}
      />
    </Modal>
  );
}

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
  createBudget,
  updateBudget,
  type Budget,
  type BudgetPeriodType,
} from "@/lib/services/budgets";
import { sanitizeDate } from "@/lib/utils/date";
import type { Category } from "@/lib/services/categories";
import type { Account } from "@/lib/services/accounts";

type BudgetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  budgetToEdit?: Budget | null;
  categories: Category[];
  accounts: Account[];
  userId: string;
};

const periodTypes: { value: BudgetPeriodType; label: string }[] = [
  { value: "WEEKLY", label: "Semanal" },
  { value: "MONTHLY", label: "Mensal" },
  { value: "YEARLY", label: "Anual" },
];

function BudgetFormInner({
  budgetToEdit,
  categories,
  accounts,
  userId,
  onClose,
}: {
  budgetToEdit?: Budget | null;
  categories: Category[];
  accounts: Account[];
  userId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(
    budgetToEdit ? String(budgetToEdit.amount) : "",
  );
  const [categoryId, setCategoryId] = useState(
    budgetToEdit?.category_id ?? (categories[0]?.id ?? ""),
  );
  const [accountId, setAccountId] = useState(budgetToEdit?.account_id ?? "");
  const [periodType, setPeriodType] = useState<BudgetPeriodType>(
    budgetToEdit?.period_type ?? "MONTHLY",
  );

  const now = new Date();
  const defaultStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const defaultEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-${String(nextMonth.getDate()).padStart(2, "0")}`;

  const [startDate, setStartDate] = useState(
    budgetToEdit?.start_date
      ? budgetToEdit.start_date.split("T")[0]
      : defaultStart,
  );
  const [endDate, setEndDate] = useState(
    budgetToEdit?.end_date ? budgetToEdit.end_date.split("T")[0] : defaultEnd,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount.replace(/\s+/g, "").replace(",", "."));
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Indica um valor limite de orçamento válido.");
      return;
    }

    const safeStart = sanitizeDate(startDate);
    const safeEnd = sanitizeDate(endDate);

    if (!safeStart || !safeEnd) {
      setError("Indica as datas de início e fim do período.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (budgetToEdit) {
        await updateBudget(supabase, budgetToEdit.id, {
          amount: numAmount,
          category_id: categoryId || null,
          account_id: accountId || null,
          period_type: periodType,
          start_date: safeStart,
          end_date: safeEnd,
        });
      } else {
        await createBudget(supabase, {
          user_id: userId,
          amount: numAmount,
          category_id: categoryId || null,
          account_id: accountId || null,
          period_type: periodType,
          start_date: safeStart,
          end_date: safeEnd,
        });
      }

      router.refresh();
      onClose();
    } catch {
      setError("Não foi possível guardar o orçamento. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  const expenseCategories = categories.filter((c) => c.kind === "EXPENSE");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="budget-amount">Limite de Gasto (Kz)</Label>
        <Input
          id="budget-amount"
          type="number"
          step="any"
          min="0"
          placeholder="Ex: 100.000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="budget-cat">Categoria</Label>
          <Select
            id="budget-cat"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon ? `${c.icon} ` : ""}
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="budget-period">Tipo de Período</Label>
          <Select
            id="budget-period"
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value as BudgetPeriodType)}
          >
            {periodTypes.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="budget-acc">Carteira Específica (opcional)</Label>
        <Select
          id="budget-acc"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
          <option value="">Todas as carteiras</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="budget-start">Data Início</Label>
          <Input
            id="budget-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="budget-end">Data Fim</Label>
          <Input
            id="budget-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
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
            : budgetToEdit
              ? "Guardar Alterações"
              : "Definir Orçamento"}
        </Button>
      </div>
    </form>
  );
}

export function BudgetModal({
  isOpen,
  onClose,
  budgetToEdit,
  categories,
  accounts,
  userId,
}: BudgetModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budgetToEdit ? "Editar Orçamento" : "Definir Novo Orçamento"}
      description={
        budgetToEdit
          ? "Actualiza os limites do teu orçamento."
          : "Controla os teus limites de despesa por categoria ou período."
      }
    >
      <BudgetFormInner
        key={budgetToEdit?.id ?? "new"}
        budgetToEdit={budgetToEdit}
        categories={categories}
        accounts={accounts}
        userId={userId}
        onClose={onClose}
      />
    </Modal>
  );
}

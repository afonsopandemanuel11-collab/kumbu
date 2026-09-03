"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { contributeToGoal } from "@/lib/services/transactions";
import { formatCurrency } from "@/lib/utils/currency";
import { getTodayISODate, sanitizeDate } from "@/lib/utils/date";
import type { Goal } from "@/lib/services/goals";
import type { Account } from "@/lib/services/accounts";

type ContributeGoalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  accounts: Account[];
};

export function ContributeGoalModal({
  isOpen,
  onClose,
  goal,
  accounts,
}: ContributeGoalModalProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(getTodayISODate());
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.target_amount - goal.current_amount);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount.replace(/\s+/g, "").replace(",", "."));
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Indica um valor válido maior que 0.");
      return;
    }

    if (!accountId) {
      setError("Selecciona a carteira de onde sairá o valor.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      await contributeToGoal(supabase, {
        goalId: goal!.id,
        accountId,
        amount: numAmount,
        destinationAccountId: goal!.account_id ?? undefined,
        date: sanitizeDate(date),
        description: description.trim() || undefined,
      });

      router.refresh();
      onClose();
    } catch {
      setError("Não foi possível registar a poupança. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Poupar para: ${goal.name}`}
      description={`Faltam ${formatCurrency(remaining, goal.currency)} para atingir o objectivo.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="contribute-amount">Valor a Guardar (Kz)</Label>
          <Input
            id="contribute-amount"
            type="number"
            step="any"
            min="0"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contribute-acc">Saiu da Carteira</Label>
          <Select
            id="contribute-acc"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.current_balance} Kz)
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contribute-date">Data</Label>
          <Input
            id="contribute-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contribute-desc">
            Descrição / Comentário (opcional)
          </Label>
          <Input
            id="contribute-desc"
            placeholder="Ex: Poupança do salário deste mês"
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
            {loading ? "A guardar..." : "Confirmar Poupança"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

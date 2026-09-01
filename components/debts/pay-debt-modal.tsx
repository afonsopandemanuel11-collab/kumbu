"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { payDebt } from "@/lib/services/transactions";
import { formatCurrency } from "@/lib/utils/currency";
import { getTodayISODate, sanitizeDate } from "@/lib/utils/date";
import type { Debt } from "@/lib/services/debts";
import type { Account } from "@/lib/services/accounts";

type PayDebtModalProps = {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
  accounts: Account[];
};

export function PayDebtModal({
  isOpen,
  onClose,
  debt,
  accounts,
}: PayDebtModalProps) {
  const router = useRouter();
  const [amount, setAmount] = useState(debt ? String(debt.remaining_amount) : "");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(getTodayISODate());
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !debt) return null;

  const isIOwe = debt.type === "I_OWE";
  const title = isIOwe ? `Pagar a ${debt.person_name}` : `Receber de ${debt.person_name}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount.replace(/\s+/g, "").replace(",", "."));
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Indica um valor v�lido maior que 0.");
      return;
    }

    if (!accountId) {
      setError("Selecciona uma carteira.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      await payDebt(supabase, {
        debtId: debt!.id,
        accountId,
        amount: numAmount,
        date: sanitizeDate(date),
        description: description.trim() || undefined,
      });

      router.refresh();
      onClose();
    } catch {
      setError("N�o foi poss�vel registar o pagamento. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={`Valor restante em aberto: ${formatCurrency(debt.remaining_amount, debt.currency)}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="pay-amount">Valor do Pagamento (Kz)</Label>
          <Input
            id="pay-amount"
            type="number"
            step="any"
            min="0"
            max={debt.remaining_amount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pay-acc">
            {isIOwe ? "Saiu da Carteira" : "Depositado na Carteira"}
          </Label>
          <Select
            id="pay-acc"
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
          <Label htmlFor="pay-date">Data do Pagamento</Label>
          <Input
            id="pay-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pay-desc">Notas / Comprovativo (opcional)</Label>
          <Input
            id="pay-desc"
            placeholder="Ex: Pagamento da 1� parcela"
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
            {loading ? "A processar..." : isIOwe ? "Confirmar Pagamento" : "Confirmar Recebimento"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
